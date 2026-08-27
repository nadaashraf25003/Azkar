import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../API/Config.js'
import { URLS } from '../API/URLs.ts'

export interface BackendRecitationComment {
  id: string
  recitationId: string
  authorName: string
  content: string
  createdAtUtc: string
}

export interface BackendRecitation {
  id: string
  title: string
  reciterName: string
  audioUrl: string
  surahNumber: number
  fromAyah: number
  toAyah: number
  durationSeconds: number
  status: number | 'pending' | 'approved' | 'rejected'
  averageRating: number
  ratingsCount: number
  createdAtUtc: string
  comments: BackendRecitationComment[]
}

export function useRecitations(params?: { surahNumber?: number; includePending?: boolean }) {
  return useQuery<BackendRecitation[]>({
    queryKey: ['recitations-list', params?.surahNumber, params?.includePending],
    queryFn: async () => {
      const data = await apiClient.get<BackendRecitation[]>(URLS.RECITATIONS.LIST, {
        surahNumber: params?.surahNumber || undefined,
        includePending: params?.includePending ? 'true' : 'false',
      })
      if (Array.isArray(data)) {
        return data
      }
      return []
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function useSubmitRecitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      title: string
      reciterName: string
      audioUrl: string
      surahNumber?: number
      fromAyah?: number
      toAyah?: number
      durationSeconds?: number
    }) => {
      return await apiClient.post<BackendRecitation>(URLS.RECITATIONS.SUBMIT, {
        title: payload.title,
        reciterName: payload.reciterName,
        audioUrl: payload.audioUrl,
        surahNumber: payload.surahNumber || 1,
        fromAyah: payload.fromAyah || 1,
        toAyah: payload.toAyah || 1,
        durationSeconds: payload.durationSeconds || 0,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recitations-list'] })
    },
  })
}

export function useApproveRecitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.put(URLS.RECITATIONS.APPROVE(id), {})
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recitations-list'] })
    },
  })
}

export function useRejectRecitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.put(URLS.RECITATIONS.REJECT(id), {})
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recitations-list'] })
    },
  })
}

export function useAddRecitationComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      recitationId: string
      authorName: string
      content: string
    }) => {
      return await apiClient.post<BackendRecitationComment>(
        URLS.RECITATIONS.COMMENTS(payload.recitationId),
        {
          authorName: payload.authorName,
          content: payload.content,
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recitations-list'] })
    },
  })
}

export function useRateRecitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      recitationId: string
      deviceIdentifier: string
      score: number
    }) => {
      return await apiClient.post(
        URLS.RECITATIONS.RATE(payload.recitationId),
        {
          deviceIdentifier: payload.deviceIdentifier,
          score: payload.score,
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recitations-list'] })
    },
  })
}

export function useDeleteRecitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(URLS.RECITATIONS.DELETE(id))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recitations-list'] })
    },
  })
}

export function useDeleteRecitationComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(URLS.RECITATIONS.DELETE_COMMENT(id))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recitations-list'] })
    },
  })
}
