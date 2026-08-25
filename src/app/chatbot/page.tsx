'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/i18n'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChatMessageLocal } from '@/lib/types'
import { getChatMessages, setChatMessages, subscribeChatMessages } from '@/lib/chatbot-store'

interface Message extends ChatMessageLocal {}

const QUICK_REPLIES_EN = [
  'How to segregate waste?',
  'What is e-waste?',
  'Where to recycle?',
  'Government schemes',
  'Composting tips'
]

const QUICK_REPLIES_HI = [
  'कचरा कैसे अलग करें?',
  'ई-कचरा क्या है?',
  'रीसाइक्लिंग कहां करें?',
  'सरकारी योजनाएं',
  'कंपोस्टिंग सुझाव'
]

export default function ChatbotPage() {
  const { t, locale } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const stored = getChatMessages()
    if (stored.length > 0) {
      setMessages(stored)
      initializedRef.current = true
      return
    }

    const greeting = locale === 'hi' ? t('chatbot.greeting') : t('chatbot.greeting')
    const initialMessages: Message[] = [{
      id: 'greeting',
      text: greeting,
      isBot: true,
      timestamp: new Date(),
    }]
    setMessages(initialMessages)
    setChatMessages(initialMessages)
    initializedRef.current = true
  }, [mounted, locale, t])

  useEffect(() => {
    if (!initializedRef.current) return
    setChatMessages(messages)
  }, [messages])

  useEffect(() => {
    const unsubscribe = subscribeChatMessages((latest) => {
      setMessages(latest)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const getAiResponse = async (allMessages: Message[], userMessage: string): Promise<string> => {
    const apiMessages = allMessages.map((msg) => ({
      role: msg.isBot ? 'assistant' : 'user',
      content: msg.text,
    }))

    console.log('Sending to API:', apiMessages)

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: apiMessages,
        language: locale,
      }),
    })

    console.log('API response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('API error response:', errorData)
      const message = errorData?.error || 'Failed to get response'
      throw new Error(message)
    }

    const data = await response.json()
    console.log('API success response:', data)
    return data.message || (locale === 'hi' ? 'क्षमा करें, मुझे उत्तर नहीं मिला।' : 'Sorry, I could not find an answer.')
  }

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input.trim(),
      isBot: false,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsTyping(true)

    try {
      const responseText = await getAiResponse(updatedMessages, userMessage.text)

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: responseText,
        isBot: true,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessageText = error instanceof Error ? error.message : (locale === 'hi' ? 'क्षमा करें, कुछ तकनीकी समस्या हो गई है। कृपया बाद में पुनः प्रयास करें।' : 'Sorry, something went wrong. Please try again later.')
      const errorMessage: Message = {
        id: `bot-error-${Date.now()}`,
        text: errorMessageText,
        isBot: true,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
      setIsTyping(false)
    }
  }

  const handleQuickReply = (text: string) => {
    setInput(text)
    handleSend()
  }

  const quickReplies = locale === 'hi' ? QUICK_REPLIES_HI : QUICK_REPLIES_EN

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-light/30 via-white to-green-light/30 flex items-start justify-center pt-6 sm:pt-10">
      <div className="w-full mx-auto px-4 sm:px-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-200/60 overflow-hidden max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-navy to-navy-light text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">
                  {locale === 'hi' ? 'एको मित्र' : 'Eco Mitra'}
                </h2>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {locale === 'hi' ? 'ऑनलाइन' : 'Online'}
                </div>
              </div>
            </div>
          </div>

          <div ref={chatContainerRef} className="h-[300px] sm:h-[380px] overflow-y-auto px-4 sm:px-6 py-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                {message.isBot && (
                  <div className="w-7 h-7 bg-gradient-to-br from-navy to-navy-light rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                    message.isBot
                      ? 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                      : 'bg-gradient-to-r from-saffron to-saffron-dark text-white rounded-br-md'
                  }`}
                >
                  {message.isBot ? (
                    <div className="text-base leading-relaxed chatbot-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  )}
                  <span className={`text-[11px] mt-1.5 block ${message.isBot ? 'text-gray-400' : 'text-white/80'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {!message.isBot && (
                  <div className="w-7 h-7 bg-gradient-to-br from-saffron to-saffron-dark rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-7 h-7 bg-gradient-to-br from-navy to-navy-light rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-gray-200 px-3 py-2 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div />
          </div>

          {messages.length === 1 && (
            <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-200/60">
              <p className="text-sm font-semibold text-navy mb-2">
                {locale === 'hi' ? 'त्वरित प्रश्न:' : 'Quick questions:'}
              </p>
              <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
                {quickReplies.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleQuickReply(text)}
                    className="flex-shrink-0 px-4 py-2 bg-white border border-saffron/30 rounded-full text-sm text-navy hover:bg-saffron hover:text-white hover:border-saffron transition-all duration-200 shadow-sm"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200/60 bg-white px-6 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={locale === 'hi' ? 'कचरा प्रबंधन के बारे में पूछें...' : 'Ask about waste management...'}
                disabled={isTyping}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-saffron/50 focus:border-saffron transition-all disabled:opacity-50 text-base"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2.5 bg-gradient-to-r from-saffron to-saffron-dark text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
