import { FastifyInstance } from 'fastify'
import { success, errorResponse } from '../../utils/response'
import { getDatabase } from '../../database'
import { asyncHandler } from '../../utils/asyncHandler'


export default async function usersRoutes(Fastify: FastifyInstance){

 /************************* POST USERS **********************************/
    Fastify.post('/users', asyncHandler(async (request, reply) => {

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
    }))

    /************************* GET USERS **********************************/
    Fastify.get('/users', asyncHandler(async (request, reply) => {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM users')
    const users = stmt.all()
    reply.send(success(users))
    }))

    Fastify.get('/users/:id', asyncHandler(async (request, reply) => {

        const { id } = request.params as {id : string}
        if (!id)
                return errorResponse('400', 'Error Missing id')
        const db = getDatabase()
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
        const user = stmt.get(id)
        if (!user)
            return errorResponse('404', 'User not found')
        return success(user)

    }))

     /************************* DELETE USERS **********************************/
    Fastify.delete('/users/:id', asyncHandler(async (request, reply) => {

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
    }))

    Fastify.patch('/users/:id', asyncHandler(async (request, reply) => {
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
    }))
// Route de test temporaire pour vérifier asyncHandler
    Fastify.get('/test-error', asyncHandler(async (request, reply) => {

        throw new Error('error test')
    // Qu'est-ce que tu pourrais mettre ici pour forcer une erreur ?
    // Pense à 3 façons différentes de créer une erreur...
}))

// Route 2 : Lance un string
Fastify.get('/test-error-2', asyncHandler(async (request, reply) => {
    throw 'Ceci est juste un string'
}))

}