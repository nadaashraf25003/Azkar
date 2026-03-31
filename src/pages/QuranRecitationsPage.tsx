import { useMemo, useRef, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ADMIN_AUTH } from '../config/adminAuth'

type UserRole = 'user' | 'admin'
type ModerationStatus = 'pending' | 'approved' | 'rejected'

interface RecitationEntry {
  id: string
  surah: string
  ayahRange: string
  note: string
  authorName: string
  authorRole: UserRole
  status: ModerationStatus
  isVisible: boolean
  audioDataUrl: string
  createdAt: string
  comments: RecitationComment[]
}

interface RecitationComment {
  id: string
  authorName: string
  text: string
  rating: number
  createdAt: string
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Unable to read audio data'))
      }
    }
    reader.onerror = () => reject(new Error('Unable to read audio data'))
    reader.readAsDataURL(blob)
  })
}

export function QuranRecitationsPage() {
  const { language } = useSettings()
  const [viewerRole, setViewerRole] = useLocalStorage<UserRole>('azkar-recitation-viewer-role', 'user')
  const [entries, setEntries] = useLocalStorage<RecitationEntry[]>('azkar-recitations', [])

  const [authorName, setAuthorName] = useState('')
  const [surah, setSurah] = useState('الفاتحة')
  const [ayahRange, setAyahRange] = useState('1-7')
  const [note, setNote] = useState('')
  const [audioPreview, setAudioPreview] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [raterNameDrafts, setRaterNameDrafts] = useState<Record<string, string>>({})
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [ratingDrafts, setRatingDrafts] = useState<Record<string, number>>({})
  const [openRatingForm, setOpenRatingForm] = useState<Record<string, boolean>>({})
  const [showAllRatings, setShowAllRatings] = useState(true)
  const [showEntryRatings, setShowEntryRatings] = useState<Record<string, boolean>>({})
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminLoginError, setAdminLoginError] = useState('')

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const visibleEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        if (viewerRole === 'admin') {
          return true
        }

        return entry.status === 'approved' && entry.isVisible
      })
      .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
  }, [entries, viewerRole])

  const stopRecording = () => {
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    setIsRecording(false)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)

      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const dataUrl = await toDataUrl(blob)
        setAudioPreview(dataUrl)
      }

      recorderRef.current = recorder
      streamRef.current = stream
      recorder.start()
      setIsRecording(true)
    } catch {
      // Ignore denied microphone access.
    }
  }

  const submitRecitation = () => {
    if (!audioPreview || !surah.trim() || !ayahRange.trim()) {
      return
    }

    const next: RecitationEntry = {
      id: createId('rec'),
      surah: surah.trim(),
      ayahRange: ayahRange.trim(),
      note: note.trim(),
      authorName: authorName.trim() || (viewerRole === 'admin' ? 'Admin' : 'Anonymous'),
      authorRole: viewerRole,
      status: viewerRole === 'admin' ? 'approved' : 'pending',
      isVisible: true,
      audioDataUrl: audioPreview,
      createdAt: new Date().toISOString(),
      comments: [],
    }

    setEntries((prev) => [next, ...prev])
    setAudioPreview('')
    setNote('')
  }

  const updateEntry = (id: string, updater: (item: RecitationEntry) => RecitationEntry) => {
    setEntries((prev) => prev.map((item) => (item.id === id ? updater(item) : item)))
  }

  const addComment = (entryId: string) => {
    const raterName = (raterNameDrafts[entryId] ?? '').trim()
    const text = (commentDrafts[entryId] ?? '').trim()
    const rating = ratingDrafts[entryId] ?? 5

    if (!raterName || rating < 1 || rating > 5) {
      return
    }

    const comment: RecitationComment = {
      id: createId('com'),
      authorName: raterName,
      text,
      rating,
      createdAt: new Date().toISOString(),
    }

    updateEntry(entryId, (entry) => ({
      ...entry,
      comments: [...(entry.comments ?? []), comment],
    }))

    setRaterNameDrafts((prev) => ({ ...prev, [entryId]: '' }))
    setCommentDrafts((prev) => ({ ...prev, [entryId]: '' }))
    setRatingDrafts((prev) => ({ ...prev, [entryId]: 5 }))
    setOpenRatingForm((prev) => ({ ...prev, [entryId]: false }))
  }

  const statusLabel = (status: ModerationStatus) => {
    if (language === 'ar') {
      if (status === 'approved') return 'معتمد'
      if (status === 'rejected') return 'مرفوض'
      return 'قيد المراجعة'
    }

    if (status === 'approved') return 'Approved'
    if (status === 'rejected') return 'Rejected'
    return 'Pending'
  }

  const isEntryRatingsVisible = (entryId: string) => {
    if (!showAllRatings) {
      return false
    }

    return showEntryRatings[entryId] ?? true
  }

  const handleRoleChange = (nextRole: UserRole) => {
    if (nextRole === 'admin' && viewerRole !== 'admin') {
      setShowAdminLogin(true)
      setAdminLoginError('')
      return
    }

    if (nextRole === 'user') {
      setViewerRole('user')
      setShowAdminLogin(false)
      setAdminEmail('')
      setAdminPassword('')
      setAdminLoginError('')
      return
    }

    setViewerRole(nextRole)
  }

  const loginAsAdmin = () => {
    if (
      adminEmail.trim().toLowerCase() === ADMIN_AUTH.email &&
      adminPassword === ADMIN_AUTH.password
    ) {
      setViewerRole('admin')
      setShowAdminLogin(false)
      setAdminLoginError('')
      setAdminPassword('')
      return
    }

    setAdminLoginError(
      language === 'ar' ? 'بيانات تسجيل الدخول غير صحيحة.' : 'Invalid admin credentials.',
    )
  }

  return (
    <section className="space-y-4 md:space-y-5">
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
          {language === 'ar' ? 'منصة التلاوات القرآنية' : 'Quran Recitations Platform'}
        </p>
        <h1 className="font-title text-2xl text-[var(--text-strong)] sm:text-3xl md:text-4xl">
          {language === 'ar' ? 'سجّل تلاوتك وشاركها' : 'Record and Share Your Recitation'}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {language === 'ar'
            ? 'بنفس نمط اسأل وتعلّم: وضع مستخدم/مشرف مع نظام مراجعة واعتماد.'
            : 'Built with Ask-and-Learn style: user/admin mode with moderation workflow.'}
        </p>
      </div>

      <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
        <h2 className="text-lg font-semibold text-[var(--text-strong)]">
          {language === 'ar' ? 'إضافة تلاوة جديدة' : 'Submit New Recitation'}
        </h2>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="block text-sm text-[var(--muted)]">
            {language === 'ar' ? 'وضع العرض' : 'Viewer mode'}
            <select
              value={viewerRole}
              onChange={(event) => handleRoleChange(event.target.value as UserRole)}
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
            >
              <option value="user">{language === 'ar' ? 'مستخدم' : 'User'}</option>
              <option value="admin">{language === 'ar' ? 'مشرف' : 'Admin'}</option>
            </select>
          </label>

          {showAdminLogin && viewerRole !== 'admin' ? (
            <div className="space-y-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 md:col-span-2">
              <p className="text-xs font-semibold text-[var(--muted)]">
                {language === 'ar'
                  ? 'سجّل دخول المشرف أولاً لاستخدام وضع المشرف.'
                  : 'Login as admin first to enable admin mode.'}
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
                />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'}
                  className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
                />
              </div>
              {adminLoginError ? (
                <p className="text-xs font-semibold text-[var(--warn)]">{adminLoginError}</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loginAsAdmin}
                  className="rounded-lg bg-[var(--brand-500)] px-3 py-2 text-xs font-semibold text-white"
                >
                  {language === 'ar' ? 'تسجيل دخول المشرف' : 'Admin Login'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLogin(false)
                    setAdminEmail('')
                    setAdminPassword('')
                    setAdminLoginError('')
                  }}
                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          ) : null}

          <label className="block text-sm text-[var(--muted)]">
            {language === 'ar' ? 'الاسم (اختياري)' : 'Name (optional)'}
            <input
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm text-[var(--muted)]">
            {language === 'ar' ? 'اسم السورة' : 'Surah name'}
            <input
              value={surah}
              onChange={(event) => setSurah(event.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm text-[var(--muted)]">
            {language === 'ar' ? 'نطاق الآيات' : 'Ayah range'}
            <input
              value={ayahRange}
              onChange={(event) => setAyahRange(event.target.value)}
              placeholder={language === 'ar' ? 'مثال: 1-7' : 'Example: 1-7'}
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
            />
          </label>
        </div>

        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={language === 'ar' ? 'ملاحظاتك عن التلاوة (اختياري)' : 'Notes about recitation (optional)'}
          className="mt-3 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
          rows={3}
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="rounded-xl bg-[var(--brand-500)] px-3 py-2 text-sm font-semibold text-white"
            >
              {language === 'ar' ? 'بدء التسجيل' : 'Start Recording'}
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="rounded-xl border border-[var(--warn)] px-3 py-2 text-sm font-semibold text-[var(--warn)]"
            >
              {language === 'ar' ? 'إيقاف التسجيل' : 'Stop Recording'}
            </button>
          )}

          <button
            type="button"
            onClick={submitRecitation}
            disabled={!audioPreview}
            className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {language === 'ar' ? 'إرسال التلاوة' : 'Submit Recitation'}
          </button>
        </div>

        {audioPreview ? (
          <audio controls className="mt-3 w-full" src={audioPreview} />
        ) : null}
      </article>

      <article className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">
            {language === 'ar' ? 'التلاوات المنشورة' : 'Published Recitations'}
          </h2>

          <button
            type="button"
            onClick={() => setShowAllRatings((prev) => !prev)}
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold"
          >
            {showAllRatings
              ? language === 'ar'
                ? 'إخفاء كل التقييمات'
                : 'Hide All Ratings'
              : language === 'ar'
                ? 'إظهار كل التقييمات'
                : 'Show All Ratings'}
          </button>
        </div>

        {visibleEntries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
            {language === 'ar' ? 'لا توجد تلاوات حتى الآن.' : 'No recitations yet.'}
          </p>
        ) : (
          <div className="grid gap-3">
            {visibleEntries.map((entry) => (
              <article key={entry.id} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
                {(() => {
                  const comments = entry.comments ?? []
                  const avgRating =
                    comments.length === 0
                      ? 0
                      : comments.reduce((sum, item) => sum + item.rating, 0) / comments.length

                  return (
                    <>
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-[var(--brand-100)] px-3 py-1 text-[var(--brand-700)]">
                    {entry.surah} ({entry.ayahRange})
                  </span>
                  <span className="rounded-full border border-[var(--line)] px-3 py-1 text-[var(--muted)]">
                    {statusLabel(entry.status)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setShowEntryRatings((prev) => ({
                        ...prev,
                        [entry.id]: !(prev[entry.id] ?? true),
                      }))
                    }
                    className="rounded-full border border-[var(--line)] px-3 py-1 text-[var(--muted)]"
                  >
                    {isEntryRatingsVisible(entry.id)
                      ? language === 'ar'
                        ? 'إخفاء تقييم التلاوة'
                        : 'Hide Recitation Rating'
                      : language === 'ar'
                        ? 'إظهار تقييم التلاوة'
                        : 'Show Recitation Rating'}
                  </button>
                  {isEntryRatingsVisible(entry.id) ? (
                    <span className="rounded-full border border-[var(--line)] px-3 py-1 text-[var(--muted)]">
                      {language === 'ar'
                        ? `التقييم: ${avgRating.toFixed(1)} (${comments.length})`
                        : `Rating: ${avgRating.toFixed(1)} (${comments.length})`}
                    </span>
                  ) : null}
                </div>

                {entry.note ? (
                  <p className="text-sm text-[var(--text)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {entry.note}
                  </p>
                ) : null}

                <audio controls className="mt-3 w-full" src={entry.audioDataUrl} />

                <p className="mt-2 text-xs text-[var(--muted)]">
                  {language === 'ar' ? 'بواسطة' : 'By'}: {entry.authorName}
                </p>

                {isEntryRatingsVisible(entry.id) ? (
                  <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenRatingForm((prev) => ({ ...prev, [entry.id]: !prev[entry.id] }))
                      }
                      className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold"
                    >
                      {openRatingForm[entry.id]
                        ? language === 'ar'
                          ? 'إخفاء نموذج التقييم'
                          : 'Hide Rating Form'
                        : language === 'ar'
                          ? 'إضافة تقييم'
                          : 'Add Rating'}
                    </button>

                    {openRatingForm[entry.id] ? (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-[var(--muted)]">
                          {language === 'ar'
                            ? 'أدخل اسمك وتقييمك ثم أرسل.'
                            : 'Enter your name and rating, then submit.'}
                        </p>

                        <input
                          value={raterNameDrafts[entry.id] ?? ''}
                          onChange={(event) =>
                            setRaterNameDrafts((prev) => ({ ...prev, [entry.id]: event.target.value }))
                          }
                          placeholder={language === 'ar' ? 'اسمك' : 'Your name'}
                          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
                        />

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const selected = (ratingDrafts[entry.id] ?? 5) >= star
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setRatingDrafts((prev) => ({ ...prev, [entry.id]: star }))
                                }
                                className={[
                                  'rounded-lg border px-2 py-1 text-xs font-semibold transition',
                                  selected
                                    ? 'border-[var(--brand-500)] bg-[var(--brand-500)] text-white'
                                    : 'border-[var(--line)]',
                                ].join(' ')}
                              >
                                {star}★
                              </button>
                            )
                          })}
                        </div>

                        <textarea
                          value={commentDrafts[entry.id] ?? ''}
                          onChange={(event) =>
                            setCommentDrafts((prev) => ({ ...prev, [entry.id]: event.target.value }))
                          }
                          placeholder={
                            language === 'ar'
                              ? 'تعليقك (اختياري)'
                              : 'Your comment (optional)'
                          }
                          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
                          rows={2}
                        />

                        <button
                          type="button"
                          onClick={() => addComment(entry.id)}
                          className="mt-2 rounded-lg bg-[var(--brand-500)] px-3 py-2 text-xs font-semibold text-white"
                        >
                          {language === 'ar' ? 'إرسال التقييم' : 'Submit Rating'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {isEntryRatingsVisible(entry.id) && comments.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {comments
                      .slice()
                      .reverse()
                      .map((comment) => (
                        <div key={comment.id} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
                          <p className="text-xs font-semibold text-[var(--muted)]">
                            {comment.authorName} - {comment.rating}★
                          </p>
                          <p className="mt-1 text-sm text-[var(--text)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {comment.text}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : null}

                {viewerRole === 'admin' ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateEntry(entry.id, (item) => ({ ...item, status: 'approved' }))}
                      className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold"
                    >
                      {language === 'ar' ? 'اعتماد' : 'Approve'}
                    </button>

                    <button
                      type="button"
                      onClick={() => updateEntry(entry.id, (item) => ({ ...item, status: 'rejected' }))}
                      className="rounded-lg border border-[var(--warn)] px-3 py-1.5 text-xs font-semibold text-[var(--warn)]"
                    >
                      {language === 'ar' ? 'رفض' : 'Reject'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateEntry(entry.id, (item) => ({ ...item, isVisible: !item.isVisible }))
                      }
                      className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold"
                    >
                      {entry.isVisible
                        ? language === 'ar'
                          ? 'إخفاء'
                          : 'Hide'
                        : language === 'ar'
                          ? 'إظهار'
                          : 'Show'}
                    </button>
                  </div>
                ) : null}
                    </>
                  )
                })()}
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  )
}
