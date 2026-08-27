import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { useSettings } from './context/SettingsContext'
import { useDailyReminders } from './hooks/useDailyReminders'
import { AyatPage } from './pages/AyatPage'
import { getDeviceId, apiClient, URLS } from './API'
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

import { AdminLayout } from './components/AdminLayout'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminAzkarPage } from './pages/AdminAzkarPage'
import { AdminTasbeehPage } from './pages/AdminTasbeehPage'
import { AdminKidsPage } from './pages/AdminKidsPage'
import { AdminMessagesPage } from './pages/AdminMessagesPage'
import { AdminReligiousInfoPage } from './pages/AdminReligiousInfoPage'
import { AdminSeerahPage } from './pages/AdminSeerahPage'
import { AdminReportsPage } from './pages/AdminReportsPage'

function App() {
  const { remindersEnabled } = useSettings()

  useDailyReminders(remindersEnabled)

  useEffect(() => {
    const deviceId = getDeviceId()
    let detectedOs = 'Web'
    const getDeviceName = () => {
      const ua = navigator.userAgent
      let temp, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []
      if (/trident/i.test(M[1])) {
        temp = /\brv[ :]+(\d+)/g.exec(ua) || []
        return 'IE ' + (temp[1] || '')
      }
      if (M[1] === 'Chrome') {
        temp = ua.match(/\b(OPR|Edge)\/(\d+)/)
        if (temp != null) return temp.slice(1).join(' ').replace('OPR', 'Opera')
      }
      M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?']
      if ((temp = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, temp[1])
      
      if (ua.indexOf('Android') !== -1) detectedOs = 'Android'
      else if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) detectedOs = 'iOS'
      else if (ua.indexOf('Win') !== -1) detectedOs = 'Windows'
      else if (ua.indexOf('Mac') !== -1) detectedOs = 'macOS'
      else if (ua.indexOf('Linux') !== -1) detectedOs = 'Linux'
      return `${M[0]} on ${detectedOs}`
    }

    const deviceName = getDeviceName()

    // Log device entry activity for admin reports
    void apiClient.post(URLS.ADMIN.DEVICES_LOG, {
      deviceIdentifier: deviceId,
      deviceName,
      platform: detectedOs,
    }).catch(() => {
      // Fallback ping
      void apiClient.post(URLS.ADMIN.STATS, {
        deviceIdentifier: deviceId,
        deviceName,
        platform: detectedOs,
      }).catch(() => {})
    })
  }, [])

  return (
    <Routes>
      {/* Admin Login Route */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Dedicated Admin Portal Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/azkar" replace />} />
        <Route path="azkar" element={<AdminAzkarPage />} />
        <Route path="tasbeeh" element={<AdminTasbeehPage />} />
        <Route path="kids" element={<AdminKidsPage />} />
        <Route path="messages" element={<AdminMessagesPage />} />
        <Route path="seerah" element={<AdminSeerahPage />} />
        <Route path="religious-info" element={<AdminReligiousInfoPage />} />
        <Route path="questions" element={<QuestionsPage isAdminRoute={true} />} />
        <Route path="recitations" element={<QuranRecitationsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      {/* Main User Application Routes */}
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
