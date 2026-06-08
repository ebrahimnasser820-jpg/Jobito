import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter, Check, X, Eye } from "lucide-react";
import styles from "./WorkApplicants.module.css";
import { useTranslation } from "../../../context/translation-context";
import { useJobitoAuth } from "../../../context/LinkContxt";
import { useTheme } from "../../../context/ThemeContext";
import { useToast } from "../../../context/ToastContext";
import { API_BASE_URL } from "../../../services/api";

const WorkApplicants = () => {
  const { t } = useTranslation();
  const { apiFetch } = useJobitoAuth();
  const { theme, isDark } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [applicants, setApplicants] = useState<any[]>([]);
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedApplicantId, setExpandedApplicantId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedApplication) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedApplication]);

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId) return;
      try {
        setIsLoading(true);
        // Fetch job details
        const jobRes = await apiFetch(`${API_BASE_URL}/jobs/${jobId}`);
        if (jobRes.ok) setJobInfo(await jobRes.json());

        // Fetch applicants
        const appRes = await apiFetch(`${API_BASE_URL}/applications/job/${jobId}`);
        if (appRes.ok) setApplicants(await appRes.json());
      } catch (error) {
        console.error("Error fetching applicants:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [jobId, apiFetch]);

  const handleUpdateStatus = async (applicationId: string, status: string) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setApplicants(prev => prev.map(app => 
          app.applicationId === applicationId ? { ...app, status } : app
        ));
        if (selectedApplication?.applicationId === applicationId) {
          setSelectedApplication(prev => ({ ...prev, status }));
        }
        showToast(t("تم تحديث حالة الطلب بنجاح"), "success");
      } else {
        const errorData = await response.json().catch(() => ({}));
        showToast(errorData.message || t("حدث خطأ أثناء تحديث الحالة"), "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToast(t("حدث خطأ في الاتصال بالخادم"), "error");
    }
  };

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : styles.light}`} data-theme={theme}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <button className={styles.backBtn} onClick={() => navigate(-1)} style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer'}}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1>{jobInfo?.title || t("مساعد وسائل التواصل الاجتماعي")}</h1>
            <div className={styles.meta}>
              {t(jobInfo?.category?.name || "Design")} • {t(jobInfo?.jobType || "Full-Time")} • 
              <span className={jobInfo?.isActive ? styles.statusActive : styles.statusClosed}>
                {jobInfo?.isActive ? t("نشط") : t("مغلق")}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.tabs}>
          <div className={styles.tab}>{t("Job Details")}</div>
          <div className={`${styles.tab} ${styles.activeTab}`}>{t("Applicants")}</div>
        </div>
      </header>

      <div className={styles.listHeader}>
        <h2>{t("Total Applicants")}: {applicants.length}</h2>
        <div className={styles.searchBox}>
          <input type="text" className={styles.searchBar} placeholder={t("Search Applicants")} />
          <button className={styles.filterBtn}><Filter size={16} /> {t("Filter")}</button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("Full Name")}</th>
              <th>{t("Phone Number")}</th>
              <th>{t("Address")}</th>
              <th>{t("Status")}</th>
              <th>{t("Action")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} style={{textAlign: 'center'}}>{t("جاري التحميل...")}</td></tr>
            ) : applicants.map((app) => {
              // Parse address from coverLetter
              let address = "—";
              if (app.coverLetter && app.coverLetter.includes("Address:")) {
                const parts = app.coverLetter.split("\n\nIssue Description:");
                address = parts[0].replace("Address:", "").trim();
              } else if (app.user?.location) {
                address = app.user.location;
              }

              return (
                <tr key={app.applicationId}>
                  <td>
                    <div 
                      className={styles.applicantInfo} 
                      onClick={() => navigate(`/Profile/${app.user?.userId || app.userId}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img 
                        src={app.user?.avatarUrl ? (app.user.avatarUrl.startsWith('http') ? app.user.avatarUrl : `${API_BASE_URL}${app.user.avatarUrl}`) : "https://api.dicebear.com/7.x/initials/svg?seed=" + (app.user?.fullName || "User")} 
                        alt="" 
                        className={styles.avatar} 
                      />
                      <span className={styles.name}>{app.user?.fullName || t("مستخدم")}</span>
                    </div>
                  </td>
                  <td><span className={styles.phone}>{app.user?.phone || "—"}</span></td>
                  <td><span className={styles.locationText}>{address}</span></td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[app.status.toLowerCase()]}`}>
                      {t(app.status)}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={styles.premiumActionBtn}
                      onClick={() => setSelectedApplication(app)}
                    >
                      <Eye size={16} />
                      {t("See Application")}
                    </button>
                  </td>
                </tr>
              );
            })}
            {applicants.length === 0 && !isLoading && (
              <tr><td colSpan={5} style={{textAlign: 'center'}}>{t("لا يوجد متقدمين لهذا العمل بعد.")}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button className={styles.pageBtn}>1</button>
      </div>

      {selectedApplication && (
        <div className={styles.modalOverlay} onClick={() => setSelectedApplication(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelectedApplication(null)}>
              <X size={24} />
            </button>
            <div className={styles.modalHeader}>
              <div className={styles.companyInfo}>
                {selectedApplication.user?.avatarUrl && (
                  <img src={selectedApplication.user.avatarUrl.startsWith('http') ? selectedApplication.user.avatarUrl : `${API_BASE_URL}${selectedApplication.user.avatarUrl}`} alt="" className={styles.modalAvatar} />
                )}
                <div className={styles.headerText}>
                  <h2>{selectedApplication.user?.fullName}</h2>
                  <p>{selectedApplication.user?.location || t("الإسكندرية، مصر")}</p>
                </div>
              </div>
            </div>            <hr className={styles.divider} />

            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                <div className={styles.formGroup}>
                  <label>{t("Phone Number")}</label>
                  <div className={styles.valueBox}>
                    {selectedApplication.user?.phone || "—"}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>{t("Age")}</label>
                  <div className={styles.valueBox}>
                    {(() => {
                      const dob = selectedApplication.user?.applicantProfile?.dob;
                      if (!dob) return "—";
                      const birthDate = new Date(dob);
                      const today = new Date();
                      let age = today.getFullYear() - birthDate.getFullYear();
                      const m = today.getMonth() - birthDate.getMonth();
                      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                      }
                      return age;
                    })()}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>{t("Gender")}</label>
                  <div className={styles.valueBox}>
                    {t(selectedApplication.user?.applicantProfile?.gender || "—")}
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>{t("Address")}</label>
                <div className={styles.valueBox}>
                  {(() => {
                    if (selectedApplication.coverLetter && selectedApplication.coverLetter.includes("Address:")) {
                      const parts = selectedApplication.coverLetter.split("\n\nIssue Description:");
                      return parts[0].replace("Address:", "").trim();
                    }
                    return selectedApplication.address || "—";
                  })()}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>{t("issue Descriptions")}</label>
                <div className={styles.textareaValueBox}>
                  {(() => {
                    if (selectedApplication.coverLetter && selectedApplication.coverLetter.includes("Issue Description:")) {
                      const parts = selectedApplication.coverLetter.split("Issue Description:");
                      return parts[1]?.trim() || selectedApplication.coverLetter;
                    }
                    return selectedApplication.coverLetter || "—";
                  })()}
                </div>
              </div>

              <div className={styles.modalActions}>
                {selectedApplication.status === "pending" || selectedApplication.status === "applied" ? (
                  <>
                    <button 
                      className={styles.approveModalBtn}
                      onClick={() => handleUpdateStatus(selectedApplication.applicationId, "accepted")}
                    >
                      <Check size={18} /> {t("قبول الطلب")}
                    </button>
                    <button 
                      className={styles.rejectModalBtn}
                      onClick={() => handleUpdateStatus(selectedApplication.applicationId, "rejected")}
                    >
                      <X size={18} /> {t("رفض")}
                    </button>
                  </>
                ) : (
                  <div className={`${styles.statusText} ${styles[selectedApplication.status]}`}>
                    {t("Status")}: {t(selectedApplication.status)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkApplicants;
