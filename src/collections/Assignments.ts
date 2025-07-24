import type { CollectionConfig } from 'payload'
export const Assignments: CollectionConfig = {
  slug: 'assignments',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['employee', 'project', 'startDate', 'endDate'],
  },
  auth: false,
  timestamps: true,
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'employee',
      label: 'Empleado',
      type: 'relationship',
      relationTo: 'employees',
      required: true,
    },
    {
      name: 'project',
      label: 'Proyecto',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
    },
    {
      name: 'role',
      label: 'Rol',
      type: 'text',
    },
    {
      name: 'startDate',
      label: 'Fecha de asignación',
      type: 'date',
      required: true,
    },
    {
      name: 'endDate',
      label: 'Fecha de liberación',
      type: 'date',
    },
  ],
}
