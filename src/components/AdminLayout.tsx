import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AdminTopNav } from './AdminTopNav'
import { Footer } from './Footer'
import { ProtectedRoute } from './ProtectedRoute'

export function AdminLayout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(217,119,6,0.18),transparent_40%),radial-gradient(circle_at_80%_20%,_rgba(245,158,11,0.12),transparent_35%)]" />
        <AdminTopNav />
        <main className="flex-1 mx-auto w-full max-w-6xl px-3 py-5 sm:px-4 md:px-6 md:py-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}

