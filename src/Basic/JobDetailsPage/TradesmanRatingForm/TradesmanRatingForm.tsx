import React, { useState } from "react";
import { useTranslation } from "../../../context/translation-context";
import { useJobitoAuth } from "../../../context/LinkContxt";
import { useToast } from "../../../context/ToastContext";
import { Star } from "lucide-react";
import styles from "./TradesmanRatingForm.module.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface TradesmanRatingFormProps {
  targetUserId: string;
  tradesmanName: string;
  onRatingSubmitted: () => void;
}

export const TradesmanRatingForm: React.FC<TradesmanRatingFormProps> = ({
  targetUserId,
  tradesmanName,
  onRatingSubmitted,
}) => {
  const { t } = useTranslation();
  const { apiFetch, user } = useJobitoAuth();
  const { showToast } = useToast();

  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If the user is the tradesman themselves, don't show the form
  if (user?.userId === targetUserId || user?.id === targetUserId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      showToast(t("يرجى اختيار التقييم أولاً"), "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiFetch(`${API_BASE_URL}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          ratingValue: rating,
          comment,
          raterType: "USER",
        }),
      });

      if (res.ok) {
        showToast(t("تم إرسال التقييم بنجاح"), "success");
        setRating(0);
        setComment("");
        onRatingSubmitted();
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {t("التقييمات والآراء", "Ratings and opinions")}
        </h2>
        <div className={styles.divider}></div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>{t("أضف تقييمك", "Add your rating")}</h3>
        <p className={styles.cardSubtitle}>
          {t("شاركنا تجربتك مع", "Share your experience with")} {tradesmanName}
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
          placeholder={t("اكتب رأيك هنا...", "Write your opinion here...")}
        />

        <div className={styles.footer}>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? t("جاري الإرسال...", "Submitting...") : t("إرسال التقييم", "Submit evaluation")}
          </button>
        </div>
      </div>
    </div>
  );
};
