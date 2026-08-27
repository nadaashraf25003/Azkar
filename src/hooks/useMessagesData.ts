import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../API/Config.js'
import { URLS } from '../API/URLs.ts'
import type { MessageItem } from '../types/message'

export interface BackendMessagesItemDto {
  id: string
  text: string
  category?: string
  source?: string
  dateFor?: string
}

export interface CreateMessageDto {
  text: string
  category: string
  source: string
  dateFor?: string
}

export async function fetchMessagesFromBackend(): Promise<MessageItem[]> {
  let backendData: BackendMessagesItemDto | BackendMessagesItemDto[] | null = null

  try {
    backendData = await apiClient.get<BackendMessagesItemDto[]>(URLS.CONTENT.MESSAGES)
  } catch {
    try {
      backendData = await apiClient.get<BackendMessagesItemDto | BackendMessagesItemDto[]>(URLS.CONTENT.DAILY_MESSAGE)
    } catch {
      backendData = []
    }
  }

  const rawList = Array.isArray(backendData) ? backendData : backendData ? [backendData] : []

  if (rawList.length === 0) {
    return []
  }

  return rawList.map((item, index) => ({
    id: item.id || String(index + 1),
    type: (item.category || 'religious').toLowerCase(),
    titleAr: 'رسالة اليوم',
    titleEn: 'Daily Message',
    textAr: item.text || '',
    textEn: item.text || '',
    authorAr: item.source || 'أذكار',
    authorEn: item.source || 'Azkar',
    createdAt: item.dateFor || new Date().toISOString(),
  }))
}

export function useMessagesData() {
  return useQuery({
    queryKey: ['messages-data'],
    queryFn: fetchMessagesFromBackend,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to add a new message directly to backend API (Admin)
 */
export function useAddMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateMessageDto) => {
      return await apiClient.post<BackendMessagesItemDto>(URLS.CONTENT.ADD_MESSAGE, payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['messages-data'] })
      void queryClient.invalidateQueries({ queryKey: ['daily-message'] })
    },
  })
}

/**
 * Hook to delete a message directly from backend API (Admin)
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(URLS.CONTENT.DELETE_MESSAGE(id))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['messages-data'] })
      void queryClient.invalidateQueries({ queryKey: ['daily-message'] })
    },
  })
}


