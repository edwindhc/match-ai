import { APIError, PayloadRequest } from 'payload'
import { OpenAIModel } from '../langchain/models/OpenAIModel'
import { AgentFactory } from '../langchain/factory/AgentFactory'
import { ConversationMemory } from '../langchain/memory/ConversationMemory'
import { generateTools } from '../langchain/tools'
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages'
import { StreamService } from '../services/StreamService'

function baseMessageToRoleContent(message: BaseMessage): {
  role: 'user' | 'system' | 'assistant' | 'tool'
  content: string
} {
  console.log(message, message.getType(), 'message')
  const types = {
    human: 'user',
    system: 'system',
    ai: 'assistant',
    tool: 'tool',
  } as const
  const role = types[message.getType() as keyof typeof types]

  return {
    role,
    content: message.lc_kwargs.content,
  }
}

export const generateTitle = (input: string) => {
  return input.slice(0, 50) + (input.length > 50 ? '...' : '')
}

export const startConversation = async (req: PayloadRequest) => {
  try {
    let data: { [key: string]: string } = {}
    if (typeof req.json === 'function') {
      data = await req.json()
    }
    const { message } = data

    const openAIModel = new OpenAIModel()
    const agent = AgentFactory.createAgent(openAIModel, generateTools(req))
    const memory = new ConversationMemory(openAIModel.getModel())

    const systemMessage = `Como TalentMatch AI, debes utilizar las siguientes herramientas para responder a las solicitudes relacionadas con la disponibilidad y habilidades de empleados:

Cuando muestres una lista (empleados, proyectos, asignaciones, tecnologías), usa este formato Markdown:

Lista numerada (1., 2., 3., …) Obligatoriamente cada item debe estar enumerado
y cada reistro o campo debe tener un salto de linea

Una línea por campo, con el nombre en negrita

Doble salto de línea entre cada ítem

Escribe "No especificado" si falta un valor

Ejemplo - Empleados:

Nombre: John Doe
Correo Electrónico: john.doe@example.com
Ubicación: Madrid
Área: Backend
Grado: B2
Skills: React, Node.js

Nombre: Lisa Paez
Correo Electrónico: lisa.paez@example.com
Ubicación: No especificado
Área: No especificado
Grado: A1
Skills: Vue.js



Recuerda:  
Siempre valida tus sugerencias usando las tools antes de responder y explica tu razonamiento si es relevante para la decisión.`

    /*  const systemMessage = `Eres TalentMatch AI, un agente inteligente especializado en staffing ágil para entornos corporativos. Estás diseñado para asistir a Project Managers, Recursos Humanos y otros roles clave en la identificación, recomendación y planificación de talento técnico.

Tu objetivo es automatizar el proceso de búsqueda y recomendación de candidatos para proyectos tecnológicos, mejorando la experiencia del usuario (CX) y optimizando el uso de talento interno.

Tu comportamiento está guiado por los siguientes principios y funciones:

---

📌 CONTEXTO GENERAL:
- Estás integrado en una plataforma empresarial que utiliza Payload CMS, MongoDB y React como frontend.
- Puedes acceder a datos internos de empleados (habilidades, experiencia, disponibilidad) desde bases de datos y archivos Excel conectados.
- Actúas con capacidad de autoreflexión para verificar que tus respuestas sean precisas y útiles.

---

🔍 FUNCIONES PRINCIPALES:

1. **Identificación de Perfiles:**
   - Accede a la base de datos de empleados.
   - Extrae perfiles que coincidan con criterios específicos (tecnología, años de experiencia, disponibilidad).
   - Si no hay perfiles internos adecuados, puedes sugerir contrataciones externas.

2. **Filtrado Inteligente:**
   - Evalúa las habilidades técnicas requeridas (ej. "React", "Python", etc.) y la experiencia mínima en años.
   - Considera la fecha de disponibilidad como parámetro obligatorio.

3. **Verificación de Asignaciones:**
   - Revisa si los candidatos están actualmente asignados a algún proyecto o disponibles para uno nuevo.

4. **Predicción de Disponibilidad:**
   - Estima la próxima fecha libre de cada candidato basado en compromisos actuales.

5. **Autoreflexión:**
   - Evalúa tu razonamiento antes de responder para asegurar que los perfiles sugeridos son los más relevantes.

6. **Respuesta Conversacional Clara y Profesional:**
   - Responde siempre con lenguaje profesional, orientado a negocios.
   - Usa viñetas o listas cuando presentes varios candidatos.
   - Incluye nombre, tecnología principal, años de experiencia, y disponibilidad estimada por cada candidato sugerido.

---

📊 OBJETIVOS DE NEGOCIO:

- Reducir el tiempo de búsqueda de talento en un 70%.
- Aumentar el uso de perfiles internos en un 30%.
- Disminuir los costes por contrataciones externas en un 25%.
- Aumentar la satisfacción de Project Managers y Recursos Humanos por encima del 90%.

---

🎯 EJEMPLO DE PETICIÓN:
"Necesito un desarrollador React con al menos 2 años de experiencia, disponible en las próximas 2 semanas."

🎯 RESPUESTA ESPERADA:
"He encontrado 3 perfiles internos que cumplen tus requisitos:
- **Carlos Martínez**: 3 años en React, disponible en 1 semana.
- **Ana Gómez**: 2.5 años en React, disponible inmediatamente.
- **Miguel Torres**: 4 años en React, disponible en 10 días."

---

⚠️ SI NO HAY CANDIDATOS:
- Sugiere perfiles externos si están disponibles.
- Recomienda iniciar proceso de contratación si detectas una brecha recurrente.

---

Utiliza autoreflexión y herramientas de razonamiento cuando lo consideres necesario para validar tus sugerencias antes de responder.
` */
    await memory.addMessage(message, 'user')

    // Verificar que la memoria tenga el contexto necesario
    const context = await memory.getContext()

    const stream = await agent.stream({
      messages: context.chat_history,
    })
    const streamService = new StreamService({
      onComplete: async (messages) => {
        const transformedMessage = messages
          .filter((message) => message.lc_kwargs.content)
          .map(baseMessageToRoleContent)

        const conversation = await req.payload
          .create({
            collection: 'conversations',
            data: {
              title: 'test',
              messages: transformedMessage.map((msg) => ({
                ...msg,
                content:
                  typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
                timestamp: (msg as any).timestamp || new Date().toISOString(),
              })),
            },
          })
          .catch((error) => {
            console.error('Error en startConversation:', error)
            const apiError =
              error?.data?.errors ?? error?.message ?? 'Error desconocido al crear la conversación'
            throw new APIError(apiError, 400, null, true)
          })

        const finalResponse = JSON.stringify({
          type: 'conversation_created',
          data: conversation?.id,
        })
        return finalResponse
      },
    })

    return streamService.createResponse(stream)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error en startConversation:', error)
    throw new APIError(error?.message || 'Error starting conversation', 400, null, true)
  }
}

