import { useQuery } from '@tanstack/react-query'
import { apiClient } from '..//API/Config.js'
import { URLS } from '../API/URLs.ts'

export interface AsmaaItem {
  id: number
  nameAr: string
  transliteration: string
  meaningAr: string
  meaningEn: string
}

export interface BackendAsmaaAllahDto {
  id: string
  number: number
  nameArabic: string
  nameEnglish: string
  transliteration: string
  meaningArabic: string
  meaningEnglish: string
  quranOccurrences: string
  explanation: string
}

// Local MP3 audio URL (preserved as required)
export const ALL_ASMAA_AUDIO_URL = '/04.%20Asmaa%20Allah%20Al-Hosna.mp3'

export async function fetchAsmaaAllah(): Promise<AsmaaItem[]> {
  const backendData = await apiClient.get<BackendAsmaaAllahDto[]>(URLS.CONTENT.ASMAA_ALLAH)
  if (Array.isArray(backendData)) {
    return backendData.map((item) => ({
      id: item.number,
      nameAr: item.nameArabic,
      transliteration: item.transliteration || item.nameEnglish,
      meaningAr: item.meaningArabic,
      meaningEn: item.meaningEnglish,
    }))
  }
  throw new Error('Failed to connect to backend server')
}

export function useAsmaaAllah() {
  return useQuery({
    queryKey: ['asmaa-allah'],
    queryFn: fetchAsmaaAllah,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: Infinity,
  })
}
