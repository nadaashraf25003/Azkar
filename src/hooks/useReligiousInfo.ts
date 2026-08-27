import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../API/Config.js'
import { URLS } from '../API/URLs.ts'

export interface ReligiousInfoItem {
  id: string
  category: string
  titleAr: string
  titleEn: string
  contentAr: string
  contentEn: string
  sourceAr: string
  sourceEn: string
}

export interface BackendReligiousInfoDto {
  id: string
  title: string
  category: string
  content: string
  referenceSource: string
}

export interface CreateReligiousInfoDto {
  title: string
  category: string
  content: string
  referenceSource: string
}

export async function fetchReligiousInfo(category?: string): Promise<ReligiousInfoItem[]> {
  const backendData = await apiClient.get<BackendReligiousInfoDto[]>(
    URLS.CONTENT.RELIGIOUS_INFO,
    category && category !== 'all' ? { category } : undefined,
  )
  if (Array.isArray(backendData)) {
    return backendData.map((item) => ({
      id: item.id,
      category: item.category.toLowerCase(),
      titleAr: item.title,
      titleEn: item.title,
      contentAr: item.content,
      contentEn: item.content,
      sourceAr: item.referenceSource,
      sourceEn: item.referenceSource,
    }))
  }
  return []
}

export function useReligiousInfo(category?: string) {
  return useQuery({
    queryKey: ['religious-info', category],
    queryFn: () => fetchReligiousInfo(category),
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to add a new religious information article directly to backend API (Admin)
 */
export function useAddReligiousInfo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateReligiousInfoDto) => {
      return await apiClient.post<BackendReligiousInfoDto>(
        URLS.CONTENT.ADD_RELIGIOUS_INFO,
        payload
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['religious-info'] })
    },
  })
}

/**
 * Hook to delete a religious information article directly from backend API (Admin)
 */
export function useDeleteReligiousInfo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(URLS.CONTENT.DELETE_RELIGIOUS_INFO(id))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['religious-info'] })
    },
  })
}

