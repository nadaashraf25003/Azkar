import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { AddKidsStoryModal } from '../components/AddKidsStoryModal'
import { AddKidsChallengeModal } from '../components/AddKidsChallengeModal'
import { AddKidsQuizModal } from '../components/AddKidsQuizModal'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import {
  useKidsStories,
  useKidsChallenges,
  useKidsQuizzes,
  useDeleteKidsStory,
  useDeleteKidsChallenge,
  useDeleteKidsQuiz,
} from '../hooks/useKids'

export function AdminKidsPage() {
  const { language } = useSettings()
  const [activeTab, setActiveTab] = useState<'stories' | 'challenges' | 'quizzes'>('stories')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false)
  const [isAddChallengeOpen, setIsAddChallengeOpen] = useState(false)
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false)

  // Delete target state
  const [deleteTarget, setDeleteTarget] = useState<{
    isOpen: boolean
    id: string
    title: string
    type: 'story' | 'challenge' | 'quiz'
  }>({
    isOpen: false,
    id: '',
    title: '',
    type: 'story',
  })

  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Queries
  const {
    data: stories = [],
    isLoading: isStoriesLoading,
    refetch: refetchStories,
  } = useKidsStories()

  const {
    data: challenges = [],
    isLoading: isChallengesLoading,
    refetch: refetchChallenges,
  } = useKidsChallenges()

  const {
    data: quizzes = [],
    isLoading: isQuizzesLoading,
    refetch: refetchQuizzes,
  } = useKidsQuizzes()

  // Mutations
  const deleteStoryMutation = useDeleteKidsStory()
  const deleteChallengeMutation = useDeleteKidsChallenge()
  const deleteQuizMutation = useDeleteKidsQuiz()

  const isAnyDeleting =
    deleteStoryMutation.isPending ||
    deleteChallengeMutation.isPending ||
    deleteQuizMutation.isPending

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  // Filtered Stories
  const filteredStories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return stories.filter(
      (s) =>
        query.length === 0 ||
        s.title.toLowerCase().includes(query) ||
        s.content.toLowerCase().includes(query) ||
        s.moralLesson.toLowerCase().includes(query)
    )
  }, [stories, searchQuery])

  // Filtered Challenges
  const filteredChallenges = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return challenges.filter(
      (c) =>
        query.length === 0 ||
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
    )
  }, [challenges, searchQuery])

  // Filtered Quizzes
  const filteredQuizzes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return quizzes.filter(
      (q) =>
        query.length === 0 ||
        q.questionText.toLowerCase().includes(query) ||
        q.explanation.toLowerCase().includes(query)
    )
  }, [quizzes, searchQuery])

  const confirmDelete = async () => {
    if (!deleteTarget.id) return

    try {
      if (deleteTarget.type === 'story') {
        await deleteStoryMutation.mutateAsync(deleteTarget.id)
      } else if (deleteTarget.type === 'challenge') {
        await deleteChallengeMutation.mutateAsync(deleteTarget.id)
      } else if (deleteTarget.type === 'quiz') {
        await deleteQuizMutation.mutateAsync(deleteTarget.id)
      }

      setDeleteTarget({ isOpen: false, id: '', title: '', type: 'story' })
      showNotification(
        'success',
        language === 'ar'
          ? 'تم حذف العنصر بنجاح من قاعدة بيانات الخادم.'
          : 'Item deleted successfully from backend database.'
      )
    } catch (err: any) {
      showNotification(
        'error',
        err?.message ||
          (language === 'ar' ? 'تعذر الحذف من الخادم.' : 'Failed to delete from server.')
      )
    }
  }

  const handleRefreshAll = () => {
    void refetchStories()
    void refetchChallenges()
    void refetchQuizzes()
  }

  return (
    <section className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {notification ? (
        <div
          className={[
            'fixed bottom-6 end-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl transition-all animate-bounce',
            notification.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'border-red-500/30 bg-red-500/15 text-red-600 dark:text-red-400',
          ].join(' ')}
        >
          <span className="text-lg">{notification.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="text-xs font-bold sm:text-sm">{notification.message}</span>
        </div>
      ) : null}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/25 bg-[var(--panel)] p-5 shadow-lg md:p-7">
        <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-sky-500/15 blur-3xl" />

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/15 text-2xl text-sky-600 shadow-inner">
              🎈
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-400">
                  {language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Portal'}
                </span>
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  {language === 'ar' ? 'متصل بالخادم' : 'Live Backend Sync'}
                </span>
              </div>
              <h1 className="mt-1 font-title text-2xl font-bold text-[var(--text-strong)] sm:text-3xl">
                {language === 'ar' ? 'إدارة قسم أذكار وقصص الأطفال' : 'Kids Content Management'}
              </h1>
              <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
                {language === 'ar'
                  ? 'إضافة وحذف وتعديل قصص وتحديات ومسابقات الأطفال مباشرة في الخادم'
                  : 'Add, manage, and delete kids stories, challenges, and quizzes directly on backend'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefreshAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-xs font-bold text-[var(--text)] transition hover:border-sky-500"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{language === 'ar' ? 'تحديث البيانات' : 'Refresh'}</span>
            </button>

            <Link
              to="/kids"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-xs font-bold text-[var(--text)] transition hover:border-sky-500"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{language === 'ar' ? 'معاينة صفحة الأطفال' : 'View Kids Page'}</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                if (activeTab === 'stories') setIsAddStoryOpen(true)
                else if (activeTab === 'challenges') setIsAddChallengeOpen(true)
                else setIsAddQuizOpen(true)
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-sky-700 active:scale-95 sm:text-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>
                {activeTab === 'stories'
                  ? language === 'ar' ? 'إضافة قصة جديدة' : 'Add Story'
                  : activeTab === 'challenges'
                  ? language === 'ar' ? 'إضافة تحدي جديد' : 'Add Challenge'
                  : language === 'ar' ? 'إضافة سؤال مسابقة' : 'Add Quiz'}
              </span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'القصص التربوية' : 'Kids Stories'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-sky-600 sm:text-2xl">
              {stories.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'التحديات والمهام' : 'Daily Challenges'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-emerald-600 sm:text-2xl">
              {challenges.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'أسئلة المسابقات' : 'Quiz Questions'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-amber-600 sm:text-2xl">
              {quizzes.length}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="space-y-3">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('stories')}
            className={[
              'rounded-xl border px-4 py-2.5 text-xs font-bold transition sm:text-sm',
              activeTab === 'stories'
                ? 'border-sky-600 bg-sky-600 text-white shadow-sm'
                : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-sky-500',
            ].join(' ')}
          >
            <span>📖</span>
            <span className="ms-1.5">{language === 'ar' ? 'القصص التربوية' : 'Kids Stories'}</span>
            <span className="ms-2 rounded-full bg-black/15 px-1.5 py-0.5 text-[10px]">
              {stories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('challenges')}
            className={[
              'rounded-xl border px-4 py-2.5 text-xs font-bold transition sm:text-sm',
              activeTab === 'challenges'
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-emerald-500',
            ].join(' ')}
          >
            <span>🎯</span>
            <span className="ms-1.5">{language === 'ar' ? 'التحديات اليومية' : 'Challenges'}</span>
            <span className="ms-2 rounded-full bg-black/15 px-1.5 py-0.5 text-[10px]">
              {challenges.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quizzes')}
            className={[
              'rounded-xl border px-4 py-2.5 text-xs font-bold transition sm:text-sm',
              activeTab === 'quizzes'
                ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-amber-500',
            ].join(' ')}
          >
            <span>🧩</span>
            <span className="ms-1.5">{language === 'ar' ? 'المسابقات والأسئلة' : 'Quizzes'}</span>
            <span className="ms-2 rounded-full bg-black/15 px-1.5 py-0.5 text-[10px]">
              {quizzes.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'ابحث بالكلمات المفتاحية، العناوين، أو النصوص...'
                : 'Search content by title, text, or category...'
            }
            className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-xs text-[var(--muted)] hover:text-[var(--text)]"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          {isStoriesLoading ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
              <p className="mt-3 text-xs text-[var(--muted)]">{language === 'ar' ? 'جاري جلب القصص من الخادم...' : 'Fetching stories...'}</p>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--panel)]/50 p-10 text-center">
              <p className="font-title text-base font-bold text-[var(--text-strong)]">{language === 'ar' ? 'لا توجد قصص متاحة' : 'No stories found'}</p>
              <button
                type="button"
                onClick={() => setIsAddStoryOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm"
              >
                <span>+</span>
                <span>{language === 'ar' ? 'إضافة قصة جديدة' : 'Add Story'}</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredStories.map((story) => (
                <article
                  key={story.id}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm transition hover:border-sky-500/40 md:p-6"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-400">
                      {story.ageGroup} {language === 'ar' ? 'سنوات' : 'years'}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          isOpen: true,
                          id: story.id,
                          title: story.title,
                          type: 'story',
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
                      title={language === 'ar' ? 'حذف من الخادم' : 'Delete'}
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
                    </button>
                  </div>

                  <h2 className="font-title text-lg font-bold text-[var(--text-strong)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {story.title}
                  </h2>

                  <p className="mt-2 text-xs leading-6 text-[var(--text)] line-clamp-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {story.content}
                  </p>

                  {story.moralLesson ? (
                    <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-xs">
                      <p className="font-bold text-sky-700 dark:text-sky-400">{language === 'ar' ? '🌟 العبرة المستفادة:' : '🌟 Moral Lesson:'}</p>
                      <p className="mt-0.5 text-[var(--muted)]">{story.moralLesson}</p>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-4">
          {isChallengesLoading ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <p className="mt-3 text-xs text-[var(--muted)]">{language === 'ar' ? 'جاري جلب التحديات من الخادم...' : 'Fetching challenges...'}</p>
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--panel)]/50 p-10 text-center">
              <p className="font-title text-base font-bold text-[var(--text-strong)]">{language === 'ar' ? 'لا توجد تحديات متاحة' : 'No challenges found'}</p>
              <button
                type="button"
                onClick={() => setIsAddChallengeOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm"
              >
                <span>+</span>
                <span>{language === 'ar' ? 'إضافة تحدي جديد' : 'Add Challenge'}</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredChallenges.map((challenge) => (
                <article
                  key={challenge.id}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm transition hover:border-emerald-500/40 md:p-6"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        +{challenge.points} {language === 'ar' ? 'نقطة' : 'pts'}
                      </span>
                      <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
                        {challenge.category}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          isOpen: true,
                          id: challenge.id,
                          title: challenge.title,
                          type: 'challenge',
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
                      title={language === 'ar' ? 'حذف من الخادم' : 'Delete'}
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
                    </button>
                  </div>

                  <h2 className="font-title text-lg font-bold text-[var(--text-strong)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {challenge.title}
                  </h2>

                  <p className="mt-2 text-xs leading-6 text-[var(--muted)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {challenge.description}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          {isQuizzesLoading ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <p className="mt-3 text-xs text-[var(--muted)]">{language === 'ar' ? 'جاري جلب الأسئلة من الخادم...' : 'Fetching quizzes...'}</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--panel)]/50 p-10 text-center">
              <p className="font-title text-base font-bold text-[var(--text-strong)]">{language === 'ar' ? 'لا توجد أسئلة متاحة' : 'No quiz questions found'}</p>
              <button
                type="button"
                onClick={() => setIsAddQuizOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm"
              >
                <span>+</span>
                <span>{language === 'ar' ? 'إضافة سؤال جديد' : 'Add Quiz'}</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredQuizzes.map((quiz) => (
                <article
                  key={quiz.id}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm transition hover:border-amber-500/40 md:p-6"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                      {quiz.category}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          isOpen: true,
                          id: quiz.id,
                          title: quiz.questionText,
                          type: 'quiz',
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
                      title={language === 'ar' ? 'حذف من الخادم' : 'Delete'}
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
                    </button>
                  </div>

                  <h2 className="font-title text-base font-bold text-[var(--text-strong)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {quiz.questionText}
                  </h2>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {[quiz.optionA, quiz.optionB, quiz.optionC, quiz.optionD].map(
                      (opt, idx) => (
                        <div
                          key={idx}
                          className={[
                            'rounded-xl border p-2',
                            quiz.correctOptionIndex === idx
                              ? 'border-emerald-500/60 bg-emerald-500/10 font-bold text-emerald-600'
                              : 'border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]',
                          ].join(' ')}
                        >
                          {opt}
                        </div>
                      )
                    )}
                  </div>

                  {quiz.explanation ? (
                    <p className="mt-3 text-[11px] text-[var(--muted)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      💡 {quiz.explanation}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddKidsStoryModal
        isOpen={isAddStoryOpen}
        onClose={() => setIsAddStoryOpen(false)}
        onSuccess={() =>
          showNotification(
            'success',
            language === 'ar' ? 'تمت إضافة القصة بنجاح إلى الخادم.' : 'Story added successfully.'
          )
        }
      />

      <AddKidsChallengeModal
        isOpen={isAddChallengeOpen}
        onClose={() => setIsAddChallengeOpen(false)}
        onSuccess={() =>
          showNotification(
            'success',
            language === 'ar' ? 'تمت إضافة التحدي بنجاح إلى الخادم.' : 'Challenge added successfully.'
          )
        }
      />

      <AddKidsQuizModal
        isOpen={isAddQuizOpen}
        onClose={() => setIsAddQuizOpen(false)}
        onSuccess={() =>
          showNotification(
            'success',
            language === 'ar' ? 'تمت إضافة السؤال بنجاح إلى الخادم.' : 'Quiz question added successfully.'
          )
        }
      />

      <ConfirmDeleteModal
        isOpen={deleteTarget.isOpen}
        isLoading={isAnyDeleting}
        titleAr="تأكيد الحذف من الخادم"
        titleEn="Confirm Deletion"
        messageAr="هل أنت متأكد من رغبتك في حذف هذا العنصر نهائياً من قاعدة بيانات الخادم؟"
        messageEn="Are you sure you want to permanently delete this item from the backend database?"
        itemTitle={deleteTarget.title}
        confirmTextAr="نعم، حذف من الخادم"
        confirmTextEn="Yes, Delete from Server"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget({ isOpen: false, id: '', title: '', type: 'story' })}
      />
    </section>
  )
}
