import { useEffect, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useAddKidsChallenge } from '../hooks/useKids'

export interface AddKidsChallengeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (createdItem?: any) => void
}

const CATEGORIES = [
  { id: 'Daily Akhlaq', ar: 'أخلاق وسلوكيات', en: 'Daily Akhlaq' },
  { id: 'Prayer', ar: 'الصلاة والمسجد', en: 'Prayer' },
  { id: 'Quran', ar: 'حفظ وتلاوة القرآن', en: 'Quran' },
  { id: 'Kindness', ar: 'بر الوالدين والإحسان', en: 'Kindness' },
  { id: 'Fasting', ar: 'الصيام والتطوع', en: 'Fasting' },
]

export function AddKidsChallengeModal({
  isOpen,
  onClose,
  onSuccess,
}: AddKidsChallengeModalProps) {
  const { language } = useSettings()
  const addMutation = useAddKidsChallenge()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState<number | string>(10)
  const [category, setCategory] = useState('Daily Akhlaq')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setDescription('')
      setPoints(10)
      setCategory('Daily Akhlaq')
      setFormError('')
    }
  }, [isOpen])

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

    if (!title.trim()) {
      setFormError(language === 'ar' ? 'يرجى كتابة عنوان التحدي.' : 'Please enter challenge title.')
      return
    }

    if (!description.trim()) {
      setFormError(language === 'ar' ? 'يرجى كتابة وصف ومهمة التحدي.' : 'Please enter challenge description.')
      return
    }

    try {
      const created = await addMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        points: Number(points) || 10,
        category,
        badgeIcon: '🌟',
      })

      if (onSuccess) {
        onSuccess(created)
      }
      onClose()
    } catch (err: any) {
      setFormError(
        err?.message ||
          (language === 'ar'
            ? 'حدث خطأ أثناء حفظ التحدي في الخادم.'
            : 'A server error occurred while adding the challenge.')
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
        className="w-full max-w-lg rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-2xl transition-all sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-xl text-emerald-600 shadow-inner">
              🎯
            </div>
            <div>
              <h2 className="font-title text-xl font-bold text-[var(--text-strong)]">
                {language === 'ar' ? 'إضافة تحدي يومي للأطفال' : 'Add Kids Daily Challenge'}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {language === 'ar'
                  ? 'حفظ مهمة أو تحدي جديد ليكسب الأطفال نقاطاً وتشجيعاً'
                  : 'Save a daily challenge for kids to earn points'}
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

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'عنوان التحدي' : 'Challenge Title'} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'مثال: تبسم في وجه والديك وقل لهما كلمة طيبة'
                  : 'e.g. Smile and say a kind word to your parents'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'تصنيف التحدي' : 'Challenge Category'} *
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={[
                    'rounded-xl border p-2 text-center text-xs font-bold transition',
                    category === cat.id
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                      : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text)] hover:border-emerald-500',
                  ].join(' ')}
                >
                  {language === 'ar' ? cat.ar : cat.en}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'شرح التحدي والمطلوب فعله' : 'Challenge Description'} *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'اكتب تفاصيل ما يقوم به الطفل لإتمام هذا التحدي...'
                  : 'Write what the child needs to accomplish...'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm leading-relaxed text-[var(--text)] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          {/* Points */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'النقاط المكتسبة (Points)' : 'Reward Points'} *
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              required
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
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
            >
              {addMutation.isPending ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{language === 'ar' ? 'جاري الحفظ في الخادم...' : 'Saving to server...'}</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>{language === 'ar' ? 'حفظ التحدي في الخادم' : 'Save to Server'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
