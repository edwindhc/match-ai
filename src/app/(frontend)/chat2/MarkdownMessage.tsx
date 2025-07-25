import React from 'react'
import ReactMarkdown from 'react-markdown'

interface MarkdownMessageProps {
  content: string
  className?: string
}

export default function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div className={className} style={{ lineHeight: 1.6 }}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
