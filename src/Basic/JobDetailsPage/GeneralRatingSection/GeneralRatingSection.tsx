import React, { useEffect, useState } from "react";
import { useTranslation } from "../../../context/translation-context";
import { useJobitoAuth } from "../../../context/LinkContxt";
import { useToast } from "../../../context/ToastContext";
import { Star, CheckCircle2 } from "lucide-react";
import styles from "./GeneralRatingSection.module.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface GeneralRatingSectionProps {
  companyId?: string | number;
  targetUserId?: string | number;
  targetName: string;
  jobId?: string | number;
}

export const GeneralRatingSection: React.FC<GeneralRatingSectionProps> = ({
  companyId,
  targetUserId,
  targetName,
  jobId,
}) => {
  const { t } = useTranslation();
  const { apiFetch, user } = useJobitoAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      let endpoint = "";
      if (jobId) {
        endpoint = `${API_BASE_URL}/ratings/job/${jobId}`;
      } else if (companyId) {
        endpoint = `${API_BASE_URL}/ratings/company/${companyId}`;
      } else {
        endpoint = `${API_BASE_URL}/ratings/user/${targetUserId}`;
      }
      
      const res = await apiFetch(endpoint);
      if (res.ok) {
        let data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [companyId, targetUserId, jobId]);

  const hasRated = reviews.some(r => {
    const raterId = String(r.raterUserId || r.rater_user_id || r.user?.userId || r.user?.id || r.userId || r.raterId || "");
    const currentUserId = String(user?.userId || user?.id || "");
    return raterId && currentUserId && raterId === currentUserId;
  });
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.ratingValue, 0) / reviews.length).toFixed(1)
    : null;

  const handleSubmit = async () => {
    if (rating === 0) {
      showToast(t("يرجى اختيار التقييم أولاً"), "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const body: any = {
        ratingValue: rating,
        comment,
        raterType: user?.role === "company" ? "COMPANY" : "USER"
      };
      if (jobId) {
        body.jobId = jobId;
        // Optionally pass target if backend needs it, but jobId is main
        if (companyId) body.companyId = companyId;
        if (targetUserId) body.targetUserId = targetUserId;
      } else {
        if (companyId) body.companyId = companyId;
        if (targetUserId) body.targetUserId = targetUserId;
      }

      const res = await apiFetch(`${API_BASE_URL}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast(t("تم إرسال التقييم بنجاح"), "success");
        setRating(0);
        setComment("");
        fetchReviews();
      } else {
        const data = await res.json();
        showToast(data.message || t("حدث خطأ أثناء إرسال التقييم"), "error");
      }
    } catch (err) {
      showToast(t("فشل الاتصال بالخادم"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  // Don't show form if it's the owner's own job
  const isOwner = (() => {
    if (!user) return false;
    
    const userRole = user.role;
    const userCompId = user.companyId || user.company_id;

    // 1. If we are rating a COMPANY
    if (companyId) {
      // Companies CANNOT rate other companies or themselves
      if (userRole === "company") return true;
      return false; 
    }

    // 2. If we are rating a TRADESMAN (User)
    if (targetUserId) {
      const currentUserId = user.userId || user.id;
      // Users/Tradesmen CANNOT rate themselves
      if (String(currentUserId) === String(targetUserId)) return true;
      return false;
    }
    
    return false;
  })();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>
            {jobId ? t("تقييمات الوظيفة") : companyId ? t("تقييمات الشركة") : t("تقييمات مقدم الخدمة")}
          </h2>
          {avgRating && (
            <div className={styles.avgBadge}>
              <Star size={16} fill="#FFB020" color="#FFB020" />
              <span className={styles.avgValue}>{avgRating}</span>
              <span className={styles.count}>({reviews.length})</span>
            </div>
          )}
        </div>
        <div className={styles.divider}></div>
      </div>

      {!user ? (
        <div className={styles.loginPrompt}>
          <p>{t("يرجى تسجيل الدخول لتتمكن من إضافة تقييمك.")}</p>
          <button onClick={() => window.location.href = "/user-information"} className={styles.loginBtn}>
            {t("تسجيل الدخول")}
          </button>
        </div>
      ) : !isOwner && (
        <div className={styles.card}>
          {hasRated ? (
            <div className={styles.alreadyRatedBox}>
              <div className={styles.checkCircle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className={styles.alreadyRatedText}>
                {companyId 
                  ? t("لقد قمت بتقييم هذه الشركة مسبقاً") 
                  : t("لقد قمت بتقييم هذا المعلن مسبقاً")}
              </span>
            </div>
          ) : (
            <>
              <h3 className={styles.cardTitle}>{t("أضف تقييمك")}</h3>
              <p className={styles.cardSubtitle}>
                {t("شاركنا تجربتك مع")} {targetName}
              </p>

              <div className={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`${styles.star} ${(hoveredRating || rating) >= star ? styles.starFilled : ""}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    fill={(hoveredRating || rating) >= star ? "currentColor" : "none"}
                    size={32}
                  />
                ))}
              </div>

              <textarea
                className={styles.textarea}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("اكتب رأيك هنا...")}
              />

              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={isSubmitting || !rating}
              >
                {isSubmitting ? t("جاري الإرسال...") : t("إرسال التقييم")}
              </button>
            </>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className={styles.reviewsList}>
        {reviews.length === 0 ? (
          <div className={styles.noReviews}>
            <p>{t("لا توجد تقييمات بعد.")}</p>
          </div>
        ) : (
          reviews.map((rev) => {
            const rater = rev.raterUser || rev.raterCompany || rev.user || rev.company;
            const raterName = rater?.fullName || rater?.name || t("مستخدم");
            const raterAvatar = rater?.avatarUrl || rater?.logoUrl;
            
            return (
              <div key={rev.ratingId || rev.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <img 
                    src={raterAvatar ? (raterAvatar.startsWith('http') ? raterAvatar : `${API_BASE_URL}${raterAvatar}`) : `https://api.dicebear.com/7.x/initials/svg?seed=${raterName}`} 
                    alt="" 
                    className={styles.reviewAvatar} 
                  />
                  <div className={styles.reviewInfo}>
                    <div className={styles.reviewerName}>{raterName}</div>
                    <div className={styles.reviewMeta}>
                      <div className={styles.reviewStars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < rev.ratingValue ? "#FFB020" : "none"} 
                            color={i < rev.ratingValue ? "#FFB020" : "#cbd5e1"} 
                          />
                        ))}
                      </div>
                      <span className={styles.reviewDate}>
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {rev.comment && <p className={styles.reviewComment}>{rev.comment}</p>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
