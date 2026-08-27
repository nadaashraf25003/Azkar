/**
 * Admin Credentials Configuration
 * Read purely from environment variables (.env / .env.local).
 * Contains NO hardcoded credentials in the repository.
 */
export const ADMIN_AUTH = {
  email: (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase(),
  password: String(import.meta.env.VITE_ADMIN_PASSWORD || ''),
} as const
