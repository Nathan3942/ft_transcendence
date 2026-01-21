
import { FastifyInstance } from 'fastify'
import { success, errorResponse } from '../../utils/response'
import { getDatabase } from '../../database'
import { NotFoundError, UnauthorizedError, BadRequestError } from '../../utils/appErrors'


export default async function usersRoutes(fastify: FastifyInstance){

 /************************* POST USERS **********************************/
    fastify.post('/users', async (request, reply) => {

        const {username} = request.body as { username : string }

        if (!username)
            return errorResponse("400", "Username is required")
        
        const db = getDatabase()
        const stmt = db.prepare('INSERT INTO users (username) VALUES (?)')
        const result = stmt.run(username)
        
        return success({ 
            id: result.lastInsertRowid, 
            username: username 
        })
    })

    /************************* GET USERS **********************************/
    fastify.get('/users', async(request, reply) => {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM users')
    const users = stmt.all()
    reply.send(success(users))
    })

    fastify.get('/users/:id', async(request, reply) => {

        const { id } = request.params as {id : string}
        if (!id)
                return errorResponse('400', 'Error Missing id')
        const db = getDatabase()
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
        const user = stmt.get(id)
        if (!user)
            return errorResponse('404', 'User not found')
        return success(user)

    })

     /************************* DELETE USERS **********************************/
    fastify.delete('/users/:id', async(request, reply) => {

        const { id } = request.params as { id : string} 
        
        const db = getDatabase()
        const stmt = db.prepare('DELETE FROM users WHERE id = ?')
        const result = stmt.run(id)
        
        if (result.changes == 0) {
            reply.status(404)  // ← Définir le status HTTP
            return errorResponse("404", "User not found")
        }
        
        reply.status(200)  // ← Définir le status HTTP
        return success({ message: "User deleted", id: parseInt(id) })
    })

    fastify.patch('/users/:id',async (request, reply) => {
        // on veut changer le nom d'un user
        const { id } = request.params as {id : string}
        const { username } = request.body as {username : string} //new username from request.body
        if (!id || !username)
            return errorResponse('400', 'Missing id or username')

        const db = getDatabase()
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?') //selects all variable from the user object *
        const user = stmt.get(id)
        if (!user)
            return errorResponse('404', 'User not found')


        const update = db.prepare('UPDATE users SET username = ? WHERE id = ?')
        const final = update.run(username, id)
        if (final.changes == 0)
            return errorResponse('500', 'Failed to update user')
    
        return success({
            id: parseInt(id),          // ← Virgule + utilise id de params
            username: username         // ← Nouveau username (du body)
        })
    })


fastify.get('/NotFound', async(request, reply) => {
    throw new NotFoundError("testing errorHandler global")
})

fastify.get('/Un', async(request, reply) => {
    throw new UnauthorizedError("testing Unauthorized")
})
fastify.get('/BadRequest', async(request, reply) => {
    throw new BadRequestError("testing bad request")
})
}