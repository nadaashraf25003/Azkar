import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSettings } from '../context/SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface KidsStory {
  id: string
  titleAr: string
  titleEn: string
  summaryAr: string
  summaryEn: string
  moralAr: string
  moralEn: string
}

interface WeeklyChallenge {
  id: string
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
}

interface QuizItem {
  id: string
  questionAr: string
  questionEn: string
  optionsAr: string[]
  optionsEn: string[]
  correctIndex: number
}

interface KidsContent {
  stories: KidsStory[]
  weeklyChallenges: WeeklyChallenge[]
  quiz: QuizItem[]
}

async function fetchKidsContent(): Promise<KidsContent> {
  const response = await fetch('/data/kids-content.json')
  if (!response.ok) {
    throw new Error('Failed to load kids content')
  }

  return (await response.json()) as KidsContent
}

const TASBEEH_TARGET = 33

export function KidsPage() {
  const { language } = useSettings()
  const [completedChallenges, setCompletedChallenges] = useLocalStorage<string[]>(
    'azkar-kids-completed-challenges',
    [],
  )
  const [tapCount, setTapCount] = useLocalStorage<number>('azkar-kids-tap-count', 0)

  const [activeStoryId, setActiveStoryId] = useState<string | null>(null)
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [showQuizResult, setShowQuizResult] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['kids-content'],
    queryFn: fetchKidsContent,
    staleTime: Infinity,
  })

  const activeStory = useMemo(
    () => data?.stories.find((story) => story.id === activeStoryId) ?? null,
    [activeStoryId, data?.stories],
  )

  const currentQuiz = data?.quiz[quizIndex]

  const isTapCompleted = tapCount >= TASBEEH_TARGET

  const toggleChallenge = (challengeId: string) => {
    setCompletedChallenges((prev) =>
      prev.includes(challengeId)
        ? prev.filter((id) => id !== challengeId)
        : [...prev, challengeId],
    )
  }

  const answerQuiz = (selectedIndex: number) => {
    if (!data || !currentQuiz) {
      return
    }

    const isCorrect = selectedIndex === currentQuiz.correctIndex
    if (isCorrect) {
      setQuizScore((prev) => prev + 1)
    }

    if (quizIndex + 1 >= data.quiz.length) {
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

  if (isLoading) {
    return <p className="text-sm text-[var(--muted)]">{language === 'ar' ? 'جارٍ تحميل منصة الأطفال...' : 'Loading kids platform...'}</p>
  }

  if (isError || !data) {
    return <p className="text-sm text-[var(--warn)]">{language === 'ar' ? 'تعذر تحميل بيانات الأطفال.' : 'Failed to load kids content.'}</p>
  }

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-5 md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_90%_20%,rgba(14,165,233,0.18),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(96,165,250,0.15),transparent_45%)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
            {language === 'ar' ? 'منصة الأطفال' : 'Kids Platform'}
          </p>
          <h1 className="font-title text-2xl text-[var(--text-strong)] sm:text-3xl md:text-4xl">
            {language === 'ar' ? 'تعلموا الإسلام بالمتعة' : 'Learn Islam with Fun'}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
            {language === 'ar'
              ? 'قصص ممتعة، ألعاب تعليمية بسيطة، وتحديات أسبوعية لبناء العادات الجميلة.'
              : 'Fun stories, simple educational games, and weekly challenges to build great habits.'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5 lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold text-[var(--text-strong)]">
            {language === 'ar' ? 'قصص إسلامية للأطفال' : 'Islamic Stories for Kids'}
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            {data.stories.map((story) => (
              <button
                key={story.id}
                type="button"
                onClick={() => setActiveStoryId(story.id)}
                className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4 text-left transition hover:border-[var(--brand-500)]"
              >
                <p className="text-base font-semibold text-[var(--text-strong)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {language === 'ar' ? story.titleAr : story.titleEn}
                </p>
                <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {language === 'ar' ? story.summaryAr : story.summaryEn}
                </p>
              </button>
            ))}
          </div>

          {activeStory ? (
            <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--brand-100)] p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <h3 className="text-lg font-semibold text-[var(--text-strong)]">
                {language === 'ar' ? activeStory.titleAr : activeStory.titleEn}
              </h3>
              <p className="mt-2 text-sm text-[var(--text)]">
                {language === 'ar' ? activeStory.summaryAr : activeStory.summaryEn}
              </p>
              <p className="mt-3 rounded-xl bg-[var(--panel)] p-3 text-sm font-medium text-[var(--brand-700)]">
                {language === 'ar' ? activeStory.moralAr : activeStory.moralEn}
              </p>
            </div>
          ) : null}
        </article>

        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
          <h2 className="mb-3 text-xl font-semibold text-[var(--text-strong)]">
            {language === 'ar' ? 'تحديات الأسبوع' : 'Weekly Challenges'}
          </h2>

          <div className="space-y-2">
            {data.weeklyChallenges.map((challenge) => {
              const done = completedChallenges.includes(challenge.id)
              return (
                <label
                  key={challenge.id}
                  className={[
                    'block rounded-xl border p-3 text-sm transition',
                    done
                      ? 'border-[var(--brand-500)] bg-[var(--brand-100)]'
                      : 'border-[var(--line)]',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => toggleChallenge(challenge.id)}
                    />
                    <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <p className="font-semibold text-[var(--text-strong)]">
                        {language === 'ar' ? challenge.titleAr : challenge.titleEn}
                      </p>
                      <p className="text-[var(--muted)]">
                        {language === 'ar' ? challenge.descriptionAr : challenge.descriptionEn}
                      </p>
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
          <h2 className="mb-3 text-xl font-semibold text-[var(--text-strong)]">
            {language === 'ar' ? 'لعبة السؤال السريع' : 'Quick Quiz Game'}
          </h2>

          {showQuizResult ? (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--brand-100)] p-4">
              <p className="text-lg font-semibold text-[var(--text-strong)]">
                {language === 'ar' ? 'أحسنت!' : 'Great Job!'}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {language === 'ar'
                  ? `نتيجتك: ${quizScore} من ${data.quiz.length}`
                  : `Your score: ${quizScore} out of ${data.quiz.length}`}
              </p>
              <button
                type="button"
                onClick={resetQuiz}
                className="mt-3 rounded-xl bg-[var(--brand-500)] px-3 py-2 text-sm font-semibold text-white"
              >
                {language === 'ar' ? 'إعادة اللعبة' : 'Play Again'}
              </button>
            </div>
          ) : currentQuiz ? (
            <div className="space-y-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <p className="text-sm text-[var(--muted)]">
                {language === 'ar'
                  ? `سؤال ${quizIndex + 1} من ${data.quiz.length}`
                  : `Question ${quizIndex + 1} of ${data.quiz.length}`}
              </p>
              <p className="text-base font-semibold text-[var(--text-strong)]">
                {language === 'ar' ? currentQuiz.questionAr : currentQuiz.questionEn}
              </p>
              <div className="grid gap-2">
                {(language === 'ar' ? currentQuiz.optionsAr : currentQuiz.optionsEn).map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => answerQuiz(index)}
                    className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-strong)] transition hover:border-[var(--brand-500)]"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </article>

        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
          <h2 className="mb-3 text-xl font-semibold text-[var(--text-strong)]">
            {language === 'ar' ? 'لعبة التسبيح الممتعة' : 'Fun Tasbeeh Tap Game'}
          </h2>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4 text-center">
            <p className="text-sm text-[var(--muted)]">
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
              {language === 'ar' ? 'اضغط للتسبيح' : 'Tap to Count'}
            </button>

            <button
              type="button"
              onClick={resetTapGame}
              className="mt-2 block w-full rounded-xl border border-[var(--line)] px-3 py-2 text-xs"
            >
              {language === 'ar' ? 'إعادة التحدي' : 'Reset Challenge'}
            </button>

            {isTapCompleted ? (
              <p className="mt-3 rounded-xl bg-[var(--brand-100)] p-2 text-sm font-semibold text-[var(--brand-700)]">
                {language === 'ar' ? 'ممتاز! أنهيت التحدي.' : 'Excellent! Challenge completed.'}
              </p>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  )
}
