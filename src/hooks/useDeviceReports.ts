import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../API/Config.js'
import { URLS } from '../API/URLs.ts'

export interface DeviceReport {
  deviceIdentifier: string
  deviceName: string
  platform: string
  totalVisits: number
  firstSeenUtc: string
  lastActiveUtc: string
}

export interface DeviceReportSummary {
  totalUniqueDevices: number
  totalAppOpens: number
  activeToday: number
  activeThisWeek: number
  devicesByPlatform: Record<string, number>
  recentDevices: DeviceReport[]
}

export function useDeviceReports(search?: string) {
  return useQuery<DeviceReport[]>({
    queryKey: ['admin-device-reports', search],
    queryFn: async () => {
      const data = await apiClient.get<DeviceReport[]>(
        URLS.ADMIN.DEVICES,
        search ? { search } : undefined
      )
      if (Array.isArray(data)) return data
      return []
    },
    staleTime: 1000 * 30, // 30 seconds
  })
}

export function useDeviceReportSummary() {
  return useQuery<DeviceReportSummary | null>({
    queryKey: ['admin-device-summary'],
    queryFn: async () => {
      try {
        return await apiClient.get<DeviceReportSummary>(URLS.ADMIN.DEVICES_SUMMARY)
      } catch {
        return null
      }
    },
    staleTime: 1000 * 30,
  })
}

export function useLogDeviceActivity() {
  return useMutation({
    mutationFn: async (payload: {
      deviceIdentifier: string
      deviceName: string
      platform?: string
    }) => {
      return await apiClient.post(URLS.ADMIN.DEVICES_LOG, payload)
    },
  })
}

export function useClearOldDeviceLogs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (daysOlderThan: number = 90) => {
      return await apiClient.post<{ deletedCount: number }>(URLS.ADMIN.DEVICES_CLEAR, {
        daysOlderThan,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-device-reports'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-device-summary'] })
    },
  })
}
