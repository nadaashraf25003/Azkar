const TOKEN_STORAGE_KEY = 'azkar_auth_token'
const DEVICE_ID_STORAGE_KEY = 'azkar_device_id'

/**
 * Retrieves the stored authentication token (if any).
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

/**
 * Stores an authentication token.
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

/**
 * Removes the stored authentication token.
 */
export function removeToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

/**
 * Retrieves or generates a persistent unique device identifier (UUID) for this client.
 * This identifier is used across progress tracking, favorites, kids points, and notifications.
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return '00000000-0000-0000-0000-000000000000'
  }

  let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY)

  if (!deviceId) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      deviceId = crypto.randomUUID()
    } else {
      deviceId = 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9)
    }
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId)
  }

  return deviceId
}

export const getDeviceIdentifier = getDeviceId
