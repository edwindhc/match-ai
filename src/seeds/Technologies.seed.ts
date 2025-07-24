import { Payload } from 'payload'

export const TechnologiesSeed = async (payload: Payload) => {
  const technologies = await payload.find({
    collection: 'technologies',
  })
  if (technologies.docs.length > 0) return

  await payload.create({
    collection: 'technologies',
    data: {
      name: 'React',
    },
  })
}
