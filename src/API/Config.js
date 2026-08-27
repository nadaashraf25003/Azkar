import { API_BASE_URL } from './URLs.ts'
import { getDeviceId, getToken } from './token.ts'

export { API_BASE_URL }

/**
 * Custom Error class for API responses
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Core HTTP Request dispatcher with automatic token and deviceId headers.
 * 
 * @template T
 * @param {string} endpoint - API path or full URL
 * @param {RequestInit & { params?: Record<string, any> }} [options] - Fetch options and query params
 * @returns {Promise<T>}
 */
export async function fetchApi(endpoint, options = {}) {
  const { params, headers = {}, ...customConfig } = options

  let fullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  if (params) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value))
      }
    })
    const queryString = queryParams.toString()
    if (queryString) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString
    }
  }

  const token = getToken()
  const deviceId = getDeviceId()

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-Device-Id': deviceId,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  }

  // Remove Content-Type if body is FormData
  if (customConfig.body instanceof FormData) {
    delete defaultHeaders['Content-Type']
  }

  const response = await fetch(fullUrl, {
    ...customConfig,
    headers: defaultHeaders,
  })

  let responseData = null
  const contentType = response.headers.get('content-type')

  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json()
    } catch {
      responseData = null
    }
  } else {
    try {
      responseData = await response.text()
    } catch {
      responseData = null
    }
  }

  if (!response.ok) {
    const errorMessage =
      (responseData && typeof responseData === 'object' && (responseData.message || responseData.title || responseData.error)) ||
      `Request failed with status ${response.status}: ${response.statusText}`
    throw new ApiError(errorMessage, response.status, responseData)
  }

  return responseData
}

/**
 * Convenient API Client object for HTTP verbs
 */
export const apiClient = {
  get: (url, params, options = {}) => fetchApi(url, { method: 'GET', params, ...options }),
  post: (url, body, options = {}) =>
    fetchApi(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  put: (url, body, options = {}) =>
    fetchApi(url, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  delete: (url, options = {}) => fetchApi(url, { method: 'DELETE', ...options }),
}

export default apiClient
