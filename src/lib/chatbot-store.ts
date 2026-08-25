import { ChatMessageLocal } from '@/lib/types'

type Listener = (messages: ChatMessageLocal[]) => void

let messages: ChatMessageLocal[] = []
const listeners = new Set<Listener>()

export function getChatMessages(): ChatMessageLocal[] {
  return messages
}

export function setChatMessages(newMessages: ChatMessageLocal[]) {
  messages = newMessages
  listeners.forEach((listener) => listener(messages))
}

export function subscribeChatMessages(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
