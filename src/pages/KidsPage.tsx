import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { BackendErrorState } from '../components/BackendErrorState'
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
  type BackendKidsStory,
  type BackendKidsChallenge,
} from '../hooks/useKids'

const TASBEEH_TARGET = 33

export function KidsPage() {
  const { language } = useSettings()

  // Admin authentication state
  const [isAdminAuthenticated] = useLocalStorage<boolean>('azkar-qa-admin-auth', false)
  const [viewerRole] = useLocalStorage<string>('azkar-qa-viewer-role', 'user')
  const isAdmin = isAdminAuthenticated || viewerRole === 'admin'

  const [completedChallenges, setCompletedChallenges] = useLocalStorage<string[]>(
    'azkar-kids-completed-challenges',
    [],
  )
  const [tapCount, setTapCount] = useLocalStorage<number>('azkar-kids-tap-count', 0)

  const [activeStoryId, setActiveStoryId] = useState<string | null>(null)
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [showQuizResult, setShowQuizResult] = useState(false)

  // Modals state
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false)
  const [isAddChallengeOpen, setIsAddChallengeOpen] = useState(false)
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false)

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

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Fetch backend data
  const {
    data: storiesData,
    isLoading: isStoriesLoading,
    isError: isStoriesError,
    refetch: refetchStories,
  } = useKidsStories()

  const {
    data: challengesData,
    isLoading: isChallengesLoading,
    isError: isChallengesError,
    refetch: refetchChallenges,
  } = useKidsChallenges()

  const {
    data: quizzesData,
    isLoading: isQuizzesLoading,
    isError: isQuizzesError,
    refetch: refetchQuizzes,
  } = useKidsQuizzes()

  // Mutations
  const deleteStoryMutation = useDeleteKidsStory()
  const deleteChallengeMutation = useDeleteKidsChallenge()
  const deleteQuizMutation = useDeleteKidsQuiz()

  const isDeleting =
    deleteStoryMutation.isPending ||
    deleteChallengeMutation.isPending ||
    deleteQuizMutation.isPending

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const activeStory = useMemo(
    () => storiesData?.find((story) => story.id === activeStoryId) ?? null,
    [activeStoryId, storiesData],
  )

  const currentQuiz = quizzesData ? quizzesData[quizIndex] : null
  const isTapCompleted = tapCount >= TASBEEH_TARGET

  const toggleChallenge = (challengeId: string) => {
    setCompletedChallenges((prev) =>
      prev.includes(challengeId)
        ? prev.filter((id) => id !== challengeId)
        : [...prev, challengeId],
    )
  }

  const answerQuiz = (selectedIndex: number) => {
    if (!quizzesData || !currentQuiz) return

    const isCorrect = selectedIndex === currentQuiz.correctOptionIndex
    if (isCorrect) {
      setQuizScore((prev) => prev + 1)
    }

    if (quizIndex + 1 >= quizzesData.length) {
      setShowQuizResult(true)
      return
    }

    setQuizIndex((prev) => prev + 1)
  }

  const resetQuiz = () => {
    setQuizIndex(0)
    setQuizScore(0)
    setShowQuizResult(false)
  }

  const resetTapGame = () => setTapCount(0)

  const handleDeleteStory = (story: BackendKidsStory, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteTarget({
      isOpen: true,
      id: story.id,
      title: story.title,
      type: 'story',
    })
  }

  const handleDeleteChallenge = (challenge: BackendKidsChallenge, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteTarget({
      isOpen: true,
      id: challenge.id,
      title: challenge.title,
      type: 'challenge',
    })
  }

  const confirmDelete = async () => {
    if (!deleteTarget.id) return

    try {
      if (deleteTarget.type === 'story') {
        await deleteStoryMutation.mutateAsync(deleteTarget.id)
        if (activeStoryId === deleteTarget.id) setActiveStoryId(null)
      } else if (deleteTarget.type === 'challenge') {
        await deleteChallengeMutation.mutateAsync(deleteTarget.id)
      } else if (deleteTarget.type === 'quiz') {
        await deleteQuizMutation.mutateAsync(deleteTarget.id)
      }

      setDeleteTarget({ isOpen: false, id: '', title: '', type: 'story' })
      showToast(
        language === 'ar'
          ? 'تم حذف العنصر بنجاح من قاعدة بيانات الخادم.'
          : 'Item deleted successfully from backend.'
      )
    } catch (err: any) {
      showToast(
        err?.message ||
          (language === 'ar' ? 'تعذر الحذف من الخادم.' : 'Failed to delete from server.')
      )
    }
  }

  const handleRefresh = () => {
    void refetchStories()
    void refetchChallenges()
    void refetchQuizzes()
  }

  const isLoading = isStoriesLoading || isChallengesLoading || isQuizzesLoading
  const isError = isStoriesError || isChallengesError || isQuizzesError

  if (isLoading) {
    return (
      <div className="py-12 text-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        <p className="mt-3 text-xs text-[var(--muted)]">
          {language === 'ar' ? 'جارٍ تحميل منصة الأطفال من الخادم...' : 'Loading kids platform from backend...'}
        </p>
      </div>
    )
  }

  if (isError) {
    return <BackendErrorState />
  }

  return (
    <section className="space-y-4 md:space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {toastMessage ? (
        <div className="fixed bottom-6 end-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-[var(--panel)] px-4 py-3 text-emerald-600 shadow-2xl transition-all animate-bounce dark:text-emerald-400">
          <span className="text-lg">✅</span>
          <span className="text-xs font-bold sm:text-sm">{toastMessage}</span>
        </div>
      ) : null}

      {/* Admin Status Banner */}
      {isAdmin ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-xs">
              ⚡
            </span>
            <div>
              <p className="text-xs font-bold text-sky-700 dark:text-sky-400">
                {language === 'ar'
                  ? 'وضع تحكم المشرف نشط (أذكار وقصص الأطفال)'
                  : 'Admin Control Active (Kids Platform)'}
              </p>
              <p className="text-[10px] text-[var(--muted)]">
                {language === 'ar'
                  ? 'يمكنك إضافة قصص وتحديات ومسابقات جديدة أو حذفها مباشرة من الخادم'
                  : 'You can add or delete kids stories, challenges, and quizzes directly on backend'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-xs font-bold text-[var(--text)] transition hover:border-sky-500"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{language === 'ar' ? 'تحديث' : 'Refresh'}</span>
            </button>

            <Link
              to="/admin/kids"
              className="inline-flex items-center gap-1 rounded-xl border border-sky-500/40 bg-[var(--bg)] px-3 py-1.5 text-xs font-bold text-sky-700 transition hover:bg-sky-500/10 dark:text-sky-400"
            >
              <span>{language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Portal'}</span>
              <span>←</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsAddStoryOpen(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700"
            >
              <span>+</span>
              <span>{language === 'ar' ? 'قصة' : 'Story'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddChallengeOpen(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <span>+</span>
              <span>{language === 'ar' ? 'تحدي' : 'Challenge'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddQuizOpen(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700"
            >
              <span>+</span>
              <span>{language === 'ar' ? 'مسابقة' : 'Quiz'}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-5 md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_90%_20%,rgba(14,165,233,0.18),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(96,165,250,0.15),transparent_45%)]" />
        <div className="relative flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-600">
              {language === 'ar' ? 'منصة الأطفال التعليمية' : 'Kids Platform'}
            </p>
            <h1 className="font-title text-2xl text-[var(--text-strong)] sm:text-3xl md:text-4xl">
              {language === 'ar' ? 'تعلموا الإسلام بالمتعة' : 'Learn Islam with Fun'}
            </h1>
            <p className="mt-2 max-w-3xl text-xs text-[var(--muted)] sm:text-sm">
              {language === 'ar'
                ? 'قصص ممتعة، ألعاب تعليمية بسيطة، وتحديات أسبوعية لبناء العادات الجميلة.'
                : 'Fun stories, simple educational games, and weekly challenges to build great habits.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2 text-xs font-bold text-[var(--text)] transition hover:border-sky-500"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{language === 'ar' ? 'تحديث البيانات' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* STORIES ARTICLE */}
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--text-strong)]">
              {language === 'ar' ? 'قصص إسلامية للأطفال' : 'Islamic Stories for Kids'}
            </h2>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => setIsAddStoryOpen(true)}
                className="inline-flex items-center gap-1 rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700"
              >
                <span>+</span>
                <span>{language === 'ar' ? 'إضافة قصة' : 'Add Story'}</span>
              </button>
            ) : null}
          </div>

          {storiesData && storiesData.length === 0 ? (
            <p className="text-xs text-[var(--muted)]">
              {language === 'ar' ? 'لا توجد قصص محفوظة بعد.' : 'No stories found.'}
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {storiesData?.map((story) => (
                <div
                  key={story.id}
                  onClick={() => setActiveStoryId(story.id)}
                  className={[
                    'group relative cursor-pointer rounded-2xl border p-4 transition hover:border-sky-500',
                    activeStoryId === story.id
                      ? 'border-sky-500 bg-sky-500/10'
                      : 'border-[var(--line)] bg-[var(--bg)]',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-base font-semibold text-[var(--text-strong)]" dir="rtl">
                      {story.title}
                    </p>

                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteStory(story, e)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
                        title={language === 'ar' ? 'حذف من الخادم' : 'Delete'}
                      >
                        🗑️
                      </button>
                    ) : null}
                  </div>

                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-[var(--muted)]" dir="rtl">
                    {story.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeStory ? (
            <div className="mt-4 rounded-2xl border border-[var(--line)] bg-sky-500/10 p-4 transition-all" dir="rtl">
              <h3 className="text-lg font-semibold text-[var(--text-strong)]">
                {activeStory.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text)]">
                {activeStory.content}
              </p>
              {activeStory.moralLesson ? (
                <p className="mt-3 rounded-xl bg-[var(--panel)] p-3 text-xs font-medium text-sky-700 dark:text-sky-400">
                  🌟 {activeStory.moralLesson}
                </p>
              ) : null}
            </div>
          ) : null}
        </article>

        {/* CHALLENGES ARTICLE */}
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--text-strong)]">
              {language === 'ar' ? 'تحديات الأسبوع' : 'Weekly Challenges'}
            </h2>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => setIsAddChallengeOpen(true)}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <span>+</span>
                <span>{language === 'ar' ? 'إضافة' : 'Add'}</span>
              </button>
            ) : null}
          </div>

          <div className="space-y-2">
            {challengesData?.map((challenge) => {
              const done = completedChallenges.includes(challenge.id)
              return (
                <div
                  key={challenge.id}
                  className={[
                    'flex items-start justify-between gap-2 rounded-xl border p-3 text-sm transition',
                    done
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-[var(--line)] bg-[var(--bg)]',
                  ].join(' ')}
                >
                  <label className="flex flex-1 cursor-pointer items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => toggleChallenge(challenge.id)}
                      className="mt-1"
                    />
                    <div dir="rtl">
                      <p className="text-xs font-bold text-[var(--text-strong)] sm:text-sm">
                        {challenge.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        {challenge.description}
                      </p>
                    </div>
                  </label>

                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteChallenge(challenge, e)}
                      className="inline-flex shrink-0 items-center rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
                      title={language === 'ar' ? 'حذف من الخادم' : 'Delete'}
                    >
                      🗑️
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* QUIZ GAME */}
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--text-strong)]">
              {language === 'ar' ? 'لعبة السؤال السريع' : 'Quick Quiz Game'}
            </h2>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => setIsAddQuizOpen(true)}
                className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700"
              >
                <span>+</span>
                <span>{language === 'ar' ? 'إضافة سؤال' : 'Add'}</span>
              </button>
            ) : null}
          </div>

          {showQuizResult ? (
            <div className="rounded-2xl border border-[var(--line)] bg-amber-500/10 p-4 text-center">
              <p className="text-lg font-semibold text-[var(--text-strong)]">
                {language === 'ar' ? '🎉 أحسنت صنعاً بارك الله فيك!' : '🎉 Great Job!'}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {language === 'ar'
                  ? `نتيجتك: ${quizScore} من ${quizzesData?.length || 0}`
                  : `Your score: ${quizScore} out of ${quizzesData?.length || 0}`}
              </p>
              <button
                type="button"
                onClick={resetQuiz}
                className="mt-3 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700"
              >
                {language === 'ar' ? 'إعادة المسابقة' : 'Play Again'}
              </button>
            </div>
          ) : currentQuiz ? (
            <div className="space-y-3" dir="rtl">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--muted)]">
                  {language === 'ar'
                    ? `سؤال ${quizIndex + 1} من ${quizzesData?.length || 0}`
                    : `Question ${quizIndex + 1} of ${quizzesData?.length || 0}`}
                </p>
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({
                        isOpen: true,
                        id: currentQuiz.id,
                        title: currentQuiz.questionText,
                        type: 'quiz',
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-600 hover:bg-red-500 hover:text-white"
                  >
                    🗑️ {language === 'ar' ? 'حذف هذا السؤال' : 'Delete'}
                  </button>
                ) : null}
              </div>

              <p className="text-base font-semibold text-[var(--text-strong)]">
                {currentQuiz.questionText}
              </p>

              <div className="grid gap-2">
                {[currentQuiz.optionA, currentQuiz.optionB, currentQuiz.optionC, currentQuiz.optionD]
                  .filter(Boolean)
                  .map((option, index) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => answerQuiz(index)}
                      className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-strong)] transition hover:border-amber-500 hover:bg-amber-500/10"
                    >
                      {option}
                    </button>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)]">
              {language === 'ar' ? 'لا توجد أسئلة مسابقات حالياً.' : 'No quiz questions available.'}
            </p>
          )}
        </article>

        {/* TAP GAME */}
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
          <h2 className="mb-3 text-xl font-semibold text-[var(--text-strong)]">
            {language === 'ar' ? 'لعبة التسبيح الممتعة' : 'Fun Tasbeeh Tap Game'}
          </h2>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4 text-center">
            <p className="text-xs text-[var(--muted)]">
              {language === 'ar'
                ? `الهدف: ${TASBEEH_TARGET} تسبيحة`
                : `Target: ${TASBEEH_TARGET} taps`}
            </p>
            <p className="mt-2 text-3xl font-bold text-[var(--brand-600)]">
              {Math.min(tapCount, TASBEEH_TARGET)} / {TASBEEH_TARGET}
            </p>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--line)]">
              <div
                className="h-full rounded-full bg-[var(--brand-500)] transition-all"
                style={{ width: `${Math.min(100, Math.round((tapCount / TASBEEH_TARGET) * 100))}%` }}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (!isTapCompleted) {
                  setTapCount((prev) => prev + 1)
                }
              }}
              disabled={isTapCompleted}
              className={[
                'mt-4 w-full rounded-2xl px-4 py-3 text-sm font-bold text-white transition sm:w-auto sm:px-6',
                isTapCompleted
                  ? 'cursor-not-allowed bg-[var(--muted)]'
                  : 'bg-[var(--brand-500)] hover:bg-[var(--brand-600)]',
              ].join(' ')}
            >
              {language === 'ar' ? 'اضغط للتسبيح 📿' : 'Tap to Count 📿'}
            </button>

            <button
              type="button"
              onClick={resetTapGame}
              className="mt-2 block w-full rounded-xl border border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)] hover:text-[var(--text)]"
            >
              {language === 'ar' ? 'إعادة التحدي' : 'Reset Challenge'}
            </button>

            {isTapCompleted ? (
              <p className="mt-3 rounded-xl bg-emerald-500/15 p-2 text-xs font-semibold text-emerald-600">
                {language === 'ar' ? '🌟 ممتاز! بارك الله فيك أنهيت التحدي.' : '🌟 Excellent! Challenge completed.'}
              </p>
            ) : null}
          </div>
        </article>
      </div>

      {/* Modals */}
      <AddKidsStoryModal
        isOpen={isAddStoryOpen}
        onClose={() => setIsAddStoryOpen(false)}
        onSuccess={() =>
          showToast(
            language === 'ar' ? 'تمت إضافة القصة بنجاح إلى الخادم.' : 'Story added successfully.'
          )
        }
      />

      <AddKidsChallengeModal
        isOpen={isAddChallengeOpen}
        onClose={() => setIsAddChallengeOpen(false)}
        onSuccess={() =>
          showToast(
            language === 'ar' ? 'تمت إضافة التحدي بنجاح إلى الخادم.' : 'Challenge added successfully.'
          )
        }
      />

      <AddKidsQuizModal
        isOpen={isAddQuizOpen}
        onClose={() => setIsAddQuizOpen(false)}
        onSuccess={() =>
          showToast(
            language === 'ar' ? 'تمت إضافة السؤال بنجاح إلى الخادم.' : 'Quiz question added successfully.'
          )
        }
      />

      <ConfirmDeleteModal
        isOpen={deleteTarget.isOpen}
        isLoading={isDeleting}
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
