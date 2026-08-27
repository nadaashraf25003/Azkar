import { useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getDeviceId } from '../API/token'
import { BackendErrorState } from '../components/BackendErrorState'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import {
  useRecitations,
  useSubmitRecitation,
  useApproveRecitation,
  useRejectRecitation,
  useAddRecitationComment,
  useRateRecitation,
  useDeleteRecitation,
  useDeleteRecitationComment,
  type BackendRecitation,
} from '../hooks/useRecitations'

type UserRole = 'user' | 'admin'
type ModerationStatus = 'pending' | 'approved' | 'rejected'

const SURAH_LIST = [
  'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
  'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
  'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
  'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
  'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
  'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
  'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
  'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
  'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
  'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
  'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
  'المسد', 'الإخلاص', 'الفلق', 'الناس'
]

function getSurahNumber(name: string): number {
  const index = SURAH_LIST.findIndex((s) => s.includes(name) || name.includes(s))
  return index >= 0 ? index + 1 : 1
}

function parseAyahRange(range: string): { from: number; to: number } {
  const parts = range.split('-').map((p) => parseInt(p.trim(), 10))
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { from: Math.max(1, parts[0]), to: Math.max(parts[0], parts[1]) }
  }
  const single = parseInt(range.trim(), 10)
  if (!isNaN(single)) {
    return { from: Math.max(1, single), to: Math.max(1, single) }
  }
  return { from: 1, to: 7 }
}

