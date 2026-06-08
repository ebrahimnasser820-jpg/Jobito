import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Clock, Check, X, MessageSquare, Star, Info } from "lucide-react";
import styles from "./WorkApplicantDetails.module.css";
import { useTranslation } from "../../../../context/translation-context";
import { useJobitoAuth } from "../../../../context/LinkContxt";
import { useTheme } from "../../../../context/ThemeContext";
import { useToast } from "../../../../context/ToastContext";
import { API_BASE_URL } from "../../../../services/api";

const WorkApplicantDetails = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { apiFetch } = useJobitoAuth();
  const { showToast } = useToast();
  const { theme, isDark } = useTheme();
  const [app, setApp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch(`${API_BASE_URL}/applications/${id}`);
        if (res.ok) {
          const data = await res.json();
          setApp(data);
        }
      } catch (error) {
        console.error("Error fetching application details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id, apiFetch]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setApp(prev => ({ ...prev, status: newStatus }));
        showToast(t("تم تحديث الحالة بنجاح"), "success");
      }
    } catch (error) {
      showToast(t("فشل تحديث الحالة"), "error");
    }
  };

  if (isLoading) return <div className={`${styles.container} ${isDark ? styles.dark : styles.light}`}>{t("جاري التحميل...")}</div>;
  if (!app) return <div className={`${styles.container} ${isDark ? styles.dark : styles.light}`}>{t("المتقدم غير موجود")}</div>;

  const u = app.user;
  
  // Parse coverLetter for Address and Description
  let address = t("غير محدد");
  let description = app.coverLetter || "";
  
  if (app.coverLetter && app.coverLetter.includes("Address:")) {
    const parts = app.coverLetter.split("\n\nIssue Description:");
    address = parts[0].replace("Address:", "").trim();
    description = parts[1] ? parts[1].trim() : parts[0];
  }

  const applicant = {
    id: id,
    name: u?.fullName || t("مستخدم"),
    phone: u?.phone || "—",
    email: u?.email || "—",
    avatar: u?.avatarUrl ? (u.avatarUrl.startsWith('http') ? u.avatarUrl : `${API_BASE_URL}${u.avatarUrl}`) : "https://api.dicebear.com/7.x/initials/svg?seed=" + (u?.fullName || "User"),
    location: u?.location || "—",
    appliedDate: new Date(app.appliedAt).toLocaleDateString(),
    appliedTime: new Date(app.appliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    description: description,
    address: address,
    rating: u?.rating || 0,
    totalOrders: 0,
    images: app.resumeUrl ? [app.resumeUrl.startsWith('http') ? app.resumeUrl : `${API_BASE_URL}${app.resumeUrl}`] : []
  };

  const statusColors = {
    pending: styles.statusPending,
    accepted: styles.statusApproved,
    rejected: styles.statusRejected,
    reviewing: styles.statusPending,
    applied: styles.statusPending
  };

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : styles.light}`} data-theme={theme}>
      <header className={styles.header}>
        <div className={styles.topNav}>
          <button className={styles.backBtn} onClick={() => navigate(-1)} style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer'}}>
            <ArrowLeft size={24} />
          </button>
          <div className={styles.headerInfo}>
            <h1>{t("تفاصيل المتقدم للعمل")}</h1>
            <p className={styles.breadcrumb}>{t("أعمالي")} / {t("المتقدمين")} / {applicant.name}</p>
          </div>
        </div>
      </header>

      <div className={styles.contentGrid}>
        {/* Left Side: Main Info */}
        <div className={styles.mainContent}>
          <div className={styles.card}>
            <div className={styles.applicantHeader}>
              <img src={applicant.avatar} alt="" className={styles.avatar} />
              <div className={styles.info}>
                <h2>{applicant.name}</h2>
                <div className={styles.meta}>
                  <span><Star size={14} className={styles.starIcon} /> {applicant.rating}</span>
                </div>
              </div>
              <div className={`${styles.statusBadge} ${statusColors[app.status] || styles.statusPending}`}>
                {t(app.status)}
              </div>
            </div>

            <div className={styles.section}>
              <h3><Info size={18} className={styles.sectionIcon} /> {t("وصف المشكلة")}</h3>
              <p className={styles.description}>{applicant.description}</p>
              
              <div className={styles.imageGallery}>
                {applicant.images.map((img, i) => (
                  <img key={i} src={img} alt="Problem Site" className={styles.previewImage} onClick={() => window.open(img, '_blank')} style={{cursor: 'pointer'}} />
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h3><MapPin size={18} className={styles.sectionIcon} /> {t("عنوان الموقع")}</h3>
              <div className={styles.addressBox}>
                <p>{applicant.address}</p>
                <p className={styles.locationMeta}>{applicant.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Sidebar Info */}
        <div className={styles.sidebar}>
          <div className={styles.card}>
            <h3>{t("بيانات التواصل")}</h3>
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <Phone size={18} />
                <div className={styles.contactText}>
                  <span>{t("رقم الهاتف")}</span>
                  <strong>{applicant.phone}</strong>
                </div>
              </div>
              <div className={styles.contactItem}>
                <Mail size={18} />
                <div className={styles.contactText}>
                  <span>{t("البريد الإلكتروني")}</span>
                  <strong>{applicant.email}</strong>
                </div>
              </div>
              <div className={styles.contactItem}>
                <Calendar size={18} />
                <div className={styles.contactText}>
                  <span>{t("تاريخ التقديم")}</span>
                  <strong>{applicant.appliedDate}</strong>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button 
                className={styles.chatBtn} 
                onClick={() => navigate("/chat", { 
                  state: { 
                    preselectedUser: {
                      userId: u.userId,
                      fullName: u.fullName,
                      avatarUrl: u.avatarUrl
                    }
                  } 
                })}
              >
                <MessageSquare size={18} /> {t("بدء محادثة")}
              </button>
              
              {app.status === "applied" || app.status === "pending" || app.status === "reviewing" ? (
                <div className={styles.decisionBtns}>
                  <button className={styles.approveBtn} onClick={() => handleUpdateStatus("accepted")}>
                    <Check size={18} /> {t("قبول الطلب")}
                  </button>
                  <button className={styles.rejectBtn} onClick={() => handleUpdateStatus("rejected")}>
                    <X size={18} /> {t("رفض")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkApplicantDetails;
