import { PayloadRequest, Where } from 'payload'

export const freeEmployee = async (req: PayloadRequest) => {
  const date = new Date().toISOString()
  const skills = ['React', 'Angular']
  console.log('date', date)
  const assignments = await req.payload.find({
    collection: 'assignments',
    where: {
      and: [
        { startDate: { less_than_equal: date } },
        {
          or: [{ endDate: { greater_than_equal: date } }, { endDate: { equals: null } }],
        },
      ],
    },
  })
  const busyEmployeeIds = assignments.docs.map((a) =>
    typeof a.employee === 'object' ? a.employee.id : a.employee,
  )
  const where: Where = {}
  console.log('busyEmployeeIds', busyEmployeeIds)
  where.id = { not_in: [] }
  if (skills.length > 0) {
    console.log('skills', skills)
  }
  console.log('where', where)
  const freeEmployees = await req.payload.find({
    collection: 'employees',
    where: {
      and: [
        {
          skills: { in: [2] },
        },
      ],
    },
  })
  const skills2 = await req.payload.find({
    collection: 'technologies',
    depth: 0,
    limit: 999,
    where: {
      name: { in: skills },
    },
  })
  console.log('freeEmployees', freeEmployees)
  return Response.json(skills2)
}
