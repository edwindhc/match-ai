'use client'

import * as React from 'react'
import { Bot, BotIcon, BotMessageSquare, Send, SendHorizonalIcon, Sparkles } from 'lucide-react'
import Image from 'next/image'
import MarkdownMessage from '../../app/(frontend)/chat/MarkdownMessage'
import { Skeleton } from './skeleton'

const Chat = ({
  messages,
  sendMessage,
  input,
  setInput,
  loadingInitial,
  loadingSend,
}: {
  messages: any[]
  sendMessage: (e: React.FormEvent) => Promise<void>
  input: string
  setInput: (input: string) => void
  loadingInitial: boolean
  loadingSend: boolean
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input después de recibir respuesta
  React.useEffect(() => {
    if (!loadingSend && inputRef.current) {
      inputRef.current.focus()
    }
  }, [loadingSend])

  return (
    <div className="h-screen min-h-screen bg-[#0c0414] text-white flex flex-col relative overflow-x-hidden">
      {/* Gradient */}
      <div className="flex gap-[10rem] rotate-[-20deg] absolute top-[-40rem] right-[-30rem] z-[0] blur-[4rem] skew-[-40deg]  opacity-50">
        <div className="w-[10rem] h-[20rem] rounded-2xl animated-gradient"></div>
        <div className="w-[10rem] h-[20rem] rounded-2xl animated-gradient"></div>
        <div className="w-[10rem] h-[20rem] rounded-2xl animated-gradient"></div>
      </div>
      <div className="flex gap-[10rem] rotate-[-20deg] absolute top-[-50rem] right-[-50rem] z-[0] blur-[4rem] skew-[-40deg]  opacity-50">
        <div className="w-[10rem] h-[20rem] rounded-2xl animated-gradient"></div>
        <div className="w-[10rem] h-[20rem] rounded-2xl animated-gradient"></div>
        <div className="w-[10rem] h-[20rem] rounded-2xl animated-gradient"></div>
      </div>
      <div className="flex gap-[10rem] rotate-[-20deg] absolute top-[-60rem] right-[-60rem] z-[0] blur-[4rem] skew-[-40deg]  opacity-50">
        <div className="w-[10rem] h-[30rem] rounded-2xl animated-gradient"></div>
        <div className="w-[10rem] h-[30rem] rounded-2xl animated-gradient"></div>
        <div className="w-[10rem] h-[30rem] rounded-2xl animated-gradient"></div>
      </div>
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <picture>
            <source srcSet="https://www.capgemini.com/es-es/wp-content/themes/capgemini2020/assets/images/logo.svg" />
            <Image
              alt="Payload Logo"
              height={200}
              src="https://www.capgemini.com/es-es/wp-content/themes/capgemini2020/assets/images/logo.svg"
              width={200}
            />
          </picture>
        </div>
        {/* <button className="bg-white text-black hover:bg-gray-200 rounded-full px-4 py-2 text-sm cursor-pointer font-semibold">
            Get Started
          </button> */}
      </header>

      {/* Main Content */}

      {/* Chat Messages */}
      <main className="flex flex-col px-4 gap-4 max-w-5xl w-full mx-auto flex-1">
        <div
          className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-[#17ABDA]/70 scrollbar-track-[#1a0036] pr-2"
          style={{
            minHeight: 0,
            maxHeight: 'calc(100vh - 200px)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#17ABDA #1c1528',
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'assistant' ? 'items-start' : 'items-end justify-end'} gap-3`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-[#17ABDA] rounded-full flex items-center justify-center">
                  <BotMessageSquare className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex flex-col w-full">
                <div
                  className={`w-full text-xs mb-1 ${msg.role === 'user' ? 'text-right' : 'text-left'} text-purple-300 font-semibold`}
                >
                  {msg.role === 'assistant' ? 'MathAI' : 'Tú'}{' '}
                  <span className="text-xs text-gray-400 ml-2">
                    {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div
                  className={`${msg.role === 'assistant' ? 'bubble-assistant' : 'bubble-user'} rounded-2xl px-4 py-2 max-w-[80%] break-words shadow-md ${
                    msg.role === 'assistant'
                      ? 'bg-[#1c1528] text-sm rounded-xl px-4 py-2 mt-1 w-fit max-w-[80%]'
                      : 'bg-[#2a1f3d] text-sm rounded-xl px-4 py-2 mt-1 w-fit max-w-[80%] ml-auto'
                  }
                `}
                >
                  {msg.role === 'assistant' ? (
                    <MarkdownMessage content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          ))}
          {loadingInitial && (
            <>
              {/* Skeleton MathAI */}
              <div className="flex items-start gap-3 mt-2">
                <div className="w-8 h-8 bg-[#17ABDA] rounded-full flex items-center justify-center">
                  <BotMessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col w-full">
                  <div className="w-full text-xs mb-1 text-left text-purple-300 font-semibold">
                    MathAI
                  </div>
                  <Skeleton className="h-6 w-96 mb-2 bg-[#2a1f3d]" />
                  <Skeleton className="h-6 w-[32rem] mb-2 bg-[#2a1f3d]" />
                  <Skeleton className="h-6 w-80 mb-2 bg-[#2a1f3d]" />
                  <Skeleton className="h-6 w-72 bg-[#2a1f3d]" />
                </div>
              </div>
              {/* Skeleton Usuario */}
              <div className="flex items-end justify-end gap-3 mt-2">
                <div className="flex flex-col w-full items-end">
                  <div className="w-full text-xs mb-1 text-right text-purple-300 font-semibold">
                    Tú
                  </div>
                  <Skeleton className="h-6 w-80 mb-2 bg-[#2a1f3d] ml-auto" />
                  <Skeleton className="h-6 w-64 bg-[#2a1f3d] ml-auto" />
                </div>
              </div>
            </>
          )}
          {loadingSend && !loadingInitial && (
            <div className="text-purple-300 text-sm mt-2">MathAI está pensando...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="relative max-w-2xl mx-auto w-full">
          <div className="bg-[#1c1528] rounded-full p-3 flex items-center">
            <button className="p-2 rounded-full hover:bg-[#2a1f3d] transition-all">
              <Sparkles className="w-5 h-5 text-[#17ABDA]" />
            </button>
            <form className="flex items-center gap-2 justify-between w-full" onSubmit={sendMessage}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                disabled={loadingSend}
                className="bg-transparent flex-1 outline-none text-gray-300 pl-4"
                autoFocus
              />
              <button
                type="submit"
                className="p-2 cursor-pointer rounded-full hover:bg-[#2a1f3d] transition-all"
                disabled={loadingSend}
              >
                <SendHorizonalIcon className="w-5 h-5 text-[#17ABDA]" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export { Chat }
