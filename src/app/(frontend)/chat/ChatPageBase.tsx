import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ChatLayout from '@/components/ui/ChatLayout'
import ChatMessages from '@/components/ui/ChatMessages'
import ChatInputBar from '@/components/ui/ChatInputBar'

interface ChatPageBaseProps {
  mode: 'new' | 'existing'
  suggestions?: string[]
}

const ChatPageBase = ({ mode, suggestions = [] }: ChatPageBaseProps) => {
  const router = useRouter()
  const params = useParams()
  const [messages, setMessages] = useState<any[]>(
    mode === 'new'
      ? [
          {
            role: 'assistant',
            content: '¡Hola! Soy tu agente IA. ¿En qué puedo ayudarte hoy?',
            timestamp: new Date().toISOString(),
          },
        ]
      : [],
  )
  const [input, setInput] = useState('')
  const [loadingInitial, setLoadingInitial] = useState(mode === 'existing')
  const [loadingSend, setLoadingSend] = useState(false)
  const id = params?.id

  // Cargar historial solo en modo existente
  useEffect(() => {
    if (mode !== 'existing' || !id) return
    setLoadingInitial(true)
    fetch(`/api/conversations/${id}`)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []))
      .finally(() => setLoadingInitial(false))
  }, [mode, id])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() }
    setMessages((msgs: any[]) => [...msgs, userMessage])
    setInput('')
    if (mode === 'new') {
      setLoadingSend(true)
      const res = await fetch('/api/conversations/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })
      if (!res.body) {
        setLoadingSend(false)
        return
      }
      const reader = res.body.getReader()
      let assistantMessage = ''
      let assistantTimestamp = ''
      let done = false
      let buffer = ''
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          buffer += new TextDecoder().decode(value)
          let eolIndex
          while ((eolIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, eolIndex).trim()
            buffer = buffer.slice(eolIndex + 1)
            if (line.startsWith('data:')) {
              try {
                const data = JSON.parse(line.replace('data:', '').trim())
                if (data.type === 'conversation_created') {
                  router.push(`/chat/${data.data}`)
                  return
                }
                if (data.type === 'assistant') {
                  assistantMessage = data.content
                  assistantTimestamp = data.timestamp
                  setMessages((msgs: any[]) => {
                    if (msgs[msgs.length - 1]?.role === 'user') {
                      return [
                        ...msgs,
                        {
                          role: 'assistant',
                          content: assistantMessage,
                          timestamp: assistantTimestamp,
                        },
                      ]
                    } else {
                      return msgs.map((msg, i) =>
                        i === msgs.length - 1 && msg.role === 'assistant'
                          ? { ...msg, content: assistantMessage, timestamp: assistantTimestamp }
                          : msg,
                      )
                    }
                  })
                }
              } catch (err) {}
            }
          }
        }
      }
      setLoadingSend(false)
    } else {
      setLoadingSend(true)
      const res = await fetch(`/api/conversations/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })
      if (!res.body) {
        setLoadingSend(false)
        return
      }
      const reader = res.body.getReader()
      let buffer = ''
      let done = false
      let assistantMessage = ''
      let assistantTimestamp = ''
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          buffer += new TextDecoder().decode(value)
          let eolIndex
          while ((eolIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, eolIndex).trim()
            buffer = buffer.slice(eolIndex + 1)
            if (line.startsWith('data:')) {
              try {
                const data = JSON.parse(line.replace('data:', '').trim())
                if (data.type === 'assistant') {
                  assistantMessage = data.content
                  assistantTimestamp = data.timestamp
                  setMessages((msgs: any[]) => {
                    if (msgs[msgs.length - 1]?.role === 'user') {
                      return [
                        ...msgs,
                        {
                          role: 'assistant',
                          content: assistantMessage,
                          timestamp: assistantTimestamp,
                        },
                      ]
                    } else {
                      return msgs.map((msg, i) =>
                        i === msgs.length - 1 && msg.role === 'assistant'
                          ? { ...msg, content: assistantMessage, timestamp: assistantTimestamp }
                          : msg,
                      )
                    }
                  })
                }
              } catch (err) {}
            }
          }
        }
      }
      setLoadingSend(false)
    }
  }

  return (
    <ChatLayout>
      <main className="flex flex-col px-4 gap-4 max-w-5xl w-full mx-auto flex-1">
        <ChatMessages
          messages={messages}
          loadingInitial={loadingInitial}
          loadingSend={loadingSend}
        />
        <ChatInputBar
          input={input}
          setInput={setInput}
          onSend={handleSend}
          loading={loadingSend}
          suggestions={mode === 'new' ? suggestions : []}
        />
      </main>
    </ChatLayout>
  )
}

export default ChatPageBase
