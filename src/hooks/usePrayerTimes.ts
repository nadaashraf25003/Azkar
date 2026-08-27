import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '..//API/Config.js'
import { URLS } from '../API/URLs.ts'
import { getDeviceId } from '../API/token.ts'

export interface BackendPrayerTimes {
  date: string
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
  nextPrayer: string
  timeRemaining: string
}

export interface BackendQibla {
  latitude: number
  longitude: number
  qiblaAngleDegrees: number
  distanceToKaabaKm: number
}

export interface SavePrayerSettingsParams {
  calculationMethod: string
  juristicMethod: string
  latitude: number
  longitude: number
  cityName: string
  countryName: string
  timezoneOffsetMinutes: number
}

/**
 * Hook to fetch calculated prayer times directly from backend API
 */
export function usePrayerTimesApi(params: {
  latitude: number
  longitude: number
  method?: string
  date?: string
  enabled?: boolean
}) {
  const { latitude, longitude, method = 'Egyptian', date, enabled = true } = params

  return useQuery<BackendPrayerTimes>({
    queryKey: ['prayer-times-api', latitude, longitude, method, date],
    queryFn: async () => {
      return await apiClient.get(URLS.PRAYER.TIMES, {
        lat: latitude,
        lng: longitude,
        method,
        date,
      })
    },
    enabled: enabled && latitude !== 0 && longitude !== 0,
    staleTime: 1000 * 60 * 30, // 30 mins
  })
}

/**
 * Hook to fetch Qibla direction & distance directly from backend API
 */
export function useQiblaDirectionApi(params: {
  latitude: number
  longitude: number
  enabled?: boolean
}) {
  const { latitude, longitude, enabled = true } = params

  return useQuery<BackendQibla>({
    queryKey: ['prayer-qibla-api', latitude, longitude],
    queryFn: async () => {
      return await apiClient.get(URLS.PRAYER.QIBLA, {
        lat: latitude,
        lng: longitude,
      })
    },
    enabled: enabled && latitude !== 0 && longitude !== 0,
    staleTime: Infinity,
  })
}

/**
 * Hook to save prayer calculation settings on backend
 */
export function useSavePrayerSettings() {
  const deviceId = getDeviceId()

  return useMutation({
    mutationFn: async (settings: SavePrayerSettingsParams) => {
      return await apiClient.post(URLS.PRAYER.SETTINGS, {
        deviceIdentifier: deviceId,
        ...settings,
      })
    },
  })
}
