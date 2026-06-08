import {
  MailIcon,
  LockIcon,
  LoaderIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Style from "./Login.module.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import MyLoginPage from "../MyLoginPage/MyLoginPage";
import { useJobitoAuth } from "../../../context/LinkContxt.js";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../../../context/translation-context";
import { useToast } from "../../../context/ToastContext";

import { API_BASE_URL } from "../../../services/api.js";

// Import Social Icons (using lucide or custom if needed, for now I'll use placeholders or labels)
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.96.95-2.44 1.78-3.99 1.78-2.26 0-3.54-1.33-5.8-1.33-2.32 0-3.9 1.33-5.91 1.33-1.55 0-3.23-1.04-4.22-2.19C-5 17.5 10 0 20.28z" /> {/* Simplified path */}
    <path d="M12.182 4.347c0.612-0.752 1.024-1.796 0.911-2.848-0.904 0.037-2 0.603-2.648 1.354-0.581 0.665-1.09 1.728-0.952 2.75 1.014 0.078 2.077-0.504 2.689-1.256z" fill="currentColor" />
    <path d="M15.03 21.505c-0.82 0-1.677-0.24-2.573-0.24-0.895 0-1.848 0.24-2.573 0.24-2.316 0-4.102-1.39-5.187-2.966-2.203-3.194-1.686-8.411 1.246-11.455 1.455-1.512 3.513-2.47 5.313-2.47 0.923 0 1.777 0.213 2.502 0.493 0.725 0.281 1.267 0.413 1.84 0.413 0.518 0 1.014-0.122 1.638-0.373 0.625-0.25 1.43-0.533 2.535-0.533 1.83 0 3.738 0.922 4.962 2.451-0.141 0.086-2.617 1.514-2.585 4.542 0.035 3.655 3.013 4.854 3.085 4.885-0.024 0.085-0.484 1.677-1.59 3.29-1.014 1.472-2.07 2.942-3.667 2.942z" fill="currentColor" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface LoginPageProps {
  setShowLogin: (value: boolean) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setShowLogin }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { googleClientId, login: contextLogin } = useJobitoAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isResetMode, setIsResetMode] = useState(false);
  const [resetMethod, setResetMethod] = useState<"google" | "email" | null>(
    null,
  );
  const [resetStep, setResetStep] = useState(1);

  const [resetEmail, setResetEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [googleToken, setGoogleToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  // Deletion status handling
  const [deletionStatus, setDeletionStatus] = useState<{ scheduled: boolean; daysLeft?: number } | null>(null);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [loginToken, setLoginToken] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const processLoginSuccess = async (token: string) => {
    setLoginToken(token);
    try {
      const statusRes = await fetch(`${API_BASE_URL}/users/me/deletion-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.scheduled) {
          setDeletionStatus(statusData);
          setShowDeletionModal(true);
          return; // Wait for user decision, do not login yet
        }
      }
    } catch (e) {
      console.error("Failed to fetch deletion status", e);
    }
    
    // Normal login without deletion scheduled
    contextLogin(token);
    setShowLogin(false);
    navigate("/");
  };

  const handleGoogleLogin = async (response: CredentialResponse) => {
    if (!response.credential) return;
    if (isResetMode && resetMethod === "google" && resetStep === 1) {
      setGoogleToken(response.credential);
      setResetStep(2);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({ token: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google login failed");
        
      await processLoginSuccess(data.access_token);
    } catch (err: unknown) {
      showToast(err instanceof Error ? t(err.message) : t("فشل تسجيل الدخول بجوجل"), "error");
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    try {
      setIsSendingCode(true);
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "69420" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("فشل إرسال الرمز"));
      showToast(t("تم إرسال رمز التحقق إلى بريدك الإلكتروني!"), "success");
      setResetStep(2);
    } catch (err: unknown) {
      showToast(err instanceof Error ? t(err.message) : t("حدث خطأ ما"), "error");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast(t("كلمات المرور غير متطابقة!"), "error");
      return;
    }
    try {
      setIsResetting(true);
      let res;
      if (resetMethod === "google") {
        res = await fetch(`${API_BASE_URL}/auth/reset-password-google`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "69420" },
          body: JSON.stringify({ googleToken, new_password: newPassword }),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "69420" },
          body: JSON.stringify({ email: resetEmail, code: otpCode, new_password: newPassword }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      showToast(t("Password reset success!"), "success");
      setIsResetMode(false);
      setResetStep(1);
    } catch (err: unknown) {
      showToast(err instanceof Error ? t(err.message) : t("فشل إعادة تعيين كلمة المرور"), "error");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      setIsLoggingIn(true);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "69420" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      await processLoginSuccess(data.access_token);

    } catch (err: unknown) {
      showToast(err instanceof Error ? t(err.message) : t("حدث خطأ ما"), "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const resetState = () => {
    setIsResetMode(false);
    setResetMethod(null);
    setResetStep(1);
  };

  return (
    <div className={Style.loginWrapper}>
      <div className={Style.centeredBox}>
        <div className={Style.header}>
          <h2 className={Style.title}>
            {isResetMode ? t("Reset Password") : t("Agent Login")}
          </h2>
          {!isResetMode && (
            <p className={Style.subtitle}>
              {t("Hey, Enter your details to get sign in to your account")}
            </p>
          )}
        </div>

        {!isResetMode ? (
          <AnimatePresence mode="wait">
            <motion.form
              key="login-form"
              className={Style.form}
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className={Style.inputGroup}>
                <div className={Style.relativeInput}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("Enter Email / Phone No")}
                    required
                  />
                </div>
              </div>

              <div className={Style.inputGroup}>
                <div className={Style.relativeInput}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("Passcode")}
                    dir="ltr"
                    required
                  />
                  <button type="button" className={Style.hideBtn} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                <div className={Style.troubleLink}>
                  <button type="button" onClick={() => setIsResetMode(true)}>
                    {t("Having trouble in sign in?")}
                  </button>
                </div>
              </div>

              <button
                className={Style.authbtn}
                type="submit"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? <LoaderIcon className="loader" /> : t("Sign in")}
              </button>

              <div className={Style.divider}>
                <span>{t("Or Sign in with")}</span>
              </div>

              <div className={Style.googleWrapper}>
                <GoogleOAuthProvider clientId={googleClientId}>
                  <MyLoginPage
                    onGoogleLogin={handleGoogleLogin}
                  />
                </GoogleOAuthProvider>
              </div>

            </motion.form>
          </AnimatePresence>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="reset-flow"
              className={Style.form}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button onClick={resetState} className={Style.backBtn}>
                <ArrowLeftIcon size={16} /> {t("العودة لتسجيل الدخول")}
              </button>

              {resetStep === 1 && !resetMethod ? (
                <div className={Style.methodGrid}>
                  <p className={Style.subtitle}>{t("اختر طريقة استعادة كلمة المرور")}</p>
                  <button 
                    className={`${Style.methodBtn} ${Style.googleBtn}`}
                    onClick={() => setResetMethod("google")}
                  >
                    <GoogleIcon /> {t("استعادة عبر Google")}
                  </button>
                  <button 
                    className={`${Style.methodBtn} ${Style.emailBtn}`}
                    onClick={() => setResetMethod("email")}
                  >
                    <MailIcon size={20} /> {t("استعادة عبر البريد الإلكتروني")}
                  </button>
                </div>
              ) : resetStep === 1 && resetMethod === "google" ? (
                <>
                  <p className={Style.subtitle}>{t("يرجى تسجيل الدخول بحساب Google المرتبط لتغيير كلمة المرور")}</p>
                  <div className={Style.googleWrapper}>
                    <GoogleOAuthProvider clientId={googleClientId}>
                      <MyLoginPage
                        onSuccess={handleGoogleLogin}
                        onError={() => showToast(t("فشل التحقق من Google"), "error")}
                      />
                    </GoogleOAuthProvider>
                  </div>
                </>
              ) : resetStep === 1 && resetMethod === "email" ? (
                <>
                  <div className={Style.inputGroup}>
                    <label>{t("البريد الإلكتروني لاستعادة الحساب")}</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <button
                    className={Style.authbtn}
                    onClick={handleRequestOtp}
                    disabled={isSendingCode}
                  >
                    {isSendingCode ? <LoaderIcon className="loader" /> : t("إرسال رمز التحقق")}
                  </button>
                </>
              ) : (
                <>
                  <div className={Style.inputGroup}>
                    <label>{t("رمز التحقق (OTP)")}</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="000000"
                      className={Style.otpInput}
                      required
                    />
                  </div>
                  <div className={Style.inputGroup}>
                    <label>{t("كلمة المرور الجديدة")}</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className={Style.inputGroup}>
                    <label>{t("تأكيد كلمة المرور")}</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <button
                    className={Style.authbtn}
                    onClick={handleResetPassword}
                    disabled={isResetting}
                  >
                    {isResetting ? <LoaderIcon className="loader" /> : t("تعيين كلمة المرور الجديدة")}
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Deletion Modal */}
        {showDeletionModal && deletionStatus && (
          <div className={Style.modalOverlay}>
            <div className={Style.modalContent}>
              <span className={Style.modalIcon}>⚠️</span>
              <h2 className={Style.modalTitle}>{t("حسابك مجدول للحذف")}</h2>
              <p className={Style.modalText}>
                {t("حسابك مجدول للحذف خلال {{days}} أيام. اضغط على 'استكمال الدخول' لإلغاء طلب الحذف والدخول لحسابك.", { days: deletionStatus.daysLeft })}
              </p>
              
              <div className={Style.modalActions}>
                <button
                  onClick={async () => {
                    try {
                      const cancelRes = await fetch(`${API_BASE_URL}/users/me/cancel-deletion`, {
                        method: "PATCH",
                        headers: { Authorization: `Bearer ${loginToken}` },
                      });
                      if (!cancelRes.ok) throw new Error("Cancel failed");
                      alert(t("تم إلغاء طلب حذف الحساب بنجاح!"));
                      setShowDeletionModal(false);
                      // Now log them in because they cancelled
                      if (loginToken) {
                        contextLogin(loginToken);
                        setShowLogin(false);
                        navigate("/");
                      }
                    } catch (e) {
                      console.error(e);
                      alert(t("فشل إلغاء الحذف"));
                    }
                  }}
                  className={Style.cancelDeleteBtn}
                >
                  {t("استكمال الدخول")}
                </button>
                <button
                  onClick={() => {
                    setShowDeletionModal(false);
                    setLoginToken(null);
                    // DO NOT login. Just close modal.
                  }}
                  className={Style.goBackBtn}
                >
                  {t("تراجع (عدم الدخول)")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
