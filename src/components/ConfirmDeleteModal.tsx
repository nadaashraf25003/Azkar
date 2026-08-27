import { useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'

export interface ConfirmDeleteModalProps {
  isOpen: boolean
  titleAr?: string
  titleEn?: string
  messageAr?: string
  messageEn?: string
  itemTitle?: string
  confirmTextAr?: string
  confirmTextEn?: string
  cancelTextAr?: string
  cancelTextEn?: string
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
  onClose: () => void
}

export function ConfirmDeleteModal({
  isOpen,
  titleAr = 'تأكيد الحذف النهائي',
  titleEn = 'Confirm Permanent Deletion',
  messageAr = 'هل أنت متأكد من رغبتك في حذف هذا العنصر نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء.',
  messageEn = 'Are you sure you want to permanently delete this item from the database? This action cannot be undone.',
  itemTitle,
  confirmTextAr = 'نعم، حذف نهائي',
  confirmTextEn = 'Yes, Delete Permanently',
  cancelTextAr = 'إلغاء',
  cancelTextEn = 'Cancel',
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  const { language } = useSettings()

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={isLoading ? undefined : onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/20 bg-[var(--panel)] p-6 shadow-2xl transition-all"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Glow Header */}
        <div className="pointer-events-none absolute -top-12 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-rose-500/15 blur-2xl" />

        <div className="relative text-center">
          {/* Danger Icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-2xl text-rose-600 dark:text-rose-400 shadow-inner">
            🗑️
          </div>

          {/* Title */}
          <h3 className="font-title text-xl font-bold text-[var(--text-strong)]">
            {language === 'ar' ? titleAr : titleEn}
          </h3>

          {/* Message */}
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            {language === 'ar' ? messageAr : messageEn}
          </p>

          {/* Optional Item Snippet Preview */}
          {itemTitle ? (
            <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-xs font-medium text-[var(--text)] line-clamp-2 text-start">
              <span className="text-[var(--muted)] font-normal">
                {language === 'ar' ? 'العنصر: ' : 'Item: '}
              </span>
              "{itemTitle}"
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--line)] disabled:opacity-50"
            >
              {language === 'ar' ? cancelTextAr : cancelTextEn}
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => void onConfirm()}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-rose-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{language === 'ar' ? 'جاري الحذف...' : 'Deleting...'}</span>
                </>
              ) : (
                <>
                  <span>🗑️</span>
                  <span>{language === 'ar' ? confirmTextAr : confirmTextEn}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
