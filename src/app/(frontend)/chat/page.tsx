'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import MarkdownMessage from './MarkdownMessage'
import { Hero1 } from '@/components/ui/hero-1'
export default function Chat2Page() {
  const router = useRouter()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu agente IA. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() }
    setMessages((msgs) => [...msgs, userMessage])
    setInput('')
    setLoading(true)
    console.log('input', input)

    // Llama al endpoint que retorna un stream
    const res = await fetch('/api/conversations/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    })

    if (!res.body) {
      setLoading(false)
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
        // Decodifica el chunk y procesa cada línea SSE
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
                // Actualiza el último mensaje del asistente o agrégalo si no existe
                setMessages((msgs) => {
                  // Si el último mensaje es del usuario, agrega uno nuevo del asistente
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
                    // Si ya hay un mensaje del asistente, actualízalo
                    return msgs.map((msg, i) =>
                      i === msgs.length - 1 && msg.role === 'assistant'
                        ? { ...msg, content: assistantMessage, timestamp: assistantTimestamp }
                        : msg,
                    )
                  }
                })
              }
            } catch (err) {
              // Ignora líneas que no sean JSON
            }
          }
        }
      }
    }
    setLoading(false)
  }

  return (
    <>
      <Hero1 sendMessage={handleSend} input={input} setInput={setInput} loading={loading} />
    </>
  )
}
