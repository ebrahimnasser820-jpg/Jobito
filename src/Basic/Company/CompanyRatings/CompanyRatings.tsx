import React, { useState, useEffect } from "react";
import { useTranslation } from "../../../context/translation-context";
import { useJobitoAuth } from "../../../context/LinkContxt";
import styles from "./CompanyRatings.module.css";
import { Star, CheckCircle } from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import { Link } from "react-router-dom";

import { API_BASE_URL } from "../../../services/api";

const API = API_BASE_URL;

interface Rating {
  ratingId: number;
  ratingValue: number;
  comment: string;
  createdAt: string;
  user?: {
    userId: string;
    fullName?: string;
    name?: string;
    avatarUrl?: string;
  };
  targetUser?: {
    userId: string;
    fullName?: string;
    name?: string;
    avatarUrl?: string;
  };
  jobId?: number;
  job?: {
    jobId: number;
    title?: string;
    titleEn?: string;
  };
}

interface Application {
  applicationId: number;
  status: string;
  appliedAt: string;
  job: {
    jobId: number;
    title: string;
  };
  user: {
    userId: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    phone?: string;
  };
}

const CompanyRatings: React.FC = () => {
  const { t } = useTranslation();
  const { apiFetch, user } = useJobitoAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"received" | "given">("received");
  const [receivedRatings, setReceivedRatings] = useState<Rating[]>([]);
  const [givenRatings, setGivenRatings] = useState<Rating[]>([]);
  const [hiredApplicants, setHiredApplicants] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<number | null>(null);

  // States for interactive rating
  const [hoveredStarId, setHoveredStarId] = useState<{ userId: string; star: number } | null>(null);
  const [pendingRatings, setPendingRatings] = useState<Record<string, { ratingValue: number; comment: string }>>({});
  const [submittingRating, setSubmittingRating] = useState<string | null>(null);
  const [now, setNow] = useState(new Date().getTime());

  // Dynamic clock update for the countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date().getTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);
        if (user?.classification === "tradesman") {
          // For Tradesman
          if (user?.userId || user?.id) {
            const uId = user.userId || user.id;
            // Fetch Received Ratings
            const receivedRes = await apiFetch(`${API}/ratings/user/${uId}`);
            if (receivedRes.ok) setReceivedRatings(await receivedRes.json());
            
            // Fetch Given Ratings (if tradesman has company/is posting work)
            const hiredRes = await apiFetch(`${API}/applications/user/hired`);
            console.log(`🔍 [CompanyRatings] hiredRes status: ${hiredRes.status}`);
            if (hiredRes.ok) {
              const hiredData = await hiredRes.json();
              console.log(`✅ [CompanyRatings] Hired applicants:`, hiredData);
              setHiredApplicants(hiredData);
            } else {
              console.error(`❌ [CompanyRatings] Failed to fetch hired applicants: ${hiredRes.status} ${hiredRes.statusText}`);
            }

            const givenRes = await apiFetch(`${API}/ratings/user/${uId}/given`);
            if (givenRes.ok) setGivenRatings(await givenRes.json());
          }
        } else {
          // For Company
          const profileRes = await apiFetch(`${API}/companies/my/profile`);
          if (!profileRes.ok) throw new Error("Failed to load profile");
          const profileData = await profileRes.json();
          const cId = profileData.companyId || profileData.id || profileData.company_id;
          setCompanyId(cId);

          if (cId) {
            // Fetch Received Ratings
            const receivedRes = await apiFetch(`${API}/ratings/company/${cId}`);
            if (receivedRes.ok) setReceivedRatings(await receivedRes.json());

            // Fetch Given Ratings
            const givenRes = await apiFetch(`${API}/ratings/company/${cId}/given`);
            if (givenRes.ok) setGivenRatings(await givenRes.json());

            // Fetch Hired Applicants
            const hiredRes = await apiFetch(`${API}/applications/company/${cId}/hired`);
            if (hiredRes.ok) setHiredApplicants(await hiredRes.json());
          }
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [apiFetch, user]);

  const getAvatarUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    return `${API}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handleStarHover = (userId: string, star: number) => {
    setHoveredStarId({ userId, star });
  };

  const handleStarClick = (userId: string, star: number) => {
    setPendingRatings(prev => ({
      ...prev,
      [userId]: { ...prev[userId], ratingValue: star, comment: prev[userId]?.comment || "" }
    }));
  };

  const handleCommentChange = (userId: string, comment: string) => {
    setPendingRatings(prev => ({
      ...prev,
      [userId]: { ...prev[userId], ratingValue: prev[userId]?.ratingValue || 0, comment }
    }));
  };

  const submitRating = async (userId: string) => {
    if (!companyId && user?.role !== "tradesman" && user?.classification !== "tradesman") return;
    const ratingData = pendingRatings[userId];
    if (!ratingData || ratingData.ratingValue === 0) {
      showToast(t("الرجاء اختيار عدد النجوم أولاً", "Please select a star rating first"), "error");
      return;
    }

    try {
      setSubmittingRating(userId);
      const res = await apiFetch(`${API}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: companyId,
          targetUserId: userId,
          ratingValue: ratingData.ratingValue,
          comment: ratingData.comment,
          raterType: companyId ? "COMPANY" : "USER"
        })
      });

      if (res.ok) {
        showToast(t("تم إرسال التقييم بنجاح", "Rating submitted successfully"), "success");
        // Refresh given ratings
        const uId = user?.userId || user?.id;
        const endpoint = companyId ? `${API}/ratings/company/${companyId}/given` : `${API}/ratings/user/${uId}/given`;
        const givenRes = await apiFetch(endpoint);
        if (givenRes.ok) setGivenRatings(await givenRes.json());
      } else {
        const errData = await res.json().catch(() => null);
        const errMsg = errData?.message || t("حدث خطأ أثناء إرسال التقييم", "Failed to submit rating");
        showToast(errMsg, "error");
      }
    } catch (error) {
      console.error(error);
      showToast(t("حدث خطأ أثناء إرسال التقييم", "Failed to submit rating"), "error");
    } finally {
      setSubmittingRating(null);
    }
  };

  const renderStars = (value: number) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star
        key={idx}
        className={`${styles.star} ${idx < value ? styles.starFilled : ""}`}
        fill={idx < value ? "currentColor" : "none"}
        size={18}
      />
    ));
  };

  const renderInteractiveStars = (userId: string, existingValue: number) => {
    const currentValue = pendingRatings[userId]?.ratingValue || existingValue || 0;
    const hoverValue = hoveredStarId?.userId === userId ? hoveredStarId.star : 0;
    const displayValue = hoverValue || currentValue;

    return Array.from({ length: 5 }).map((_, idx) => {
      const starValue = idx + 1;
      return (
        <Star
          key={idx}
          className={`${styles.star} ${styles.interactiveStar} ${starValue <= displayValue ? styles.starFilled : ""}`}
          fill={starValue <= displayValue ? "currentColor" : "none"}
          size={24}
          onMouseEnter={() => handleStarHover(userId, starValue)}
          onMouseLeave={() => setHoveredStarId(null)}
          onClick={() => handleStarClick(userId, starValue)}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
        />
      );
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("التقييمات", "Ratings")}</h1>
        <p className={styles.subtitle}>
          {t("إدارة التقييمات التي تلقيتها وتقييم الأشخاص الذين وظفتهم", "Manage ratings you received and rate people you hired")}
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${activeTab === "received" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("received")}
        >
          {t("التقييمات المستلمة", "Received Ratings")} ({receivedRatings.length})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "given" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("given")}
        >
          {t("تقييم المقبولين", "Rate Accepted Applicants")} ({hiredApplicants.length})
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>{t("جاري التحميل...", "Loading...")}</div>
      ) : activeTab === "received" ? (
        (() => {
          const displayedRatings = receivedRatings;
            
          return displayedRatings.length === 0 ? (
            <div className={styles.noData}>
              {user?.classification === "tradesman"
                ? t("لم يقم أحد بتقييمك حتى الآن.", "No one has rated you yet.")
                : t("لم يقم أحد بتقييم شركتك حتى الآن.", "No one has rated your company yet.")}
            </div>
          ) : (
            <div className={styles.receivedGrid}>
              {displayedRatings.map((rating) => (
              <div key={rating.ratingId} className={styles.receivedCard}>
                <div className={styles.raterInfo}>
                  {rating.raterUser?.avatarUrl || rating.raterCompany?.logoUrl || rating.user?.avatarUrl || rating.company?.logoUrl ? (
                    <img
                      src={getAvatarUrl(rating.raterUser?.avatarUrl || rating.raterCompany?.logoUrl || rating.user?.avatarUrl || rating.company?.logoUrl)}
                      alt={rating.raterUser?.name || rating.raterUser?.fullName || rating.raterCompany?.name || rating.user?.name || rating.user?.fullName || rating.company?.name}
                      className={styles.raterAvatar}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {(rating.raterUser?.name || rating.raterUser?.fullName || rating.raterCompany?.name || rating.user?.name || rating.user?.fullName || rating.company?.name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={styles.raterName}>
                    {rating.raterUser?.name || rating.raterUser?.fullName || rating.raterCompany?.name || rating.user?.name || rating.user?.fullName || rating.company?.name || t("مستخدم غير معروف", "Unknown User")}
                  </div>
                  {rating.job && (
                    <div className={styles.jobTitleRating}>
                      {t("وظيفة:", "Job:")}{" "}
                      <Link to={`/Job details/${rating.job.jobId}`} className={styles.jobLink}>
                        {rating.job.title || rating.job.titleEn}
                      </Link>
                    </div>
                  )}
                  <div className={styles.ratingDate}>
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className={styles.receivedStars}>{renderStars(rating.ratingValue)}</div>
                {rating.comment && <div className={styles.receivedComment}>{rating.comment}</div>}
              </div>
            ))}
          </div>
          );
        })()
      ) : (
        <div className={styles.ratingsList}>
          {hiredApplicants.length === 0 ? (
            <div className={styles.noData}>
              {t("لم تقم بتوظيف أي شخص حتى الآن لتقييمه.", "You haven't hired anyone yet to evaluate.")}
            </div>
          ) : (
            hiredApplicants.map((app) => {
              const existingRating = givenRatings.find(r => r.targetUser?.userId === app.user.userId);
              const unlockDurationInMs = user?.classification === "tradesman" 
                ? 1 * 24 * 60 * 60 * 1000 // 1 day for tradesman
                : 7 * 24 * 60 * 60 * 1000; // 7 days for company
              const hiringDate = new Date(app.appliedAt).getTime();
              const unlockDate = hiringDate + unlockDurationInMs;
              const isLocked = now < unlockDate;
              
              const timeLeftToUnlock = (() => {
                if (!isLocked) return null;
                const diff = unlockDate - now;
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                return { days, hours, minutes, seconds };
              })();

              return (
                <div key={app.applicationId} className={styles.horizontalRatingRow}>
                  <div className={styles.userSection}>
                    <img
                      src={app.user.avatarUrl ? (app.user.avatarUrl.startsWith('http') ? app.user.avatarUrl : `${API}${app.user.avatarUrl}`) : `https://api.dicebear.com/7.x/initials/svg?seed=${app.user.fullName}`}
                      alt={app.user.fullName}
                      className={styles.avatar}
                    />
                    <div className={styles.nameInfo}>
                      <span className={styles.fullName}>{app.user.fullName}</span>
                      <span className={styles.email}>{app.user.email}</span>
                    </div>
                  </div>

                  <div className={styles.detailsSection}>
                    <div className={styles.badgeHired}>{t("تم التوظيف", "Hired")}</div>
                    <div className={styles.dateText}>{new Date(app.appliedAt).toLocaleDateString()}</div>
                    <div className={styles.phoneText}>{app.user.phone || "—"}</div>
                  </div>

                  <div className={styles.ratingInputSection}>
                    {isLocked && !existingRating ? (
                      <div className={styles.lockedMessage}>
                        <span>{t("التقييم متاح خلال:", "Rating available in:")}</span>
                        <span className={styles.compactTimer}>
                          {timeLeftToUnlock?.days}{t("ي", "d")} {timeLeftToUnlock?.hours}{t("س", "h")}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className={styles.starsRow}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={18}
                              fill={star <= (pendingRatings[app.user.userId]?.ratingValue || existingRating?.ratingValue || 0) ? "#f59e0b" : "none"}
                              stroke={star <= (pendingRatings[app.user.userId]?.ratingValue || existingRating?.ratingValue || 0) ? "#f59e0b" : "#7C8493"}
                              style={{ cursor: !existingRating ? 'pointer' : 'default' }}
                              onClick={() => !existingRating && handleStarClick(app.user.userId, star)}
                            />
                          ))}
                        </div>
                        <input
                          type="text"
                          className={styles.commentInput}
                          placeholder={t("أضف تعليقاً...", "Add a comment...")}
                          value={pendingRatings[app.user.userId]?.comment !== undefined ? pendingRatings[app.user.userId].comment : (existingRating?.comment || "")}
                          onChange={(e) => !existingRating && handleCommentChange(app.user.userId, e.target.value)}
                          disabled={!!existingRating}
                        />
                      </>
                    )}
                  </div>

                  <div className={styles.actionSection}>
                    {existingRating ? (
                      <div className={styles.finalizedLabel}>
                        <CheckCircle size={16} color="#10b981" />
                        <span>{t("تم التقييم", "Rated")}</span>
                      </div>
                    ) : isLocked ? (
                      <div className={styles.statusWait}>
                        <span className={styles.badgeWait}>{t("انتظار", "Waiting")}</span>
                      </div>
                    ) : (
                      <button 
                        className={styles.compactSubmitBtn}
                        onClick={() => submitRating(app.user.userId)}
                        disabled={submittingRating === app.user.userId}
                      >
                        {submittingRating === app.user.userId ? "..." : t("تقييم", "Rate")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyRatings;
