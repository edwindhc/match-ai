import { PayloadRequest } from 'payload'
import z from 'zod'

const empty = z.object({})
const byId = z.object({ id: z.string() })
export const userTools = [
  {
    name: 'find_users',
    description: 'Find users information',
    schema: empty,
    handler: (req: PayloadRequest) => async () => req.payload.find({ collection: 'users' }),
  },
  {
    name: 'find_user_by_id',
    description: 'Find user by ID',
    schema: byId,
    handler:
      (req: PayloadRequest) =>
      async ({ id }: { id: string }) =>
        req.payload.findByID({ collection: 'users', id }),
  },
]

/* 
// Example of how to create a original tool
const findUsers = tool(
            async () => {
              return req.payload.find({
                collection: 'users',
              })
            },
            {
              name: 'find_users',
              description: 'Find users information',
              schema: z.object({}),
            },
          ) as unknown as Tool
*/
