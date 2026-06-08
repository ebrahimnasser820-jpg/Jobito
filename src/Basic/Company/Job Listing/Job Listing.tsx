import { useState, useEffect, useCallback, useRef } from "react";
import "./Job Listing.css";
import { useNavigate } from "react-router-dom";
import { useJobitoAuth } from "../../../context/LinkContxt";
import { useTranslation } from "../../../context/translation-context";
import { useToast } from "../../../context/ToastContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface Job {
  jobId?: number;
  job_id?: number;
  title: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  jobType: string;
  slotsAvailable: number;
  salary: number;
  appliedCount?: number;
}

export default function JobListing() {
  const { user, apiFetch } = useJobitoAuth();
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  console.log("Logged in as:", user?.name);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("المتقدمون");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterType, setFilterType] = useState({
    "full-time": false,
    "part-time": false,
    freelance: false,
    internship: false,
    "one-time": false,
    remote: false
  });
  
  const [filterStatus, setFilterStatus] = useState({
    active: false,
    closed: false
  });

  const toggleStatusFilter = (key: keyof typeof filterStatus) => {
    setFilterStatus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTypeFilter = (key: keyof typeof filterType) => {
    setFilterType(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const fetchJobs = useCallback(async () => {
    try {
      let companyId;
      try {
        const profileRes = await apiFetch(
          `${API_BASE_URL}/companies/my/profile?_t=${Date.now()}`,
        );
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.companyId) {
            companyId = profileData.companyId;
          }
        }
      } catch (e) {
        console.warn("Profile fetch failed:", e);
      }

      const url = companyId
        ? `${API_BASE_URL}/jobs?companyId=${companyId}&_t=${Date.now()}`
        : `${API_BASE_URL}/jobs?_t=${Date.now()}`;

      const jobsRes = await apiFetch(url);

      if (!jobsRes.ok) {
        const errData = await jobsRes.json().catch(() => ({}));
        throw new Error(
          errData.message || `Failed to fetch jobs (Status: ${jobsRes.status})`,
        );
      }
      const jobsData = await jobsRes.json();
      const freshJobs = jobsData.data || [];
      console.log("🔥 [JobListing] Fresh Data from Server:", freshJobs);
      setJobs(freshJobs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [navigate, apiFetch]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDelete = async (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    const id = job.jobId || job.job_id;
    if (!id || !window.confirm(t("هل أنت متأكد من حذف هذه الوظيفة؟"))) return;

    try {
      const res = await apiFetch(`${API_BASE_URL}/jobs/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setJobs(jobs.filter((j) => (j.jobId || j.job_id) !== id));
      } else {
        const data = await res.json();
        showToast(t(data.message) || t("فشل حذف الوظيفة"), "error");
      }
    } catch {
      showToast(t("خطأ أثناء حذف الوظيفة"), "error");
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    const id = job.jobId || job.job_id;
    const currentActive =
      job.isActive !== undefined ? job.isActive : job.is_active;

    if (id === undefined) return;

    try {
      const res = await apiFetch(`${API_BASE_URL}/jobs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentActive }),
      });

      if (res.ok) {
        const updated = await res.json();
        setJobs(
          jobs.map((j) =>
            (j.jobId || j.job_id) === id
              ? {
                  ...j,
                  isActive: updated.isActive,
                  is_active: updated.isActive,
                }
              : j,
          ),
        );
      } else {
        const data = await res.json();
        showToast(t(data.message) || t("فشل تحديث الحالة"), "error");
      }
    } catch {
      showToast(t("خطأ أثناء تحديث الحالة"), "error");
    }
  };

  const handleEdit = async (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    const id = job.jobId || job.job_id;
    if (!id) return;
    
    try {
      // Fetch full job details to ensure we have description, benefits, etc.
      const res = await apiFetch(`${API_BASE_URL}/jobs/${id}?_t=${Date.now()}`);
      if (res.ok) {
        const fullJob = await res.json();
        navigate("/PostJob", { state: { editJob: fullJob } });
      } else {
        showToast(t("فشل في جلب بيانات الوظيفة"), "error");
      }
    } catch (err) {
      console.error("Error fetching job for edit:", err);
      showToast(t("حدث خطأ أثناء جلب البيانات"), "error");
    }
  };

  const getStatusClass = (isActive: boolean) => {
    return isActive ? "status-open" : "status-closed";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? t("مفتوح") : t("مغلق");
  };

  const getTypeClass = (type: string) => {
    const t = String(type || "").toLowerCase();
    if (t.includes("full")) return "type-fulltime";
    if (t.includes("part")) return "type-parttime";
    if (t.includes("free")) return "type-freelance";
    if (t.includes("remote")) return "type-remote";
    if (t.includes("intern")) return "type-internship";
    return "type-fulltime";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredJobs = jobs.filter(job => {
    let rawType = "";
    if (Array.isArray(job.jobType)) {
      rawType = job.jobType.join(" ");
    } else if (typeof job.jobType === "string") {
      rawType = job.jobType;
    }
    
    const sType = rawType.toLowerCase();
    const isActive = job.isActive;

    const anyStatus = filterStatus.active || filterStatus.closed;
    const matchStatus = !anyStatus || (
      (filterStatus.active && isActive) || 
      (filterStatus.closed && !isActive)
    );

    const anyType = Object.values(filterType).some(v => v);
    const matchType = !anyType || (
      (filterType["full-time"] && (sType === "full-time" || sType === "دوام كامل")) ||
      (filterType["part-time"] && (sType === "part-time" || sType === "دوام جزئي")) ||
      (filterType.freelance && (sType === "freelance" || sType.includes("عمل حر") || sType.includes("freelance"))) ||
      (filterType.internship && (sType === "internship" || sType.includes("تدريب") || sType.includes("internship"))) ||
      (filterType["one-time"] && (sType === "one-time" || sType.includes("مرة واحدة") || sType.includes("one-time"))) ||
      (filterType.remote && (sType === "remote" || sType.includes("عن بعد") || sType.includes("remote")))
    );

    return matchStatus && matchType;
  });

  if (loading) return <div className="jl-loading">{t("جاري التحميل...")}</div>;
  if (error) return <div className="jl-error">{t("خطأ")}: {t(error)}</div>;

  return (
    <div className="job-listing-page">
      <div className="jl-header-area">
        <div className="jl-title-row">
          <div className="jl-title-group">
            <h1 className="jl-title">{t("قائمة الوظائف")}</h1>
            <p className="jl-subtitle">
              {t("إدارة الوظائف التي قمت بنشرها ومتابعة المتقدمين.")}
            </p>
          </div>
          <div className="jl-date-range-picker">
            <span className="jl-date-text">13 Apr — 19 Apr</span>
            <svg
              className="jl-date-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <rect x="7" y="14" width="2" height="2"></rect>
              <rect x="11" y="14" width="2" height="2"></rect>
              <path d="M15 14h2"></path>
              <path d="M15 18h2"></path>
              <rect x="7" y="18" width="2" height="2"></rect>
              <rect x="11" y="18" width="2" height="2"></rect>
            </svg>
          </div>
        </div>
      </div>

      <div className="jl-main-card">
        <div className="jl-card-toolbar">
          <h2 className="jl-card-title">{t("Job List")}</h2>
          <div className="filter-checkboxes">
            <label className={`filter-chip ${filterStatus.active ? "filter-chip-active filter-chip-hired" : ""}`}>
              <input type="checkbox" checked={filterStatus.active} onChange={() => toggleStatusFilter("active")} />
              {t("Live")}
            </label>
            <label className={`filter-chip ${filterStatus.closed ? "filter-chip-active filter-chip-declined" : ""}`}>
              <input type="checkbox" checked={filterStatus.closed} onChange={() => toggleStatusFilter("closed")} />
              {t("Closed")}
            </label>
            
            <span style={{ width: "1px", height: "24px", background: "var(--color-border)", margin: "0 8px" }}></span>

            <label className={`filter-chip ${filterType["full-time"] ? "filter-chip-active filter-chip-waitlisted" : ""}`}>
              <input type="checkbox" checked={filterType["full-time"]} onChange={() => toggleTypeFilter("full-time")} />
              {t("Fulltime")}
            </label>
            <label className={`filter-chip ${filterType["part-time"] ? "filter-chip-active filter-chip-inreview" : ""}`}>
              <input type="checkbox" checked={filterType["part-time"]} onChange={() => toggleTypeFilter("part-time")} />
              {t("Part-Time")}
            </label>
            <label className={`filter-chip ${filterType.freelance ? "filter-chip-active filter-chip-waitlisted" : ""}`}>
              <input type="checkbox" checked={filterType.freelance} onChange={() => toggleTypeFilter("freelance")} />
              {t("Freelance")}
            </label>
            <label className={`filter-chip ${filterType.remote ? "filter-chip-active filter-chip-hired" : ""}`}>
              <input type="checkbox" checked={filterType.remote} onChange={() => toggleTypeFilter("remote")} />
              {t("Remote")}
            </label>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="jl-empty-state">{t("لا توجد وظائف تتطابق مع البحث.")}</div>
        ) : (
          <table className="jl-table">
            <thead>
              <tr>
                <th>{t("Roles")}</th>
                <th>{t("Status")}</th>
                <th>{t("Date Posted")}</th>
                <th>{t("Due Date")}</th>
                <th>{t("Job Type")}</th>
                <th>{t("Applicants")}</th>
                <th>{t("Needs")}</th>
                <th>{t("Procedures")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr
                  key={job.jobId || job.job_id}
                  onClick={() =>
                    navigate("/Job details", {
                      state: { jobId: job.jobId || job.job_id },
                    })
                  }
                >
                  <td className="jl-col-role">{job.title}</td>
                  <td data-label={t("Status")}>
                    <span
                      className={`jl-status-badge ${job.isActive ? "status-open" : "status-closed"}`}
                    >
                      {job.isActive ? t("Live") : t("Closed")}
                    </span>
                  </td>
                  <td className="jl-col-date" data-label={t("Date Posted")}>{formatDate(job.createdAt)}</td>
                  <td className="jl-col-date" data-label={t("Due Date")}>
                    {job.updatedAt ? formatDate(job.updatedAt) : "24 May 2020"}
                  </td>
                  <td data-label={t("Job Type")}>
                    <span
                      className={`jl-type-badge ${getTypeClass(Array.isArray(job.jobType) ? job.jobType[0] : String(job.jobType || ""))}`}
                    >
                      {Array.isArray(job.jobType)
                        ? t(job.jobType[0])
                        : (t(String(job.jobType || "")) || t("Fulltime"))}
                    </span>
                  </td>
                  <td className="jl-col-appl" data-label={t("Applicants")}>
                    <button
                      className="jl-applicants-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/AllApplicants?jobId=${job.jobId || job.job_id}`,
                        );
                      }}
                    >
                      {job.appliedCount || 0}
                    </button>
                  </td>
                  <td className="jl-col-needs" data-label={t("Needs")}>
                    {job.appliedCount || 0} / {job.slotsAvailable}
                  </td>
                  <td data-label={t("Procedures")}>
                    <div className="jl-actions">
                      <button
                        className="jl-action-btn"
                        title={t("Edit")}
                        onClick={(e) => handleEdit(e, job)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="jl-action-btn"
                        title={job.isActive ? t("Close") : t("Open")}
                        onClick={(e) => handleToggleStatus(e, job)}
                      >
                        {job.isActive ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                      <button
                        className="jl-action-btn"
                        title={t("Delete")}
                        onClick={(e) => handleDelete(e, job)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
