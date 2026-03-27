import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { calculateQiblaBearing, getQiblaMapsUrl } from '../utils/qibla'

export function SettingsPage() {
  const {
    language,
    setLanguage,
    remindersEnabled,
    setRemindersEnabled,
  } = useSettings()
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null)
  const [qiblaError, setQiblaError] = useState<string>('')

  const detectQibla = () => {
    if (!navigator.geolocation) {
      setQiblaError('Geolocation is not supported on this device.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const bearing = calculateQiblaBearing(
          position.coords.latitude,
          position.coords.longitude,
        )
        setQiblaBearing(bearing)
        setQiblaError('')
      },
      () => {
        setQiblaError('Unable to access your location for Qibla direction.')
      },
    )
  }

  const askReminderPermission = async () => {
    if (typeof Notification === 'undefined') {
      return
    }

    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const handleReminderToggle = async (checked: boolean) => {
    if (checked) {
      await askReminderPermission()
    }

    setRemindersEnabled(checked)
  }

  return (
    <section className="space-y-4">
      <h1 className="font-title text-3xl text-[var(--text-strong)]">
        {language === 'ar' ? 'الإعدادات' : 'Settings'}
      </h1>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">
            {language === 'ar' ? 'اللغة' : 'Language'}
          </h2>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={[
                'rounded-xl border px-3 py-2 text-sm font-semibold',
                language === 'ar'
                  ? 'border-[var(--brand-500)] bg-[var(--brand-500)] text-white'
                  : 'border-[var(--line)]',
              ].join(' ')}
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={[
                'rounded-xl border px-3 py-2 text-sm font-semibold',
                language === 'en'
                  ? 'border-[var(--brand-500)] bg-[var(--brand-500)] text-white'
                  : 'border-[var(--line)]',
              ].join(' ')}
            >
              English
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">
            {language === 'ar' ? 'التذكيرات اليومية' : 'Daily reminders'}
          </h2>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(event) => handleReminderToggle(event.target.checked)}
            />
            {language === 'ar'
              ? 'تفعيل إشعارات المتصفح للصباح والمساء'
              : 'Enable browser notifications for morning/evening reminders'}
          </label>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {language === 'ar'
              ? 'ملاحظة: تعمل التذكيرات أثناء فتح التطبيق في المتصفح.'
              : 'Note: reminders work while the app is open in your browser.'}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 md:col-span-2">
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">
            {language === 'ar' ? 'اتجاه القبلة (اختياري)' : 'Qibla direction (optional)'}
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={detectQibla}
              className="rounded-xl bg-[var(--brand-500)] px-3 py-2 text-sm font-semibold text-white"
            >
              {language === 'ar' ? 'تحديد الاتجاه' : 'Detect direction'}
            </button>
            <a
              href={getQiblaMapsUrl()}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-semibold"
            >
              {language === 'ar' ? 'فتح في الخرائط' : 'Open in Google Maps'}
            </a>
          </div>

          {qiblaBearing !== null ? (
            <p className="mt-3 text-sm text-[var(--text-strong)]">
              {language === 'ar' ? 'اتجاه القبلة من موقعك الحالي:' : 'Qibla bearing from your location:'}{' '}
              <strong>{qiblaBearing.toFixed(1)}°</strong>
            </p>
          ) : null}

          {qiblaError ? <p className="mt-3 text-sm text-[var(--warn)]">{qiblaError}</p> : null}
        </article>
      </div>
    </section>
  )
}
