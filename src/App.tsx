import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { useSettings } from './context/SettingsContext'
import { useDailyReminders } from './hooks/useDailyReminders'
import { AyatPage } from './pages/AyatPage'
import { AsmaaAllahPage } from './pages/AsmaaAllahPage'
import { CategoryCounterPage } from './pages/CategoryCounterPage'
import { ContactPage } from './pages/ContactPage'
import { CounterPage } from './pages/CounterPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { HomePage } from './pages/HomePage'
import { KidsPage } from './pages/KidsPage'
import { MessageTypePage } from './pages/MessageTypePage'
import { MessagesPage } from './pages/MessagesPage'
import { PrayerTimesPage } from './pages/PrayerTimesPage'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { QuranRecitationsPage } from './pages/QuranRecitationsPage'
import { QuestionsPage } from './pages/QuestionsPage'
import { ReligiousInfoPage } from './pages/ReligiousInfoPage'
import { SeerahPage } from './pages/SeerahPage'
import { SettingsPage } from './pages/SettingsPage'
import { TasbeehCounterPage } from './pages/TasbeehCounterPage'
import { TermsPage } from './pages/TermsPage'
import { SurahPage } from './pages/SurahPage'

function App() {
  const { remindersEnabled } = useSettings()

  useDailyReminders(remindersEnabled)

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/ayat" element={<AyatPage />} />
        <Route path="/ayat/:chapterNumber" element={<SurahPage />} />
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
        <Route path="/asmaa-allah" element={<AsmaaAllahPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/religious-info" element={<ReligiousInfoPage />} />
        <Route path="/seerah" element={<SeerahPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
