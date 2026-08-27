import { useSettings } from '../context/SettingsContext'

interface BackendErrorStateProps {
  titleAr?: string
  titleEn?: string
  messageAr?: string
  messageEn?: string
  onRetry?: () => void
}

export function BackendErrorState({
  titleAr = 'عذراً، الخادم غير متاح حالياً',
  titleEn = 'Backend Server Unavailable',
  messageAr = 'تعذر الاتصال بالخادم. يرجى التأكد من تشغيل الخادم والاتصال بالشبكة.',
  messageEn = 'Failed to connect to backend server. Please verify network connection or backend status.',
  onRetry,
}: BackendErrorStateProps) {
  const { language } = useSettings()

  return (
    <section className="my-6 space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--warn)]/40 bg-[var(--panel)] p-8 text-center shadow-lg transition duration-300">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(239,68,68,0.1),transparent_60%)]" />
        <div className="relative z-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--warn)]/15 text-2xl font-bold text-[var(--warn)] shadow-sm">
            ⚠️
          </div>
          <h2 className="font-title text-xl font-bold text-[var(--text-strong)] sm:text-2xl" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {language === 'ar' ? titleAr : titleEn}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {language === 'ar' ? messageAr : messageEn}
          </p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--brand-500)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--brand-600)] active:scale-95"
            >
              🔄 {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
