import { Payload } from 'payload'

export const ProjectsSeed = async (payload: Payload) => {
  const projects = await payload.find({
    collection: 'projects',
  })
  if (projects.docs.length > 0) return

  const manager = await payload.find({
    collection: 'employees',
    limit: 1,
  })
  if (!manager.docs.length) return console.log('No manager found')

  await payload.create({
    collection: 'projects',
    data: {
      name: 'Project 1',
      description: 'Description 1',
      manager: manager.docs[0].id,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    },
  })
}