function parseModerationStatus(status: number | string): ModerationStatus {
  if (status === 1 || status === 'Approved' || status === 'approved') return 'approved'
  if (status === 2 || status === 'Rejected' || status === 'rejected') return 'rejected'
  return 'pending'
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

interface QuranRecitationsPageProps {
  isAdminRoute?: boolean
}

export function QuranRecitationsPage({ isAdminRoute = false }: QuranRecitationsPageProps) {
  const { language } = useSettings()
  const location = useLocation()
  const isDirectAdminUrl = isAdminRoute || location.pathname.startsWith('/admin')

  const [viewerRole] = useLocalStorage<UserRole>('azkar-recitation-viewer-role', isDirectAdminUrl ? 'admin' : 'user')
  const [isAdminAuthenticated] = useLocalStorage<boolean>('azkar-recitations-admin-auth', false)

  const effectiveRole: UserRole = isDirectAdminUrl || (viewerRole === 'admin' && isAdminAuthenticated) ? 'admin' : 'user'

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
  const [hiddenEntries, setHiddenEntries] = useState<Record<string, boolean>>({})
  const [audioInputMode, setAudioInputMode] = useState<'record' | 'url'>('record')
  const [directAudioUrl, setDirectAudioUrl] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [submitError, setSubmitError] = useState('')

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Backend Query & Mutations
  const {
    data: recitationsData,
    isLoading,
    isError,
    refetch,
  } = useRecitations({
    includePending: effectiveRole === 'admin',
  })

  const submitRecitationMutation = useSubmitRecitation()
  const approveRecitationMutation = useApproveRecitation()
  const rejectRecitationMutation = useRejectRecitation()
  const addCommentMutation = useAddRecitationComment()
  const rateRecitationMutation = useRateRecitation()
  const deleteRecitationMutation = useDeleteRecitation()
  const deleteCommentMutation = useDeleteRecitationComment()

  const visibleEntries = useMemo(() => {
    const list = recitationsData ?? []
    return list
      .filter((entry) => {
        if (hiddenEntries[entry.id]) return false
        if (effectiveRole === 'admin') return true
        return parseModerationStatus(entry.status) === 'approved'
      })
      .sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime())
  }, [recitationsData, effectiveRole, hiddenEntries])

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
      // Microphone access error
    }
  }

  const effectiveAudioUrl = audioInputMode === 'url' ? directAudioUrl.trim() : audioPreview

  const submitRecitation = async () => {
    if (!effectiveAudioUrl || !surah.trim() || !ayahRange.trim()) {
      setSubmitError(language === 'ar' ? 'يرجى تسجيل الصوت أو إدخال رابط صوتي، وتحديد السورة والآيات.' : 'Please record audio or provide an audio URL, and fill surah details.')
      return
    }

    setSubmitError('')
    setSubmitSuccess('')

    const { from, to } = parseAyahRange(ayahRange)
    const surahNum = getSurahNumber(surah)
    const reciter = authorName.trim() || (language === 'ar' ? 'مشارك' : 'Contributor')
    const titleText = `${surah.trim()} (${ayahRange.trim()})${note.trim() ? ` - ${note.trim()}` : ''}`

    try {
      await submitRecitationMutation.mutateAsync({
        title: titleText,
        reciterName: reciter,
        audioUrl: effectiveAudioUrl,
        surahNumber: surahNum,
        fromAyah: from,
        toAyah: to,
        durationSeconds: 30,
      })

      setAudioPreview('')
      setDirectAudioUrl('')
      setNote('')
      setSubmitSuccess(
        language === 'ar'
          ? 'تم رفع التلاوة إلى الخادم بنجاح! وستظهر للجميع بعد مراجعة المشرف.'
          : 'Your recitation was submitted successfully and will appear once approved by admin.'
      )
    } catch (err: any) {
      const msg = err?.data?.detail || err?.data?.title || err?.message
      setSubmitError(
        language === 'ar'
          ? `حدث خطأ أثناء حفظ التلاوة في الخادم: ${msg || 'يرجى المحاولة مرة أخرى'}`
          : `Failed to submit recitation: ${msg || 'Please try again.'}`
      )
    }
  }

  const addComment = async (entryId: string) => {
    const raterName = (raterNameDrafts[entryId] ?? '').trim()
    const text = (commentDrafts[entryId] ?? '').trim()
    const rating = ratingDrafts[entryId] ?? 5

    if (!raterName) {
      return
    }

    try {
      if (text) {
        await addCommentMutation.mutateAsync({
          recitationId: entryId,
          authorName: raterName,
          content: text,
        })
      }

      try {
        await rateRecitationMutation.mutateAsync({
          recitationId: entryId,
          deviceIdentifier: getDeviceId(),
          score: rating,
        })
      } catch (rateErr: any) {
        // If the server returns Rating.AlreadySubmitted or another non-fatal rating note,
        // we log it gently and continue since the comment was successfully created.
        console.warn('Rating submission response:', rateErr?.message || rateErr)
      }

      setRaterNameDrafts((prev) => ({ ...prev, [entryId]: '' }))
      setCommentDrafts((prev) => ({ ...prev, [entryId]: '' }))
      setRatingDrafts((prev) => ({ ...prev, [entryId]: 5 }))
      setOpenRatingForm((prev) => ({ ...prev, [entryId]: false }))
    } catch (err: any) {
      console.error('Failed to add recitation comment/rating:', err)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await approveRecitationMutation.mutateAsync(id)
    } catch {
      // Error handling
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectRecitationMutation.mutateAsync(id)
    } catch {
      // Error handling
    }
  }

  const [deleteTarget, setDeleteTarget] = useState<{
    isOpen: boolean
    type: 'recitation' | 'comment'
    id: string
    titleSnippet: string
  }>({
    isOpen: false,
    type: 'recitation',
    id: '',
    titleSnippet: '',
  })

  const openDeleteRecitationModal = (id: string, title: string) => {
    setDeleteTarget({
      isOpen: true,
      type: 'recitation',
      id,
      titleSnippet: title,
    })
  }

  const openDeleteCommentModal = (commentId: string, content: string) => {
    setDeleteTarget({
      isOpen: true,
      type: 'comment',
      id: commentId,
      titleSnippet: content,
    })
  }

  const executeDelete = async () => {
    if (!deleteTarget.id) return

    try {
      if (deleteTarget.type === 'recitation') {
        await deleteRecitationMutation.mutateAsync(deleteTarget.id)
      } else {
        await deleteCommentMutation.mutateAsync(deleteTarget.id)
      }
      setDeleteTarget((prev) => ({ ...prev, isOpen: false }))
    } catch (err) {
      console.error('Failed to delete item:', err)
    }
  }

  const toggleVisibility = (id: string) => {
    setHiddenEntries((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const statusLabel = (status: number | string) => {
    const parsed = parseModerationStatus(status)
    if (language === 'ar') {
      if (parsed === 'approved') return 'معتمد'
      if (parsed === 'rejected') return 'مرفوض'
      return 'قيد المراجعة'
    }

    if (parsed === 'approved') return 'Approved'
    if (parsed === 'rejected') return 'Rejected'
    return 'Pending'
  }

  const isEntryRatingsVisible = (entryId: string) => {
    if (!showAllRatings) {
      return false
    }

    return showEntryRatings[entryId] ?? true
  }

  return (
    <section className="space-y-4 md:space-y-5">
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
          {effectiveRole === 'admin'
            ? language === 'ar'
              ? 'لوحة تحكم المشرف - التلاوات'
              : 'Admin Moderation - Recitations'
            : language === 'ar'
              ? 'منصة التلاوات القرآنية'
              : 'Quran Recitations Platform'}
        </p>
        <h1 className="font-title text-2xl text-[var(--text-strong)] sm:text-3xl md:text-4xl">
          {effectiveRole === 'admin'
            ? language === 'ar'
              ? 'إدارة واعتماد التلاوات القرآنية'
              : 'Quran Recitations Moderation & Management'
            : language === 'ar'
              ? 'سجّل تلاوتك وشاركها'
              : 'Record and Share Your Recitation'}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {effectiveRole === 'admin'
            ? language === 'ar'
              ? 'مراجعة التلاوات المسجلة في الخادم واعتمادها أو رفضها والتحكم في ظهورها للمستخدمين.'
              : 'Review recorded recitations from backend, approve/reject, and control visibility for users.'
            : language === 'ar'
              ? 'سجّل تلاوتك العطرة واحفظها في الخادم وشاركها مع المجتمع واستمع لتقييمات وآراء الآخرين.'
              : 'Record your recitation, save it to server, share with community, and receive feedback.'}
        </p>
      </div>

      {/* SUBMIT RECITATION SECTION - ONLY VISIBLE FOR NORMAL USERS, HIDDEN FOR ADMIN */}
      {effectiveRole !== 'admin' ? (
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">
            {language === 'ar' ? 'إضافة تلاوة جديدة' : 'Submit New Recitation'}
          </h2>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="block text-sm text-[var(--muted)]">
              {language === 'ar' ? 'الاسم (اختياري)' : 'Name (optional)'}
              <input
                value={authorName}
                onChange={(event) => setAuthorName(event.target.value)}
                placeholder={language === 'ar' ? 'اسم القارئ' : 'Reciter name'}
                className="mt-1 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm text-[var(--text)]"
              />
            </label>

            <label className="block text-sm text-[var(--muted)]">
              {language === 'ar' ? 'اسم السورة' : 'Surah name'}
              <input
                value={surah}
                onChange={(event) => setSurah(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm text-[var(--text)]"
              />
            </label>

            <label className="block text-sm text-[var(--muted)]">
              {language === 'ar' ? 'نطاق الآيات' : 'Ayah range'}
              <input
                value={ayahRange}
                onChange={(event) => setAyahRange(event.target.value)}
                placeholder={language === 'ar' ? 'مثال: 1-7' : 'Example: 1-7'}
                className="mt-1 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm text-[var(--text)]"
              />
            </label>
          </div>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={language === 'ar' ? 'ملاحظاتك عن التلاوة (اختياري)' : 'Notes about recitation (optional)'}
            className="mt-3 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm text-[var(--text)]"
            rows={3}
          />

          <div className="mt-4 border-t border-[var(--line)] pt-3">
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setAudioInputMode('record')}
                className={[
                  'rounded-xl px-3 py-1.5 text-xs font-semibold transition',
                  audioInputMode === 'record'
                    ? 'bg-[var(--brand-500)] text-white'
                    : 'border border-[var(--line)] text-[var(--muted)] hover:bg-[var(--line)]',
                ].join(' ')}
              >
                🎙️ {language === 'ar' ? 'تسجيل بالمايكروفون' : 'Microphone Recording'}
              </button>
              <button
                type="button"
                onClick={() => setAudioInputMode('url')}
                className={[
                  'rounded-xl px-3 py-1.5 text-xs font-semibold transition',
                  audioInputMode === 'url'
                    ? 'bg-[var(--brand-500)] text-white'
                    : 'border border-[var(--line)] text-[var(--muted)] hover:bg-[var(--line)]',
                ].join(' ')}
              >
                🔗 {language === 'ar' ? 'رابط ملف صوتي (MP3 / Audio URL)' : 'Direct Audio URL (MP3)'}
              </button>
            </div>

            {audioInputMode === 'record' ? (
              <div className="flex flex-wrap items-center gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="rounded-xl bg-[var(--brand-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-600)]"
                  >
                    {language === 'ar' ? '🎙️ بدء التسجيل' : '🎙️ Start Recording'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="animate-pulse rounded-xl border border-[var(--warn)] bg-rose-50 px-4 py-2 text-sm font-semibold text-[var(--warn)] dark:bg-rose-950/30"
                  >
                    {language === 'ar' ? '⏹️ إيقاف التسجيل' : '⏹️ Stop Recording'}
                  </button>
                )}

                {audioPreview ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ {language === 'ar' ? 'تم تسجيل الصوت بنجاح' : 'Audio recorded successfully'}
                  </span>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  value={directAudioUrl}
                  onChange={(e) => setDirectAudioUrl(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'أدخل رابط الملف الصوتي (مثال: https://.../recitation.mp3)'
                      : 'Enter audio file URL (e.g. https://.../recitation.mp3)'
                  }
                  className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm text-[var(--text)]"
                />
              </div>
            )}
          </div>

          {effectiveAudioUrl ? (
            <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2">
              <audio controls className="w-full" src={effectiveAudioUrl} />
            </div>
          ) : null}

          {submitError ? (
            <p className="mt-3 text-xs font-semibold text-rose-500">{submitError}</p>
          ) : null}

          {submitSuccess ? (
            <p className="mt-3 text-xs font-semibold text-emerald-500">{submitSuccess}</p>
          ) : null}

          <div className="mt-4">
            <button
              type="button"
              onClick={submitRecitation}
              disabled={!effectiveAudioUrl || submitRecitationMutation.isPending}
              className="rounded-xl bg-[var(--brand-500)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-600)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitRecitationMutation.isPending
                ? language === 'ar'
                  ? 'جاري الإرسال للخادم...'
                  : 'Submitting to server...'
                : language === 'ar'
                  ? 'إرسال التلاوة إلى الخادم'
                  : 'Submit Recitation to Server'}
            </button>
          </div>
        </article>
      ) : null}

      <article className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">
            {effectiveRole === 'admin'
              ? language === 'ar'
                ? 'التلاوات المسجلة في الخادم (للإشراف)'
                : 'Recitations from Backend (Admin Moderation)'
              : language === 'ar'
                ? 'التلاوات المعتمدة من الخادم'
                : 'Approved Recitations from Backend'}
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:bg-[var(--line)]"
            >
              🔄 {language === 'ar' ? 'تحديث' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={() => setShowAllRatings((prev) => !prev)}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:bg-[var(--line)]"
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
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-500)] border-t-transparent"></div>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {language === 'ar' ? 'جاري جلب التلاوات من الخادم...' : 'Fetching recitations from server...'}
            </p>
          </div>
        ) : isError ? (
          <BackendErrorState
            titleAr="تعذر جلب التلاوات"
            titleEn="Failed to fetch recitations"
            messageAr="حدث خطأ في الاتصال بالخادم"
            messageEn="Could not connect to backend server"
            onRetry={() => void refetch()}
          />
        ) : visibleEntries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
            {language === 'ar' ? 'لا توجد تلاوات في الخادم حتى الآن.' : 'No recitations found on server.'}
          </p>
        ) : (
          <div className="grid gap-3">
            {visibleEntries.map((entry: BackendRecitation) => {
              const comments = entry.comments ?? []
              const avgRating = entry.averageRating || (comments.length > 0 ? 5 : 0)
              const status = parseModerationStatus(entry.status)

              return (
                <article key={entry.id} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 shadow-sm">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-[var(--brand-100)] px-3 py-1 text-[var(--brand-700)]">
                      {entry.title || `سورة رقم ${entry.surahNumber} (${entry.fromAyah}-${entry.toAyah})`}
                    </span>
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-xs font-semibold',
                        status === 'approved'
                          ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : status === 'rejected'
                            ? 'border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
                      ].join(' ')}
                    >
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
                      className="rounded-full border border-[var(--line)] px-3 py-1 text-[var(--muted)] hover:bg-[var(--line)]"
                    >
                      {isEntryRatingsVisible(entry.id)
                        ? language === 'ar'
                          ? 'إخفاء التقييمات'
                          : 'Hide Ratings'
                        : language === 'ar'
                          ? 'إظهار التقييمات'
                          : 'Show Ratings'}
                    </button>
                    {isEntryRatingsVisible(entry.id) ? (
                      <span className="rounded-full border border-[var(--line)] px-3 py-1 text-[var(--muted)]">
                        {language === 'ar'
                          ? `⭐ التقييم: ${avgRating.toFixed(1)} (${entry.ratingsCount || comments.length})`
                          : `⭐ Rating: ${avgRating.toFixed(1)} (${entry.ratingsCount || comments.length})`}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {language === 'ar' ? 'القارئ' : 'Reciter'}: <strong className="text-[var(--text-strong)]">{entry.reciterName}</strong>
                    <span className="mx-2 opacity-40">•</span>
                    <span>{new Date(entry.createdAtUtc).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                  </p>

                  <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2">
                    <audio controls className="w-full" src={entry.audioUrl} />
                  </div>

                  {isEntryRatingsVisible(entry.id) ? (
                    <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenRatingForm((prev) => ({ ...prev, [entry.id]: !prev[entry.id] }))
                        }
                        className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:bg-[var(--line)]"
                      >
                        {openRatingForm[entry.id]
                          ? language === 'ar'
                            ? 'إخفاء نموذج التقييم'
                            : 'Hide Rating Form'
                          : language === 'ar'
                            ? '✍️ إضافة تقييم أو تعليق'
                            : '✍️ Add Rating or Feedback'}
                      </button>

                      {openRatingForm[entry.id] ? (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-[var(--muted)]">
                            {language === 'ar'
                              ? 'أدخل اسمك وتقييمك ثم أرسل للخادم.'
                              : 'Enter your name and rating, then submit.'}
                          </p>

                          <input
                            value={raterNameDrafts[entry.id] ?? ''}
                            onChange={(event) =>
                              setRaterNameDrafts((prev) => ({ ...prev, [entry.id]: event.target.value }))
                            }
                            placeholder={language === 'ar' ? 'اسمك' : 'Your name'}
                            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm text-[var(--text)]"
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
                                    'rounded-lg border px-3 py-1 text-xs font-semibold transition',
                                    selected
                                      ? 'border-[var(--brand-500)] bg-[var(--brand-500)] text-white'
                                      : 'border-[var(--line)] hover:bg-[var(--line)]',
                                  ].join(' ')}
                                >
                                  {star} ★
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
                                ? 'تعليقك أو ملاحظاتك التجويدية (اختياري)'
                                : 'Your feedback or Tajweed notes (optional)'
                            }
                            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm text-[var(--text)]"
                            rows={2}
                          />

                          <button
                            type="button"
                            onClick={() => addComment(entry.id)}
                            disabled={addCommentMutation.isPending || rateRecitationMutation.isPending}
                            className="mt-2 rounded-lg bg-[var(--brand-500)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-600)] disabled:opacity-50"
                          >
                            {language === 'ar' ? 'إرسال التقييم' : 'Submit Rating'}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {isEntryRatingsVisible(entry.id) && comments.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {comments.map((comment) => (
                        <div key={comment.id} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-[var(--text-strong)]">
                              👤 {comment.authorName}
                              <span className="mx-2 text-[var(--muted)] font-normal">
                                {new Date(comment.createdAtUtc).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                              </span>
                            </p>

                            {effectiveRole === 'admin' ? (
                              <button
                                type="button"
                                disabled={deleteCommentMutation.isPending}
                                onClick={() => openDeleteCommentModal(comment.id, comment.content)}
                                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-500 hover:text-white dark:text-rose-400 disabled:opacity-50"
                                title={language === 'ar' ? 'حذف التعليق نهائياً من قاعدة البيانات' : 'Delete Comment Permanently'}
                              >
                                🗑️ {language === 'ar' ? 'حذف' : 'Delete'}
                              </button>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-[var(--text)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {effectiveRole === 'admin' ? (
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3">
                      <button
                        type="button"
                        onClick={() => handleApprove(entry.id)}
                        disabled={approveRecitationMutation.isPending}
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 disabled:opacity-50"
                      >
                        ✓ {language === 'ar' ? 'اعتماد التلاوة' : 'Approve'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(entry.id)}
                        disabled={rejectRecitationMutation.isPending}
                        className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-500 hover:text-white dark:text-rose-400 disabled:opacity-50"
                      >
                        ✕ {language === 'ar' ? 'رفض التلاوة' : 'Reject'}
                      </button>

                      <button
                        type="button"
                        disabled={deleteRecitationMutation.isPending}
                        onClick={() => openDeleteRecitationModal(entry.id, entry.title || `سورة رقم ${entry.surahNumber}`)}
                        className="rounded-lg border border-rose-500/40 bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-95 disabled:opacity-50"
                        title={language === 'ar' ? 'حذف التلاوة وجميع تقييماتها نهائياً من قاعدة البيانات' : 'Delete Recitation Permanently'}
                      >
                        🗑️ {language === 'ar' ? 'حذف التلاوة' : 'Delete Recitation'}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleVisibility(entry.id)}
                        className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--line)]"
                      >
                        {hiddenEntries[entry.id]
                          ? language === 'ar'
                            ? 'إظهار محلياً'
                            : 'Show Locally'
                          : language === 'ar'
                            ? 'إخفاء محلياً'
                            : 'Hide Locally'}
                      </button>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        )}
      </article>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={deleteTarget.isOpen}
        isLoading={deleteRecitationMutation.isPending || deleteCommentMutation.isPending}
        titleAr={
          deleteTarget.type === 'recitation'
            ? 'تأكيد حذف التلاوة'
            : 'تأكيد حذف التعليق'
        }
        titleEn={
          deleteTarget.type === 'recitation'
            ? 'Confirm Recitation Deletion'
            : 'Confirm Comment Deletion'
        }
        messageAr={
          deleteTarget.type === 'recitation'
            ? 'هل أنت متأكد من رغبتك في حذف هذه التلاوة وجميع التعليقات والتقييمات التابعة لها نهائياً من قاعدة البيانات؟'
            : 'هل أنت متأكد من رغبتك في حذف هذا التعليق نهائياً من قاعدة البيانات؟'
        }
        messageEn={
          deleteTarget.type === 'recitation'
            ? 'Are you sure you want to permanently delete this recitation, its comments and ratings from the database?'
            : 'Are you sure you want to permanently delete this comment from the database?'
        }
        itemTitle={deleteTarget.titleSnippet}
        onConfirm={executeDelete}
        onClose={() => setDeleteTarget((prev) => ({ ...prev, isOpen: false }))}
      />
    </section>
  )
}
