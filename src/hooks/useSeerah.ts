import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../API/Config.js'
import { URLS } from '../API/URLs.ts'

export interface SeerahEvent {
  id: string
  order: number
  period: string
  yearHijri: number
  yearLabelAr: string
  yearLabelEn: string
  titleAr: string
  titleEn: string
  summaryAr: string
  summaryEn: string
  lessonsAr: string[]
  lessonsEn: string[]
}

export interface BackendSeerahEventDto {
  id: string
  order: number
  title: string
  period: string
  yearHijri: number
  description: string
  lessonsLearned: string
}

export interface CreateSeerahEventDto {
  order: number
  title: string
  period: string
  yearHijri: number
  description: string
  lessonsLearned: string
}

export async function fetchSeerah(): Promise<SeerahEvent[]> {
  const backendData = await apiClient.get<BackendSeerahEventDto[]>(URLS.CONTENT.SEERAH)
  if (Array.isArray(backendData)) {
    return backendData.map((item) => ({
      id: item.id,
      order: item.order,
      period: item.period || 'Makkah',
      yearHijri: item.yearHijri,
      yearLabelAr: `${item.yearHijri} هـ`,
      yearLabelEn: `${item.yearHijri} AH`,
      titleAr: item.title,
      titleEn: item.title,
      summaryAr: item.description,
      summaryEn: item.description,
      lessonsAr: item.lessonsLearned ? item.lessonsLearned.split(';').map((s) => s.trim()).filter(Boolean) : [],
      lessonsEn: item.lessonsLearned ? item.lessonsLearned.split(';').map((s) => s.trim()).filter(Boolean) : [],
    }))
  }
  return []
}

export function useSeerah() {
  return useQuery({
    queryKey: ['seerah-data'],
    queryFn: fetchSeerah,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to add a new Seerah event directly to backend API (Admin)
 */
export function useAddSeerahEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateSeerahEventDto) => {
      return await apiClient.post<BackendSeerahEventDto>(URLS.CONTENT.ADD_SEERAH, payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['seerah-data'] })
    },
  })
}

/**
 * Hook to delete a Seerah event directly from backend API (Admin)
 */
export function useDeleteSeerahEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(URLS.CONTENT.DELETE_SEERAH(id))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['seerah-data'] })
    },
  })
}

