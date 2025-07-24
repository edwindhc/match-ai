import { Payload } from 'payload'

export const AssignmentsSeed = async (payload: Payload) => {
  const assignments = await payload.find({
    collection: 'assignments',
  })
  if (assignments.docs.length > 0) return

  const employees = await payload.find({
    collection: 'employees',
    limit: 1,
  })
  if (!employees.docs.length) return console.log('No employees found')

  const projects = await payload.find({
    collection: 'projects',
    limit: 1,
  })
  if (!projects.docs.length) return console.log('No projects found')

  await payload.create({
    collection: 'assignments',
    data: {
      employee: employees.docs[0].id,
      project: projects.docs[0].id,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    },
  })
}
