import React, { useEffect, useRef, useState, useMemo } from "react";
import styles from "./HelpSection.module.css";
import { useTranslation } from "../../../context/translation-context";
import image from "../../../assets/Img/Gemini_Generated_Image_lk4biqlk4biqlk4b.png";
import { CheckCircle, Smile, Users, Award } from "lucide-react";

interface MappedStat {
  label: string;
  value: string;
  icon: JSX.Element;
}

export const HelpSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const { t } = useTranslation();
  const iconMap: Record<string, JSX.Element> = useMemo(() => ({
    "smile": <Smile size={20} />,
    "check-circle": <CheckCircle size={20} />,
    "users": <Users size={20} />,
    "award": <Award size={20} />,
  }), []);

  const stats: MappedStat[] = useMemo(() => {
    const MOCK_STATS_DATA = [
      { label: t("عميل سعيد"), value: "500+", icon: "smile" },
      { label: t("وظيفة مكتملة"), value: "1,200+", icon: "check-circle" },
      { label: t("مستخدم نشط"), value: "10k+", icon: "users" },
      { label: t("جائزة تميز"), value: "15", icon: "award" },
    ];

    return MOCK_STATS_DATA.map((s) => ({
      label: s.label,
      value: s.value,
      icon: iconMap[s.icon] || <CheckCircle size={20} />,
    }));
  }, [iconMap]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -100px 0px",
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className={styles.helpSection} ref={sectionRef}>
      <div className={styles.helpContainer}>
        <div
          className={`${styles.helpContent} ${isVisible ? styles.visible : ""}`}
        >
          <div className={styles.helpTextSide}>
            <div className={styles.helpBadge}>
              <CheckCircle size={18} />
              <span>{t("موثوق به")}</span>
            </div>

            <h2>
              {t("نحن نؤمن")} <span>{t("بالابتكار الرقمي")}</span>
            </h2>

            <p>
              {t("مهمتنا هي تمكين كل فرد من الوصول إلى الفرصة التي يستحقها، من خلال تقنيات حديثة وتواصل فعال يكسر الحواجز.")}
            </p>

            <div className={styles.helpStats}>
              {stats.map((stat, idx) => (
                <div key={idx} className={styles.statItem}>
                  <div className={styles.statIcon}>{stat.icon}</div>
                  <span className={styles.statNumber}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>

            <div className={styles.authorInfo}>
              <div className={styles.authorAvatar}>
                <img src={image} alt="Farah Mody" />
              </div>
              <div className={styles.authorDetails}>
                <strong>Farah Mody</strong>
                <span>{t("مديرة العمليات")}</span>
              </div>
            </div>
          </div>

          <div className={styles.helpImageSide}>
            <div className={styles.floatingBlob}>
              <div className={styles.blobShape}>
                <img src={image} alt="Director" />
              </div>
              <div className={styles.experienceBadge}>
                <span className={styles.expNumber}>10+</span>
                <span>{t("سنوات من التميز")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
