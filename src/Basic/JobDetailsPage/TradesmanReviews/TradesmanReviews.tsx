import React, { useState, useEffect } from "react";
import { useTranslation } from "../../../context/translation-context";
import { Star } from "lucide-react";
import { useJobitoAuth } from "../../../context/LinkContxt";
import styles from "./TradesmanReviews.module.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface TradesmanReviewsProps {
  userId: string;
}

export const TradesmanReviews: React.FC<TradesmanReviewsProps> = ({ userId }) => {
  const { t } = useTranslation();
  const { apiFetch } = useJobitoAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`${API_BASE_URL}/ratings/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (e) {
        console.error("Error fetching tradesman reviews", e);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [userId, apiFetch]);

  const getAvatarUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const renderStars = (value: number) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star
        key={idx}
        className={`${styles.star} ${idx < value ? styles.starFilled : ""}`}
        fill={idx < value ? "currentColor" : "none"}
        size={16}
      />
    ));
  };

  if (loading) return null;
  if (reviews.length === 0) return null; // Don't show the section if no reviews

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {t("آراء وتقييمات العملاء", "Customers Reviews")} ({reviews.length})
      </h2>
      
      <div className={styles.reviewsGrid}>
        {reviews.map((rating, idx) => (
          <div key={idx} className={styles.reviewCard}>
            <div className={styles.cardHeader}>
              <div className={styles.userInfo}>
                {rating.user?.avatarUrl || rating.company?.logoUrl ? (
                  <img
                    src={getAvatarUrl(rating.user?.avatarUrl || rating.company?.logoUrl)}
                    alt={rating.user?.name || rating.user?.fullName || rating.company?.name || "?"}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {(rating.user?.name || rating.user?.fullName || rating.company?.name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className={styles.userName}>
                    {rating.user?.name || rating.user?.fullName || rating.company?.name || t("مستخدم غير معروف")}
                  </div>
                  <div className={styles.date}>
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className={styles.stars}>
                {renderStars(rating.ratingValue)}
              </div>
            </div>
            
            {rating.comment && (
              <p className={styles.comment}>
                "{rating.comment}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
