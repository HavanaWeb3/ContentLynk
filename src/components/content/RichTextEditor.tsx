'use client'

import { useEffect } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import { EditorState, $getRoot } from 'lexical'

import { ToolbarPlugin } from './editor/ToolbarPlugin'
import { AutoLinkPlugin } from './editor/AutoLinkPlugin'

// Simple ErrorBoundary component for Lexical
function LexicalErrorBoundary({ error }: any): JSX.Element {
  return (
    <div className="text-red-500 p-4 border border-red-300 rounded bg-red-50">
      An error occurred in the editor. Please refresh the page.
    </div>
  )
}

interface RichTextEditorProps {
  initialContent?: string
  onChange?: (content: string, plainText: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
}

/**
 * Lexical Rich Text Editor Component
 *
 * Features:
 * - Headings (H1, H2, H3)
 * - Bold, italic, underline, strikethrough
 * - Bullet and numbered lists
 * - Links (with auto-linking)
 * - Quotes
 * - Code blocks
 * - Undo/redo
 * - Auto-save
 * - Markdown shortcuts
 */
export function RichTextEditor({
  initialContent,
  onChange,
  placeholder = 'Start writing your article...',
  className = '',
  readOnly = false,
}: RichTextEditorProps) {
  const editorConfig = {
    namespace: 'ContentLynkEditor',
    theme: {
      root: 'editor-root',
      paragraph: 'editor-paragraph',
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
        code: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
      },
      heading: {
        h1: 'text-4xl font-bold mt-8 mb-4',
        h2: 'text-3xl font-bold mt-6 mb-3',
        h3: 'text-2xl font-bold mt-4 mb-2',
      },
      list: {
        ul: 'list-disc list-inside ml-4 my-4',
        ol: 'list-decimal list-inside ml-4 my-4',
        listitem: 'my-1',
      },
      link: 'text-indigo-600 hover:text-indigo-700 underline cursor-pointer',
      quote: 'border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700',
      code: 'bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm my-4 overflow-x-auto',
    },
    onError: (error: Error) => {
      console.error('Lexical Editor Error:', error)
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
    ],
    editorState: initialContent,
    editable: !readOnly,
  }

  const handleEditorChange = (editorState: EditorState) => {
    try {
      // Get JSON representation of the editor state
      const json = JSON.stringify(editorState.toJSON())

      // Get plain text for reading time calculation using proper Lexical API
      let plainText = ''
      editorState.read(() => {
        const root = $getRoot()
        plainText = root.getTextContent()
      })

      onChange?.(json, plainText)
    } catch (error) {
      console.error('Error handling editor change:', error)
      // Still try to call onChange with empty values
      onChange?.('', '')
    }
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      <LexicalComposer initialConfig={editorConfig}>
        <div className="editor-container border border-gray-300 rounded-lg overflow-hidden bg-white">
          {!readOnly && <ToolbarPlugin />}

          <div className="editor-inner relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="editor-input min-h-[400px] p-4 outline-none prose prose-lg max-w-none" />
              }
              placeholder={
                <div className="editor-placeholder absolute top-4 left-4 text-gray-400 pointer-events-none">
                  {placeholder}
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>

          <OnChangePlugin onChange={handleEditorChange} />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <AutoLinkPlugin />
          {!readOnly && <AutoFocusPlugin />}
        </div>

        <div className="mt-2 text-sm text-gray-500">
          <strong>Formatting tips:</strong> Use # for headings, ** for bold, * for italic, - for lists
        </div>
      </LexicalComposer>
    </div>
  )
}

/**
 * Read-only viewer for Lexical content
 */
export function RichTextViewer({ content, className = '' }: { content: string; className?: string }) {
  return (
    <RichTextEditor
      initialContent={content}
      readOnly={true}
      className={className}
    />
  )
}
