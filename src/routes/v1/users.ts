
import { FastifyInstance } from 'fastify'
import { success, errorResponse } from '../../utils/response'
import { getDatabase } from '../../database'
import { NotFoundError, UnauthorizedError, BadRequestError } from '../../utils/appErrors'


export default async function usersRoutes(server : FastifyInstance){

 /************************* POST USERS **********************************/
    server.post('/users', async (request, reply) => {

        const {username} = request.body as { username : string }

        if (!username)
            throw new BadRequestError("missing username id")
            
        
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
            throw new BadRequestError();
        const db = getDatabase()
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
        const user = stmt.get(id)
        if (!user)
            throw new NotFoundError("user not found")
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
            throw new NotFoundError("user not found")
        }
        
        reply.status(200)  // ← Définir le status HTTP
        return success({ message: "User deleted", id: parseInt(id) })
    })

/************************* PATCH USERS **********************************/

    server.patch('/users/:id',async (request, reply) => {
        // on veut changer le nom d'un user
        const { id } = request.params as {id : string}
        const { username } = request.body as {username : string} //new username from request.body
        if (!id || !username)
            throw new BadRequestError("missing id or username")

        const db = getDatabase()
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?') //selects all variable from the user object *
        const user = stmt.get(id)
        if (!user)
            throw new NotFoundError("user not found")


        const update = db.prepare('UPDATE users SET username = ? WHERE id = ?')
        const final = update.run(username, id)
        if (final.changes == 0)
            return errorResponse("InternalServerError", "Failed to update user", 500, []) //how do i handle this
    
        return success({
            id: parseInt(id),          // ← Virgule + utilise id de params
            username: username         // ← Nouveau username (du body)
        })
    })
}