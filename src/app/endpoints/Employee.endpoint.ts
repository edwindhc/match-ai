import { PayloadRequest, Where } from 'payload'

export const freeEmployee = async (req: PayloadRequest) => {
  const technologies = await req.payload.find({
    collection: 'technologies',
    where: { name: { in: ['flutter'] } },
    depth: 0,
    limit: 999,
  })
  return Response.json(technologies)
}
