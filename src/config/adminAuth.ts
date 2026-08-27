/**
 * Admin Credentials Configuration
 * Sourced securely from environment variables (.env / .env.local).
 * Never commit hardcoded production passwords to GitHub.
 */
export const ADMIN_AUTH = {
  email: (import.meta.env.VITE_ADMIN_EMAIL || 'admin@azkar.app').trim().toLowerCase(),
  password: import.meta.env.VITE_ADMIN_PASSWORD || 'Azkar@123',
} as const
