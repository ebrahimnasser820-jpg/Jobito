import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Eye, Users, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import styles from "./WorkListing.module.css";
import { useTranslation } from "../../../context/translation-context";
import { useJobitoAuth } from "../../../context/LinkContxt";
import { useTheme } from "../../../context/ThemeContext";
import { API_BASE_URL } from "../../../services/api";

const WorkListing = () => {
  const { t } = useTranslation();
  const { user, apiFetch } = useJobitoAuth();
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();

  const [works, setWorks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchWorks = async () => {
      if (!user?.companyId && !user?.id) return;
      
      try {
        setIsLoading(true);
        // Fetch jobs specifically posted by this tradesman
        const userId = user.id || (user as any).userId;
        const response = await apiFetch(`${API_BASE_URL}/jobs?userId=${userId}&classification=tradesman_work&_t=${Date.now()}`);
        if (response.ok) {
          const result = await response.json();
          const freshWorks = result.data || [];
          console.log("🔥 [WorkListing] Fresh Works:", freshWorks);
          setWorks(freshWorks);
        }
      } catch (error) {
        console.error("Error fetching works:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorks();
  }, [user, apiFetch]);

  const handleEdit = async (work: any) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/jobs/${work.jobId}?_t=${Date.now()}`);
      if (res.ok) {
        const fullWork = await res.json();
        navigate("/PostWork", { state: { editJob: fullWork } });
      }
    } catch (error) {
      console.error("Error fetching work for edit:", error);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm(t("هل أنت متأكد من حذف هذا العمل؟"))) return;
    try {
      const response = await apiFetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setWorks(works.filter(w => w.jobId !== jobId));
      }
    } catch (error) {
      console.error("Error deleting work:", error);
    }
  };

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : styles.light}`} data-theme={theme}>
      <header className={styles.header}>
        <h1>{t("قائمة الأعمال")}</h1>
        <p>{t("شاهد حالة أعمالك المنشورة وإحصائيات المتقدمين.")}</p>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("الأدوار")}</th>
              <th>{t("التقييم")}</th>
              <th>{t("الحالة")}</th>
              <th>{t("تاريخ النشر")}</th>
              <th>{t("تاريخ الانتهاء")}</th>
              <th>{t("المتقدمين")}</th>
              <th>{t("طلبات التقديم")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{textAlign: 'center'}}>{t("جاري التحميل...")}</td></tr>
            ) : works.map((work) => (
              <tr key={work.jobId} style={{display: 'table-row'}}>
                <td>
                  <div className={styles.jobTitle}>{t(work.title)}</div>
                </td>
                <td>
                  <div className={styles.rate}>
                    <Star size={14} fill="#fbbf24" stroke="none" />
                    <span>{work.rating ? Number(work.rating).toFixed(1) : "0.0"}</span>
                  </div>
                </td>
                <td>
                  <span className={`${styles.status} ${!work.isActive ? styles.statusClosed : ''}`}>
                    {work.isActive ? t("نشط") : t("مغلق")}
                  </span>
                </td>
                <td>
                  <div className={styles.date}>{new Date(work.createdAt).toLocaleDateString()}</div>
                </td>
                <td>
                  <div className={styles.date}>
                    {work.expiresAt 
                      ? new Date(work.expiresAt).toLocaleDateString() 
                      : t("غير محدد")}
                  </div>
                </td>
                <td>
                  <div className={styles.applicants}>{work.appliedCount || 0}</div>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleEdit(work)}
                      title={t("تعديل")}
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => navigate(`/WorkManagement/${work.jobId}`, { state: { tab: "applicants" } })}
                      title={t("المتقدمين")}
                    >
                      <Users size={16} />
                    </button>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => navigate(`/WorkManagement/${work.jobId}`, { state: { tab: "details" } })}
                      title={t("عرض")}
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.actionDelete}`}
                      onClick={() => handleDelete(work.jobId)}
                      title={t("حذف")}
                    >
                      <Trash2 size={16} color="var(--red-600)" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {works.length === 0 && !isLoading && (
              <tr><td colSpan={7} style={{textAlign: 'center'}}>{t("لا توجد أعمال منشورة بعد.")}</td></tr>
            )}
          </tbody>
        </table>
      </div>


    </div>
  );
};

export default WorkListing;
