import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '..//API/Config.js'
import { URLS } from '../API/URLs.ts'

export interface BackendAnswer {
  id: string
  questionId: string
  authorName: string
  content: string
  referenceSource: string
  isVerifiedScholar: boolean
  upvotes: number
  downvotes: number
  createdAtUtc: string
}

export interface BackendQuestion {
  id: string
  title: string
  content: string
  category: string
  askerName: string
  upvotes: number
  downvotes: number
  isAnswered: boolean
  isApproved: boolean
  answersCount: number
  createdAtUtc: string
  answers?: BackendAnswer[]
}

export function useQuestions(params?: { category?: string; search?: string; includePending?: boolean }) {
  return useQuery<BackendQuestion[]>({
    queryKey: ['questions-list', params?.category, params?.search, params?.includePending],
    queryFn: async () => {
      const categoryParam = params?.category && params.category !== 'all' ? params.category : undefined
      const searchParam = params?.search?.trim() || undefined

      const data = await apiClient.get<BackendQuestion[]>(URLS.QUESTIONS.LIST, {
        category: categoryParam,
        search: searchParam,
        includePending: params?.includePending ? 'true' : 'false',
      })
      if (Array.isArray(data)) {
        return data
      }
      throw new Error('Failed to connect to backend server')
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function useQuestionDetails(id?: string) {
  return useQuery<BackendQuestion | null>({
    queryKey: ['question-details', id],
    queryFn: async () => {
      if (!id) return null
      return await apiClient.get<BackendQuestion>(URLS.QUESTIONS.DETAILS(id))
    },
    enabled: Boolean(id),
  })
}

export function useAskQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      title: string
      content: string
      category: string
      askerName: string
    }) => {
      return await apiClient.post<BackendQuestion>(URLS.QUESTIONS.ASK, payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['questions-list'] })
    },
  })
}

export function useApproveQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.put(`/questions/${id}/approve`, {})
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['questions-list'] })
    },
  })
}

export function useAddAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      questionId: string
      authorName: string
      content: string
      referenceSource?: string
    }) => {
      return await apiClient.post<BackendAnswer>(URLS.QUESTIONS.ADD_ANSWER, payload)
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['questions-list'] })
      void queryClient.invalidateQueries({ queryKey: ['question-details', variables.questionId] })
    },
  })
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(URLS.QUESTIONS.DELETE(id))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['questions-list'] })
    },
  })
}

export function useDeleteAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(URLS.QUESTIONS.DELETE_ANSWER(id))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['questions-list'] })
    },
  })
}
