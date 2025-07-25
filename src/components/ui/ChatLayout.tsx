import * as React from 'react'
import Image from 'next/image'

const ChatLayout = ({ children }: { children: React.ReactNode }) => (
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
    </header>
    {children}
  </div>
)

export default ChatLayout
