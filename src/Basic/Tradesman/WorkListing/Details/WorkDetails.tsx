import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Clock, MapPin, DollarSign, 
  Users, Share2, MoreVertical, CheckCircle2, AlertCircle,
  Wrench, ShieldCheck, MessageSquare, Search, Filter, X, Plus,
  Trash2, ChevronDown, MoveVertical as ArrowVertical,
  Briefcase, Target, Info, Camera, Pencil, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./WorkDetails.module.css";
import { useTranslation } from "../../../../context/translation-context";
import { useJobitoAuth } from "../../../../context/LinkContxt";
import { API_BASE_URL } from "../../../../services/api";
import { useTheme } from "../../../../context/ThemeContext";

const WorkDetails = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { apiFetch } = useJobitoAuth();
  const { theme, isDark } = useTheme();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.tab || "details";
  });
  const [work, setWork] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppsLoading, setIsAppsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  useEffect(() => {
    const fetchWorkDetails = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await apiFetch(`${API_BASE_URL}/jobs/${id}?_t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          console.log("🔥 [WorkDetails] Fresh Work Data:", data);
          setWork(data);
        }
      } catch (error) {
        console.error("Error fetching work details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkDetails();
  }, [id, apiFetch]);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!id || activeTab !== "applicants") return;
      try {
        setIsAppsLoading(true);
        const response = await apiFetch(`${API_BASE_URL}/applications/job/${id}`);
        if (response.ok) {
          const data = await response.json();
          setApplicants(data);
        }
      } catch (error) {
        console.error("Error fetching applicants:", error);
      } finally {
        setIsAppsLoading(false);
      }
    };
    fetchApplicants();
  }, [id, activeTab, apiFetch]);

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
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (!window.confirm(t("هل أنت متأكد من حذف هذا الطلب؟"))) return;
    try {
      const response = await apiFetch(`${API_BASE_URL}/applications/${applicationId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setApplicants(prev => prev.filter(app => app.applicationId !== applicationId));
      }
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const handleDeleteWork = async () => {
    if (!window.confirm(t("هل أنت متأكد من رغبتك في حذف هذا العمل؟"))) return;
    try {
      const response = await apiFetch(`${API_BASE_URL}/jobs/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        navigate("/JobListing");
      } else {
        alert(t("حدث خطأ أثناء الحذف"));
      }
    } catch (error) {
      console.error("Error deleting work:", error);
    }
  };


  if (isLoading) {
    return (
      <div className={`${styles.container} ${isDark ? styles.dark : styles.light}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>{t("جاري التحميل...")}</p>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className={`${styles.container} ${isDark ? styles.dark : styles.light}`}>
        <div className={styles.loadingContainer}>
          <AlertCircle size={48} color="#ef4444" />
          <p>{t("لم يتم العثور على العمل")}</p>
          <button className={styles.detailsBtn} onClick={() => navigate(-1)}>{t("العودة")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : styles.light}`} data-theme={theme}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <button 
            className={styles.backBtn} 
            style={{ marginLeft: '10px' }}
            onClick={() => navigate(`/Job details`, { state: { jobId: work.jobId || work.job_id || id } })}
            title={t("عرض الصفحة العامة للعمل")}
          >
            <Eye size={18} />
          </button>
          <button 
            className={styles.backBtn} 
            style={{ marginLeft: '10px' }}
            onClick={() => navigate(`/PostJob`, { state: { editJob: work } })}
            title={t("تعديل")}
          >
            <Pencil size={18} />
          </button>
          <button 
            className={styles.backBtn} 
            style={{ marginLeft: '10px', color: '#ef4444' }}
            onClick={handleDeleteWork}
            title={t("حذف")}
          >
            <Trash2 size={18} />
          </button>
          <div className={styles.headerTitleArea}>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {work.title}
            </motion.h1>
            <div className={styles.meta}>
              <span>{work.category?.name || "General"}</span>
              <span>•</span>
              <span>{t(work.jobType || "Full-Time")}</span>
              <span>•</span>
              <span>{work.appliedCount || 0} {t("متقدمين")}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'details' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('details')}
          >
            {t("تفاصيل العمل")}
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'applicants' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('applicants')}
          >
            {t("المتقدمين")}
          </button>
        </div>
      </header>

      <main className={styles.content}>
        <AnimatePresence mode="wait">
          {activeTab === 'details' ? (
            <motion.div 
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={styles.detailsView}
            >
              <div className={styles.mainSection}>
                <section className={styles.card}>
                  <h3 className={styles.sectionTitle}><Info size={18} /> {t("وصف العمل")}</h3>
                  <div className={styles.checklist}>
                    {work.description?.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                      <div key={i} className={styles.checkItem}>
                        <CheckCircle2 size={16} className={styles.checkIcon} />
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.card}>
                  <h3 className={styles.sectionTitle}><Target size={18} /> {t("المهارات المطلوبة")}</h3>
                  <div className={styles.skillsGrid}>
                    {work.skills?.map((skill: string) => (
                      <span key={skill} className={styles.skillTag}>{t(skill)}</span>
                    ))}
                    {(!work.skills || work.skills.length === 0) && <p className={styles.metaText}>{t("لم يتم تحديد مهارات")}</p>}
                  </div>
                </section>

                {work.images && work.images.length > 0 && (
                  <section className={styles.card}>
                    <h3 className={styles.sectionTitle}><Camera size={18} /> {t("صور توضيحية")}</h3>
                    <div className={styles.imageGallery}>
                      {work.images.map((img: string, i: number) => (
                        <div key={i} className={styles.galleryItem}>
                          <img src={img.startsWith('http') ? img : `${API_BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`} alt={`Work ${i}`} />
                          <div className={styles.galleryOverlay}>
                            <span>{t("صورة")} {i + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className={styles.sideSection}>
                <section className={styles.card}>
                  <h3 className={styles.sectionTitle}><MapPin size={18} /> {t("مكان العمل")}</h3>
                  <p className={styles.sectionText}>{work.address}</p>
                </section>

                <section className={styles.card}>
                  <h3 className={styles.sectionTitle}><Clock size={18} /> {t("أيام العمل")}</h3>
                  <div className={styles.workTimeInfo}>
                    <span>{work.workTime?.map((d: string) => t(d)).join(', ') || t("غير محدد")}</span>
                  </div>
                </section>

                <section className={styles.card}>
                  <h3 className={styles.sectionTitle}><DollarSign size={18} /> {t("الميزانية")}</h3>
                  <p style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>
                    {work.salary || work.salaryMax || 0} EGP
                  </p>
                </section>
              </aside>
            </motion.div>
          ) : (
            <motion.div 
              key="applicants"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={styles.applicantsView}
            >
              <div className={styles.applicantsHeader}>
                <h2>{t("إجمالي المتقدمين")}: {applicants.length}</h2>
                <div className={styles.applicantsActions}>
                  <div className={styles.searchWrapper}>
                    <Search size={18} />
                    <input type="text" className={styles.searchBar} placeholder={t("البحث في المتقدمين...")} />
                  </div>
                </div>
              </div>

              <div className={styles.tableCard}>
                <table className={styles.applicantsTable}>
                  <thead>
                    <tr>
                      <th>{t("المتقدم")}</th>
                      <th>{t("التواصل")}</th>
                      <th>{t("الحالة")}</th>
                      <th>{t("الإجراءات")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isAppsLoading ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}><div className={styles.spinner}></div></td></tr>
                    ) : applicants.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>{t("لا يوجد متقدمين حتى الآن")}</td></tr>
                    ) : applicants.map((app) => (
                      <tr key={app.applicationId}>
                        <td>
                          <div className={styles.applicantInfo}>
                            <img src={app.user?.avatarUrl?.startsWith('http') ? app.user.avatarUrl : `${API_BASE_URL}${app.user?.avatarUrl}`} alt="" className={styles.avatar} />
                            <div>
                              <div className={styles.name}>{app.user?.fullName || "متقدم مجهول"}</div>
                              <div className={styles.metaText}>{app.user?.city || "القاهرة"}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={styles.phone}>{app.user?.phone || "01xxxxxxxxx"}</div>
                        </td>
                        <td>
                          <span className={`${styles.skillTag} ${app.status === 'accepted' ? styles.approvedBtn : app.status === 'rejected' ? styles.rejectedBtn : ''}`}>
                            {t(app.status || "قيد الانتظار")}
                          </span>
                        </td>
                        <td>
                          <div className={styles.tableActions}>
                            <button 
                              className={`${styles.actionBtn} ${styles.chatBtn}`}
                              onClick={() => navigate('/chat', { state: { preselectedUser: app.user } })}
                              title={t("تواصل")}
                            >
                              <MessageSquare size={18} />
                            </button>
                            <button 
                              className={styles.detailsBtn}
                              onClick={() => navigate(`/WorkApplicantDetails/${app.applicationId}`)}
                            >
                              {t("التفاصيل")}
                            </button>
                            <button 
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              onClick={() => handleDeleteApplication(app.applicationId)}
                              title={t("حذف")}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default WorkDetails;
