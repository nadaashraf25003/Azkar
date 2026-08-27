import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../API/Config.js'
import { URLS } from '../API/URLs.ts'
import type { MessageItem } from '../types/message'

export interface BackendDailyMessageDto {
  id: string
  text: string
  category: string
  source: string
  dateFor: string
}

export function useDailyMessage() {
  return useQuery<MessageItem | null>({
    queryKey: ['daily-message'],
    queryFn: async (): Promise<MessageItem | null> => {
      const backendMsg = await apiClient.get<BackendDailyMessageDto>(URLS.CONTENT.DAILY_MESSAGE)
      if (backendMsg && backendMsg.text) {
        const item: MessageItem = {
          id: backendMsg.id,
          type: (backendMsg.category || 'religious').toLowerCase(),
          titleAr: 'رسالة اليوم',
          titleEn: 'Daily Message',
          textAr: backendMsg.text,
          textEn: backendMsg.text,
          authorAr: backendMsg.source || 'أذكار',
          authorEn: backendMsg.source || 'Azkar',
          createdAt: backendMsg.dateFor || new Date().toISOString(),
        }
        return item
      }
      throw new Error('Failed to connect to backend server')
    },
    staleTime: 1000 * 60 * 30,
  })
}
