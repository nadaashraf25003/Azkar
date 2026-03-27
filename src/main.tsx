import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { FavoritesProvider } from './context/FavoritesContext.tsx'
import { SettingsProvider } from './context/SettingsContext.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <FavoritesProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </FavoritesProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
