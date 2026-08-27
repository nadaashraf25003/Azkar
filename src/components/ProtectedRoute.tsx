import { Navigate, useLocation } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

/**
 * Route guard component that protects admin routes.
 * If user is not authenticated as admin, redirects to /admin/login preserving return url.
 */
export function ProtectedRoute({
  children,
  redirectTo = '/admin/login',
}: ProtectedRouteProps) {
  const location = useLocation()
  const [isAdminAuthenticated] = useLocalStorage<boolean>('azkar-qa-admin-auth', false)
  const [viewerRole] = useLocalStorage<string>('azkar-qa-viewer-role', 'user')

  const isAuthenticated = isAdminAuthenticated || viewerRole === 'admin'

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <>{children}</>
}
