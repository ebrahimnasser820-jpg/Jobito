import { ArrowRight, Sparkles } from "lucide-react";
import styles from "./HeroSectionAbout.module.css";
import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../../context/translation-context";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as any },
  },
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const buttonsVariant: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as any },
  },
};

export const HeroSectionAbout = () => {
  const [isVisible, setIsVisible] = useState<any>({});
  const sectionRefs = useRef<any>({});
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const observers: any = {};

    Object.keys(sectionRefs.current).forEach((key) => {
      observers[key] = new IntersectionObserver(
        ([entry]) => {
          setIsVisible((prev: any) => ({ ...prev, [key]: entry.isIntersecting }));
        },
        { threshold: 0.2, rootMargin: "0px 0px -100px 0px" },
      );

      if (sectionRefs.current[key]) {
        observers[key].observe(sectionRefs.current[key]);
      }
    });

    return () => {
      Object.values(observers).forEach((observer: any) => observer.disconnect());
    };
  }, []);

  return (
    <section
      className={styles.heroSection}
      ref={(el) => {
        if (el) sectionRefs.current.hero = el;
      }}
    >
      {/* ── Background ── */}
      <div className={styles.heroBackground}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.floatingShapes}>
          <motion.div
            className={styles.shape1}
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          />
          <motion.div
            className={styles.shape2}
            initial={{ opacity: 0, scale: 0, rotate: 20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }}
          />
          <motion.div
            className={styles.shape3}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
          />
        </div>
      </div>

      {/* ── Content ── */}
      <motion.div
        className={`${styles.container} ${isVisible.hero ? styles.visible : ""}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.content}>

          {/* ✅ Badge */}
          <motion.div className={styles.badge} variants={fadeLeft}>
            <Sparkles size={16} />
            <span>{t("مرحباً بكم في جوبيتو")}</span>
          </motion.div>

          {/* ✅ Title */}
          <motion.h1 className={styles.title} variants={fadeUp}>
            <span className={styles.servicesWord}>{t("خدماتنا")}</span>
            <span className={styles.titleLine}>
              <span className={styles.purpleText}>{t("نحن")}</span>
              <span className={styles.blueText}>
                {t("نقدم الأفضل")}
                <svg className={styles.underline} viewBox="0 0 300 20">
                  <motion.path
                    d="M5 15 Q 40 5, 80 15 T 160 15 T 240 15 T 300 15"
                    stroke="#26A4FF"
                    fill="transparent"
                    strokeWidth="4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.7 }}
                  />
                </svg>
              </span>
            </span>
          </motion.h1>

          {/* ✅ Description */}
          <motion.p className={styles.description} variants={fadeUp}>
            {t("نحن نساعدك في العثور على الوظيفة المثالية أو اكتشاف المواهب المناسبة لشركتك. جوبيتو هو شريكك الموثوق في رحلة النجاح المهني.")}
          </motion.p>

          <motion.div className={styles.heroButtons} variants={buttonsVariant}>
            <motion.button
              className={styles.primaryButton}
              onClick={() => navigate("/user-information")}
              whileHover={{ scale: 1.04, x: 3 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              {t("ابدأ الآن")}
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
};