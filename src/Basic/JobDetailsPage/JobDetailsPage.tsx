import { useNavigate, useLocation, Link } from "react-router-dom";
import styles from "./JobDetailsPage.module.css";
import { ApplyJobModal } from "./ApplyJobModal/ApplyJobModal";
import { RateTradesmanModal } from "./RateTradesmanModal/RateTradesmanModal";
import { ReportJobModal } from "./ReportJobModal/ReportJobModal";
import { TradesmanReviews } from "./TradesmanReviews/TradesmanReviews";
import { GeneralRatingSection } from "./GeneralRatingSection/GeneralRatingSection";
import { TradesmanRatingForm } from "./TradesmanRatingForm/TradesmanRatingForm";
import { useJobitoAuth } from "../../context/LinkContxt.js";
import { useEffect, useState, useMemo, useRef } from "react";
import AllApplicants from "../Company/All Applicants/All Applicants";
import { useTranslation } from "../../context/translation-context";
import { useToast } from "../../context/ToastContext";

const CheckIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="#56CDAD" strokeWidth="2" />
    <path
      d="M8 12L11 15L16 9"
      stroke="#56CDAD"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

import { API_BASE_URL, getCommonHeaders } from "../../services/api.js";

interface Benefit {
  emoji: string;
  name: string;
  desc: string;
}

interface Application {
  applicationId: number;
  status: string;
}

interface Job {
  jobId: number | string;
  isActive: boolean;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  address: string;
  jobType: string | string[];
  salaryMin?: number;
  salaryMax?: number;
  createdAt?: string;
  expiresAt?: string;
  slotsAvailable?: number;
  category?: { name: string };
  company?: {
    name: string;
    description: string;
    website: string;
    benefits: Benefit[];
    officePhoto1Url: string;
    officePhoto2Url: string;
    logoUrl?: string;
  };
  applications?: Application[];
  images?: string[];
  user?: {
    userId?: string;
    id?: string;
    avatarUrl?: string;
    fullName?: string;
  };
}

