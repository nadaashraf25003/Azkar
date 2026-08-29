import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { apiClient } from "../API/Config.js";
import { URLS } from "../API/URLs.ts";
import { setToken } from "../API/token.ts";
import { ADMIN_AUTH } from "../config/adminAuth";

export function AdminLoginPage() {
  const { language } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdminAuthenticated, setIsAdminAuthenticated] =
    useLocalStorage<boolean>("azkar-qa-admin-auth", false);
  const [viewerRole, setQaRole] = useLocalStorage<string>(
    "azkar-qa-viewer-role",
    "user",
  );
  const [, setRecitationRole] = useLocalStorage<string>(
    "azkar-recitation-viewer-role",
    "user",
  );

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const returnUrl = (location.state as any)?.from?.pathname || "/admin/azkar";

  // If already authenticated as admin, redirect to admin area
  useEffect(() => {
    if (isAdminAuthenticated || viewerRole === "admin") {
      navigate(returnUrl, { replace: true });
    }
  }, [isAdminAuthenticated, viewerRole, navigate, returnUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError("");
    setIsSubmitting(true);

    try {
      // Authenticate against backend API and obtain JWT Bearer token
      const response: any = await apiClient.post(URLS.ADMIN.LOGIN, {
        email: adminEmail.trim(),
        password: adminPassword,
      });

      if (response && response.token) {
        setToken(response.token);
      }

      setIsAdminAuthenticated(true);
      setQaRole("admin");
      setRecitationRole("admin");
      navigate(returnUrl, { replace: true });
    } catch (err: any) {
      // Fallback check against local env credentials if backend is temporarily unreachable
      if (
        adminEmail.trim().toLowerCase() === ADMIN_AUTH.email.toLowerCase() &&
        ADMIN_AUTH.password &&
        adminPassword === ADMIN_AUTH.password
      ) {
        setIsAdminAuthenticated(true);
        setQaRole("admin");
        setRecitationRole("admin");
        navigate(returnUrl, { replace: true });
        return;
      }

      setAdminLoginError(
        err?.message ||
          (language === "ar"
            ? "بيانات تسجيل الدخول غير صحيحة. يرجى التحقق من البريد وكلمة المرور."
            : "Invalid admin credentials. Please verify your email and password."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex min-h-[80vh] items-center justify-center p-4"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <article className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-[var(--panel)] p-6 shadow-2xl backdrop-blur-xl md:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-amber-500 shadow-inner">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="font-title text-2xl font-bold text-[var(--text-strong)]">
            {language === "ar" ? "تسجيل دخول المشرف" : "Admin Login"}
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {language === "ar"
              ? "الوصول إلى لوحة التحكم الكاملة وإدارة محتوى التطبيق"
              : "Access the complete moderation panel and platform management"}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--muted)]">
              {language === "ar" ? "البريد الإلكتروني" : "Email Address"} *
            </label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@azkar.app"
              className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--muted)]">
              {language === "ar" ? "كلمة المرور" : "Password"} *
            </label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--text)]"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {adminLoginError ? (
            <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
              <span>⚠️</span>
              <span>{adminLoginError}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-amber-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-amber-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? language === "ar"
                ? "جاري التحقق..."
                : "Authenticating..."
              : language === "ar"
              ? "دخول لوحة الإشراف"
              : "Enter Admin Panel"}
          </button>
        </form>

        <div className="mt-6 border-t border-[var(--line)] pt-4 text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--text-strong)]"
          >
            {language === "ar"
              ? "← العودة إلى التطبيق الرئيسي"
              : "← Back to main application"}
          </button>
        </div>
      </article>
    </div>
  );
}
