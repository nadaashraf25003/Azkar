import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../API/Config.js'
import { URLS } from '../API/URLs.ts'

export interface BackendKidsStory {
  id: string
  title: string
  ageGroup: string
  content: string
  moralLesson: string
  coverImageUrl: string
  audioUrl: string
}

export interface BackendKidsChallenge {
  id: string
  title: string
  description: string
  points: number
  category: string
  badgeIcon: string
}

export interface BackendKidsQuizQuestion {
  id: string
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOptionIndex: number
  explanation: string
  category: string
}

export interface BackendKidsProgress {
  deviceIdentifier: string
  totalPoints: number
  completedStoriesCount: number
  completedChallengesCount: number
  quizzesTakenCount: number
}

export function useKidsStories(ageGroup?: string) {
  return useQuery<BackendKidsStory[]>({
    queryKey: ['kids-stories', ageGroup],
    queryFn: async () => {
      const data = await apiClient.get<BackendKidsStory[]>(
        URLS.KIDS.STORIES,
        ageGroup ? { ageGroup } : undefined,
      )
      if (Array.isArray(data)) return data
      return []
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useKidsChallenges() {
  return useQuery<BackendKidsChallenge[]>({
    queryKey: ['kids-challenges'],
    queryFn: async () => {
      const data = await apiClient.get<BackendKidsChallenge[]>(URLS.KIDS.CHALLENGES)
      if (Array.isArray(data)) return data
      return []
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useKidsQuizzes(category?: string) {
  return useQuery<BackendKidsQuizQuestion[]>({
    queryKey: ['kids-quizzes', category],
    queryFn: async () => {
      const data = await apiClient.get<BackendKidsQuizQuestion[]>(
        URLS.KIDS.QUIZZES,
        category ? { category } : undefined,
      )
      if (Array.isArray(data)) return data
      return []
    },
    staleTime: 1000 * 60 * 5,
  })
}

// ---------------- STORIES MUTATIONS (ADMIN) ----------------
export interface CreateKidsStoryDto {
  title: string
  ageGroup: string
  content: string
  moralLesson: string
  coverImageUrl?: string
  audioUrl?: string
}

export function useAddKidsStory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateKidsStoryDto) => {
      return await apiClient.post<BackendKidsStory>(URLS.KIDS.ADD_STORY, payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['kids-stories'] })
    },
  })
}

export function useDeleteKidsStory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(URLS.KIDS.DELETE_STORY(id))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['kids-stories'] })
    },
  })
}

// ---------------- CHALLENGES MUTATIONS (ADMIN) ----------------
export interface CreateKidsChallengeDto {
  title: string
  description: string
  points: number
  category: string
  badgeIcon?: string
}

export function useAddKidsChallenge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateKidsChallengeDto) => {
      return await apiClient.post<BackendKidsChallenge>(URLS.KIDS.ADD_CHALLENGE, payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['kids-challenges'] })
    },
  })
}

export function useDeleteKidsChallenge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(URLS.KIDS.DELETE_CHALLENGE(id))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['kids-challenges'] })
    },
  })
}

// ---------------- QUIZZES MUTATIONS (ADMIN) ----------------
export interface CreateKidsQuizDto {
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOptionIndex: number
  explanation: string
  category?: string
}

export function useAddKidsQuiz() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateKidsQuizDto) => {
      return await apiClient.post<BackendKidsQuizQuestion>(URLS.KIDS.ADD_QUIZ, payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['kids-quizzes'] })
    },
  })
}

export function useDeleteKidsQuiz() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(URLS.KIDS.DELETE_QUIZ(id))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['kids-quizzes'] })
    },
  })
}

