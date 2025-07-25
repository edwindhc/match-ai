import * as React from 'react'
import { SendHorizonalIcon, Sparkles } from 'lucide-react'
import { Loader2 } from 'lucide-react'

interface ChatInputBarProps {
  input: string
  setInput: (input: string) => void
  onSend: (e: React.FormEvent) => Promise<void>
  loading: boolean
  placeholder?: string
  suggestions?: string[]
}

const ChatInputBar = ({
  input,
  setInput,
  onSend,
  loading,
  placeholder = 'Escribe un mensaje...',
  suggestions = [],
}: ChatInputBarProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [loading])

  return (
    <div className="relative max-w-2xl mx-auto w-full">
      <div className="bg-[#1c1528] rounded-full p-3 flex items-center">
        <button className="p-2 rounded-full hover:bg-[#2a1f3d] transition-all">
          <Sparkles className="w-5 h-5 text-[#17ABDA]" />
        </button>
        <form className="flex items-center gap-2 justify-between w-full" onSubmit={onSend}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            className="bg-transparent flex-1 outline-none text-gray-300 pl-4"
            autoFocus
          />
          <button
            type="submit"
            className="p-2 cursor-pointer rounded-full hover:bg-[#2a1f3d] transition-all"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 text-[#17ABDA] animate-spin" />
            ) : (
              <SendHorizonalIcon className="w-5 h-5 text-[#17ABDA]" />
            )}
          </button>
        </form>
      </div>
      {loading && <div className="text-purple-300 text-sm mt-2">MathAI está pensando...</div>}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-2xl mx-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="bg-[#1c1528] hover:bg-[#2a1f3d] rounded-full px-4 py-2 text-sm cursor-pointer"
              onClick={() => {
                setInput(suggestion)
                setTimeout(() => {
                  if (inputRef.current)
                    inputRef.current.form?.dispatchEvent(
                      new Event('submit', { cancelable: true, bubbles: true }),
                    )
                }, 0)
              }}
              disabled={loading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChatInputBar
