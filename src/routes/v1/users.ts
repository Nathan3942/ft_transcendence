
import { FastifyInstance } from 'fastify'
import { success, errorResponse } from '../../utils/response'
import { getDatabase } from '../../database'
import { NotFoundError, UnauthorizedError, BadRequestError } from '../../utils/appErrors'
import { getAll, getById, createUser } from '../../repository/usersRepository'
import { queryAll, queryOne, queryExecute } from '../../database/queryWrapper'
import { z } from 'zod'


export default async function usersRoutes(server : FastifyInstance){
    /************************* ZOD TESTER **********************************/
    server.post('/zodTest', async (request, reply) => {
        const userSchema = z.object({
            username: z.string().min(1, 'username requis')
        })
        const result = userSchema.safeParse(request.body)
        if (!result.success) {
            throw new BadRequestError("test zod error")
        }
        return success(result.data)
    })

server.get('/zodTest', async (request, reply) =>{

    const userSchema = z.object({
        username: z.string().min(1, 'username requis'),
        test: z.number()
    })

    const username = userSchema.safeParse(request.query)
    if(!username.success){
        throw new BadRequestError("test zod error")
    }
    return success(username)
})



 /************************* ME **********************************/

    server.get('/me', async (request, reply) => {
        //future authentication
        throw new UnauthorizedError("Not authenticated")
})


 /************************* POST USERS **********************************/
    server.post('/users', async (request, reply) => {

        const { username } = request.body as { username: string }

        if (!username)
            throw new BadRequestError("missing username")

        try {
            const user = await createUser({ username });
            return success(user);
        } catch (err: any) {
            if (err.message.includes('already exists')) {
                throw new BadRequestError("User already exists");
            }
            throw err;
        }
    })

    /************************* GET USERS **********************************/
    server.get('/users', async(request, reply) => {
        const users = getAll()
        if (users.length === 0)
            throw new NotFoundError("no users in database")
        return success(users)
    })

    server.get('/users/:id', async(request, reply) => {
        const { id } = request.params as { id: string }
        const user = getById(id)
        if (!user)
            throw new NotFoundError("User not found")
        return success(user)
    })

     /************************* DELETE USERS **********************************/
    server.delete('/users/:id', async(request, reply) => {
        const { id } = request.params as { id: string }
        const result = queryExecute('DELETE FROM users WHERE id = ?', [id])
        if (result.changes === 0) {
            reply.status(404)
            throw new NotFoundError("user not found")
        }
        reply.status(200)
        return success({ message: "User deleted", id: parseInt(id) })
    })

/************************* PATCH USERS **********************************/

    server.patch('/users/:id', async (request, reply) => {
        const { id } = request.params as { id: string }
        const { username } = request.body as { username: string }
        if (!id || !username)
            throw new BadRequestError("missing id or username")

        const user = queryOne("SELECT * FROM users WHERE id = ?", [id]) // a remplacer
        if (!user)
            throw new NotFoundError("user not found")

        const result = queryExecute('UPDATE users SET username = ? WHERE id = ?', [username, id])
        if (result.changes === 0)
            return errorResponse("InternalServerError", "Failed to update user", 500, [])

        return success({
            id: parseInt(id),
            username: username
        })
    })
}