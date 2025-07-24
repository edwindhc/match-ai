import { PayloadRequest } from 'payload'
import z from 'zod'

const dateAndSkills = z.object({
  date: z.string(), // formato ISO
  skills: z.array(z.number()).optional(), // opcional
})

export const employeeTools = [
  // 1. Buscar empleados ocupados
  {
    name: 'find_busy_employees',
    description:
      'Find employees who are busy (have an assignment) on a given date, optionally filtered by required skills.',
    schema: dateAndSkills,
    handler:
      (req: PayloadRequest) =>
      async ({ date, skills = [] }: z.infer<typeof dateAndSkills>) => {
        // Buscar assignments activos en la fecha
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
          depth: 1, // para expandir empleado y skills
        })
        // Filtrar por skills si corresponde
        let busyEmployees = assignments.docs.map((a) => a.employee).filter(Boolean)
        if (skills.length > 0) {
          busyEmployees = busyEmployees.filter((e: any) =>
            skills.some(
              (s: number) => Array.isArray(e.skills) && e.skills.some((sk: any) => sk.id === s),
            ),
          )
        }
        return busyEmployees
      },
  },

  // 2. Buscar empleados libres
  {
    name: 'find_free_employees',
    description:
      'Find employees who are free (no assignment) on a given date, optionally filtered by required skills.',
    schema: dateAndSkills,
    handler:
      (req: PayloadRequest) =>
      async ({ date, skills = [] }: z.infer<typeof dateAndSkills>) => {
        const getDate = date ? new Date(date).toISOString() : new Date().toISOString()

        const assignments = await req.payload.find({
          collection: 'assignments',
          where: {
            and: [
              { startDate: { less_than_equal: getDate } },
              {
                or: [{ endDate: { greater_than_equal: getDate } }, { endDate: { equals: null } }],
              },
            ],
          },
        })
        const busyEmployeeIds = assignments.docs.map((a) =>
          typeof a.employee === 'object' ? a.employee.id : a.employee,
        )

        const where: any = {}
        if (busyEmployeeIds.length > 0) {
          where.id = { not_in: busyEmployeeIds }
        }
        if (skills.length > 0) {
          where.skills = { in: skills }
        }
        const freeEmployees = await req.payload.find({
          collection: 'employees',
          where,
        })
        return freeEmployees
      },
  },

  // 3. Buscar próximos empleados por quedar libre
  {
    name: 'find_next_available_employees',
    description:
      'Find the employees who will be available soonest after a given date, optionally filtered by required skills.',
    schema: dateAndSkills,
    handler:
      (req: PayloadRequest) =>
      async ({ date, skills = [] }: z.infer<typeof dateAndSkills>) => {
        // Buscar assignments activos en la fecha, ordenados por endDate ascendente
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
          sort: 'endDate',
          depth: 1,
        })
        // Filtrar por skills si corresponde
        let filteredAssignments = assignments.docs
        if (skills.length > 0) {
          filteredAssignments = filteredAssignments.filter(
            (a: any) =>
              a.employee &&
              skills.some(
                (s: number) =>
                  Array.isArray(a.employee.skills) &&
                  a.employee.skills.some((sk: any) => sk.id === s),
              ),
          )
        }
        // El/los empleados más próximos a quedar libres
        return { docs: filteredAssignments }
      },
  },

  // Tool para buscar los IDs de las skills por nombre
  {
    name: 'find_skill_ids_by_name_and_return_current_time',
    description: 'Find technology (skill) IDs by their names and return the current time',
    schema: z.object({ names: z.array(z.string()) }),
    handler:
      (req: PayloadRequest) =>
      async ({ names }: { names: string[] }) => {
        const skillsResponse = await req.payload.find({
          collection: 'technologies',
          where: { name: { in: names } },
          depth: 0,
          limit: 999,
        })
        return {
          docs: skillsResponse.docs.map((s: any) => s.id),
          currentTime: new Date().toISOString(),
        }
      },
  },
]
