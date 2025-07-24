import type { CollectionConfig } from 'payload'
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'manager', 'startDate', 'endDate'],
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
      name: 'name',
      label: 'Nombre del proyecto',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
    },
    {
      name: 'manager',
      label: 'Responsable',
      type: 'relationship',
      relationTo: 'employees',
      required: true,
    },
    {
      name: 'startDate',
      label: 'Fecha de inicio',
      type: 'date',
      required: true,
    },
    {
      name: 'endDate',
      label: 'Fecha de fin',
      type: 'date',
      required: true,
    },
    {
      name: 'assignments',
      label: 'Asignaciones',
      type: 'relationship',
      relationTo: 'assignments',
      hasMany: true,
      admin: {
        hidden: true,
      },
    },
  ],
}
