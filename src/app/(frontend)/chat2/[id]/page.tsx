'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import MarkdownMessage from '../MarkdownMessage'
import { Chat } from '@/components/ui/chat'
export default function ChatIdPage() {
  const { id } = useParams()
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  // Cargar mensajes previos
  useEffect(() => {
    if (!id) return
    fetch(`/api/conversations/${id}`)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []))
      .then(() => setLoading(false))
  }, [id])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() }
    setMessages((msgs) => [...msgs, userMessage])
    setInput('')
    setLoading(true)

    const res = await fetch(`/api/conversations/${id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    })

    if (!res.body) {
      setLoading(false)
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
                setMessages((msgs) => {
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
    setLoading(false)
  }

  return (
    <>
      <Chat
        messages={messages}
        sendMessage={handleSend}
        input={input}
        setInput={setInput}
        loading={loading}
      />
    </>
  )
}
