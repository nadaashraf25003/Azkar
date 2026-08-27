import { useEffect, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useAddKidsQuiz } from '../hooks/useKids'

export interface AddKidsQuizModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (createdItem?: any) => void
}

export function AddKidsQuizModal({
  isOpen,
  onClose,
  onSuccess,
}: AddKidsQuizModalProps) {
  const { language } = useSettings()
  const addMutation = useAddKidsQuiz()

  const [questionText, setQuestionText] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [optionC, setOptionC] = useState('')
  const [optionD, setOptionD] = useState('')
  const [correctIndex, setCorrectIndex] = useState(0)
  const [explanation, setExplanation] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setQuestionText('')
      setOptionA('')
      setOptionB('')
      setOptionC('')
      setOptionD('')
      setCorrectIndex(0)
      setExplanation('')
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

    if (!questionText.trim()) {
      setFormError(language === 'ar' ? 'يرجى كتابة نص السؤال.' : 'Please enter question text.')
      return
    }

    if (!optionA.trim() || !optionB.trim()) {
      setFormError(language === 'ar' ? 'يرجى ملء الخيارات الأساسية (أ، ب).' : 'Please fill at least Option A and Option B.')
      return
    }

    try {
      const created = await addMutation.mutateAsync({
        questionText: questionText.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim() || '-',
        optionD: optionD.trim() || '-',
        correctOptionIndex: correctIndex,
        explanation: explanation.trim() || (language === 'ar' ? 'إجابة صحيحة وموفقة بارك الله فيك!' : 'Great job! Correct answer.'),
        category: 'General',
      })

      if (onSuccess) {
        onSuccess(created)
      }
      onClose()
    } catch (err: any) {
      setFormError(
        err?.message ||
          (language === 'ar'
            ? 'حدث خطأ أثناء حفظ السؤال في الخادم.'
            : 'A server error occurred while adding the quiz question.')
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
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-xl text-amber-600 shadow-inner">
              🧩
            </div>
            <div>
              <h2 className="font-title text-xl font-bold text-[var(--text-strong)]">
                {language === 'ar' ? 'إضافة سؤال مسابقة للأطفال' : 'Add Kids Quiz Question'}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {language === 'ar'
                  ? 'حفظ سؤال ومسابقات دينية للأطفال في قاعدة البيانات'
                  : 'Save an interactive quiz question for kids'}
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

          {/* Question Text */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'نص السؤال' : 'Question Text'} *
            </label>
            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'مثال: كم عدد ركعات صلاة الفجر؟'
                  : 'e.g. How many Rak’ahs in Fajr prayer?'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              required
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'الخيارات (اختر الإجابة الصحيحة):' : 'Options (Select correct one):'} *
            </label>

            {[
              { idx: 0, val: optionA, setVal: setOptionA, label: 'أ' },
              { idx: 1, val: optionB, setVal: setOptionB, label: 'ب' },
              { idx: 2, val: optionC, setVal: setOptionC, label: 'ج' },
              { idx: 3, val: optionD, setVal: setOptionD, label: 'د' },
            ].map(({ idx, val, setVal, label }) => (
              <div key={idx} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCorrectIndex(idx)}
                  className={[
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-bold text-xs transition',
                    correctIndex === idx
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                      : 'border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:border-emerald-500',
                  ].join(' ')}
                  title={language === 'ar' ? 'حدد كإجابة صحيحة' : 'Mark as correct answer'}
                >
                  {label}
                </button>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  placeholder={`${language === 'ar' ? 'الخيار' : 'Option'} ${label}`}
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--text)] outline-none transition focus:border-amber-500"
                />
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'الشرح والتوضيح عند الإجابة الصحيحة' : 'Explanation & Feedback'}
            </label>
            <input
              type="text"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'مثال: صلاة الفجر ركعتان جهريتان'
                  : 'e.g. Fajr prayer consists of 2 Rak’ahs'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
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
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-amber-700 active:scale-95 disabled:opacity-50"
            >
              {addMutation.isPending ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{language === 'ar' ? 'جاري الحفظ في الخادم...' : 'Saving to server...'}</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>{language === 'ar' ? 'حفظ السؤال في الخادم' : 'Save to Server'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
