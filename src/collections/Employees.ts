import { freeEmployee } from '@/app/endpoints/Employee.endpoint'
import type { CollectionConfig } from 'payload'
import payload from 'payload'
export const Employees: CollectionConfig = {
  slug: 'employees',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'grade', 'location'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        console.log(data, 'data beforeChange')
        return data
      },
    ],
  },
  /* hooks: {
    afterRead: [
      async ({ doc, req }) => {
        const r = req as any
        if (r._fromEmployeeAfterRead) return doc
        r._fromEmployeeAfterRead = true
        const assignments = await req.payload.find({
          collection: 'assignments',
          where: {
            employee: {
              equals: doc.id,
            },
          },
          depth: 0,
        })
        r._fromEmployeeAfterRead = false
        return {
          ...doc,
          assignments: assignments.docs,
        }
      },
    ],
  }, */
  auth: false,
  timestamps: true,
  fields: [
    {
      name: 'firstName',
      label: 'Nombre',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      label: 'Apellido',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'location',
      label: 'Localidad',
      type: 'text',
    },
    {
      name: 'area',
      label: 'Área',
      type: 'text',
    },
    {
      name: 'grade',
      label: 'Grado',
      type: 'select',
      required: true,
      options: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      defaultValue: 'A1',
    },
    {
      name: 'skills',
      label: 'Tecnologías',
      type: 'relationship',
      relationTo: 'technologies',
      filterOptions: ({ id }) => {
        console.log(id, 'id filterOptions')
        return {
          id: {
            not_in: id ? [id] : [],
          },
        }
      },
      hasMany: true,
    },
    {
      name: 'assignments',
      label: 'Asignaciones',
      type: 'relationship',
      relationTo: 'assignments',
      hasMany: true,
      virtual: true,
      filterOptions: ({ id }) => {
        return {
          id: {
            not_in: id ? [id] : [],
          },
        }
      },
      admin: {
        hidden: true,
      },
    },
  ],
  endpoints: [
    {
      path: '/freeEmployee',
      method: 'get',
      handler: freeEmployee,
    },
  ],
}
