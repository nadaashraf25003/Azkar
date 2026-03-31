import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'
import { Footer } from './Footer'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),transparent_40%),radial-gradient(circle_at_80%_20%,_rgba(59,130,246,0.14),transparent_35%)]" />
      <TopNav />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
