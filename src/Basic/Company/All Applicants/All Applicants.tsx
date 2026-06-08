import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import styles from "./All Applicants.module.css";
import { useJobitoAuth } from "../../../context/LinkContxt";
import { useTranslation } from "../../../context/translation-context";
import { useToast } from "../../../context/ToastContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface Applicant {
  applicationId: number;
  status: string;
  appliedAt: string;
  updatedAt?: string;
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
  };
}

const SortIcon = () => (
  <svg
    width="10"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: "4px", opacity: 0.5 }}
  >
    <polyline points="7 10 12 5 17 10" />
    <polyline points="7 14 12 19 17 14" />
  </svg>
);

const CustomCheckbox = () => <div className={styles['custom-checkbox']}></div>;

export default function AllApplicants({ jobIdProp }: { jobIdProp?: string | number | null }) {
  const { t, language } = useTranslation();
  const { apiFetch } = useJobitoAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const jobId = jobIdProp ? String(jobIdProp) : searchParams.get("jobId");

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilters, setStatusFilters] = useState({
    hired: false,
    declined: false,
    inreview: false,
    waitlisted: false,
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const toggleFilter = (key: keyof typeof statusFilters) => {
    setStatusFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!jobId) {
        setError(t("لم يتم تحديد الوظيفة"));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await apiFetch(`${API_BASE_URL}/applications/job/${jobId}`);
        if (!res.ok) {
          throw new Error(t("فشل في جلب بيانات المتقدمين"));
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [];
        setApplicants(list);
      } catch (err) {
        console.error("Error fetching applicants:", err);
        setError(err instanceof Error ? t(err.message) : t("خطأ غير متوقع"));
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [jobId, apiFetch]);

  const handleDeleteApplicant = async (applicationId: number) => {
    if (!window.confirm(t("هل أنت متأكد من رغبتك في حذف هذا المتقدم بشكل نهائي؟")))
      return;
    try {
      const res = await apiFetch(
        `${API_BASE_URL}/applications/${applicationId}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setApplicants((prev) =>
          prev.filter((app) => app.applicationId !== applicationId),
        );
        showToast(t("تم الحذف بنجاح"), "success");
      } else {
        showToast(t("حدث خطأ أثناء محاولة الحذف"), "error");
      }
    } catch (err) {
      console.error(err);
      showToast(t("حدث خطأ أثناء محاولة الحذف"), "error");
    }
  };

  const getBadgeClass = (stage: string) => {
    const s = (stage || "applied").toLowerCase();
    switch (s) {
      case "applied":
      case "inreview":
      case "reviewing":
      case "interviewed":
      case "interviewing":
        return styles['badge-inreview'];
      case "shortlisted":
      case "waitlisted":
        return styles['badge-waitlisted'];
      case "declined":
        return styles['badge-declined'];
      case "hired":
        return styles['badge-hired'];
      default:
        return styles['badge-inreview'];
    }
  };

  const getTranslatedStage = (stage: string) => {
    const s = (stage || "applied").toLowerCase();
    switch (s) {
      case "applied":
      case "inreview":
      case "reviewing":
        return t("تحت المراجعة");
      case "shortlisted":
      case "waitlisted":
        return t("في الانتظار");
      case "declined":
        return t("مرفوض");
      case "hired":
        return t("تم التوظيف");
      case "interviewed":
      case "interviewing":
        return t("تمت المقابلة");
      case "offered":
        return t("عرض عمل");
      default:
        return t(stage);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const loc = language === "ar" ? "ar-EG" : "en-US";
    return new Date(dateStr).toLocaleDateString(loc, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getAvatarUrl = (url?: string, name?: string) => {
    if (url) {
      if (url.startsWith("http")) return url;
      return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
    }
    return `https://api.dicebear.com/7.x/initials/svg?seed=${name || "User"}`;
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      (app.user?.fullName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (app.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const anyFilterActive =
      statusFilters.hired ||
      statusFilters.declined ||
      statusFilters.inreview ||
      statusFilters.waitlisted;
    if (!anyFilterActive) return matchesSearch;

    const s = (app.status || "applied").toLowerCase();
    const matchesStatus =
      (statusFilters.hired && s === "hired") ||
      (statusFilters.declined && s === "declined") ||
      (statusFilters.waitlisted && ["waitlisted", "shortlisted"].includes(s)) ||
      (statusFilters.inreview &&
        [
          "applied",
          "inreview",
          "reviewing",
          "interviewing",
          "interviewed",
        ].includes(s));

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredApplicants.length / pageSize) || 1;
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  if (loading) {
    return (
      <div className={styles['applicant-page']}>
        <div style={{ textAlign: "center", padding: "60px 0", color: "#7C8493" }}>
          {t("جاري تحميل المتقدمين...")}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['applicant-page']}>
        <div style={{ textAlign: "center", padding: "60px 0", color: "#FF6B6B" }}>
          ⚠️ {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles['applicant-page']} ${jobIdProp ? styles.isEmbedded : ""}`}>
      <div className={styles['top-p-header']}>
        <h2 className={styles['top-p-title']}>
          {t("إجمالي المتقدمين")} : {applicants.length}
        </h2>
        <div className={styles['top-p-actions']}>
          <div className={styles['search-box']}>
            <input
              type="text"
              placeholder={t("البحث عن متقدم...")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.filterCheckboxes}>
        <label className={`${styles.filterChip} ${statusFilters.hired ? styles.filterChipActive : ""}`}>
          <input
            type="checkbox"
            checked={statusFilters.hired}
            onChange={() => toggleFilter("hired")}
          />
          {t("تم التوظيف")}
        </label>
        <label className={`${styles.filterChip} ${statusFilters.declined ? styles.filterChipActive : ""}`}>
          <input
            type="checkbox"
            checked={statusFilters.declined}
            onChange={() => toggleFilter("declined")}
          />
          {t("مرفوض")}
        </label>
        <label className={`${styles.filterChip} ${statusFilters.waitlisted ? styles.filterChipActive : ""}`}>
          <input
            type="checkbox"
            checked={statusFilters.waitlisted}
            onChange={() => toggleFilter("waitlisted")}
          />
          {t("في الانتظار")}
        </label>
        <label className={`${styles.filterChip} ${statusFilters.inreview ? styles.filterChipActive : ""}`}>
          <input
            type="checkbox"
            checked={statusFilters.inreview}
            onChange={() => toggleFilter("inreview")}
          />
          {t("تحت المراجعة")}
        </label>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.applicantTable}>
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: "center" }}>
                <CustomCheckbox />
              </th>
              <th>
                {t("الاسم الكامل")} <SortIcon />
              </th>
              <th>
                {t("البريد الإلكتروني")} <SortIcon />
              </th>
              <th>
                {t("مرحلة التوظيف")} <SortIcon />
              </th>
              <th>
                {t("تاريخ التقديم")} <SortIcon />
              </th>
              <th>
                {t("الهاتف")} <SortIcon />
              </th>
              <th>
                {t("العداد/الإجراء")} <SortIcon />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredApplicants.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#7C8493" }}>
                  {t("لا يوجد متقدمون لهذه الوظيفة بعد.")}
                </td>
              </tr>
            ) : (
              paginatedApplicants.map((app) => (
                <tr key={app.applicationId}>
                  <td style={{ textAlign: "center" }}>
                    <CustomCheckbox />
                  </td>
                  <td>
                    <div 
                      className={styles.appUser} 
                      onClick={() => navigate(`/Profile/${app.user?.userId}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src={getAvatarUrl(app.user?.avatarUrl, app.user?.fullName)}
                        alt={app.user?.fullName || "User"}
                      />
                      <span>{t(app.user?.fullName || "مستخدم")}</span>
                    </div>
                  </td>
                  <td className={styles.appRole} data-label={t("البريد الإلكتروني")}>{t(app.user?.email || "—")}</td>
                  <td data-label={t("مرحلة التوظيف")}>
                    <span className={`${styles.appBadge} ${getBadgeClass(app.status)}`}>
                      {getTranslatedStage(app.status)}
                    </span>
                  </td>
                  <td className={styles.appDate} data-label={t("تاريخ التقديم")}>{formatDate(app.appliedAt)}</td>
                  <td className={styles.appRole} data-label={t("الهاتف")}>{t(app.user?.phone || "—")}</td>
                  <td data-label={t("العداد/الإجراء")}>
                    <div className={styles.appActions}>
                      {app.resumeUrl && (
                        <button
                          className={styles.seeAppBtn}
                          onClick={(e) => {
                            e.stopPropagation();
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
                        >
                          {t("Resume")}
                        </button>
                      )}
                      {app.portfolioUrl && (
                        <button
                          className={styles.seeAppBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            const val = app.portfolioUrl!.trim();
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
                        >
                          {t("Portfolio")}
                        </button>
                      )}
                      <button 
                        className={styles.seeAppBtn}
                        onClick={() => navigate(`/ApplicantDetails/${app.applicationId}`)}
                      >
                        {t("View Application")}
                      </button>

                      {(app.status || "").toLowerCase() === "hired" && app.updatedAt && (
                        <div className={styles.timerContainer} style={{ 
                          marginLeft: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '80px',
                          padding: '4px 10px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: '8px',
                          border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                          {(() => {
                            const hiredDate = new Date(app.updatedAt).getTime();
                            const expiryDate = hiredDate + (7 * 24 * 60 * 60 * 1000);
                            const now = new Date().getTime();
                            const diff = expiryDate - now;

                            if (diff <= 0) {
                              return (
                                <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 700 }}>
                                  {t("رسمي", "Official")}
                                </span>
                              );
                            }

                            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            
                            return (
                              <>
                                <span style={{ color: '#3b82f6', fontSize: '12px', fontWeight: 800 }}>
                                  {days}{t("ي", "d")} {hours}{t("س", "h")}
                                </span>
                                <span style={{ color: 'rgba(59, 130, 246, 0.7)', fontSize: '9px', textTransform: 'uppercase' }}>
                                  {t("متبقي", "Left")}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {applicants.length > 10 && (
        <div className={styles.paginationFooter}>
          <div className={styles.pageSizeWrap}>
            {t("إظهار")}
            <div className={styles.pageSelectBox}>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontWeight: 'inherit', color: 'inherit', cursor: 'pointer' }}
              >
                {[10, 20, 50].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {t("لكل صفحة")}
          </div>
          <div className={styles.pageControls}>
          <button 
            className={styles.pageNav}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button 
              key={pageNum}
              className={`${styles.pageNum} ${currentPage === pageNum ? styles.active : ""}`}
              onClick={() => {
                setCurrentPage(pageNum);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {pageNum}
            </button>
          ))}
          <button 
            className={styles.pageNav}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>
        </div>
      )}
    </div>
  );
}
