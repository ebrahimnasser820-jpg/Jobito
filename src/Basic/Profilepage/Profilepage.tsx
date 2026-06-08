import { useState, useEffect } from "react";
import styles from "./Profilepage.module.css";
import { useJobitoAuth } from "../../context/LinkContxt";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../context/translation-context";
import { useToast } from "../../context/ToastContext";
import type {
  ExperienceItem as Experience,
  EducationItem as Education,
} from "../../context/LinkContxt";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const BriefcaseIcon = () => (
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
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const GraduationIcon = () => (
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
    <path d="M22 10L12 5 2 10l10 5 10-5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const PlusIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const MailIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const PhoneIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const GlobeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const InstagramIcon = () => (
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
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const TwitterIcon = () => (
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
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);
const Share2Icon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const getAvatarUrl = (path: string | undefined | null) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

import { useParams } from "react-router-dom";

export default function ProfilePage() {
  const { user, apiFetch } = useJobitoAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [showMoreExp, setShowMoreExp] = useState(false);
  const [showMoreEdu, setShowMoreEdu] = useState(false);
  const [ratings, setRatings] = useState<any[]>([]);

  const [showReportInput, setShowReportInput] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const endpoint = id ? `${API_BASE_URL}/users/${id}` : `${API_BASE_URL}/users/me`;
        const response = await apiFetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          
          try {
            const ratingsRes = await apiFetch(`${API_BASE_URL}/ratings/user/${data.userId || data.id}`);
            if (ratingsRes.ok) {
              setRatings(await ratingsRes.json());
            }
          } catch(e) {
            console.error("Failed to fetch user ratings", e);
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    fetchProfile();
  }, [apiFetch, id]);

  const { showToast } = useToast();
  const [hasReported, setHasReported] = useState(false);

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    setIsReporting(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/content/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterUserId: user?.userId || user?.id,
          postOwnerId: id || user?.userId || user?.id,
          postOwnerName: profileUser?.fullName || profileUser?.name,
          contentType: "profile",
          contentId: id || user?.userId || user?.id,
          reason: "other",
          customReason: reportReason,
        }),
      });
      if (res.ok) {
        showToast(t("تم إرسال البلاغ بنجاح وسيتم مراجعته من قبل الإدارة."));
        setHasReported(true);
        setShowReportInput(false);
        setReportReason("");
      }
    } catch (err) {
      console.error("Failed to submit report", err);
      showToast(t("حدث خطأ أثناء إرسال البلاغ."), "error");
    } finally {
      setIsReporting(false);
    }
  };

  const profileUser = profile || user;
  
  // Sync classification from context to profile state if context user changes
  useEffect(() => {
    if (user?.classification && profile && profile.classification !== user.classification) {
      setProfile(prev => prev ? { ...prev, classification: user.classification } : null);
    }
  }, [user?.classification, profile]);

  const experiences = (profileUser?.experiences || []) as Experience[];
  const educations = (profileUser?.educations || []) as Education[];
  const skills = profileUser?.skills || [];
  const portfolios = (profileUser?.portfolios || []) as string[];
  const services = profileUser?.services || [];
  const socialLinks = profileUser?.socialLinks || {
    instagram: "",
    twitter: "",
    linkedin: "",
    github: "",
  };

  const displayName =
    t(profileUser?.fullName || "") || t(profileUser?.name || "") || t("اسم المستخدم");
  const displayAvatar = profileUser?.avatarUrl || profileUser?.avatar;
  const displayBio = t(profileUser?.bio || "") || t("أضف نبذة عن نفسك...");
  const displayLocation = t(profileUser?.location || "") || t("الموقع غير محدد");

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={`${styles.card} ${styles.heroCard}`}>
          <div
            className={styles.heroBanner}
            style={{
              backgroundImage: profileUser?.banner_url
                ? `url(${getAvatarUrl(profileUser.banner_url)})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          <div className={styles.heroBody}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatar}>
                {displayAvatar ? (
                  <img src={getAvatarUrl(displayAvatar) || ""} alt="avatar" />
                ) : (
                  displayName[0] || "U"
                )}
              </div>
            </div>
            <div className={styles.heroInfo}>
              <div className={styles.heroName} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {displayName}
                {ratings.length > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "1rem", color: "#FFB020", background: "rgba(255, 176, 32, 0.15)", padding: "2px 8px", borderRadius: "12px", fontWeight: "600" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {(ratings.reduce((sum, r) => sum + r.ratingValue, 0) / ratings.length).toFixed(1)}
                  </span>
                )}

                {/* Report Button */}
                {id && (
                  <button 
                    onClick={() => !hasReported && setShowReportInput(!showReportInput)}
                    disabled={hasReported}
                    style={{ 
                      background: hasReported ? "rgba(16, 185, 129, 0.1)" : "rgba(220, 38, 38, 0.1)", 
                      color: hasReported ? "#10b981" : "#dc2626", 
                      border: `1px solid ${hasReported ? "rgba(16, 185, 129, 0.2)" : "rgba(220, 38, 38, 0.2)"}`, 
                      padding: "4px 12px", 
                      borderRadius: "8px", 
                      fontSize: "0.85rem", 
                      fontWeight: "600",
                      cursor: hasReported ? "default" : "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {hasReported ? t("تم الإبلاغ") : t("إبلاغ")}
                  </button>
                )}
              </div>

              {/* Report Input Area */}
              {showReportInput && (
                <div style={{ marginTop: '10px', width: '100%', maxWidth: '300px' }}>
                  <input 
                    type="text" 
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder={t("ما هو سبب الإبلاغ؟")}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      border: '1px solid #ddd', 
                      fontSize: '0.9rem',
                      outline: 'none',
                      marginBottom: '8px'
                    }}
                  />
                  <button 
                    onClick={handleReport}
                    disabled={isReporting || !reportReason.trim()}
                    style={{ 
                      background: "#dc2626", 
                      color: "#fff", 
                      border: "none", 
                      padding: "6px 16px", 
                      borderRadius: "6px", 
                      fontSize: "0.85rem", 
                      cursor: "pointer",
                      opacity: (isReporting || !reportReason.trim()) ? 0.6 : 1
                    }}
                  >
                    {isReporting ? t("جاري الإرسال...") : t("إرسال البلاغ")}
                  </button>
                </div>
              )}
              <div className={styles.heroRole}>
                {profileUser?.role === "company"
                  ? t("حساب شركة")
                  : profileUser?.classification === "tradesman"
                  ? t("صنايعي")
                  : t("باحث عن عمل")}
              </div>
              <div className={styles.heroLoc}>
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                {t(displayLocation)}
              </div>
            </div>
            <div className={styles.heroActions}>
              {!id && (
                <button
                  className={styles.editProfileBtn}
                  onClick={() => navigate("/edit-profile")}
                >
                  {t("تعديل الملف الشخصي")}
                </button>
              )}
              <div className={styles.openBadge}>
                <div className={styles.openDot} />
                {t("متاح للفرص")}
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{t("نبذة عني")}</span>
            </div>
            <div
              className={`${styles.aboutText} ${aboutExpanded ? styles.expanded : styles.collapsed}`}
            >
              {displayBio}
            </div>
            <button
              className={styles.showMore}
              onClick={() => setAboutExpanded((e) => !e)}
            >
              {aboutExpanded ? t("عرض أقل ↑") : t("عرض المزيد ↓")}
            </button>
          </div>
        </div>

        {/* Experiences */}
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{t("الخبرات")}</span>
            </div>
             {experiences
              .slice(0, showMoreExp ? undefined : 4)
              .map((exp, idx) => (
                <div className={styles.expItem} key={idx}>
                  <div className={styles.expLogo}>
                    <BriefcaseIcon />
                  </div>
                  <div className={styles.expContent}>
                    <div className={styles.expTop}>
                      <div>
                        <div className={styles.expTitle}>{t(exp.role || "")}</div>
                        <div className={styles.expCompany}>{t(exp.period || "")}</div>
                        <div className={styles.expLoc}>{t(exp.location || "")}</div>
                      </div>
                    </div>
                    {exp.desc && (
                      <div className={styles.expDesc}>{t(exp.desc)}</div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
        {/* Education */}
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{t("التعليم")}</span>
            </div>
            {educations
              .slice(0, showMoreEdu ? undefined : 4)
              .map((edu, idx) => (
                <div className={styles.expItem} key={idx}>
                  <div className={styles.expLogo}>
                    <GraduationIcon />
                  </div>
                  <div className={styles.expContent}>
                    <div className={styles.expTop}>
                      <div>
                        <div className={styles.eduSchool}>{t(edu.school || "")}</div>
                        <div className={styles.eduDegree}>{t(edu.degree || "")}</div>
                        <div className={styles.eduPeriod}>{t(edu.period || "")}</div>
                        <div className={styles.expLoc}>{t(edu.location || "")}</div>
                      </div>
                    </div>
                    {edu.desc && (
                      <div className={styles.eduDesc}>{t(edu.desc)}</div>
                    )}
                  </div>
                </div>
              ))}
            {educations.length === 0 && (
              <div className={styles.detailVal}>{t("غير محدد")}</div>
            )}
            {educations.length > 4 && (
              <button
                className={styles.showMore}
                onClick={() => setShowMoreEdu((e) => !e)}
              >
                {showMoreEdu ? t("عرض أقل ↑") : t("عرض المزيد ↓")}
              </button>
            )}
          </div>
        </div>


        {/* Skills */}
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{t("المهارات")}</span>
            </div>
             <div className={styles.skillsWrap}>
              {skills.map((s) => (
                <div className={styles.skillTag} key={s}>
                  {t(s || "")}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Serves Section - Only for Tradesmen */}
        {profileUser?.classification === "tradesman" && services.length > 0 && (
          <div className={styles.card}>
            <div className={styles.cardBody}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>{t("Serves")}</span>
              </div>
              <div className={styles.servesList}>
                {services.map((srv: string, idx: number) => (
                  <div key={idx} className={styles.servesItem}>
                    {t(srv)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Portfolio */}
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{t("المعرض")}</span>
            </div>
            <div className={styles.portfolioGrid}>
              {portfolios.map((img, idx) => (
                <div className={styles.portfolioItem} key={idx}>
                  <img
                    src={getAvatarUrl(img) || ""}
                    alt={`Gallery ${idx}`}
                    className={styles.portfolioImg}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Ratings */}
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{t("تقييمات الشركات والعملاء")}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ratings.length > 0 ? (
                ratings.map((rev, idx) => {
                  const raterName = rev.raterUser?.name || rev.raterUser?.fullName || rev.raterCompany?.name || rev.user?.name || rev.user?.fullName || rev.company?.name || "مستخدم غير معروف";
                  const raterAvatar = rev.raterUser?.avatarUrl || rev.raterCompany?.logoUrl || rev.user?.avatarUrl || rev.company?.logoUrl;
                  
                  return (
                  <div key={idx} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border, #eee)', background: 'var(--bg-card, #fff)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
                      <img
                        src={getAvatarUrl(raterAvatar) || `https://api.dicebear.com/7.x/identicon/svg?seed=${raterName}`}
                        alt={raterName}
                        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{t(raterName)}</div>
                        <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} style={{ color: rev.ratingValue >= star ? "#FFD700" : "#E0E0E0", width: 14, height: 14 }} viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {rev.comment && <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rev.comment}</p>}
                  </div>
                  );
                })
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{t("لا توجد تقييمات من الشركات حتى الآن.")}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT ===== */}
      <div className={styles.right}>
        {/* Additional Details */}
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{t("تفاصيل إضافية")}</span>
            </div>
            {[
              {
                icon: <MailIcon />,
                label: t("البريد الإلكتروني"),
                val: t(profileUser?.email || "") || t("غير محدد"),
              },
              {
                icon: <PhoneIcon />,
                label: t("الهاتف"),
                val: t(profileUser?.phone || "") || t("غير محدد"),
              },

            ].map((d) => (
              <div className={styles.detailRow} key={d.label}>
                <div className={styles.detailIcon}>{d.icon}</div>
                <div>
                  <div className={styles.detailLabel}>{d.label}</div>
                  <div className={styles.detailVal}>{d.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links - only show if at least one link exists */}
        {(() => {
          const linksArray = Array.isArray(profileUser?.socialLinks)
            ? profileUser.socialLinks
            : (profileUser?.socialLinks ? Object.values(profileUser.socialLinks).filter(Boolean) : []);
            
          const activeLinks = linksArray.filter((link: any) => typeof link === 'string' && link.trim() !== "");
          
          if (activeLinks.length === 0) return null;

          return (
            <div className={styles.card}>
              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>{t("روابط التواصل الاجتماعي")}</span>
                </div>
                {activeLinks.map((link: string, idx: number) => (
                  <div className={styles.socialRow} key={idx} style={{ padding: "8px 0" }}>
                    <a
                      className={styles.socialLink}
                      href={link.startsWith("http") ? link : `https://${link}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: "0.95rem", wordBreak: "break-all", color: "var(--primary-color, #2563eb)", textDecoration: "none" }}
                    >
                      {link}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
