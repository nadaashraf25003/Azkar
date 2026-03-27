import { useMemo } from 'react'
import { ZikrCard } from '../components/ZikrCard'
import { useFavorites } from '../context/FavoritesContext'
import { useSettings } from '../context/SettingsContext'
import { useAzkarData } from '../hooks/useAzkarData'
import { useTasbeehCounters } from '../hooks/useTasbeehCounters'

export function FavoritesPage() {
  const { favoriteIds } = useFavorites()
  const { language } = useSettings()
  const { data, isLoading } = useAzkarData()
  const { counters, increment, decrement, resetCounter } = useTasbeehCounters()

  const favorites = useMemo(() => {
    if (!data) {
      return []
    }

    return data.filter((item) => favoriteIds.includes(item.id))
  }, [data, favoriteIds])

  if (isLoading) {
    return <p className="text-sm text-[var(--muted)]">Loading favorites...</p>
  }

  return (
    <section className="space-y-4">
      <h1 className="font-title text-3xl text-[var(--text-strong)]">
        {language === 'ar' ? 'المفضلة' : 'Favorites'}
      </h1>

      {favorites.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
          {language === 'ar'
            ? 'لم تقم بإضافة أذكار للمفضلة بعد.'
            : 'No favorites yet. Save Azkar from Today page.'}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {favorites.map((item) => (
            <ZikrCard
              key={item.id}
              zikr={item}
              language={language}
              currentCount={counters[item.id] ?? 0}
              onIncrement={increment}
              onDecrement={decrement}
              onReset={resetCounter}
            />
          ))}
        </div>
      )}
    </section>
  )
}
