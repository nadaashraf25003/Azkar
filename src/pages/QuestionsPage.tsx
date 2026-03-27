import { useEffect, useMemo, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'

type UserRole = 'user' | 'admin'
type ModerationStatus = 'pending' | 'approved' | 'rejected'
type QATag = 'Fiqh' | 'Quran' | 'Hadith' | 'Aqeedah' | 'Seerah'

interface QAAnswer {
  id: string
  text: string
  authorName: string
  authorRole: UserRole
  votes: number
  isBest: boolean
  isVisible: boolean
  createdAt: string
}

interface QAQuestion {
  id: string
  title: string
  body: string
  authorName: string
  tags: QATag[]
  votes: number
  status: ModerationStatus
  isLocked: boolean
  isVisible: boolean
  createdAt: string
  answers: QAAnswer[]
}

const TAGS: QATag[] = ['Fiqh', 'Quran', 'Hadith', 'Aqeedah', 'Seerah']
const TAG_LABELS_AR: Record<QATag, string> = {
  Fiqh: 'فقه',
  Quran: 'قرآن',
  Hadith: 'حديث',
  Aqeedah: 'عقيدة',
  Seerah: 'سيرة',
}
const QUESTIONS_SEED_PATH = `${import.meta.env.BASE_URL}data/questions.json`

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function formatDate(value: string): string {
  const date = new Date(value)
  return date.toLocaleDateString()
}

function displayTag(tag: QATag, language: 'ar' | 'en'): string {
  return language === 'ar' ? TAG_LABELS_AR[tag] : tag
}

export function QuestionsPage() {
  const { language } = useSettings()
  const [viewerRole, setViewerRole] = useLocalStorage<UserRole>('azkar-qa-viewer-role', 'user')
  const [questions, setQuestions] = useLocalStorage<QAQuestion[]>('azkar-qa-questions', [])

  const [searchQuery, setSearchQuery] = useState('')
  const [tagFilter, setTagFilter] = useState<'all' | QATag>('all')

  const [authorName, setAuthorName] = useState('')
  const [questionTitle, setQuestionTitle] = useState('')
  const [questionBody, setQuestionBody] = useState('')
  const [selectedTags, setSelectedTags] = useState<QATag[]>([])

  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({})
  const [isReloadingSeed, setIsReloadingSeed] = useState(false)

  const loadSeedQuestions = async (): Promise<void> => {
    setIsReloadingSeed(true)
    try {
      const response = await fetch(QUESTIONS_SEED_PATH)
      if (!response.ok) {
        return
      }

      const data = (await response.json()) as QAQuestion[]
      if (Array.isArray(data)) {
        setQuestions(data)
      }
    } catch {
      // Keep current state if seed loading fails.
    } finally {
      setIsReloadingSeed(false)
    }
  }

  useEffect(() => {
    if (questions.length > 0) {
      return
    }

    let canceled = false

    const loadSeed = async () => {
      await loadSeedQuestions()
      if (canceled) {
        return
      }
    }

    void loadSeed()

    return () => {
      canceled = true
    }
  }, [questions.length, setQuestions])

  const visibleQuestions = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()

    return questions
      .filter((question) => {
        if (viewerRole === 'user') {
          return question.status === 'approved' && question.isVisible
        }

        return true
      })
      .filter((question) => {
        const matchesTag = tagFilter === 'all' || question.tags.includes(tagFilter)
        const haystack = `${question.title} ${question.body} ${question.tags.join(' ')}`.toLowerCase()
        const matchesSearch = normalized.length === 0 || haystack.includes(normalized)

        return matchesTag && matchesSearch
      })
      .sort((a, b) => b.votes - a.votes)
  }, [questions, searchQuery, tagFilter, viewerRole])

  const updateQuestion = (questionId: string, updater: (question: QAQuestion) => QAQuestion) => {
    setQuestions((prev) => prev.map((question) => (question.id === questionId ? updater(question) : question)))
  }

  const submitQuestion = () => {
    if (!questionTitle.trim() || !questionBody.trim() || selectedTags.length === 0) {
      return
    }

    const question: QAQuestion = {
      id: createId('q'),
      title: questionTitle.trim(),
      body: questionBody.trim(),
      authorName: authorName.trim() || (viewerRole === 'admin' ? 'Admin' : 'Anonymous'),
      tags: selectedTags,
      votes: 0,
      status: viewerRole === 'admin' ? 'approved' : 'pending',
      isLocked: false,
      isVisible: true,
      createdAt: new Date().toISOString(),
      answers: [],
    }

    setQuestions((prev) => [question, ...prev])
    setQuestionTitle('')
    setQuestionBody('')
    setSelectedTags([])
  }

  const submitAnswer = (questionId: string) => {
    const draft = answerDrafts[questionId]?.trim()
    if (!draft) {
      return
    }

    updateQuestion(questionId, (question) => {
      if (question.isLocked) {
        return question
      }

      const answer: QAAnswer = {
        id: createId('a'),
        text: draft,
        authorName: authorName.trim() || (viewerRole === 'admin' ? 'Admin' : 'Community User'),
        authorRole: viewerRole,
        votes: 0,
        isBest: false,
        isVisible: true,
        createdAt: new Date().toISOString(),
      }

      return { ...question, answers: [answer, ...question.answers] }
    })

    setAnswerDrafts((prev) => ({ ...prev, [questionId]: '' }))
  }

  const toggleTag = (tag: QATag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    )
  }

  const questionStatusLabel = (status: ModerationStatus): string => {
    if (language === 'ar') {
      if (status === 'approved') return 'معتمد'
      if (status === 'rejected') return 'مرفوض'
      return 'قيد المراجعة'
    }

    if (status === 'approved') return 'Approved'
    if (status === 'rejected') return 'Rejected'
    return 'Pending'
  }

  return (
    <section className="space-y-4 md:space-y-5">
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
          {language === 'ar' ? 'منصة الأسئلة الشرعية' : 'Religious Q&A Platform'}
        </p>
        <h1 className="font-title text-2xl text-[var(--text-strong)] sm:text-3xl md:text-4xl">
          {language === 'ar' ? 'اسأل وتعلّم' : 'Ask and Learn'}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {language === 'ar'
            ? 'يمكن للمستخدمين طرح الأسئلة، الإجابة، التصويت، وإدارة المحتوى عبر نظام إشراف.'
            : 'Users can ask, answer, vote, and manage content through moderation controls.'}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5 lg:col-span-1">
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">
            {language === 'ar' ? 'طرح سؤال' : 'Ask a question'}
          </h2>

          <div className="mt-3 space-y-3">
            <label className="block text-sm text-[var(--muted)]">
              {language === 'ar' ? 'وضع العرض' : 'Viewer mode'}
              <select
                value={viewerRole}
                onChange={(event) => setViewerRole(event.target.value as UserRole)}
                className="mt-1 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
              >
                <option value="user">{language === 'ar' ? 'مستخدم' : 'User'}</option>
                <option value="admin">{language === 'ar' ? 'مشرف' : 'Admin'}</option>
              </select>
            </label>

            <input
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              placeholder={language === 'ar' ? 'اسمك (اختياري)' : 'Your name (optional)'}
              className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
            />

            <input
              value={questionTitle}
              onChange={(event) => setQuestionTitle(event.target.value)}
              placeholder={language === 'ar' ? 'عنوان السؤال' : 'Question title'}
              className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
            />

            <textarea
              value={questionBody}
              onChange={(event) => setQuestionBody(event.target.value)}
              rows={4}
              placeholder={language === 'ar' ? 'اكتب تفاصيل السؤال...' : 'Write question details...'}
              className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
            />

            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => {
                const active = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={[
                      'rounded-full border px-3 py-1 text-xs font-semibold',
                      active
                        ? 'border-[var(--brand-500)] bg-[var(--brand-500)] text-white'
                        : 'border-[var(--line)] text-[var(--muted)]',
                    ].join(' ')}
                  >
                    {displayTag(tag, language)}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={submitQuestion}
              className="w-full rounded-xl bg-[var(--brand-500)] px-3 py-2 text-sm font-semibold text-white"
            >
              {language === 'ar' ? 'نشر السؤال' : 'Publish question'}
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap gap-2">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={language === 'ar' ? 'بحث في الأسئلة...' : 'Search questions...'}
              className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm sm:min-w-56 sm:flex-1"
            />
            <select
              value={tagFilter}
              onChange={(event) => setTagFilter(event.target.value as 'all' | QATag)}
              className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm sm:w-auto"
            >
              <option value="all">{language === 'ar' ? 'كل التصنيفات' : 'All Tags'}</option>
              {TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {displayTag(tag, language)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                void loadSeedQuestions()
              }}
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-semibold sm:w-auto"
            >
              {isReloadingSeed
                ? language === 'ar'
                  ? 'جارٍ التحميل...'
                  : 'Loading...'
                : language === 'ar'
                  ? 'إعادة تحميل الأسئلة'
                  : 'Reload Questions'}
            </button>
          </div>

          <div className="space-y-4">
            {visibleQuestions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--line)] p-5 text-sm text-[var(--muted)]">
                {language === 'ar' ? 'لا توجد أسئلة بهذه الفلاتر.' : 'No questions found with these filters.'}
              </p>
            ) : (
              visibleQuestions.map((question) => (
                <article key={question.id} className="rounded-2xl border border-[var(--line)] p-3 sm:p-4">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--text-strong)]">{question.title}</h3>
                      <p className="text-xs text-[var(--muted)]">
                        {question.authorName} • {formatDate(question.createdAt)} • {questionStatusLabel(question.status)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuestion(question.id, (item) => ({ ...item, votes: item.votes + 1 }))}
                        className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuestion(question.id, (item) => ({
                            ...item,
                            votes: Math.max(0, item.votes - 1),
                          }))
                        }
                        className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs"
                      >
                        -
                      </button>
                      <span className="rounded-lg bg-[var(--brand-100)] px-2 py-1 text-xs font-semibold text-[var(--brand-700)]">
                        {question.votes}
                      </span>
                    </div>
                  </div>

                  <p className="mb-3 text-sm text-[var(--text)]">{question.body}</p>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {question.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[var(--line)] bg-[var(--brand-100)] px-2 py-1 text-xs text-[var(--brand-700)]"
                      >
                        {displayTag(tag, language)}
                      </span>
                    ))}
                  </div>

                  {viewerRole === 'admin' ? (
                    <div className="mb-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuestion(question.id, (item) => ({ ...item, status: 'approved' }))}
                        className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs"
                      >
                        {language === 'ar' ? 'اعتماد' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQuestion(question.id, (item) => ({ ...item, status: 'rejected' }))}
                        className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs"
                      >
                        {language === 'ar' ? 'رفض' : 'Reject'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuestion(question.id, (item) => ({ ...item, isLocked: !item.isLocked }))
                        }
                        className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs"
                      >
                        {question.isLocked
                          ? language === 'ar'
                            ? 'فتح الإجابات'
                            : 'Unlock answers'
                          : language === 'ar'
                            ? 'قفل الإجابات'
                            : 'Lock answers'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuestion(question.id, (item) => ({ ...item, isVisible: !item.isVisible }))
                        }
                        className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs"
                      >
                        {question.isVisible
                          ? language === 'ar'
                            ? 'إخفاء'
                            : 'Hide'
                          : language === 'ar'
                            ? 'إظهار'
                            : 'Show'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuestions((prev) => prev.filter((item) => item.id !== question.id))}
                        className="rounded-lg border border-[var(--warn)] px-2 py-1 text-xs text-[var(--warn)]"
                      >
                        {language === 'ar' ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  ) : null}

                  <div className="space-y-2 border-t border-[var(--line)] pt-3">
                    <p className="text-sm font-semibold text-[var(--text-strong)]">
                      {language === 'ar' ? 'الإجابات' : 'Answers'} ({question.answers.filter((answer) => answer.isVisible || viewerRole === 'admin').length})
                    </p>

                    {question.answers
                      .filter((answer) => answer.isVisible || viewerRole === 'admin')
                      .sort((a, b) => b.votes - a.votes)
                      .map((answer) => (
                        <div key={answer.id} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs text-[var(--muted)]">
                              {answer.authorName} • {answer.authorRole === 'admin' ? 'Admin' : 'User'} • {formatDate(answer.createdAt)}
                            </p>
                            <div className="flex items-center gap-2">
                              {answer.isBest ? (
                                <span className="rounded-full bg-[var(--brand-500)] px-2 py-1 text-[10px] font-bold text-white">
                                  {language === 'ar' ? 'أفضل إجابة' : 'Best Answer'}
                                </span>
                              ) : null}
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuestion(question.id, (item) => ({
                                    ...item,
                                    answers: item.answers.map((itemAnswer) =>
                                      itemAnswer.id === answer.id
                                        ? { ...itemAnswer, votes: itemAnswer.votes + 1 }
                                        : itemAnswer,
                                    ),
                                  }))
                                }
                                className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuestion(question.id, (item) => ({
                                    ...item,
                                    answers: item.answers.map((itemAnswer) =>
                                      itemAnswer.id === answer.id
                                        ? { ...itemAnswer, votes: Math.max(0, itemAnswer.votes - 1) }
                                        : itemAnswer,
                                    ),
                                  }))
                                }
                                className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs"
                              >
                                -
                              </button>
                              <span className="rounded-lg bg-[var(--brand-100)] px-2 py-1 text-xs font-semibold text-[var(--brand-700)]">
                                {answer.votes}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-[var(--text)]">{answer.text}</p>

                          {viewerRole === 'admin' ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuestion(question.id, (item) => ({
                                    ...item,
                                    answers: item.answers.map((itemAnswer) => ({
                                      ...itemAnswer,
                                      isBest: itemAnswer.id === answer.id,
                                    })),
                                  }))
                                }
                                className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs"
                              >
                                {language === 'ar' ? 'تعيين كأفضل' : 'Mark best'}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuestion(question.id, (item) => ({
                                    ...item,
                                    answers: item.answers.map((itemAnswer) =>
                                      itemAnswer.id === answer.id
                                        ? { ...itemAnswer, isVisible: !itemAnswer.isVisible }
                                        : itemAnswer,
                                    ),
                                  }))
                                }
                                className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs"
                              >
                                {answer.isVisible
                                  ? language === 'ar'
                                    ? 'إخفاء'
                                    : 'Hide'
                                  : language === 'ar'
                                    ? 'إظهار'
                                    : 'Show'}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuestion(question.id, (item) => ({
                                    ...item,
                                    answers: item.answers.filter((itemAnswer) => itemAnswer.id !== answer.id),
                                  }))
                                }
                                className="rounded-lg border border-[var(--warn)] px-2 py-1 text-xs text-[var(--warn)]"
                              >
                                {language === 'ar' ? 'حذف' : 'Delete'}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ))}

                    {!question.isLocked ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <input
                          value={answerDrafts[question.id] ?? ''}
                          onChange={(event) =>
                            setAnswerDrafts((prev) => ({ ...prev, [question.id]: event.target.value }))
                          }
                          placeholder={language === 'ar' ? 'أضف إجابتك...' : 'Write your answer...'}
                          className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm sm:min-w-56 sm:flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => submitAnswer(question.id)}
                          className="w-full rounded-xl bg-[var(--brand-500)] px-3 py-2 text-sm font-semibold text-white sm:w-auto"
                        >
                          {language === 'ar' ? 'إرسال' : 'Submit'}
                        </button>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-[var(--muted)]">
                        {language === 'ar' ? 'تم قفل الإجابات لهذا السؤال.' : 'Answers are locked for this question.'}
                      </p>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  )
}
