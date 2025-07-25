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

function processText(text: string) {
  return text.replace(/\\n/g, '\n').replace(/\s+\n/g, '\n').trim()
}

function baseMessageToRoleContent(message: BaseMessage): {
  role: 'user' | 'system' | 'assistant' | 'tool'
  content: string
} {
  const types = {
    human: 'user',
    system: 'system',
    ai: 'assistant',
    tool: 'tool',
  } as const
  console.log(message.getType(), 'message.getType()')
  const role = types[message.getType() as keyof typeof types]

  return {
    role,
    content: processText(message.lc_kwargs.content ?? ''),
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
    1. find_skill_ids_by_name_and_return_current_time
    Úsala para obtener los IDs de las skills por su nombre y devolver la fechay hora actual.
    Si el usuario solicita skills específicas, utiliza esta tool para obtener los IDs antes de usar las otras tools.
2. find_busy_employees
Úsala para identificar empleados que están ocupados (tienen asignaciones activas) en una fecha específica.
Si el usuario solicita saber quiénes NO están disponibles o quiénes están asignados en cierto periodo, utiliza esta tool.
Puedes filtrar por skills si el usuario lo solicita.
3. find_free_employees
Úsala para encontrar empleados libres (sin asignaciones activas) en una fecha específica.
Si el usuario pide empleados disponibles para un proyecto en una fecha, esta es la tool principal.
Si el usuario especifica skills requeridas, pásalas como filtro; si no, busca todos los libres.
3. find_next_available_employees
Úsala cuando NO haya empleados libres en la fecha solicitada.
Sirve para sugerir empleados que estarán disponibles próximamente, ordenados por la fecha más cercana de liberación.
Si el usuario pregunta por "el próximo disponible" o "quién estará libre pronto", utiliza esta tool.
También puedes filtrar por skills si es necesario.
la fecha debe ser en formato ISO string, ejemplo: 2025-07-19T11:17:58.982Z
🧠 COMPORTAMIENTO DEL AGENTE
Antes de responder, reflexiona sobre cuál tool es la más adecuada según la petición del usuario.
Si el usuario no especifica skills, busca todos los empleados que cumplan la condición de disponibilidad.
Si ninguna tool retorna resultados (por ejemplo, no hay libres ni próximos a liberar), sugiere buscar perfiles externos o iniciar proceso de contratación.
Siempre presenta los resultados de forma clara, profesional y orientada a negocios, incluyendo nombre, skills principales, años de experiencia y fecha de disponibilidad.
Si la petición es ambigua, pide aclaraciones al usuario antes de ejecutar una tool.
🛠️ EJEMPLOS DE USO DE TOOLS
Petición: "¿Quién está disponible el 10 de junio con skills en Python?"
Usa: find_free_employees con { date: '2024-06-10', skills: ['Python'] }
Petición: "¿Quién estará libre más pronto con experiencia en React?"
Usa: find_next_available_employees con { date: hoy, skills: ['React'] }
Petición: "¿Quiénes están ocupados el 1 de julio?"
Usa: find_busy_employees con { date: '2024-07-01' }
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
              title: generateTitle(transformedMessage[1].content),
              messages: transformedMessage.map((msg) => ({
                ...msg,
                timestamp: (msg as any).timestamp || new Date().toISOString(),
              })),
            },
          })
          .catch((error) => {
            console.error('Error en startConversation:', error)
            throw new APIError(error.data.errors, 400, null, true)
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
        console.log(transformedMessage.slice(-1), ' transformedMessage')
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
