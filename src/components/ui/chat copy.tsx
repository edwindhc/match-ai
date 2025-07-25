'use client'

import * as React from 'react'
import { SendHorizonalIcon, Sparkles } from 'lucide-react'
import Image from 'next/image'
import MarkdownMessage from '../../app/(frontend)/chat/MarkdownMessage'

interface Message {
  role: 'assistant' | 'user'
  content: string
  timestamp: string
}

interface ChatProps {
  messages: Message[]
  input: string
  setInput: (input: string) => void
  loading: boolean
  onSend: (e: React.FormEvent) => void
}

export const Chat = ({ messages, input, setInput, loading, onSend }: ChatProps) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="min-h-screen bg-[#0c0414] text-white flex flex-col relative overflow-x-hidden">
      {/* Gradient */}
      <div className="flex gap-[10rem] rotate-[-20deg] absolute top-[-40rem] right-[-30rem] z-[0] blur-[4rem] skew-[-40deg]  opacity-50">
        <div className="w-[10rem] h-[20rem]  bg-linear-90 from-white to-blue-300"></div>
        <div className="w-[10rem] h-[20rem]  bg-linear-90 from-white to-blue-300"></div>
        <div className="w-[10rem] h-[20rem]  bg-linear-90 from-white to-blue-300"></div>
      </div>
      <div className="flex gap-[10rem] rotate-[-20deg] absolute top-[-50rem] right-[-50rem] z-[0] blur-[4rem] skew-[-40deg]  opacity-50">
        <div className="w-[10rem] h-[20rem]  bg-linear-90 from-white to-blue-300"></div>
        <div className="w-[10rem] h-[20rem]  bg-linear-90 from-white to-blue-300"></div>
        <div className="w-[10rem] h-[20rem]  bg-linear-90 from-white to-blue-300"></div>
      </div>
      <div className="flex gap-[10rem] rotate-[-20deg] absolute top-[-60rem] right-[-60rem] z-[0] blur-[4rem] skew-[-40deg]  opacity-50">
        <div className="w-[10rem] h-[30rem]  bg-linear-90 from-white to-blue-300"></div>
        <div className="w-[10rem] h-[30rem]  bg-linear-90 from-white to-blue-300"></div>
        <div className="w-[10rem] h-[30rem]  bg-linear-90 from-white to-blue-300"></div>
      </div>
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <picture>
            <source srcSet="/logo-mathai.svg" />
            <Image alt="MathAI Logo" height={40} src="/logo-mathai.svg" width={40} />
          </picture>
          <span className="font-bold text-xl tracking-tight ml-2">MathAI</span>
        </div>
      </header>
      {/* Chat Messages */}
      <main className="flex flex-col px-4 py-6 gap-4 max-w-3xl w-full mx-auto flex-1">
        <div
          className="flex-1 overflow-y-auto space-y-4 h-[420px]"
          style={{ scrollbarWidth: 'thin' }}
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col items-${msg.role === 'user' ? 'end' : 'start'}`}>
              <div
                className={`text-xs mb-1 ${msg.role === 'user' ? 'text-right' : 'text-left'} text-purple-300 font-semibold`}
              >
                {msg.role === 'assistant' ? 'MathAI' : 'Tú'}
              </div>
              <div
                className={`rounded-2xl px-4 py-2 max-w-[80%] break-words shadow-md ${
                  msg.role === 'assistant'
                    ? 'bg-gradient-to-br from-[#3a2067] to-[#5f2b8a] text-left text-white'
                    : 'bg-gradient-to-br from-[#2d0a4b] to-[#3a2067] text-right text-purple-100'
                }
              `}
              >
                {msg.role === 'assistant' ? <MarkdownMessage content={msg.content} /> : msg.content}
              </div>
              <div
                className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'} text-gray-400`}
              >
                {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          {loading && (
            <div className="text-purple-300 text-sm mt-2">MathAI está escribiendo...</div>
          )}
        </div>
        {/* Input */}
        <form
          className="flex items-center gap-2 p-4 border-t border-[#2d0a4b] bg-[#1a0036]/80"
          onSubmit={onSend}
        >
          <span className="text-purple-400">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 px-2 py-2"
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-purple-700 hover:bg-purple-800 transition-colors text-white rounded-full px-4 py-2 font-semibold shadow"
          >
            <SendHorizonalIcon className="w-5 h-5 text-white" />
          </button>
        </form>
      </main>
    </div>
  )
}
