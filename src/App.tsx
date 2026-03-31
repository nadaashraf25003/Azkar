import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { useSettings } from './context/SettingsContext'
import { useDailyReminders } from './hooks/useDailyReminders'
import { AyatPage } from './pages/AyatPage'
import { CounterPage } from './pages/CounterPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { HomePage } from './pages/HomePage'
import { KidsPage } from './pages/KidsPage'
import { MessagesPage } from './pages/MessagesPage'
import { PrayerTimesPage } from './pages/PrayerTimesPage'
import { QuestionsPage } from './pages/QuestionsPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  const { remindersEnabled } = useSettings()

  useDailyReminders(remindersEnabled)

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/ayat" element={<AyatPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/counter" element={<CounterPage />} />
        <Route path="/kids" element={<KidsPage />} />
        <Route path="/prayer-times" element={<PrayerTimesPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
