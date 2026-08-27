import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '..//API/Config.js'
import { URLS } from '../API/URLs.ts'
import { getDeviceId } from '../API/token.ts'

export interface BackendTasbeehPreset {
  id: string
  name: string
  arabicText: string
  transliteration: string
  benefit: string
  targetCount: number
  isCustom: boolean
}

export interface BackendTasbeehStats {
  totalCountToday: number
  totalCountAllTime: number
  totalSessionsCount: number
}

export function useTasbeehPresets() {
  const deviceId = getDeviceId()

  return useQuery<BackendTasbeehPreset[]>({
    queryKey: ['tasbeeh-presets', deviceId],
    queryFn: async () => {
      try {
        const data = await apiClient.get<BackendTasbeehPreset[]>(URLS.TASBEEH.PRESETS, {
          deviceId,
        })
        if (Array.isArray(data) && data.length > 0) return data
      } catch (err) {
        console.warn('Backend tasbeeh presets error:', err)
      }
      return []
    },
    staleTime: 1000 * 60 * 30,
  })
}

export function useTasbeehStats() {
  const deviceId = getDeviceId()

  return useQuery<BackendTasbeehStats | null>({
    queryKey: ['tasbeeh-stats', deviceId],
    queryFn: async () => {
      try {
        return await apiClient.get<BackendTasbeehStats>(URLS.TASBEEH.STATS, {
          deviceId,
        })
      } catch {
        return null
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useRecordTasbeehSession() {
  const queryClient = useQueryClient()
  const deviceId = getDeviceId()

  return useMutation({
    mutationFn: async (payload: {
      presetId?: string
      zikrName: string
      totalCount: number
    }) => {
      return await apiClient.post(URLS.TASBEEH.SESSION, {
        deviceIdentifier: deviceId,
        presetId: payload.presetId,
        zikrName: payload.zikrName,
        totalCount: payload.totalCount,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasbeeh-stats'] })
    },
  })
}

export interface CreateTasbeehPresetDto {
  name: string
  arabicText: string
  transliteration?: string
  benefit?: string
  targetCount?: number
  isCustom?: boolean
  deviceIdentifier?: string
}

/**
 * Hook to add a new Tasbeeh preset directly to backend API (Admin)
 */
export function useAddTasbeehPreset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateTasbeehPresetDto) => {
      return await apiClient.post<BackendTasbeehPreset>(URLS.TASBEEH.ADD_PRESET, payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasbeeh-presets'] })
    },
  })
}

/**
 * Hook to delete a Tasbeeh preset directly from backend API (Admin)
 */
export function useDeleteTasbeehPreset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(URLS.TASBEEH.DELETE_PRESET(id))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasbeeh-presets'] })
    },
  })
}