export const chatConversation = async (req: PayloadRequest) => {
  try {
    let data: { [key: string]: string } = {}
    if (typeof req.json === 'function') {
      data = await req.json()
    }
    const { id } = req.routeParams as { id: string }
    const { message } = data

    const conversation = await req.payload.findByID({
      collection: 'conversations',
      id,
    })

    if (!conversation) {
      throw new APIError('Conversation not found', 400, null, true)
    }

    const openAIModel = new OpenAIModel()
    const agent = AgentFactory.createAgent(openAIModel, generateTools(req))
    const memory = new ConversationMemory(openAIModel.getModel())

    const lastMsg = (conversation.messages || []).slice(-1)[0]
    if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== message) {
      for (const msg of conversation.messages || []) {
        if (msg.role !== 'tool') {
          await memory.addMessage(msg.content, msg.role, (msg as any).timestamp)
        }
      }
      await memory.addMessage(message, 'user')
    } else {
      for (const msg of conversation.messages || []) {
        if (msg.role !== 'tool') {
          await memory.addMessage(msg.content, msg.role, (msg as any).timestamp)
        }
      }
    }

    const { chat_history: messages } = await memory.getContext()

    const stream = await agent.stream({
      messages,
    })

    const streamService = new StreamService({
      onComplete: async (messages) => {
        const transformedMessage = messages
          .filter((message) => message.lc_kwargs.content)
          .map(baseMessageToRoleContent)
        const currentMessages = conversation.messages || []
        // Verifica si el último mensaje del usuario ya está en el historial
        const lastUserMsg =
          currentMessages.length > 0 ? currentMessages[currentMessages.length - 1] : null
        const shouldAddUserMsg =
          !lastUserMsg || lastUserMsg.content !== message || lastUserMsg.role !== 'user'

        // Prepara el nuevo mensaje del asistente
        const lastAssistantMsg = transformedMessage.slice(-1)[0]
        const shouldAddAssistantMsg =
          lastAssistantMsg &&
          !currentMessages.some(
            (msg) => msg.role === lastAssistantMsg.role && msg.content === lastAssistantMsg.content,
          )

        const newMessages = [...currentMessages]
        if (shouldAddUserMsg) {
          newMessages.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
          } as any)
        }
        if (shouldAddAssistantMsg && lastAssistantMsg) {
          newMessages.push({ ...lastAssistantMsg, timestamp: new Date().toISOString() } as any)
        }

        await req.payload.update({
          collection: 'conversations',
          id,
          data: {
            messages: newMessages,
          },
        })
        return undefined
      },
    })

    return streamService.createResponse(stream)
  } catch (error: any) {
    console.error('Error en chatConversation:', error)
    throw new APIError(error?.message || 'Error en la conversación', 400, null, true)
  }
}
