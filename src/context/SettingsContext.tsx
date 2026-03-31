import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Language } from '../types/azkar'

export type ThemeMode = 'light' | 'dark'
export type AccentColor = 'blue' | 'emerald' | 'amber' | 'rose'

interface SettingsContextValue {
  theme: ThemeMode
  toggleTheme: () => void
  accentColor: AccentColor
  setAccentColor: (color: AccentColor) => void
  language: Language
  setLanguage: (language: Language) => void
  remindersEnabled: boolean
  setRemindersEnabled: (enabled: boolean) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<ThemeMode>('azkar-theme', 'light')
  const [accentColor, setAccentColor] = useLocalStorage<AccentColor>('azkar-accent-color', 'blue')
  const [language, setLanguage] = useLocalStorage<Language>('azkar-language', 'ar')
  const [remindersEnabled, setRemindersEnabled] = useLocalStorage<boolean>(
    'azkar-reminders-enabled',
    false,
  )

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.accent = accentColor
  }, [accentColor])

  useEffect(() => {
    const root = document.documentElement
    const isArabic = language === 'ar'

    root.lang = isArabic ? 'ar' : 'en'
    root.dir = isArabic ? 'rtl' : 'ltr'
  }, [language])

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }

  return (
    <SettingsContext.Provider
      value={{
        theme,
        toggleTheme,
        accentColor,
        setAccentColor,
        language,
        setLanguage,
        remindersEnabled,
        setRemindersEnabled,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used inside SettingsProvider')
  }

  return context
}
