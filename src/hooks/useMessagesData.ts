import { useQuery } from '@tanstack/react-query'
import type { MessageItem } from '../types/message'

const MESSAGES_PATH = `${import.meta.env.BASE_URL}data/messages.json`

async function fetchMessages(): Promise<MessageItem[]> {
  const response = await fetch(MESSAGES_PATH)

  if (!response.ok) {
    throw new Error('Failed to load messages')
  }

  return (await response.json()) as MessageItem[]
}

export function useMessagesData() {
  return useQuery({
    queryKey: ['messages-data'],
    queryFn: fetchMessages,
    staleTime: Infinity,
  })
}
