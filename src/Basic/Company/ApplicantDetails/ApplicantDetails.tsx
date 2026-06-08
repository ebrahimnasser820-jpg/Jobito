import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJobitoAuth } from "../../../context/LinkContxt";
import { useTranslation } from "../../../context/translation-context";
import { useToast } from "../../../context/ToastContext";
import "./ApplicantDetails.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface Applicant {
  applicationId: number;
  status: string;
  appliedAt: string;
  portfolioUrl?: string;
  coverLetter?: string;
  resumeUrl?: string;
  user: {
    userId: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    phone?: string;
    skills?: string[];
    bio?: string;
    dob?: string;
    gender?: string;
    experiences?: any[];
    educations?: any[];
    portfolios?: any[];
    experience?: number;
    languages?: string[];
    socialLinks?: {
      instagram?: string;
      twitter?: string;
      website?: string;
      linkedin?: string;
    };
    location?: string;
  };
  job?: {
    title: string;
    category?: { name: string };
    jobType?: string;
  };
}

export default function ApplicantDetails() {
  const { t, language } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiFetch } = useJobitoAuth();
  const { showToast } = useToast();
  const [app, setApp] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [myCompanyId, setMyCompanyId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    const fetchMyCompany = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/companies/my/profile`);
        if (res.ok) {
          const data = await res.json();
          setMyCompanyId(data.companyId || data.company_id);
        }
      } catch(e) {}
    };
    fetchMyCompany();
  }, [apiFetch]);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`${API_BASE_URL}/applications/${id}`);
        if (!res.ok) throw new Error(t("فشل في جلب بيانات المتقدم"));
        const data = await res.json();
        console.log("🕵️‍♂️ [ApplicantDetails] Data fetched from backend:", data);
        setApp(data);
      } catch (err) {
        setError(err instanceof Error ? t(err.message) : t("خطأ غير متوقع"));
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id, apiFetch]);

  // Auto-update status to 'reviewing' if it's 'applied'
  useEffect(() => {
    if (app && app.status === "applied") {
      const updateToReviewing = async () => {
        try {
          const res = await apiFetch(
            `${API_BASE_URL}/applications/${id}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "reviewing" }),
            },
          );
          if (res.ok) {
            setApp((prev) => (prev ? { ...prev, status: "reviewing" } : null));
          }
        } catch (err) {
          console.error("Failed to auto-update status to reviewing", err);
        }
      };
      updateToReviewing();
    }
  }, [app?.status, id, apiFetch]);

  // Removed unused getAvatarUrl

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(t("فشل في تحديث الحالة"));
      setApp((prev) => (prev ? { ...prev, status: newStatus } : null));
      const statusText =
        newStatus === "hired"
          ? t("مقبول")
          : newStatus === "declined"
            ? t("مرفوض")
            : t("في الانتظار");
      showToast(`${t("تم تحديث الحالة إلى:")} ${statusText}`, "success");
    } catch (err) {
      showToast(err instanceof Error ? t(err.message) : t("خطأ"), "error");
    }
  };

  const handleDownloadCV = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!app?.resumeUrl) return;

    const url = app.resumeUrl.startsWith("http")
      ? app.resumeUrl
      : `${API_BASE_URL}${app.resumeUrl.startsWith("/") ? "" : "/"}${app.resumeUrl}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      const cleanName = (app?.user?.fullName || "Applicant").split(" ")[0] || "Applicant";
      link.download = `${cleanName}_CV.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      setIsDownloaded(true);
    } catch (error) {
      console.error("Download failed, opening in new tab:", error);
      window.open(url, "_blank");
      setIsDownloaded(true);
    }
  };

  const handleGoToChat = () => {
    if (!u) return;
    navigate('/chat', {
      state: {
        preselectedUser: {
          userId: u.userId,
          fullName: u.fullName,
          avatarUrl: u.avatarUrl || null,
          email: u.email,
        },
        initialMessage: `${t("مرحباً")} ${(u?.fullName || "Applicant").split(" ")[0]}، ${t("بخصوص تقديمك على وظيفة")} ${t(app?.job?.title || "المتاحة")}، ${t("نحن مهتمون بملفك ونتمنى التواصل معك قريباً.")}`,
      },
    });
  };

  const submitRating = async () => {
    if (!rating || !myCompanyId || !app?.user?.userId) return;
    setSubmittingReview(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: myCompanyId,
          targetUserId: app.user.userId,
          ratingValue: rating,
          comment,
          raterType: 'COMPANY'
        }),
      });
      if (res.ok) {
        showToast(t("تم إرسال التقييم بنجاح"), "success");
        setHasRated(true);
      } else {
        throw new Error("Failed");
      }
    } catch (e) {
      console.error("Failed to submit review", e);
      showToast(t("حدث خطأ أثناء الإرسال"), "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="details-loading">{t("جاري التحميل...")}</div>;
  if (error || !app)
    return (
      <div className="details-error">⚠️ {t(error || "المتقدم غير موجود")}</div>
    );
  const u = app.user || {
    userId: "",
    fullName: "",
    email: "",
    avatarUrl: "",
    phone: "",
    skills: [],
    bio: "",
    dob: "",
    gender: "",
    experiences: [],
    educations: [],
    portfolios: [],
    experience: 0,
    languages: [],
    socialLinks: {},
    location: ""
  };
  const avatar = u.avatarUrl
    ? u.avatarUrl.startsWith("http")
      ? u.avatarUrl
      : `${API_BASE_URL}${u.avatarUrl}`
    : "https://via.placeholder.com/150";

  const getAppliedSince = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return t("اليوم");
    if (days === 1) return t("منذ يوم");
    if (days === 2) return t("منذ يومين");
    return `${t("منذ")} ${days} ${t("أيام")}`;
  };

  return (
    <div className="applicant-details-view">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          {t("تفاصيل المتقدم")}
        </button>
      </div>

      <div className="details-content">
        <div className="details-sidebar">
          <div className="sidebar-card profile-main-card">
            <div className="profile-top">
              <div className="profile-info-text">
                <h2 className="profile-name">{t(u.fullName)}</h2>
                <p className="profile-role">{t(u.skills?.[0] || "متخصص")}</p>
              </div>
              <img src={avatar} alt={u.fullName} className="large-avatar" />
            </div>

            <div className="sidebar-divider" />

            <div className="sidebar-section">
              <div className="info-header">
                <span className="applied-time">
                  {getAppliedSince(app.appliedAt)}
                </span>
                <span className="info-label">{t("الوظيفة المتقدم لها")}</span>
              </div>
              <h2 className="applied-job-title">
                {t(app.job?.title || "بدون عنوان")}
              </h2>
              <div className="applied-job-meta">
                {t(app.job?.category?.name || "عام")} •{" "}
                {Array.isArray(app.job?.jobType)
                  ? t(app.job.jobType[0] || "دوام كامل")
                  : t(app.job?.jobType || "دوام كامل")}
              </div>
            </div>

            <div className="sidebar-divider" />

            {app.resumeUrl ? (
              <div
                className={`cv-file-box clickable ${isDownloaded ? "downloaded" : ""}`}
                onClick={handleDownloadCV}
              >
                <div className="cv-icon-wrapper">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="cv-main-icon"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  {isDownloaded && <span className="download-badge">✓</span>}
                </div>
                <div className="cv-info-row">
                  <div className="cv-details-text">
                    <span className="cv-filename">
                      {app.resumeUrl.split("/").pop() ||
                        `${(u?.fullName || "Applicant").split(" ")[0]}_CV.pdf`}
                    </span>
                    <span className="cv-filesize">{t("سيرة ذاتية احترافية")}</span>
                  </div>
                  <div className="cv-dl-action">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="cv-file-box"
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              >
                <div
                  className="cv-icon-wrapper"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    boxShadow: "none",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="cv-main-icon"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </div>
                <div className="cv-info-row">
                  <div className="cv-details-text">
                    <span className="cv-filename" style={{ color: "var(--color-text-muted)" }}>
                      {t("بدون ملف CV")}
                    </span>
                    <span className="cv-filesize">{t("لم يقم المتقدم برفع ملف")}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="sidebar-divider" />
            <div className="sidebar-actions multi-actions">
              {app.status === "hired" ? (
                <div className="status-result status-hired">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  {t("تم التوظيف")}
                </div>
              ) : app.status === "declined" ? (
                <div className="status-result status-declined">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  {t("تم الرفض")}
                </div>
              ) : app.status === "waitlisted" ? (
                <div className="status-result status-waitlisted">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  {t("في الانتظار")}
                </div>
              ) : (
                <>
                  <button
                    className="accept-btn"
                    onClick={() => handleStatusUpdate("hired")}
                  >
                    {t("قبول")}
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleStatusUpdate("declined")}
                  >
                    {t("رفض")}
                  </button>
                  <button
                    className="waitlist-btn"
                    onClick={() => handleStatusUpdate("waitlisted")}
                  >
                    {t("انتظار")}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="sidebar-card contact-card">
            <div className="sidebar-section-title">{t("بيانات التواصل")}</div>

            <button
              onClick={handleGoToChat}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#4640de",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "16px",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#3b35bd")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#4640de")
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {t("مراسلة المتقدم")}
            </button>

            <div className="contact-item">
              <div className="item-icon green-bg">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div className="item-val">
                <span className="item-label">{t("البريد الإلكتروني")}</span>
                <span className="item-text">{t(u.email)}</span>
              </div>
            </div>
            {u.phone && (
              <div className="contact-item">
                <div className="item-icon blue-bg">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div className="item-val">
                  <span className="item-label">{t("الهاتف")}</span>
                  <span className="item-text">{t(u.phone)}</span>
                </div>
              </div>
            )}
            {u.socialLinks?.linkedin && (
              <div className="contact-item">
                <div className="item-icon blue-bg">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </div>
                <div className="item-val">
                  <span className="item-label">{t("لينكد إن")}</span>
                  <span className="item-text">
                    linkedin.com/in/{u.socialLinks.linkedin}
                  </span>
                </div>
              </div>
            )}
            {u.socialLinks?.instagram && (
              <div className="contact-item">
                <div className="item-icon purple-bg">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <div className="item-val">
                  <span className="item-label">{t("إنستجرام")}</span>
                  <span className="item-text">
                    instagram.com/{u.socialLinks.instagram}
                  </span>
                </div>
              </div>
            )}
            {u.socialLinks?.twitter && (
              <div className="contact-item">
                <div className="item-icon dark-bg">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4l11.733 16h4.267l-11.733-16h-4.267zM4 20l6.768-6.768m2.464-2.464l6.768-6.768"></path>
                  </svg>
                </div>
                <div className="item-val">
                  <span className="item-label">{t("إكس (تويتر)")}</span>
                  <span className="item-text">
                    x.com/{u.socialLinks.twitter}
                  </span>
                </div>
              </div>
            )}
            {u.socialLinks?.website && (
              <div className="contact-item">
                <div className="item-icon blue-bg">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                </div>
                <div className="item-val">
                  <span className="item-label">{t("الموقع الشخصي")}</span>
                  <span className="item-text">{t(u.socialLinks.website)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="details-main">
          <div className="main-tabs">
            <div className="tab active">{t("ملف المتقدم")}</div>
          </div>

          <div className="main-card">
            <div className="main-section">
              <h3 className="section-title">{t("المعلومات الشخصية")}</h3>
              <div className="info-grid">
                <div className="info-cell">
                  <span className="cell-label">{t("الاسم الكامل")}</span>
                  <span className="cell-val">{t(u.fullName)}</span>
                </div>
                <div className="info-cell">
                  <span className="cell-label">{t("الجنس")}</span>
                  <span className="cell-val">{t(u.gender || "لم يحدد")}</span>
                </div>
                <div className="info-cell">
                  <span className="cell-label">{t("تاريخ الميلاد")}</span>
                  <span className="cell-val">
                    {u.dob
                      ? new Date(u.dob).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : t("غير متوفر")}
                    {u.dob &&
                      ` (${new Date().getFullYear() - new Date(u.dob).getFullYear()} ${t("سنة")})`}
                  </span>
                </div>
                <div className="info-cell">
                  <span className="cell-label">{t("اللغات")}</span>
                  <span className="cell-val">
                    {u.languages?.length ? u.languages.map(l => t(l)).join("، ") : t("العربية")}
                  </span>
                </div>
                <div className="info-cell full-width">
                  <span className="cell-label">{t("العنوان")}</span>
                  <span className="cell-val">{t(u.location || "غير محدد")}</span>
                </div>
              </div>
            </div>

            <div className="main-divider" />

            <div className="main-section">
              <h3 className="section-title">{t("المعلومات المهنية")}</h3>
              <div className="about-me-sect">
                <h4 className="item-label">{t("نبذة عني")}</h4>
                <p className="about-text">
                  {t(u.bio || "لا يوجد نبذة تعريفية متاحة لهذا المتقدم.")}
                </p>
              </div>

              <div className="info-grid">
                <div className="info-cell">
                  <span className="cell-label">{t("الوظيفة الحالية")}</span>
                  <span className="cell-val">{t(u.skills?.[0] || "متخصص")}</span>
                </div>
                <div className="info-cell">
                  <span className="cell-label">{t("سنوات الخبرة")}</span>
                  <span className="cell-val text-primary">
                    {u.experience || 0} {t("سنوات")}
                  </span>
                </div>
                <div className="info-cell">
                  <span className="cell-label">{t("أعلى مؤهل علمي")}</span>
                  <span className="cell-val">
                    {t(u.educations?.[0]?.degree || "غير متوفر")}
                  </span>
                </div>
                <div className="info-cell">
                  <span className="cell-label">{t("المهارات")}</span>
                  <div className="skill-tags">
                    {u.skills?.length ? (
                      u.skills.map((s, idx) => (
                        <span key={idx} className="skill-tag">
                          {t(s)}
                        </span>
                      ))
                    ) : (
                      <span className="skill-tag">{t("لا توجد مهارات مسجلة")}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {app.resumeUrl && (
              <>
                <div className="main-section">
                  <h3 className="section-title">{t("السيرة الذاتية المرفقة")}</h3>
                  {app.resumeUrl.toLowerCase().endsWith(".pdf") ? (
                    <div style={{ marginTop: "16px", display: "flex", gap: "16px" }}>
                      <button
                        className="see-app-btn"
                        onClick={() => {
                          const val = app.resumeUrl!.trim();
                          const isValid = val.startsWith("http") || val.includes("/") || val.startsWith(".");
                          if (!isValid || val.length < 4) {
                            showToast(`${t("قيمة تالفة:")} "${val}"`, "warning");
                          }
                          const url = val.startsWith("http")
                            ? val
                            : val.includes("/") || val.startsWith(".")
                            ? `${API_BASE_URL}${val.startsWith("/") ? "" : "/"}${val}`
                            : `https://${val}`;
                          window.open(url, "_blank", "noopener,noreferrer");
                        }}
                        style={{
                          background: "linear-gradient(135deg, #4A6ED1 0%, #3B5CBD 100%)",
                          color: "white",
                          border: "none",
                          padding: "12px 24px",
                          borderRadius: "30px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "15px",
                          boxShadow: "0 4px 15px rgba(74, 110, 209, 0.3)",
                        }}
                      >
                        👁️ {t("فتح السيرة الذاتية مباشرة")}
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "30px",
                        background: "var(--color-bg)",
                        borderRadius: "12px",
                        textAlign: "center",
                        marginTop: "16px",
                        border: "1px dashed var(--color-border)",
                      }}
                    >
                      <p
                        style={{
                          color: "var(--color-text-muted)",
                          marginBottom: "16px",
                          fontSize: "15px",
                        }}
                      >
                        {t("السيرة الذاتية متوفرة بصيغة قابلة للتحميل المباشر وليست PDF.")}
                      </p>
                      <button
                        onClick={handleDownloadCV}
                        style={{
                          padding: "10px 24px",
                          background: "#4640de",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        {t("تحميل السيرة الذاتية")}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {(() => {
              const portfolios = app.user?.portfolios;
              console.log("🖼️ [ApplicantDetails] Raw portfolios data:", JSON.stringify(portfolios));
              if (!portfolios || !Array.isArray(portfolios) || portfolios.length === 0) return null;
              return (
                <>
                  <div className="main-divider" />
                  <div className="main-section">
                    <h3 className="section-title">{t("معرض أعمال المتقدم")}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px', marginTop: '16px' }}>
                      {portfolios.map((item: any, idx: number) => {
                        let urlStr = '';
                        if (typeof item === 'string') {
                          urlStr = item;
                        } else if (item && typeof item === 'object') {
                          urlStr = item.imageUrl || item.image_url || item.url || item.path || '';
                        }
                        console.log(`🖼️ [ApplicantDetails] Portfolio[${idx}] raw:`, item, "=> urlStr:", urlStr);
                        if (!urlStr) return null;
                        // Normalize backslashes to forward slashes
                        urlStr = urlStr.replace(/\\/g, '/');
                        const finalUrl = urlStr.startsWith("http") || urlStr.startsWith("data:") 
                          ? urlStr 
                          : `${API_BASE_URL}${urlStr.startsWith("/") ? "" : "/"}${urlStr}`;
                        return (
                          <div key={idx} style={{ width: '100%', paddingTop: '100%', position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border, #eee)' }}>
                            <img 
                              src={finalUrl} 
                              alt={`Portfolio ${idx}`}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; console.error(`🖼️ Failed to load: ${finalUrl}`); }}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              );
            })()}

            {app.status === "hired" && !hasRated && (
              <>
                <div className="main-divider" />
                <div className="main-section">
                  <h3 className="section-title">{t("تقييم المتقدم")}</h3>
                  <div style={{ background: 'var(--bg-card, #fff)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border, #eee)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{ cursor: "pointer", color: (hoverRating || rating) >= star ? "#FFD700" : "#E0E0E0", width: 28, height: 28, transition: "color 0.2s" }}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t("اكتب رأيك في المتقدم هنا...")}
                      style={{ width: '100%', minHeight: '80px', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border, #eee)', marginBottom: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                    <button
                      onClick={submitRating}
                      disabled={!rating || submittingReview || !myCompanyId}
                      className="accept-btn"
                      style={{ opacity: (!rating || submittingReview || !myCompanyId) ? 0.5 : 1, width: 'auto', padding: '10px 24px' }}
                    >
                      {submittingReview ? t("جاري الإرسال...") : t("إرسال التقييم")}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
