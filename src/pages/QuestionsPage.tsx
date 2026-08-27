import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { ADMIN_AUTH } from "../config/adminAuth";
import { BackendErrorState } from "../components/BackendErrorState";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import {
  useQuestions,
  useAskQuestion,
  useApproveQuestion,
  useAddAnswer,
  useDeleteQuestion,
  useDeleteAnswer,
  type BackendQuestion,
} from "../hooks/useQuestions";

type UserRole = "user" | "admin";
type QATag = "Fiqh" | "Quran" | "Hadith" | "Aqeedah" | "Seerah";

const TAGS: QATag[] = ["Fiqh", "Quran", "Hadith", "Aqeedah", "Seerah"];
const TAG_LABELS_AR: Record<QATag, string> = {
  Fiqh: "فقه",
  Quran: "قرآن",
  Hadith: "حديث",
  Aqeedah: "عقيدة",
  Seerah: "سيرة",
};

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  return isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function displayTag(tag: string, language: "ar" | "en"): string {
  const matchingTag = TAGS.find((t) => t.toLowerCase() === tag.toLowerCase());
  if (matchingTag) {
    return language === "ar" ? TAG_LABELS_AR[matchingTag] : matchingTag;
  }
  return tag;
}

interface QuestionsPageProps {
  isAdminRoute?: boolean;
}

