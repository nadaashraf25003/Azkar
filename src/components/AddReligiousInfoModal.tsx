import { useEffect, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useAddReligiousInfo } from '../hooks/useReligiousInfo'

export interface AddReligiousInfoModalProps {
  isOpen: boolean
  initialCategory?: string
  onClose: () => void
  onSuccess?: (createdItem?: any) => void
}

const CATEGORY_OPTIONS: { id: string; ar: string; en: string }[] = [
  { id: 'aqeedah', ar: 'العقيدة', en: 'Aqeedah' },
  { id: 'fiqh', ar: 'الفقه', en: 'Fiqh' },
  { id: 'quran', ar: 'القرآن', en: 'Quran' },
  { id: 'seerah', ar: 'السيرة النبوية', en: 'Prophetic Seerah' },
  { id: 'akhlaq', ar: 'الأخلاق والآداب', en: 'Manners & Ethics' },
  { id: 'dua', ar: 'الأدعية والأذكار', en: 'Dua & Supplications' },
]

export function AddReligiousInfoModal({
  isOpen,
  initialCategory = 'aqeedah',
  onClose,
  onSuccess,
}: AddReligiousInfoModalProps) {
  const { language } = useSettings()
  const addMutation = useAddReligiousInfo()

  const [category, setCategory] = useState(initialCategory)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [source, setSource] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory && initialCategory !== 'all' ? initialCategory : 'aqeedah')
      setTitle('')
      setContent('')
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

    if (!title.trim()) {
      setFormError(
        language === 'ar'
          ? 'يرجى كتابة عنوان المعلومة الدينية.'
          : 'Please enter the title of the religious information.'
      )
      return
    }

    if (!content.trim()) {
      setFormError(
        language === 'ar'
          ? 'يرجى كتابة تفاصيل ومحتوى المعلومة.'
          : 'Please enter the content details.'
      )
      return
    }

    try {
      const created = await addMutation.mutateAsync({
        category: category.trim().toLowerCase(),
        title: title.trim(),
        content: content.trim(),
        referenceSource: source.trim() || (language === 'ar' ? 'مرجع موثوق' : 'Verified Source'),
      })

      if (onSuccess) {
        onSuccess(created)
      }
      onClose()
    } catch (err: any) {
      setFormError(
        err?.message ||
          (language === 'ar'
            ? 'حدث خطأ في الخادم أثناء حفظ المعلومة.'
            : 'A server error occurred while adding the information.')
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
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-xl text-emerald-600 shadow-inner">
              📖
            </div>
            <div>
              <h2 className="font-title text-xl font-bold text-[var(--text-strong)]">
                {language === 'ar' ? 'إضافة معلومة دينية جديدة' : 'Add New Religious Information'}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {language === 'ar'
                  ? 'حفظ مقالة أو فائدة دينية مباشرة في قاعدة بيانات الخادم'
                  : 'Save an Islamic article or insight directly to the backend database'}
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
              {language === 'ar' ? 'القسم / التصنيف' : 'Category'} *
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = category === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={[
                      'rounded-xl border p-2.5 text-center text-xs font-bold transition',
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                        : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text)] hover:border-emerald-500',
                    ].join(' ')}
                  >
                    {language === 'ar' ? cat.ar : cat.en}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'عنوان المعلومة / الفائدة' : 'Title / Subject'} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'مثال: أركان الإيمان، فضل صيام التطوع، غزوة بدر الكبرى...'
                  : 'e.g. Pillars of Faith, Virtues of Voluntary Fasting...'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'محتوى المعلومة بالتفصيل' : 'Content & Explanation'} *
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'اكتب شرح المعلومة الدينية، الفائدة، أو التفاصيل هنا...'
                  : 'Write the full religious details, summary, and lessons here...'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm leading-relaxed text-[var(--text)] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          {/* Reference Source */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'المصدر أو المرجع (اختياري)' : 'Reference / Source (Optional)'}
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'مثال: صحيح البخاري، زاد المعاد، تفسير القرطبي...'
                  : 'e.g. Sahih Al-Bukhari, Tafsir Ibn Kathir...'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                  <span>{language === 'ar' ? 'حفظ المعلومة في الخادم' : 'Save to Server'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
