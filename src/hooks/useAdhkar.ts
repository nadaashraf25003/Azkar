import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../API/Config.js'
import { URLS } from '../API/URLs.ts'
import { getDeviceId } from '../API/token.ts'

export interface BackendCategory {
  id: string
  name: string
  arabicName: string
  icon: string
  description: string
  order: number
  zikrCount: number
}

export interface BackendZikr {
  id: string
  categoryId: string
  arabicText: string
  translation: string
  transliteration: string
  repeatCount: number
  fadl: string
  source: string
  audioUrl: string
  order: number
}

export interface DailyProgressItem {
  zikrId: string
  deviceIdentifier: string
  completedCount: number
  isCompleted: boolean
  date: string
}

export interface CreateZikrDto {
  categoryId: string
  arabicText: string
  translation?: string
  transliteration?: string
  repeatCount: number
  fadl?: string
  source?: string
  audioUrl?: string
  order?: number
}

/**
 * Hook to fetch all Adhkar categories directly from backend API
 */
export function useAdhkarCategories() {
  return useQuery<BackendCategory[]>({
    queryKey: ['adhkar-categories'],
    queryFn: async () => {
      const data = await apiClient.get<BackendCategory[]>(URLS.ADHKAAR.CATEGORIES)
      return Array.isArray(data) ? data : ((data as any)?.value || [])
    },
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to fetch all Adhkar across categories directly from backend API
 */
export function useAllAdhkar() {
  return useQuery<BackendZikr[]>({
    queryKey: ['adhkar-all'],
    queryFn: async () => {
      const data = await apiClient.get<BackendZikr[]>(URLS.ADHKAAR.LIST)
      return Array.isArray(data) ? data : ((data as any)?.value || [])
    },
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to fetch Adhkar by category ID directly from backend API
 */
export function useAdhkarByCategory(categoryId?: string) {
  return useQuery<BackendZikr[]>({
    queryKey: ['adhkar-by-category', categoryId],
    queryFn: async () => {
      if (!categoryId) return []
      const data = await apiClient.get<BackendZikr[]>(URLS.ADHKAAR.BY_CATEGORY(categoryId))
      return Array.isArray(data) ? data : ((data as any)?.value || [])
    },
    enabled: Boolean(categoryId),
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to add a new Zikr item directly to backend API (Admin)
 */
export function useAddZikr() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateZikrDto) => {
      return await apiClient.post<BackendZikr>(URLS.ADHKAAR.ADD, {
        categoryId: payload.categoryId,
        arabicText: payload.arabicText,
        translation: payload.translation || '',
        transliteration: payload.transliteration || '',
        repeatCount: payload.repeatCount,
        fadl: payload.fadl || '',
        source: payload.source || '',
        audioUrl: payload.audioUrl || '',
        order: payload.order || 0,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adhkar-categories'] })
      void queryClient.invalidateQueries({ queryKey: ['adhkar-by-category'] })
      void queryClient.invalidateQueries({ queryKey: ['adhkar-all'] })
    },
  })
}

/**
 * Hook to delete a Zikr item directly from backend API (Admin)
 */
export function useDeleteZikr() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (zikrId: string) => {
      return await apiClient.delete(URLS.ADHKAAR.DELETE(zikrId))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adhkar-categories'] })
      void queryClient.invalidateQueries({ queryKey: ['adhkar-by-category'] })
      void queryClient.invalidateQueries({ queryKey: ['adhkar-all'] })
    },
  })
}

/**
 * Hook to fetch user's daily progress from backend API
 */
export function useDailyProgress() {
  const deviceId = getDeviceId()

  return useQuery<DailyProgressItem[]>({
    queryKey: ['adhkar-progress-today', deviceId],
    queryFn: async () => {
      try {
        return await apiClient.get<DailyProgressItem[]>(URLS.ADHKAAR.DAILY_PROGRESS, { deviceId })
      } catch {
        return []
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to update daily progress on backend API
 */
export function useUpdateDailyProgress() {
  const queryClient = useQueryClient()
  const deviceId = getDeviceId()

  return useMutation({
    mutationFn: async (params: {
      zikrId: string
      completedCount: number
      isCompleted: boolean
    }) => {
      return await apiClient.post(URLS.ADHKAAR.UPDATE_PROGRESS, {
        deviceIdentifier: deviceId,
        zikrId: params.zikrId,
        completedCount: params.completedCount,
        isCompleted: params.isCompleted,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adhkar-progress-today'] })
    },
  })
}



