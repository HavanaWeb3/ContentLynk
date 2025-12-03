'use client'

import { useState } from 'react'

interface SimpleTextEditorProps {
  onChange?: (content: string, plainText: string) => void
  placeholder?: string
  className?: string
}

/**
 * Simple Text Editor (temporary replacement for Lexical)
 *
 * This is a fallback while we debug the Lexical SSR issues.
 * Provides basic rich text editing without the complexity.
 */
export function SimpleTextEditor({
  onChange,
  placeholder = 'Start writing your article...',
  className = '',
}: SimpleTextEditorProps) {
  const [content, setContent] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)

    // For now, just pass the same content as both JSON and plain text
    // We can enhance this later
    onChange?.(newContent, newContent)
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length
  const readingTime = Math.ceil(wordCount / 200)

  return (
    <div className={`simple-text-editor ${className}`}>
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <textarea
          value={content}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full min-h-[400px] p-4 outline-none resize-none font-serif text-lg leading-relaxed"
          style={{ fontFamily: 'Georgia, serif' }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div>
          <strong>Word count:</strong> {wordCount} • <strong>Reading time:</strong> ~{readingTime} min
        </div>
        <div className="text-xs">
          <strong>Formatting tips:</strong> Write in plain text for now
        </div>
      </div>
    </div>
  )
}

export { SimpleTextEditor as RichTextEditor }
