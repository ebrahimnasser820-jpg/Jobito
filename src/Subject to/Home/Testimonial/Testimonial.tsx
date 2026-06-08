import { useRef, useState, useEffect } from "react";
import styles from "./Testimonial.module.css";
import { useTranslation } from "../../../context/translation-context";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

type TestimonialProps = {
  img: string;
  name: string;
  username: string;
  body: string;
};

interface BackendTestimonial {
  id: string | number;
  body: string;
  bodyEn?: string;
  user?: {
    fullName?: string;
    email?: string;
    avatarUrl?: string;
  };
}

export default function Testimonial() {
  const { t } = useTranslation();
  const firstRowRef = useRef(null);
  const secondRowRef = useRef(null);
  const [reviews, setReviews] = useState<TestimonialProps[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/testimonials/featured`)
      .then((res) => res.json())
      .then((data: BackendTestimonial[]) => {
        const mapped = data.map((tItem) => ({
          img: tItem.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tItem.user?.email || tItem.id}`,
          name: tItem.user?.fullName || t("Anonymous"),
          username: tItem.user?.email || "",
          body: t(tItem.body),
        }));
        setReviews(mapped);
      })
      .catch((err) => console.error("Failed to fetch testimonials:", err));
  }, [t]);

  const ReviewCard = ({ img, name, username, body }: TestimonialProps) => (
    <figure className={styles.reviewCard}>
      <div className={styles.userinfo}>
        <img src={img} alt={t(name)} />
        <div>
          <figcaption>{t(name)}</figcaption>
          <p>{username}</p>
        </div>
      </div>
      <blockquote>{t(body)}</blockquote>
    </figure>
  );

  if (reviews.length === 0) return null;

  const midpoint = Math.ceil(reviews.length / 2);
  const firstRowData = reviews.slice(0, midpoint);
  const secondRowData = reviews.slice(midpoint);

  const displayFirstRow = [...firstRowData, ...firstRowData];
  const displaySecondRow = [...secondRowData, ...secondRowData];

  return (
    <div className={styles.testimonial}>
      <h2>{t("ماذا يقول عملاؤنا")}</h2>

      <div className={styles["marquee-container"]}>
        {displayFirstRow.length > 0 && (
          <div ref={firstRowRef} className={styles.marquee}>
            {displayFirstRow.map((review, idx) => (
              <ReviewCard key={`row1-${idx}`} {...review} />
            ))}
          </div>
        )}

        {displaySecondRow.length > 0 && (
          <div
            ref={secondRowRef}
            className={`${styles.marquee} ${styles.reverse}`}
          >
            {displaySecondRow.map((review, idx) => (
              <ReviewCard key={`row2-${idx}`} {...review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
