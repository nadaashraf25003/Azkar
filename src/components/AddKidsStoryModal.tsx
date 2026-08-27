import { useEffect, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useAddKidsStory } from '../hooks/useKids'

export interface AddKidsStoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (createdItem?: any) => void
}

export function AddKidsStoryModal({
  isOpen,
  onClose,
  onSuccess,
}: AddKidsStoryModalProps) {
  const { language } = useSettings()
  const addMutation = useAddKidsStory()

  const [title, setTitle] = useState('')
  const [ageGroup, setAgeGroup] = useState('5-8')
  const [content, setContent] = useState('')
  const [moralLesson, setMoralLesson] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setAgeGroup('5-8')
      setContent('')
      setMoralLesson('')
      setCoverImageUrl('')
      setAudioUrl('')
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
      setFormError(language === 'ar' ? 'يرجى إدخال عنوان القصة.' : 'Please enter story title.')
      return
    }

    if (!content.trim()) {
      setFormError(language === 'ar' ? 'يرجى إدخال نص القصة.' : 'Please enter story content.')
      return
    }

    try {
      const created = await addMutation.mutateAsync({
        title: title.trim(),
        ageGroup,
        content: content.trim(),
        moralLesson: moralLesson.trim() || (language === 'ar' ? 'حب الخير ومساعدة الآخرين' : 'Good morals and kindness'),
        coverImageUrl: coverImageUrl.trim(),
        audioUrl: audioUrl.trim(),
      })

      if (onSuccess) {
        onSuccess(created)
      }
      onClose()
    } catch (err: any) {
      setFormError(
        err?.message ||
          (language === 'ar'
            ? 'حدث خطأ أثناء حفظ القصة في الخادم.'
            : 'A server error occurred while adding the story.')
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
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/15 text-xl text-sky-600 shadow-inner">
              📖
            </div>
            <div>
              <h2 className="font-title text-xl font-bold text-[var(--text-strong)]">
                {language === 'ar' ? 'إضافة قصة أطفال جديدة' : 'Add New Kids Story'}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {language === 'ar'
                  ? 'حفظ قصة إسلامية تربوية للأطفال مباشرة في قاعدة البيانات'
                  : 'Save an educational Islamic kids story directly to backend'}
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

          {/* Story Title */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'عنوان القصة' : 'Story Title'} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'مثال: قصة الصدق منجاة، عصفور الجنة، رحلة في المسجد...'
                  : 'e.g. The Honest Bird, A Day at the Mosque...'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              required
            />
          </div>

          {/* Age Group */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'الفئة العمرية المناسبة' : 'Age Group'} *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '4-7', label: '4 - 7 سنوات' },
                { id: '5-8', label: '5 - 8 سنوات' },
                { id: '8-12', label: '8 - 12 سنة' },
              ].map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setAgeGroup(group.id)}
                  className={[
                    'rounded-xl border p-2.5 text-center text-xs font-bold transition',
                    ageGroup === group.id
                      ? 'border-sky-600 bg-sky-600 text-white shadow-sm'
                      : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text)] hover:border-sky-500',
                  ].join(' ')}
                >
                  {group.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'نص القصة وأحداثها' : 'Story Content'} *
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'اكتب أحداث القصة بأسلوب سهل وشيق للأطفال...'
                  : 'Write the story text in engaging words for kids...'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm leading-relaxed text-[var(--text)] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              required
            />
          </div>

          {/* Moral Lesson */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'العبرة والدرس المستفاد' : 'Moral Lesson'}
            </label>
            <input
              type="text"
              value={moralLesson}
              onChange={(e) => setMoralLesson(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'مثال: أهمية الصدق في كل الأحوال ومحبة الله'
                  : 'e.g. Honesty always leads to success'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
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
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-sky-700 active:scale-95 disabled:opacity-50"
            >
              {addMutation.isPending ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{language === 'ar' ? 'جاري الحفظ في الخادم...' : 'Saving to server...'}</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>{language === 'ar' ? 'حفظ القصة في الخادم' : 'Save to Server'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
