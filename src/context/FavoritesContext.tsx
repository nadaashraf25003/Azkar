import { createContext, useContext, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface FavoritesContextValue {
  favoriteIds: string[]
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  clearFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>('azkar-favorites', [])

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const isFavorite = (id: string) => favoriteIds.includes(id)

  const clearFavorites = () => setFavoriteIds([])

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, toggleFavorite, isFavorite, clearFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used inside FavoritesProvider')
  }

  return context
}
