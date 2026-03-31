import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { useSettings } from './context/SettingsContext'
import { useDailyReminders } from './hooks/useDailyReminders'
import { AyatPage } from './pages/AyatPage'
import { CategoryCounterPage } from './pages/CategoryCounterPage'
import { CounterPage } from './pages/CounterPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { HomePage } from './pages/HomePage'
import { KidsPage } from './pages/KidsPage'
import { MessageTypePage } from './pages/MessageTypePage'
import { MessagesPage } from './pages/MessagesPage'
import { PrayerTimesPage } from './pages/PrayerTimesPage'
import { QuranRecitationsPage } from './pages/QuranRecitationsPage'
import { QuestionsPage } from './pages/QuestionsPage'
import { SettingsPage } from './pages/SettingsPage'
import { TasbeehCounterPage } from './pages/TasbeehCounterPage'

function App() {
  const { remindersEnabled } = useSettings()

  useDailyReminders(remindersEnabled)

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/ayat" element={<AyatPage />} />
        <Route path="/recitations" element={<QuranRecitationsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/type/:type" element={<MessageTypePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/counter" element={<CounterPage />}>
          <Route index element={<Navigate to="tasbeeh" replace />} />
          <Route path="tasbeeh" element={<TasbeehCounterPage />} />
          <Route path="categories" element={<CategoryCounterPage />} />
        </Route>
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
