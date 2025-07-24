import { CollectionConfig } from 'payload'

import { startConversation, chatConversation } from '../app/endpoints/Conversations.endpoint'

const Conversations: CollectionConfig = {
  slug: 'conversations',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'messages',
      type: 'array',
      fields: [
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'System', value: 'system' },
            { label: 'User', value: 'user' },
            { label: 'Assistant', value: 'assistant' },
            { label: 'Tool', value: 'tool' },
          ],
          required: true,
        },
        {
          name: 'content',
          type: 'textarea',
          required: true,
        },
        {
          name: 'timestamp',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  endpoints: [
    {
      path: '/start',
      method: 'post',
      handler: startConversation,
    },
    {
      path: '/:id/chat',
      method: 'post',
      handler: chatConversation,
    },
  ],
}

export default Conversations
