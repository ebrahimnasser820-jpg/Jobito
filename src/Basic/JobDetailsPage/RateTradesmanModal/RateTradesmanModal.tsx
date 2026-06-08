import React, { useState } from "react";
import { useTranslation } from "../../../context/translation-context";
import { useJobitoAuth } from "../../../context/LinkContxt";
import { useToast } from "../../../context/ToastContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface RateTradesmanModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  tradesmanName: string;
}

export const RateTradesmanModal: React.FC<RateTradesmanModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  tradesmanName,
}) => {
  const { t } = useTranslation();
  const { apiFetch } = useJobitoAuth();
  const { showToast } = useToast();

  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
        onClose();
        window.location.reload(); // Refresh to show new rating
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
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ backgroundColor: "#0B223F", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "450px", color: "#fff", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "#a0aabf", cursor: "pointer" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "8px", fontWeight: "bold" }}>{t("تقييم الصنايعي")}</h2>
        <p style={{ color: "#a0aabf", marginBottom: "24px" }}>{t("ما هو تقييمك لخدمة")} {t(tradesmanName)}؟</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <svg 
                key={star} 
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                style={{ cursor: "pointer", color: (hoveredRating || rating) >= star ? "#FFD700" : "#4A5568" }}
                width="32" height="32" viewBox="0 0 24 24" fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "#e2e8f0" }}>{t("تعليق (اختياري)")}</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("اكتب رأيك في الخدمة المقدمة...")}
              style={{ width: "100%", padding: "12px", minHeight: "100px", borderRadius: "12px", border: "1px solid #2D3748", backgroundColor: "#1A202C", color: "#fff", outline: "none" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ width: "100%", padding: "14px", backgroundColor: "#3182ce", color: "#fff", border: "none", borderRadius: "12px", fontSize: "1rem", fontWeight: "bold", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? t("جاري الإرسال...") : t("إرسال التقييم")}
          </button>
        </form>
      </div>
    </div>
  );
};
