import { useEffect, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useAddMessage } from '../hooks/useMessagesData'

export interface AddMessageModalProps {
  isOpen: boolean
  initialCategory?: string
  onClose: () => void
  onSuccess?: (createdItem?: any) => void
}

const MESSAGE_TYPES: { id: string; ar: string; en: string }[] = [
  { id: 'religious', ar: 'دينية', en: 'Religious' },
  { id: 'reflection', ar: 'خواطر', en: 'Reflections' },
  { id: 'quran', ar: 'آيات قرآنية', en: 'Quranic Verses' },
  { id: 'hadith', ar: 'أحاديث نبوية', en: 'Prophetic Hadith' },
  { id: 'dua', ar: 'أدعية', en: 'Supplications' },
  { id: 'motivation', ar: 'تحفيز وأمل', en: 'Motivation' },
  { id: 'gratitude', ar: 'شكر وامتنان', en: 'Gratitude' },
  { id: 'wisdom', ar: 'حِكَم وعِبر', en: 'Wisdom' },
  { id: 'community', ar: 'مجتمع وأخوة', en: 'Community' },
  { id: 'action', ar: 'عمل وخطوات', en: 'Action' },
]

export function AddMessageModal({
  isOpen,
  initialCategory = 'religious',
  onClose,
  onSuccess,
}: AddMessageModalProps) {
  const { language } = useSettings()
  const addMutation = useAddMessage()

  const [category, setCategory] = useState(initialCategory)
  const [text, setText] = useState('')
  const [source, setSource] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory && initialCategory !== 'all' ? initialCategory : 'religious')
      setText('')
      setSource('')
      setFormError('')
    }
  }, [isOpen, initialCategory])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !addMutation.isPending) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, addMutation.isPending, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!text.trim()) {
      setFormError(
        language === 'ar'
          ? 'يرجى كتابة نص الرسالة اليومية.'
          : 'Please enter the message text.'
      )
      return
    }

    try {
      const created = await addMutation.mutateAsync({
        category: category.trim().toLowerCase(),
        text: text.trim(),
        source: source.trim() || (language === 'ar' ? 'أذكار' : 'Azkar'),
        dateFor: new Date().toISOString(),
      })

      if (onSuccess) {
        onSuccess(created)
      }
      onClose()
    } catch (err: any) {
      setFormError(
        err?.message ||
          (language === 'ar'
            ? 'حدث خطأ في الخادم أثناء حفظ الرسالة.'
            : 'A server error occurred while adding the message.')
      )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm transition-opacity animate-fade-in"
      role="dialog"
      aria-modal="true"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full max-w-xl rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-2xl transition-all sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/15 text-xl text-indigo-600 shadow-inner">
              💌
            </div>
            <div>
              <h2 className="font-title text-xl font-bold text-[var(--text-strong)]">
                {language === 'ar' ? 'إضافة رسالة يومية جديدة' : 'Add New Daily Message'}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {language === 'ar'
                  ? 'حفظ رسالة ملهمة أو خاطرة مباشرة في قاعدة بيانات الخادم'
                  : 'Save an inspirational message directly to the backend database'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={addMutation.isPending}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line)] text-sm text-[var(--muted)] transition hover:bg-[var(--line)]/30 hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {formError ? (
            <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
              <span>⚠️</span>
              <span>{formError}</span>
            </div>
          ) : null}

          {/* Category selection */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'نوع / تصنيف الرسالة' : 'Message Category'} *
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MESSAGE_TYPES.map((cat) => {
                const isSelected = category === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={[
                      'rounded-xl border p-2.5 text-center text-xs font-bold transition',
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                        : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text)] hover:border-indigo-500',
                    ].join(' ')}
                  >
                    {language === 'ar' ? cat.ar : cat.en}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Message Text */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'نص الرسالة اليومية' : 'Message Text'} *
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'اكتب نص الرسالة، الخاطرة، الآية، أو الحديث الشريف...'
                  : 'Write the message, quote, verse, or reflection...'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm leading-relaxed text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          {/* Source / Author */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'المصدر أو القائل (اختياري)' : 'Source / Author (Optional)'}
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'مثال: صحيح البخاري، سورة الرعد، الحسن البصري...'
                  : 'e.g. Sahih Muslim, Surah Ar-Ra’d, Al-Hasan Al-Basri...'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[var(--line)] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={addMutation.isPending}
              className="rounded-xl border border-[var(--line)] bg-transparent px-4 py-2.5 text-xs font-bold text-[var(--text)] transition hover:bg-[var(--line)]/30"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={addMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
            >
              {addMutation.isPending ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{language === 'ar' ? 'جاري الحفظ في الخادم...' : 'Saving to server...'}</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>{language === 'ar' ? 'حفظ الرسالة في الخادم' : 'Save to Server'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
