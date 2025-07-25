import * as React from 'react'
import { BotMessageSquare } from 'lucide-react'
import MarkdownMessage from '../../app/(frontend)/chat/MarkdownMessage'
import { Skeleton } from './skeleton'

interface ChatMessagesProps {
  messages: any[]
  loadingInitial: boolean
  loadingSend: boolean
}

const ChatMessages = ({ messages, loadingInitial, loadingSend }: ChatMessagesProps) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
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
              {msg.role === 'assistant' ? <MarkdownMessage content={msg.content} /> : msg.content}
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
              <div className="w-full text-xs mb-1 text-right text-purple-300 font-semibold">Tú</div>
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
  )
}

export default ChatMessages
