
import { FastifyInstance } from 'fastify'
import { success, errorResponse } from '../../utils/response'
import { getDatabase } from '../../database'
import { NotFoundError, UnauthorizedError, BadRequestError } from '../../utils/appErrors'


export default async function usersRoutes(server : FastifyInstance){

 /************************* POST USERS **********************************/
    server.post('/users', async (request, reply) => {

        const {username} = request.body as { username : string }

        if (!username)
            return errorResponse("BadRequestError", "Username is required", 400, [])
        
        const db = getDatabase()
        const stmt = db.prepare('INSERT INTO users (username) VALUES (?)')
        const result = stmt.run(username)
        
        return success({ 
            id: result.lastInsertRowid, 
            username: username 
        })
    })

    /************************* GET USERS **********************************/
    server.get('/users', async(request, reply) => {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM users')
    const users = stmt.all()
    reply.send(success(users))
    })

    server.get('/users/:id', async(request, reply) => {

        const { id } = request.params as {id : string}
        if (!id)
            return errorResponse("BadRequestError", "Error Missing id", 400, [])
        const db = getDatabase()
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
        const user = stmt.get(id)
        if (!user)
            return errorResponse("NotFoundError", "User not found", 404, [])
        return success(user)

    })

     /************************* DELETE USERS **********************************/
    server.delete('/users/:id', async(request, reply) => {

        const { id } = request.params as { id : string} 
        
        const db = getDatabase()
        const stmt = db.prepare('DELETE FROM users WHERE id = ?')
        const result = stmt.run(id)
        
        if (result.changes == 0) {
            reply.status(404)
            return errorResponse("NotFoundError", "User not found", 404, [])
        }
        
        reply.status(200)  // ← Définir le status HTTP
        return success({ message: "User deleted", id: parseInt(id) })
    })

    server.patch('/users/:id',async (request, reply) => {
        // on veut changer le nom d'un user
        const { id } = request.params as {id : string}
        const { username } = request.body as {username : string} //new username from request.body
        if (!id || !username)
            return errorResponse("BadRequestError", "Missing id or username", 400, [])

        const db = getDatabase()
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?') //selects all variable from the user object *
        const user = stmt.get(id)
        if (!user)
            return errorResponse("NotFoundError", "User not found", 404, [])


        const update = db.prepare('UPDATE users SET username = ? WHERE id = ?')
        const final = update.run(username, id)
        if (final.changes == 0)
            return errorResponse("InternalServerError", "Failed to update user", 500, [])
    
        return success({
            id: parseInt(id),          // ← Virgule + utilise id de params
            username: username         // ← Nouveau username (du body)
        })
    })


server.get('/NotFound', async(request, reply) => {
    throw new NotFoundError("testing errorHandler global")
})

server.get('/Un', async(request, reply) => {
    throw new UnauthorizedError("testing Unauthorized")
})
server.get('/BadRequest', async(request, reply) => {
    throw new BadRequestError("testing bad request")
})
}