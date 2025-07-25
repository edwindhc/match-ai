'use client'

import * as React from 'react'
import { Send, SendHorizonalIcon, Sparkles } from 'lucide-react'
import Image from 'next/image'

const Hero1 = ({
  sendMessage,
  input,
  setInput,
}: {
  sendMessage: (e: React.FormEvent) => Promise<void>
  input: string
  setInput: (input: string) => void
}) => {
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
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex-1 flex justify-center">
            <div className="bg-[#1c1528] rounded-full px-4 py-2 flex items-center gap-2  w-fit mx-4">
              <span className="text-xs flex items-center gap-2">
                <span className="bg-black p-1 rounded-full">🥳</span>
                Talent AI encuentra talento en segundos
              </span>
            </div>
          </div>
          {/* Headline */}
          <h1 className="text-5xl font-bold leading-tight">
            Construye equipos ganadores sin esfuerzo
          </h1>

          {/* Subtitle */}
          <p className="text-md">
            TalentMatch AI te ayuda a encontrar el talento ideal para tus proyectos — de forma
            rápida, precisa y basada en datos.
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl mx-auto w-full">
            <div className="bg-[#1c1528] rounded-full p-3 flex items-center">
              <button className="p-2 rounded-full hover:bg-[#2a1f3d] transition-all">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </button>
              <form
                className="flex items-center gap-2 justify-between w-full"
                onSubmit={sendMessage}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="¿Cómo puede ayudarte TalentMatch AI hoy?"
                  className="bg-transparent flex-1 outline-none text-gray-300 pl-4"
                />
                <button
                  type="submit"
                  className="p-2 cursor-pointer rounded-full hover:bg-[#2a1f3d] transition-all"
                >
                  <SendHorizonalIcon className="w-5 h-5 text-purple-400" />
                </button>
              </form>
            </div>
          </div>

          {/* Suggestion pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-12 max-w-2xl mx-auto">
            <button className="bg-[#1c1528] hover:bg-[#2a1f3d] rounded-full px-4 py-2 text-sm">
              Buscar un desarrollador React disponible la próxima semana
            </button>
            <button className="bg-[#1c1528] hover:bg-[#2a1f3d] rounded-full px-4 py-2 text-sm">
              Analizar brechas de talento internas
            </button>
            <button className="bg-[#1c1528] hover:bg-[#2a1f3d] rounded-full px-4 py-2 text-sm">
              Sugerir candidatos con IA
            </button>
            <button className="bg-[#1c1528] hover:bg-[#2a1f3d] rounded-full px-4 py-2 text-sm">
              Generar informe de staffing con LangChain
            </button>
            <button className="bg-[#1c1528] hover:bg-[#2a1f3d] rounded-full px-4 py-2 text-sm">
              Encontrar talento usando filtros inteligentes
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export { Hero1 }