export const JobDetailsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { apiFetch, isAuthenticated, role } = useJobitoAuth();
  const { showToast } = useToast();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "applicants">(
    "details",
  );
  const [job, setJob] = useState<Job | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"original" | "en">("original");
  const [userApplication, setUserApplication] = useState<Application | null>(
    null,
  );
  const [tradesmanRating, setTradesmanRating] = useState<string | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const jobId = location.state?.jobId || 1;

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/jobs/${jobId}?_t=${Date.now()}`,
          {
            headers: getCommonHeaders(),
          },
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setJob(data);

        const simRes = await fetch(
          `${API_BASE_URL}/jobs/similar/${jobId}?_t=${Date.now()}`,
          {
            headers: {
              "ngrok-skip-browser-warning": "69420",
            },
          },
        );
        if (simRes.ok) {
          const simData = await simRes.json();
          setSimilarJobs(simData);
        }

        const uId = data.user?.userId || data.user?.id;
        if (uId && (!data.company || !data.company.name)) {
          try {
            const ratingsRes = await fetch(
              `${API_BASE_URL}/ratings/user/${uId}`,
              {
                headers: { "ngrok-skip-browser-warning": "69420" },
              },
            );
            if (ratingsRes.ok) {
              const ratings = await ratingsRes.json();
              if (ratings && ratings.length > 0) {
                const avg = (
                  ratings.reduce(
                    (sum: number, r: any) => sum + r.ratingValue,
                    0,
                  ) / ratings.length
                ).toFixed(1);
                setTradesmanRating(avg);
              }
            }
          } catch (e) {
            console.error("Error fetching tradesman ratings", e);
          }
        }
      } catch (error) {
        console.error("Error fetching job data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobData();

    const fetchApplicationStatus = async () => {
      if (isAuthenticated && role === "student") {
        try {
          const res = await apiFetch(
            `${API_BASE_URL}/applications/status/${jobId}`,
          );
          if (res.ok) {
            const data = await res.json();
            setUserApplication(data);
          }
        } catch (err) {
          console.error("Error fetching application status:", err);
        }
      }
    };
    fetchApplicationStatus();

    // 📈 Record View - runs only once per page load
    const recordView = async () => {
      try {
        let sessionId = localStorage.getItem("jobito_session_id");
        if (!sessionId) {
          sessionId =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
          localStorage.setItem("jobito_session_id", sessionId);
        }

        await apiFetch(`${API_BASE_URL}/jobs/${jobId}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
      } catch (err) {
        // Silent fail for view tracking
      }
    };
    recordView();
  }, [jobId, apiFetch, isAuthenticated, role]);

  // Report handler
  const handleReport = () => {
    setIsReportModalOpen(true);
  };

  const handleDelete = async () => {
    if (!window.confirm(t("هل أنت متأكد من حذف هذه الوظيفة؟"))) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(t("تم حذف الوظيفة بنجاح."), "success");
        navigate("/JobListing");
      } else {
        throw new Error("Failed to delete job");
      }
    } catch (error: any) {
      console.error("Error deleting job:", error);
      showToast(t("خطأ أثناء حذف الوظيفة."), "error");
    }
  };

  const toggleActive = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !job?.isActive }),
      });
      if (res.ok) {
        const updatedJob = await res.json();
        setJob((prev) =>
          prev ? { ...prev, isActive: updatedJob.isActive } : null,
        );
        showToast(
          updatedJob.isActive
            ? t("تم إعادة فتح الوظيفة")
            : t("تم إغلاق الوظيفة"),
          "success",
        );
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling job status:", error);
      showToast(t("خطأ أثناء تحديث حالة الوظيفة."), "error");
    }
  };

  const handleEdit = () => {
    navigate("/PostJob", { state: { editJob: job } });
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate("/user-information");
    } else {
      setIsApplyModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div
        className={styles.pageContainer}
        style={{ padding: "40px", textAlign: "center" }}
      >
        {t("جاري التحميل...")}
      </div>
    );
  }

  if (!job) {
    return (
      <div
        className={styles.pageContainer}
        style={{ padding: "40px", textAlign: "center" }}
      >
        {t("الوظيفة غير موجودة.")}
      </div>
    );
  }

  const descriptionToUse =
    lang === "en" && job.descriptionEn
      ? job.descriptionEn
      : t(job.description || "");
  const parsedSections: Record<string, string> = {};

  if (descriptionToUse) {
    let currentTitle = t("الوصف");
    let currentLines: string[] = [];

    const lines = descriptionToUse.split("\n");
    lines.forEach((line: string) => {
      const headerMatch = line.match(/^\*\*\s*(.*?)\s*:?\s*\*\*$/);
      if (headerMatch) {
        parsedSections[currentTitle] = currentLines.join("\n").trim();
        currentTitle = headerMatch[1];
        currentLines = [];
      } else {
        currentLines.push(line);
      }
    });
    parsedSections[currentTitle] = currentLines.join("\n").trim();
  }

  return (
    <div className={styles.pageContainer}>
      <div className={`${styles.contentWrapper} ${activeTab === "applicants" ? styles.wideWrapper : ""}`}>
        <div className={styles.breadcrumb}>
          <div />
          {job.titleEn && (
            <div className={styles.langToggle}>
              <button
                className={`${styles.langBtn} ${lang === "original" ? styles.activeLang : ""}`}
                onClick={() => setLang("original")}
              >
                {t("الأصلية")}
              </button>
              <button
                className={`${styles.langBtn} ${lang === "en" ? styles.activeLang : ""}`}
                onClick={() => setLang("en")}
              >
                {t("الإنجليزية")}
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation for Companies */}
        {role === "company" && (
          <div
            className={styles.tabsContainer}
            style={{ padding: "0 40px" }}
          >
            <button
              className={`${styles.tab} ${activeTab === "details" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("details")}
            >
              {t("Job Details")}
            </button>
            <button
              className={`${styles.tab} ${activeTab === "applicants" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("applicants")}
            >
              {t("Applicants")}
            </button>
            <button
              className={styles.tab}
              onClick={() => navigate(`/JobAnalytics/${jobId}`)}
            >
              {t("الإحصائيات")}
            </button>
          </div>
        )}

        {/* Header Card - only show in details tab */}
        {activeTab === "details" && (
          <div className={styles.headerCard}>
            <div className={styles.headerLeft}>
              <div className={styles.companyLogo}>
                {job.user?.avatarUrl ? (
                  <img
                    src={
                      job.user.avatarUrl.startsWith("http")
                        ? job.user.avatarUrl
                        : `${API_BASE_URL}${job.user.avatarUrl.startsWith("/") ? "" : "/"}${job.user.avatarUrl}`
                    }
                    alt={job.user.fullName || job.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : job.company?.logoUrl ? (
                  <img
                    src={
                      job.company.logoUrl.startsWith("http")
                        ? job.company.logoUrl
                        : `${API_BASE_URL}${job.company.logoUrl.startsWith("/") ? "" : "/"}${job.company.logoUrl}`
                    }
                    alt={job.company.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : job.images && job.images.length > 0 ? (
                  <img
                    src={
                      job.images[0].startsWith("http")
                        ? job.images[0]
                        : `${API_BASE_URL}${job.images[0].startsWith("/") ? "" : "/"}${job.images[0]}`
                    }
                    alt={job.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span>
                    {job.company?.name?.[0]?.toUpperCase() ||
                      job.user?.fullName?.[0]?.toUpperCase() ||
                      "C"}
                  </span>
                )}
              </div>
              <div className={styles.headerTitles}>
                <h1>
                  {lang === "en" && job.titleEn
                    ? job.titleEn
                    : t(job.title || "")}
                </h1>
                <div className={styles.subHeaderInfo}>
                  {job.user?.fullName && !job.company && (
                    <>
                      <span
                        style={{
                          fontWeight: "600",
                          color: "var(--color-primary)",
                        }}
                      >
                        {t(job.user.fullName)}
                        {tradesmanRating && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              marginLeft: "6px",
                              fontSize: "0.9rem",
                              color: "#FFB020",
                              background: "rgba(255, 176, 32, 0.1)",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              verticalAlign: "middle",
                            }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            {tradesmanRating}
                          </span>
                        )}
                      </span>
                      <div className={styles.dotSeparator}></div>
                    </>
                  )}
                  {Array.isArray(job.fieldOfWork) && job.fieldOfWork.length > 0 ? (
                    job.fieldOfWork.map((f: any, idx: number) => {
                      const name = typeof f === "string" ? f : (f?.name || "");
                      return name ? <span key={idx}>{t(name)}</span> : null;
                    })
                  ) : (
                    (job.category?.name || (typeof job.fieldOfWork === "string" && job.fieldOfWork)) ? (
                      <span>
                        {t(
                          job.category?.name ||
                            (typeof job.fieldOfWork === "string"
                              ? job.fieldOfWork
                              : "")
                        )}
                      </span>
                    ) : null
                  )}
                  <div className={styles.dotSeparator}></div>
                  <span>
                    {Array.isArray(job.jobType)
                      ? t(job.jobType[0])
                      : t(job.jobType || "full-time")}
                  </span>
                  <div className={styles.dotSeparator}></div>
                  <span style={{ color: "var(--color-text)" }}>
                    {job.applications?.length || 0} / {job.slotsAvailable || 10}{" "}
                    {t("Hired")}
                  </span>
                </div>
              </div>
            </div>
            {role === "company" ? (
              <div className={styles.headerRight}>
                <button
                  className={styles.editBtn}
                  title={t("تعديل الوظيفة")}
                  onClick={handleEdit}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  className={job.isActive ? styles.closeBtn : styles.reopenBtn}
                  title={job.isActive ? t("إغلاق الوظيفة") : t("فتح الوظيفة")}
                  onClick={toggleActive}
                >
                  {job.isActive ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  )}
                </button>
                <button
                  className={styles.deleteBtn}
                  title={t("حذف الوظيفة")}
                  onClick={handleDelete}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className={styles.headerRight}>

                {/* Report Button */}
                {role !== "admin" && (
                  <button className={styles.reportBtn} title={t("إبلاغ عن هذا المحتوى")} onClick={handleReport}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </button>
                )}
                {role !== "admin" && (
                  userApplication ? (
                    <div className={(styles as any).appliedStatusContainer}>
                      <button className={(styles as any).appliedBtn} disabled>
                        <i
                          className="fa-solid fa-check-circle"
                          style={{ marginLeft: "8px" }}
                        ></i>
                        {t("تم التقديم مسبقاً")}
                      </button>
                      <div
                        className={`${(styles as any).statusBadge} ${(styles as any)["status-" + (userApplication.status || "applied")]}`}
                      >
                        <span style={{ fontSize: "13px", opacity: 0.8 }}>
                          {t("حالة الطلب")}:
                        </span>
                        <strong style={{ marginLeft: "4px" }}>
                          {userApplication.status === "applied" ||
                          userApplication.status === "reviewing"
                            ? t("تحت المراجعة") + "⏳"
                            : userApplication.status === "shortlisted" ||
                                userApplication.status === "interviewed" ||
                                userApplication.status === "hired"
                              ? t("تم القبول (تواصل معنا)") + " ✅"
                              : userApplication.status === "declined"
                                ? t("نأسف، تم الرفض") + " ❌"
                                : t("تحت المراجعة") + " ⏳"}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <button
                      className={
                        job.isActive ? styles.applyBtn : styles.closedBtn
                      }
                      onClick={handleApplyClick}
                      disabled={!job.isActive}
                    >
                      {job.isActive ? t("تقدم الآن") : t("مغلق")}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "details" ? (
          <>
            {/* Main 2-Column Layout */}
            <div className={styles.mainLayout}>
              {/* Left Column */}
              <div className={styles.leftCol}>
                {Object.entries(parsedSections).map(([title, content]) => {
                  if (!content || title === "المهارات" || title === "Skills")
                    return null;

                  const isList =
                    content.includes("•") || content.includes("- ");
                  const listItems = content
                    .split("\n")
                    .map((li) => li.replace(/^[•\-\s*]+/, "").trim())
                    .filter((li) => li.length > 0);

                  return (
                    <section key={title} className={styles.section}>
                      <h2>{t(title)}</h2>
                      {isList ? (
                        <ul className={styles.list}>
                          {listItems.map((item, i) => (
                            <li key={i}>
                              <CheckIcon />
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{ __html: content }}
                          className={styles.descriptionText}
                        />
                      )}
                    </section>
                  );
                })}

                {Array.isArray(job.images) && job.images.length > 0 && (
                  <section className={styles.section} style={{ marginTop: '24px' }}>
                    <h2>{t("صور العمل")}</h2>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                      {job.images.map((imgUrl, idx) => (
                        <img 
                          key={idx} 
                          src={imgUrl.startsWith("http") ? imgUrl : `${API_BASE_URL}${imgUrl.startsWith("/") ? "" : "/"}${imgUrl}`} 
                          alt={`${job.title} - image ${idx + 1}`}
                          style={{ 
                            width: '120px', 
                            height: '120px', 
                            objectFit: 'cover', 
                            borderRadius: '12px',
                            border: '1px solid var(--color-border)'
                          }} 
                        />
                      ))}
                    </div>
                  </section>
                )}


                {/* Rating Section Moved to Left Column */}
                {role !== "admin" && (
                  <div className={styles.widget} style={{ marginTop: '24px' }}>
                    <GeneralRatingSection 
                      jobId={job.jobId}
                      companyId={job.company?.companyId || job.company?.company_id}
                      targetUserId={job.user?.userId || job.user?.id}
                      targetName={job.company?.name || job.user?.fullName || job.user?.name || job.title || "المعلن"}
                    />
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className={styles.rightCol}>
                {/* About the Job - moved above Skills */}
                <div className={styles.widget}>
                  <h2>{t("عن الوظيفة")}</h2>
                  <div className={styles.capacityBox}>
                    <div className={styles.capacityText}>
                      <span className={styles.boldText}>
                        {job.applications?.filter((app: any) => app.status === 'accepted' || app.status === 'hired').length || 0} {t("تم قبول")}
                      </span>{" "}
                      {t("من")} {job.slotsAvailable || 10} {t("متاح")}
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${Math.min(
                            (((job.applications?.filter((app: any) => app.status === 'accepted' || app.status === 'hired').length || 0)) /
                              (job.slotsAvailable || 10)) *
                              100,
                            100,
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className={styles.roleDetails}>
                    <div className={styles.roleRow}>
                      <span className={styles.roleLabel}>{t("نشر في")}</span>
                      <span className={styles.roleValue}>
                        {job.createdAt
                          ? new Date(job.createdAt).toLocaleDateString(
                              t("ar-EG") === "ar-EG" ? "ar-EG" : "en-US",
                            )
                          : t("غير متاح")}
                      </span>
                    </div>
                    {job.expiresAt && (
                      <div className={styles.roleRow}>
                        <span className={styles.roleLabel}>
                          {t("تقدم قبل")}
                        </span>
                        <span className={styles.roleValue}>
                          {new Date(job.expiresAt).toLocaleDateString(
                            t("ar-EG") === "ar-EG" ? "ar-EG" : "en-US",
                          )}
                        </span>
                      </div>
                    )}

                    <div className={styles.roleRow}>
                      <span className={styles.roleLabel}>
                        {t("نوع الوظيفة")}
                      </span>
                      <span
                        className={styles.roleValue}
                        style={{ textTransform: "capitalize" }}
                      >
                        {Array.isArray(job.jobType)
                          ? job.jobType
                              .map((type) =>
                                type === "full-time"
                                  ? t("دوام كامل")
                                  : type === "part-time"
                                    ? t("دوام جزئي")
                                    : t(type),
                              )
                              .join(" / ")
                          : job.jobType === "full-time"
                            ? t("دوام كامل")
                            : job.jobType === "part-time"
                              ? t("دوام جزئي")
                              : t(job.jobType || "دوام كامل")}
                      </span>
                    </div>

                    {job.address && (
                      <div className={styles.roleRow}>
                        <span className={styles.roleLabel}>{t("مكان العمل")}</span>
                        <span className={styles.roleValue}>{t(job.address)}</span>
                      </div>
                    )}

                    {Array.isArray(job.workTime) && job.workTime.length > 0 && (
                      <div className={styles.roleRow}>
                        <span className={styles.roleLabel}>{t("أيام العمل")}</span>
                        <span className={styles.roleValue}>{job.workTime.map((d: string) => t(d)).join(" / ")}</span>
                      </div>
                    )}

                    <div className={styles.roleRow}>
                      <span className={styles.roleLabel}>{t("الراتب")}</span>
                      <span
                        className={styles.roleValue}
                        dir={t("ar-EG") === "ar-EG" ? "rtl" : "ltr"}
                        style={{ display: "inline-block" }}
                      >
                        {!job.salaryMin || job.salaryMin === 0
                          ? t("قابل للتفاوض")
                          : job.salaryMin === job.salaryMax || !job.salaryMax
                            ? `${job.salaryMin} ${t("جنيه مصري")}`
                            : `${job.salaryMin} - ${job.salaryMax} ${t("جنيه مصري")}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.separator}></div>

                {(parsedSections["المهارات"] || parsedSections["Skills"] || (Array.isArray(job.skills) && job.skills.length > 0)) && (
                  <>
                    <div className={styles.widget}>
                      <h2>{t("المهارات")}</h2>
                      {(parsedSections["المهارات"] || parsedSections["Skills"]) && (
                        <p
                          style={{
                            fontSize: "15px",
                            color: "var(--color-text-secondary)",
                            lineHeight: "1.6",
                            margin: 0,
                            fontWeight: 500,
                          }}
                        >
                          {t(
                            parsedSections["المهارات"] ||
                              parsedSections["Skills"],
                          )}
                        </p>
                      )}
                      
                      {Array.isArray(job.skills) && job.skills.length > 0 && (
                        <div className={styles.tagsContainer} style={{ marginTop: (parsedSections["المهارات"] || parsedSections["Skills"]) ? '16px' : '0' }}>
                          {job.skills.map((skill, idx) => (
                            <span key={idx} className={styles.tagYellow}>
                              {t(skill)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {((Array.isArray(job.fieldOfWork) &&
                      job.fieldOfWork.length > 0) ||
                      (Array.isArray((job as any).categories) &&
                        (job as any).categories.length > 0) ||
                      job.category?.name ||
                      (job as any).classification) && (
                      <>
                        <div className={styles.separator}></div>
                        <div className={styles.widget}>
                          <h2>{t("مجال العمل")}</h2>
                          <div className={styles.tagsContainer}>
                            {Array.isArray(job.fieldOfWork) &&
                            job.fieldOfWork.length > 0 ? (
                              job.fieldOfWork.map(
                                (field: any, idx: number) => {
                                  const fieldName = typeof field === "string" ? field : (field?.name || "");
                                  return (
                                    <span key={idx} className={styles.tagGreen}>
                                      {t(fieldName)}
                                    </span>
                                  );
                                },
                              )
                            ) : Array.isArray((job as any).categories) &&
                              (job as any).categories.length > 0 ? (
                              (job as any).categories.map(
                                (cat: any, idx: number) => (
                                  <span key={idx} className={styles.tagGreen}>
                                    {t(cat.name)}
                                  </span>
                                ),
                              )
                            ) : (
                              <span className={styles.tagGreen}>
                                {t(
                                  job.category?.name ||
                                    (typeof job.fieldOfWork === "string"
                                      ? job.fieldOfWork
                                      : "") ||
                                    (job as any).classification,
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <div className={styles.separator}></div>
                    <div className={styles.widget}>
                      <h2>{t("نوع الوظيفة")}</h2>
                      <div className={styles.tagsContainer}>
                        {Array.isArray(job.jobType) ? (
                          job.jobType.map((type, idx) => (
                            <span key={idx} className={styles.tagYellow}>
                              {t(type)}
                            </span>
                          ))
                        ) : (
                          <span className={styles.tagYellow}>
                            {t(job.jobType || "دوام كامل")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.separator}></div>
                  </>
                )}
              </div>
            </div>

            {/* Perks & Benefits (Hide for Tradesman) */}
            {!(job?.classification === "tradesman_work" || job?.classification === "خدمات" || job?.classification === "services" || job?.classification === "Services" || !!job?.user) && (
              <div className={styles.perksSection}>
                <div className={styles.perksHeader}>
                  <h2>{t("المزايا والفوائد")}</h2>
                  <p>{t("نحن نقدم مزايا رائعة لموظفينا.")}</p>
                </div>
                <div className={styles.perksGrid}>
                  {job.company?.benefits && job.company.benefits.length > 0 ? (
                    job.company.benefits.map((benefit: Benefit, idx: number) => (
                      <div key={idx} className={styles.perkCard}>
                        <div className={styles.perkIcon}>
                          {benefit.emoji}
                        </div>
                        <h3>{t(benefit.name)}</h3>
                        <p>{t(benefit.desc)}</p>
                      </div>
                    ))
                  ) : (
                    <p>{t("لا توجد مزايا محددة.")}</p>
                  )}
                </div>
              </div>
            )}



            {/* Similar Jobs */}
            {role !== "company" && (
              <div className={styles.similarJobsSection}>
                <div className={styles.similarHeader}>
                  <h2>{t("وظائف مشابهة")}</h2>
                  <Link to="/JobListing" className={styles.companyLink}>
                    {t("عرض كل الوظائف")}{" "}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ transform: "rotate(180deg)" }}
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                </div>

                <div className={styles.similarGrid}>
                  {similarJobs.length > 0 ? (
                    similarJobs.map((simJob: Job) => (
                      <div
                        key={simJob.jobId}
                        className={styles.similarJobCard}
                        onClick={() => {
                          navigate("/Job details", {
                            state: { jobId: simJob.jobId },
                          });
                          window.scrollTo(0, 0);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          className={styles.simLogo}
                          style={{
                            backgroundColor: simJob.company?.logoUrl
                              ? "transparent"
                              : "#4640de",
                          }}
                        >
                          <img
                            src={
                              simJob.user?.avatarUrl
                                ? simJob.user.avatarUrl.startsWith("http")
                                  ? simJob.user.avatarUrl
                                  : `${API_BASE_URL}${simJob.user.avatarUrl.startsWith("/") ? "" : "/"}${simJob.user.avatarUrl}`
                                : simJob.company?.logoUrl
                                  ? simJob.company.logoUrl.startsWith("http")
                                    ? simJob.company.logoUrl
                                    : `${API_BASE_URL}${simJob.company.logoUrl.startsWith("/") ? "" : "/"}${simJob.company.logoUrl}`
                                  : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(simJob.company?.name || simJob.user?.fullName || "Company")}`
                            }
                            alt={simJob.company?.name || simJob.user?.fullName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "inherit",
                            }}
                          />
                        </div>
                        <div className={styles.simDetails}>
                          <div className={styles.simTitleGroup}>
                            <h3>{t(simJob.title || "")}</h3>
                            <p>
                              {simJob.company?.name
                                ? t(simJob.company.name)
                                : "Jobito"}{" "}
                              • {simJob.address ? t(simJob.address) : t("عالمي")}
                            </p>
                          </div>
                          <div className={styles.simTags}>
                            <span className={styles.tagGreen}>
                              {Array.isArray(simJob.jobType)
                                ? simJob.jobType
                                    .map((type) =>
                                      type === "full-time"
                                        ? t("دوام كامل")
                                        : type === "part-time"
                                          ? t("دوام جزئي")
                                          : t(type),
                                    )
                                    .join(" / ")
                                : simJob.jobType === "full-time"
                                  ? t("دوام كامل")
                                  : t("دوام جزئي")}
                            </span>
                            {simJob.category && (
                              <span className={styles.tagYellowOutline}>
                                {t(simJob.category.name)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>{t("لا توجد وظائف مشابهة متاحة.")}</p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.applicantsContainer}>
            <AllApplicants jobIdProp={jobId} />
          </div>
        )}
      </div>

      <ApplyJobModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        jobId={jobId}
        isTradesman={!!job?.user}
        jobTitle={t(job?.title || "")}
        companyName={t(job?.company?.name || "شركة")}
        location={t(job?.address || "الموقع")}
        jobType={
          Array.isArray(job?.jobType)
            ? job.jobType
                .map((t_jt) =>
                  t_jt === "full-time"
                    ? t("دوام كامل")
                    : t_jt === "part-time"
                      ? t("دوام جزئي")
                      : t(t_jt),
                )
                .join(" / ")
            : job?.jobType === "full-time"
              ? t("دوام كامل")
              : t("دوام جزئي")
        }
        isActive={job?.isActive}
        logoUrl={
          job?.company?.logoUrl
            ? job.company.logoUrl.startsWith("http")
              ? job.company.logoUrl
              : `${API_BASE_URL}${job.company.logoUrl}`
            : undefined
        }
      />
      <RateTradesmanModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        targetUserId={job?.user?.userId || job?.user?.id || ""}
        tradesmanName={job?.user?.fullName || "الصنايعي"}
      />
      <ReportJobModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        jobId={jobId}
        jobTitle={t(job?.title || "")}
        postOwnerId={job?.user?.userId || job?.user?.id || String(job?.companyId) || ""}
        postOwnerName={job?.user?.fullName || job?.company?.name || "Jobito"}
      />
    </div>
  );
};