export function QuestionsPage({ isAdminRoute = false }: QuestionsPageProps) {
  const { language } = useSettings();
  const location = useLocation();
  const isDirectAdminUrl = isAdminRoute || location.pathname === "/admin";

  const [viewerRole, setViewerRole] = useLocalStorage<UserRole>(
    "azkar-qa-viewer-role",
    isDirectAdminUrl ? "admin" : "user",
  );
  const [isAdminAuthenticated, setIsAdminAuthenticated] =
    useLocalStorage<boolean>("azkar-qa-admin-auth", false);

  const isAdminMode = isDirectAdminUrl || viewerRole === "admin";

  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<"all" | QATag>("all");

  const [authorName, setAuthorName] = useState("");
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionBody, setQuestionBody] = useState("");
  const [selectedTag, setSelectedTag] = useState<QATag>("Fiqh");

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");

  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [answerAuthor, setAnswerAuthor] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Fetch questions from backend - includePending is true if in Admin Mode
  const {
    data: questionsData,
    isLoading,
    isError,
    refetch,
  } = useQuestions({
    category: tagFilter === "all" ? undefined : tagFilter,
    search: searchQuery,
    includePending: isAdminMode && isAdminAuthenticated,
  });

  const askQuestionMutation = useAskQuestion();
  const approveQuestionMutation = useApproveQuestion();
  const addAnswerMutation = useAddAnswer();
  const deleteQuestionMutation = useDeleteQuestion();
  const deleteAnswerMutation = useDeleteAnswer();

  const [deleteTarget, setDeleteTarget] = useState<{
    isOpen: boolean;
    type: "question" | "answer";
    id: string;
    titleSnippet: string;
  }>({
    isOpen: false,
    type: "question",
    id: "",
    titleSnippet: "",
  });

  const questions = useMemo(() => {
    return questionsData ?? [];
  }, [questionsData]);

  const submitQuestion = async () => {
    if (!questionTitle.trim() || !questionBody.trim()) {
      setSubmitError(
        language === "ar"
          ? "يرجى كتابة عنوان وسؤال تفصيلي."
          : "Please enter both a title and question details.",
      );
      return;
    }

    setSubmitError("");
    setSubmitSuccess("");

    try {
      await askQuestionMutation.mutateAsync({
        title: questionTitle.trim(),
        content: questionBody.trim(),
        category: selectedTag,
        askerName:
          authorName.trim() || (language === "ar" ? "فاعل خير" : "Anonymous"),
      });

      setQuestionTitle("");
      setQuestionBody("");
      setSubmitSuccess(
        language === "ar"
          ? "تم إرسال سؤالك إلى الخادم بنجاح! وسيكون ظاهراً للجميع فور اعتماد المشرف."
          : "Your question was stored on the server! It will be published once approved by admin.",
      );
    } catch {
      setSubmitError(
        language === "ar"
          ? "حدث خطأ أثناء إرسال السؤال. يرجى المحاولة لاحقاً."
          : "Failed to post question to server. Please try again.",
      );
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveQuestionMutation.mutateAsync(id);
    } catch {
      // Handled by React Query
    }
  };

  const openDeleteQuestionModal = (id: string, title: string) => {
    setDeleteTarget({
      isOpen: true,
      type: "question",
      id,
      titleSnippet: title,
    });
  };

  const openDeleteAnswerModal = (answerId: string, content: string) => {
    setDeleteTarget({
      isOpen: true,
      type: "answer",
      id: answerId,
      titleSnippet: content,
    });
  };

  const executeDelete = async () => {
    if (!deleteTarget.id) return;

    try {
      if (deleteTarget.type === "question") {
        await deleteQuestionMutation.mutateAsync(deleteTarget.id);
      } else {
        await deleteAnswerMutation.mutateAsync(deleteTarget.id);
      }
      setDeleteTarget((prev) => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const submitAnswer = async (questionId: string) => {
    const draft = answerDrafts[questionId]?.trim();
    if (!draft) {
      return;
    }

    try {
      await addAnswerMutation.mutateAsync({
        questionId,
        authorName:
          answerAuthor.trim() || (language === "ar" ? "مشارك" : "Contributor"),
        content: draft,
      });

      setAnswerDrafts((prev) => ({ ...prev, [questionId]: "" }));
    } catch {
      // Retain draft for retry
    }
  };

  const loginAsAdmin = () => {
    if (
      adminEmail.trim().toLowerCase() === ADMIN_AUTH.email &&
      adminPassword === ADMIN_AUTH.password
    ) {
      setIsAdminAuthenticated(true);
      setViewerRole("admin");
      setAdminLoginError("");
      setAdminPassword("");
      return;
    }

    setAdminLoginError(
      language === "ar"
        ? "بيانات تسجيل الدخول غير صحيحة."
        : "Invalid admin credentials.",
    );
  };

  if (isLoading) {
    return (
      <p className="text-sm text-[var(--muted)]">
        {language === "ar"
          ? "جارٍ تحميل الأسئلة من الخادم..."
          : "Loading questions from server..."}
      </p>
    );
  }

  if (isError || !questionsData) {
    return <BackendErrorState onRetry={() => refetch()} />;
  }

  return (
    <section className="space-y-4 md:space-y-5">
      {/* HEADER BANNER */}
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
          {language === "ar"
            ? isDirectAdminUrl || isAdminMode
              ? "لوحة تحكم المشرف - وضع الإشراف"
              : "منصة الأسئلة الشرعية"
            : isDirectAdminUrl || isAdminMode
              ? "Admin Dashboard - Moderation Mode"
              : "Religious Q&A Platform"}
        </p>
        <h1 className="font-title text-2xl text-[var(--text-strong)] sm:text-3xl md:text-4xl">
          {isDirectAdminUrl || isAdminMode
            ? language === "ar"
              ? "إدارة واعتماد الأسئلة"
              : "Questions Moderation & Approval"
            : language === "ar"
              ? "اسأل وتعلّم"
              : "Ask and Learn"}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {language === "ar"
            ? "الأسئلة المرسلة يتم حفظها في الخادم وتظهر في وضع الإشراف فقط حتى يتم اعتمادها."
            : "Questions are saved on the backend server and appear in Admin Moderation mode until approved."}
        </p>
      </div>

      {/* ADMIN AUTHENTICATION CARD IF ON /admin OR ADMIN MODE AND NOT AUTHENTICATED */}
      {(isDirectAdminUrl || isAdminMode) && !isAdminAuthenticated ? (
        <article className="mx-auto max-w-md rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-lg">
          <h2 className="text-xl font-bold text-[var(--text-strong)]">
            {language === "ar"
              ? "تسجيل دخول المشرف (Admin)"
              : "Admin Authentication"}
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {language === "ar"
              ? "الرجاء إدخال بيانات المشرف للدخول إلى وضع الإشراف واعتماد الأسئلة."
              : "Please enter admin credentials to access moderation mode and approve questions."}
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)]">
                {language === "ar" ? "البريد الإلكتروني" : "Email"}
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@azkar.app"
                className="mt-1 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--brand-500)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--muted)]">
                {language === "ar" ? "كلمة المرور" : "Password"}
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--brand-500)]"
              />
            </div>

            {adminLoginError ? (
              <p className="text-xs font-semibold text-[var(--warn)]">
                {adminLoginError}
              </p>
            ) : null}

            <button
              type="button"
              onClick={loginAsAdmin}
              className="w-full rounded-xl bg-[var(--brand-500)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-600)]"
            >
              {language === "ar" ? "دخول وضع الإشراف" : "Enter Admin Mode"}
            </button>
          </div>
        </article>
      ) : (
        <div
          className={isAdminMode ? "space-y-4" : "grid gap-4 lg:grid-cols-3"}
        >
          {/* LEFT COLUMN: ASK QUESTION FORM - ONLY VISIBLE FOR USERS, HIDDEN FOR ADMIN */}
          {!isAdminMode ? (
            <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5 lg:col-span-1">
              <h2 className="text-lg font-semibold text-[var(--text-strong)]">
                {language === "ar" ? "طرح سؤال جديد" : "Ask a New Question"}
              </h2>

              <div className="mt-3 space-y-3">
                <input
                  value={authorName}
                  onChange={(event) => setAuthorName(event.target.value)}
                  placeholder={
                    language === "ar"
                      ? "اسمك (اختياري)"
                      : "Your name (optional)"
                  }
                  className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--brand-500)]"
                />

                <input
                  value={questionTitle}
                  onChange={(event) => setQuestionTitle(event.target.value)}
                  placeholder={
                    language === "ar" ? "عنوان السؤال" : "Question title"
                  }
                  className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--brand-500)]"
                />

                <textarea
                  value={questionBody}
                  onChange={(event) => setQuestionBody(event.target.value)}
                  rows={4}
                  placeholder={
                    language === "ar"
                      ? "اكتب تفاصيل السؤال..."
                      : "Write question details..."
                  }
                  className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--brand-500)]"
                />

                <div>
                  <p className="mb-2 text-xs font-semibold text-[var(--muted)]">
                    {language === "ar" ? "اختر التصنيف" : "Select Category"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map((tag) => {
                      const active = selectedTag === tag;
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSelectedTag(tag)}
                          className={[
                            "rounded-full border px-3 py-1 text-xs font-semibold transition",
                            active
                              ? "border-[var(--brand-500)] bg-[var(--brand-500)] text-white"
                              : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--brand-500)]",
                          ].join(" ")}
                        >
                          {displayTag(tag, language)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {submitError ? (
                  <p className="text-xs font-semibold text-[var(--warn)]">
                    {submitError}
                  </p>
                ) : null}

                {submitSuccess ? (
                  <p className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-xs font-semibold text-green-600">
                    {submitSuccess}
                  </p>
                ) : null}

                <button
                  type="button"
                  disabled={askQuestionMutation.isPending}
                  onClick={submitQuestion}
                  className="w-full rounded-xl bg-[var(--brand-500)] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-600)] active:scale-95 disabled:opacity-50"
                >
                  {askQuestionMutation.isPending
                    ? language === "ar"
                      ? "جاري الحفظ في الخادم..."
                      : "Saving to server..."
                    : language === "ar"
                      ? "نشر السؤال"
                      : "Publish Question"}
                </button>
              </div>
            </article>
          ) : null}

          {/* QUESTIONS LIST / MODERATION PANEL */}
          <article
            className={[
              "rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5",
              isAdminMode ? "w-full" : "lg:col-span-2",
            ].join(" ")}
          >
            <div className="mb-4 flex flex-wrap gap-2">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={
                  language === "ar"
                    ? "بحث في الأسئلة..."
                    : "Search questions..."
                }
                className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--brand-500)] sm:min-w-56 sm:flex-1"
              />
              <select
                value={tagFilter}
                onChange={(event) =>
                  setTagFilter(event.target.value as "all" | QATag)
                }
                className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm sm:w-auto"
              >
                <option value="all">
                  {language === "ar" ? "كل التصنيفات" : "All Categories"}
                </option>
                {TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {displayTag(tag, language)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              {questions.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--line)] p-5 text-sm text-[var(--muted)]">
                  {language === "ar"
                    ? "لا توجد أسئلة حالياً من الخادم."
                    : "No questions found from server."}
                </p>
              ) : (
                questions.map((question: BackendQuestion) => (
                  <article
                    key={question.id}
                    className="rounded-2xl border border-[var(--line)] p-4 transition hover:border-[var(--brand-500)]/40"
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-[var(--text-strong)]">
                            {question.title}
                          </h3>

                          {/* APPROVAL STATUS BADGE */}
                          <span
                            className={[
                              "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                              question.isApproved
                                ? "border border-green-500/30 bg-green-500/15 text-green-600"
                                : "border border-amber-500/30 bg-amber-500/15 text-amber-600",
                            ].join(" ")}
                          >
                            {question.isApproved
                              ? language === "ar"
                                ? "معتمد"
                                : "Approved"
                              : language === "ar"
                                ? "قيد المراجعة (في انتظار موافقة المشرف)"
                                : "Pending Admin Approval"}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {question.askerName ||
                            (language === "ar" ? "مستخدم" : "User")}{" "}
                          • {formatDate(question.createdAtUtc)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {question.category ? (
                          <span className="rounded-full bg-[var(--brand-100)] px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">
                            {displayTag(question.category, language)}
                          </span>
                        ) : null}

                        {/* ADMIN APPROVAL BUTTON (VISIBLE IN ADMIN MODE) */}
                        {isAdminMode &&
                        isAdminAuthenticated &&
                        !question.isApproved ? (
                          <button
                            type="button"
                            disabled={approveQuestionMutation.isPending}
                            onClick={() => handleApprove(question.id)}
                            className="rounded-xl bg-green-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-95 disabled:opacity-50"
                          >
                            ✓{" "}
                            {language === "ar"
                              ? "اعتماد السؤال"
                              : "Approve Question"}
                          </button>
                        ) : null}

                        {/* ADMIN DELETE QUESTION BUTTON */}
                        {isAdminMode && isAdminAuthenticated ? (
                          <button
                            type="button"
                            disabled={deleteQuestionMutation.isPending}
                            onClick={() =>
                              openDeleteQuestionModal(
                                question.id,
                                question.title,
                              )
                            }
                            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 shadow-sm transition hover:bg-rose-500 hover:text-white dark:text-rose-400 active:scale-95 disabled:opacity-50"
                            title={
                              language === "ar"
                                ? "حذف السؤال نهائياً من قاعدة البيانات"
                                : "Delete Question Permanently"
                            }
                          >
                            🗑️{" "}
                            {language === "ar"
                              ? "حذف السؤال"
                              : "Delete Question"}
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <p className="mb-3 text-sm leading-6 text-[var(--text)]">
                      {question.content}
                    </p>

                    {/* ANSWERS SECTION FETCHED DIRECTLY FROM BACKEND */}
                    <div className="space-y-3 border-t border-[var(--line)] pt-3">
                      <p className="text-sm font-semibold text-[var(--text-strong)]">
                        {language === "ar" ? "الإجابات" : "Answers"} (
                        {question.answers
                          ? question.answers.length
                          : question.answersCount || 0}
                        )
                      </p>

                      {question.answers && question.answers.length > 0 ? (
                        question.answers.map((answer) => (
                          <div
                            key={answer.id}
                            className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3"
                          >
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-[var(--muted)]">
                                {answer.authorName ||
                                  (language === "ar"
                                    ? "مشارك"
                                    : "Contributor")}{" "}
                                • {formatDate(answer.createdAtUtc)}
                              </p>
                              <div className="flex items-center gap-2">
                                {answer.isVerifiedScholar ? (
                                  <span className="rounded-full bg-[var(--brand-500)] px-2 py-0.5 text-[10px] font-bold text-white">
                                    {language === "ar"
                                      ? "إجابة موثقة"
                                      : "Verified"}
                                  </span>
                                ) : null}

                                {/* ADMIN DELETE ANSWER BUTTON */}
                                {isAdminMode && isAdminAuthenticated ? (
                                  <button
                                    type="button"
                                    disabled={deleteAnswerMutation.isPending}
                                    onClick={() =>
                                      openDeleteAnswerModal(
                                        answer.id,
                                        answer.content,
                                      )
                                    }
                                    className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-500 hover:text-white dark:text-rose-400 disabled:opacity-50"
                                    title={
                                      language === "ar"
                                        ? "حذف الإجابة نهائياً من قاعدة البيانات"
                                        : "Delete Answer Permanently"
                                    }
                                  >
                                    🗑️ {language === "ar" ? "حذف" : "Delete"}
                                  </button>
                                ) : null}
                              </div>
                            </div>
                            <p className="text-sm text-[var(--text)]">
                              {answer.content}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[var(--muted)]">
                          {language === "ar"
                            ? "لا توجد إجابات مخزنة لهذا السؤال بعد."
                            : "No answers stored for this question yet."}
                        </p>
                      )}

                      {/* POST ANSWER FORM TO BACKEND */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <input
                          value={answerAuthor}
                          onChange={(e) => setAnswerAuthor(e.target.value)}
                          placeholder={
                            language === "ar"
                              ? "اسمك (اختياري)"
                              : "Your name (optional)"
                          }
                          className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-xs outline-none focus:border-[var(--brand-500)] sm:w-40"
                        />
                        <input
                          value={answerDrafts[question.id] ?? ""}
                          onChange={(event) =>
                            setAnswerDrafts((prev) => ({
                              ...prev,
                              [question.id]: event.target.value,
                            }))
                          }
                          placeholder={
                            language === "ar"
                              ? "أضف إجابتك هنا ليتم إرسالها للخادم..."
                              : "Write your answer to send to backend..."
                          }
                          className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-xs outline-none focus:border-[var(--brand-500)] sm:min-w-48 sm:flex-1"
                        />
                        <button
                          type="button"
                          disabled={
                            addAnswerMutation.isPending ||
                            !answerDrafts[question.id]?.trim()
                          }
                          onClick={() => submitAnswer(question.id)}
                          className="w-full rounded-xl bg-[var(--brand-500)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--brand-600)] sm:w-auto disabled:opacity-50"
                        >
                          {addAnswerMutation.isPending
                            ? language === "ar"
                              ? "جاري الإرسال للخادم..."
                              : "Sending to server..."
                            : language === "ar"
                              ? "إرسال الإجابة"
                              : "Submit Answer"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </article>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={deleteTarget.isOpen}
        isLoading={
          deleteQuestionMutation.isPending || deleteAnswerMutation.isPending
        }
        titleAr={
          deleteTarget.type === "question"
            ? "تأكيد حذف السؤال"
            : "تأكيد حذف الإجابة"
        }
        titleEn={
          deleteTarget.type === "question"
            ? "Confirm Question Deletion"
            : "Confirm Answer Deletion"
        }
        messageAr={
          deleteTarget.type === "question"
            ? "هل أنت متأكد من رغبتك في حذف هذا السؤال وجميع الإجابات التابعة له نهائياً من قاعدة البيانات؟"
            : "هل أنت متأكد من رغبتك في حذف هذه الإجابة نهائياً من قاعدة البيانات؟"
        }
        messageEn={
          deleteTarget.type === "question"
            ? "Are you sure you want to delete this question and all its answers permanently from the database?"
            : "Are you sure you want to delete this answer permanently from the database?"
        }
        itemTitle={deleteTarget.titleSnippet}
        onConfirm={executeDelete}
        onClose={() => setDeleteTarget((prev) => ({ ...prev, isOpen: false }))}
      />
    </section>
  );
}
