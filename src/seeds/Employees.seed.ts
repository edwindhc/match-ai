import { Payload } from 'payload'

export const EmployeesSeed = async (payload: Payload) => {
  const employees = await payload.find({
    collection: 'employees',
  })
  if (employees.docs.length > 0) return

  const technologies = await payload.find({
    collection: 'technologies',
    limit: 1,
  })
  if (!technologies.docs.length) return console.log('No technologies found')

  await payload.create({
    collection: 'employees',
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      location: 'New York',
      area: 'IT',
      grade: 'A1',
      skills: [technologies.docs[0].id],
    },
  })
}
