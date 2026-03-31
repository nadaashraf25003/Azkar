import type { MessageItem } from '../types/message'

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / 86_400_000)
}

export function getMessageOfDay(messages: MessageItem[], date: Date = new Date()): MessageItem | null {
  if (messages.length === 0) {
    return null
  }

  const daySeed = date.getFullYear() * 1000 + getDayOfYear(date)
  const index = Math.abs(daySeed) % messages.length
  return messages[index] ?? null
}
