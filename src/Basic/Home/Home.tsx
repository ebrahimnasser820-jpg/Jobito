import styles from "./home.module.css";
import heroSectionImage from "../../assets/hero-transparent-CQiEc3Un.png";
import herodarktionImage from "../../assets/hero-transparent-CQiEc3Un.png";
import Testimonial from "../../Subject to/Home/Partners/Partners";
import JobsSection from "../../Subject to/Home/JobsSection/JobsSection";
import HiringBanner from "../../Subject to/Home/HiringBanner/HiringBanner";
import Categories from "../../Subject to/Home/Categories/Categories";
import JobsDashboard from "../../Subject to/Home/JobCard/JobCard";
import TradesmanWorkflow from "../../Subject to/Home/TradesmanWorkflow/TradesmanWorkflow";
import UserWorkflow from "../../Subject to/Home/UserWorkflow/UserWorkflow";
import { motion } from "framer-motion";
import { useJobitoAuth } from "../../context/LinkContxt";
import { useTranslation } from "../../context/translation-context";
import { useTheme } from "../../context/ThemeContext";

export const Home = () => {
  const { user, isAuthenticated } = useJobitoAuth();
  const { t, language } = useTranslation();
  const { isDark } = useTheme();
  const isRTL = language === "ar";
  const isTradesman = user?.classification === "tradesman";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const blobVariants = {
    animate: (i: number) => ({
      scale: [1, 1.1, 1],
      x: i % 2 === 0 ? [0, 30, 0] : [0, -30, 0],
      y: i % 2 === 0 ? [0, -40, 0] : [0, 40, 0],
      transition: {
        duration: 8 + i * 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <>
      <motion.section
        className={styles.heroSection}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Premium Background Elements */}
        <div className={styles.heroBg}>
          <motion.div 
            className={`${styles.blob} ${styles.blob1}`}
            custom={0}
            animate="animate"
            variants={blobVariants}
          />
          <motion.div 
            className={`${styles.blob} ${styles.blob2}`}
            custom={1}
            animate="animate"
            variants={blobVariants}
          />
        </div>

        <div className={styles.container}>
          <motion.div className={styles.content} variants={containerVariants}>
            <motion.h1 className={styles.title} variants={itemVariants}>
              {isTradesman ? t("اعرض خدماتك") : t("جد وظيفة")} <br />
              <span className={styles.purpleText}>
                {isTradesman ? t("لعملائك") : t("أحلامك")}
              </span>{" "}
              <br />
              <span className={styles.blueText}>
                {isTradesman ? t("بسهولة") : t("اليوم")}
                <svg className={styles.underline} viewBox="0 0 300 20">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
                    d="M5 15 Q 40 5, 80 15 T 160 15 T 240 15 T 300 15"
                    stroke="var(--color-accent, #26A4FF)"
                    fill="transparent"
                    strokeWidth="4"
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p className={styles.description} variants={itemVariants}>
              {isTradesman
                ? t("سوق لمهاراتك وتواصل مع العملاء الذين يبحثون عن خبراتك.")
                : t("نربط المحترفين الموهوبين بأفضل الفرص في الشرق الأوسط.")}
            </motion.p>

            <motion.div
              variants={itemVariants}
              style={{ marginTop: "30px", marginBottom: "30px" }}
            >
              <a
                href="https://play.google.com/store/apps/details?id=com.jobito.app"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.heroDownloadBtn}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_1532_46193)">
                    <path
                      d="M14.5601 13.4405L1.01508 26.9855C0.367578 26.373 0.0175781 25.533 0.0175781 24.623V3.37797C0.0175781 2.45047 0.385078 1.61047 1.05008 0.980469L14.5601 13.4405Z"
                      fill="#2196F3"
                    />
                    <path
                      d="M26.2671 14.0003C26.2671 15.2253 25.6021 16.3103 24.4996 16.9228L20.6496 19.0578L15.8721 14.6478L14.5596 13.4403L19.6171 8.38281L24.4996 11.0778C25.6021 11.6903 26.2671 12.7753 26.2671 14.0003Z"
                      fill="#FFC107"
                    />
                    <path
                      d="M14.5598 13.4408L1.0498 0.980823C1.2248 0.805823 1.4523 0.648323 1.6798 0.508323C2.7823 -0.156677 4.1123 -0.174177 5.2498 0.455823L19.6173 8.38332L14.5598 13.4408Z"
                      fill="#4CAF50"
                    />
                    <path
                      d="M20.6496 19.057L5.24965 27.5445C4.70715 27.8595 4.09465 27.9995 3.49965 27.9995C2.86965 27.9995 2.23965 27.842 1.67965 27.492C1.43663 27.3528 1.21304 27.1821 1.01465 26.9845L14.5596 13.4395L15.8721 14.647L20.6496 19.057Z"
                      fill="#F44336"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1532_46193">
                      <rect width="28" height="28" fill="white" />
                    </clipPath>
                  </defs>
                </svg>

                {t("احصل عليه من Google Play")}
              </a>
            </motion.div>

            {!isAuthenticated && (
              <motion.div
                variants={itemVariants}
                className={styles.hiringBannerContainer}
              >
                <HiringBanner />
              </motion.div>
            )}

            {/* Popular searches section removed as requested */}
          </motion.div>
        </div>
        <motion.div
          className={styles.heroImage}
          initial={{ opacity: 0, x: isRTL ? -100 : 100 }}
          animate={{ 
            opacity: 1, 
            x: 0
          }}
          transition={{
            opacity: { duration: 1 },
            x: { duration: 1, ease: "easeOut" }
          }}
        >
          <img
            src={isDark ? herodarktionImage : heroSectionImage}
            alt="Hero Section"
          />
        </motion.div>
      </motion.section>
      <JobsDashboard />
      <section className={styles.companiesSection}>
        <Testimonial />
      </section>
      {!isTradesman && <UserWorkflow />}
      {isTradesman ? <TradesmanWorkflow /> : <Categories />}
      <JobsSection />
    </>
  );
};
