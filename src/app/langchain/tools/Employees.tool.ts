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
  {
    name: 'predict_employee_availability',
    description:
      'Predict when a specific employee will be available based on their current and upcoming assignments.',
    schema: z.object({ employeeId: z.string() }),
    handler:
      (req: PayloadRequest) =>
      async ({ employeeId }: { employeeId: string }) => {
        const assignments = await req.payload.find({
          collection: 'assignments',
          where: {
            employee: { equals: employeeId },
          },
          sort: '-endDate',
          limit: 1,
        })

        const lastAssignment = assignments.docs[0]
        const availableDate = lastAssignment?.endDate || new Date().toISOString()

        return {
          employeeId,
          availableDate,
          source: lastAssignment ? 'last_assignment_end' : 'available_now',
        }
      },
  },
  {
    name: 'find_projects_with_staffing_gaps',
    description: 'Find ongoing projects that have no or too few employees assigned to them.',
    schema: z.object({ minimumEmployees: z.number().default(1) }),
    handler:
      (req: PayloadRequest) =>
      async ({ minimumEmployees }: { minimumEmployees: number }) => {
        const projects = await req.payload.find({
          collection: 'projects',
          where: {
            endDate: { greater_than_equal: new Date().toISOString() },
          },
          depth: 2,
          limit: 999,
        })

        const underAssigned = projects.docs.filter((project: any) => {
          const count = project.assignments?.length || 0
          return count < minimumEmployees
        })

        return underAssigned
      },
  },
  {
    name: 'suggest_employees_for_project',
    description: 'Suggest available employees that best match a project based on skills and dates.',
    schema: z.object({
      projectId: z.string(),
    }),
    handler:
      (req: PayloadRequest) =>
      async ({ projectId }: { projectId: string }) => {
        const project = await req.payload.findByID({
          collection: 'projects',
          id: projectId,
        })

        if (!project) return { error: 'Project not found' }

        const requiredDates = {
          startDate: project.startDate,
          endDate: project.endDate,
        }

        const assignments = await req.payload.find({
          collection: 'assignments',
          where: {
            and: [
              { startDate: { less_than_equal: requiredDates.endDate } },
              {
                or: [
                  { endDate: { greater_than_equal: requiredDates.startDate } },
                  { endDate: { equals: null } },
                ],
              },
            ],
          },
        })

        const busyEmployeeIds = assignments.docs.map((a) => a.employee)

        const allEmployees = await req.payload.find({
          collection: 'employees',
          where: {
            id: { not_in: busyEmployeeIds },
          },
          depth: 1,
        })

        return {
          suggested: allEmployees.docs,
          basedOn: {
            availableBetween: requiredDates,
          },
        }
      },
  },
  {
    name: 'analyze_skill_demand',
    description: 'Analyze the most demanded skills based on current project assignments.',
    schema: z.object({ top: z.number().default(5) }),
    handler:
      (req: PayloadRequest) =>
      async ({ top }: { top: number }) => {
        const assignments = await req.payload.find({
          collection: 'assignments',
          depth: 2,
          limit: 999,
        })

        const skillCount: Record<string, number> = {}

        assignments.docs.forEach((a: any) => {
          if (a.employee?.skills?.length) {
            a.employee.skills.forEach((s: any) => {
              skillCount[s.name] = (skillCount[s.name] || 0) + 1
            })
          }
        })

        const sortedSkills = Object.entries(skillCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, top)
          .map(([skill, count]) => ({ skill, count }))

        return {
          topSkills: sortedSkills,
          totalAssignments: assignments.totalDocs,
        }
      },
  },
  {
    name: 'get_employee_assignments_by_id_or_name',
    description:
      'Get all assignments for a specific employee by ID or by full name (first and/or last name). Returns the project, role and dates.',
    schema: z.object({
      employeeId: z.string().optional(),
      name: z.string().optional(),
    }),
    handler:
      (req: PayloadRequest) =>
      async ({ employeeId, name }: { employeeId?: string; name?: string }) => {
        if (!employeeId && !name) {
          return { error: 'You must provide either employeeId or name.' }
        }

        // Buscar el empleado
        let employee: any = null
        if (employeeId) {
          employee = await req.payload.findByID({
            collection: 'employees',
            id: employeeId,
          })
        } else if (name) {
          const [firstName, lastName = ''] = name.split(' ')
          const response = await req.payload.find({
            collection: 'employees',
            where: {
              and: [{ firstName: { like: firstName } }, { lastName: { like: lastName } }],
            },
            limit: 1,
          })
          employee = response.docs[0]
        }

        if (!employee) return { error: 'Employee not found.' }

        // Buscar asignaciones de ese empleado
        const assignments = await req.payload.find({
          collection: 'assignments',
          where: {
            employee: { equals: employee.id },
          },
          depth: 2,
        })

        return {
          employee: {
            id: employee.id,
            fullName: `${employee.firstName} ${employee.lastName}`,
          },
          assignments: assignments.docs.map((a: any) => ({
            project: a.project?.name || 'N/A',
            role: a.role || 'N/A',
            startDate: a.startDate,
            endDate: a.endDate,
          })),
        }
      },
  },
  {
    name: 'create_project',
    description: 'Create a new project with name, description, manager, and dates.',
    schema: z.object({
      name: z.string(),
      description: z.string().optional(),
      managerId: z.number(),
      startDate: z.string(), // ISO format
      endDate: z.string(), // ISO format
    }),
    handler:
      (req: PayloadRequest) =>
      async ({
        name,
        description,
        managerId,
        startDate,
        endDate,
      }: {
        name: string
        description?: string
        managerId: number
        startDate: string
        endDate: string
      }) => {
        const newProject = await req.payload.create({
          collection: 'projects',
          data: {
            name,
            description,
            manager: managerId,
            startDate,
            endDate,
          },
        })
        return newProject
      },
  },
  {
    name: 'create_employee',
    description:
      'Create a new employee with name, email, location, area, grade, and skills. Automatically creates any missing skills.',
    schema: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      location: z.string().optional(),
      area: z.string().optional(),
      grade: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
      skills: z.array(z.number()).optional(),
    }),
    handler:
      (req: PayloadRequest) =>
      async ({
        firstName,
        lastName,
        email,
        location,
        area,
        grade,
        skills = [],
      }: {
        firstName: string
        lastName: string
        email: string
        location?: string
        area?: string
        grade: string
        skills?: number[]
      }) => {
        // Crear el nuevo empleado
        const newEmployee = await req.payload.create({
          collection: 'employees',
          data: {
            firstName,
            lastName,
            email,
            location,
            area,
            grade: grade as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
            skills,
          },
        })

        return newEmployee
      },
  },
  {
    name: 'create_assignment',
    description: 'Create a new assignment linking an employee to a project with role and dates.',
    schema: z.object({
      employeeId: z.number(),
      projectId: z.number(),
      role: z.string().optional(),
      startDate: z.string(), // ISO
      endDate: z.string().optional(),
    }),
    handler:
      (req: PayloadRequest) =>
      async ({
        employeeId,
        projectId,
        role,
        startDate,
        endDate,
      }: {
        employeeId: number
        projectId: number
        role?: string
        startDate: string
        endDate?: string
      }) => {
        const newAssignment = await req.payload.create({
          collection: 'assignments',
          data: {
            employee: employeeId,
            project: projectId,
            role,
            startDate,
            endDate,
          },
        })
        return newAssignment
      },
  },
  {
    name: 'create_technology',
    description: 'Create a new technology (skill) by name.',
    schema: z.object({
      name: z.string(),
    }),
    handler:
      (req: PayloadRequest) =>
      async ({ name }: { name: string }) => {
        const newTech = await req.payload.create({
          collection: 'technologies',
          data: { name },
        })
        return newTech
      },
  },

  {
    name: 'get_all_projects',
    description: 'Retrieve all projects in the system.',
    schema: z.object({}),
    handler: (req: PayloadRequest) => async () => {
      const projects = await req.payload.find({
        collection: 'projects',
        limit: 999,
      })
      return projects
    },
  },
  {
    name: 'get_all_assignments',
    description: 'Retrieve all assignments, including project and employee info.',
    schema: z.object({}),
    handler: (req: PayloadRequest) => async () => {
      const assignments = await req.payload.find({
        collection: 'assignments',
        depth: 2,
        limit: 999,
      })
      return assignments
    },
  },
  {
    name: 'get_all_technologies',
    description: 'Retrieve all registered technologies (skills).',
    schema: z.object({}),
    handler: (req: PayloadRequest) => async () => {
      const technologies = await req.payload.find({
        collection: 'technologies',
        limit: 999,
      })
      return technologies
    },
  },
  {
    name: 'get_all_employees',
    description: 'Retrieve all employees, including their skills and assignments.',
    schema: z.object({}),
    handler: (req: PayloadRequest) => async () => {
      const employees = await req.payload.find({
        collection: 'employees',
        depth: 2,
        limit: 999,
      })
      return employees
    },
  },
]
