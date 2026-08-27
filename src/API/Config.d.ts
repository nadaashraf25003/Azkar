export declare const API_BASE_URL: string

export declare class ApiError extends Error {
  status: number
  data: any
  constructor(message: string, status: number, data?: any)
}

export declare function fetchApi<T = any>(
  endpoint: string,
  options?: RequestInit & { params?: Record<string, any> }
): Promise<T>

export interface ApiClient {
  get<T = any>(url: string, params?: Record<string, any>, options?: RequestInit): Promise<T>
  post<T = any>(url: string, body?: any, options?: RequestInit): Promise<T>
  put<T = any>(url: string, body?: any, options?: RequestInit): Promise<T>
  delete<T = any>(url: string, options?: RequestInit): Promise<T>
}

export declare const apiClient: ApiClient
export default apiClient
