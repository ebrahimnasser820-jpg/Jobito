import React from "react";
import styles from "../TradesmanWorkflow/TradesmanWorkflow.module.css";
import { motion } from "framer-motion";
import { useTranslation } from "../../../context/translation-context";

const UserWorkflow: React.FC = () => {
  const { t } = useTranslation();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className={styles.section}>
      <div className={styles.bgBlob}></div>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <motion.h2 
            className={styles.title}
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t("كيف تنجز أعمالك مع جوبيتو؟")}
          </motion.h2>
          <motion.p 
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t("خطوات بسيطة للوصول إلى أفضل المحترفين والشركات لإنجاز أعمالك بأعلى جودة")}
          </motion.p>
        </div>

        <motion.div 
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Card 1 */}
          <motion.div 
            className={styles.card} 
            variants={cardVariants}
            onMouseMove={handleMouseMove}
          >
            <div className={styles.cardGlow}></div>
            <div className={styles.illustrationContainer}>
              <div className={styles.profileMockup}>
                <div className={styles.profileAvatar}></div>
                <div className={styles.profileLine}></div>
                <div className={`${styles.profileLine} ${styles.profileLine2}`}></div>
                <div className={styles.badgeSuccess}>✓</div>
              </div>
            </div>
            <h3 className={styles.cardTitle}>{t("1. ابحث عن تخصص")}</h3>
            <p className={styles.cardDesc}>
              {t("تصفح آلاف الحرفيين والشركات في مختلف التخصصات والمجالات.")}
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            className={styles.card} 
            variants={cardVariants}
            onMouseMove={handleMouseMove}
          >
            <div className={styles.cardGlow}></div>
            <div className={styles.illustrationContainer}>
              <div className={styles.badgeContainer}>
                <div className={`${styles.floatingBadge} ${styles.badge1}`}>{t("كهرباء")}</div>
                <div className={`${styles.floatingBadge} ${styles.badge2}`}>{t("سباكة")}</div>
                <div className={`${styles.floatingBadge} ${styles.badge3}`}>{t("نجارة")}</div>
              </div>
            </div>
            <h3 className={styles.cardTitle}>{t("2. قارن واختر")}</h3>
            <p className={styles.cardDesc}>
              {t("شاهد التقييمات والأعمال السابقة واختر الأنسب لاحتياجاتك وميزانيتك.")}
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            className={styles.card} 
            variants={cardVariants}
            onMouseMove={handleMouseMove}
          >
            <div className={styles.cardGlow}></div>
            <div className={styles.illustrationContainer}>
              <div className={styles.chatBubble}>
                <div className={styles.chatDot}></div>
                <div className={styles.chatDot}></div>
                <div className={styles.chatDot}></div>
              </div>
            </div>
            <h3 className={styles.cardTitle}>{t("3. تواصل فوراً")}</h3>
            <p className={styles.cardDesc}>
              {t("تواصل مباشرة مع الحرفي أو الشركة عبر الهاتف أو الرسائل للاتفاق.")}
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            className={styles.card} 
            variants={cardVariants}
            onMouseMove={handleMouseMove}
          >
            <div className={styles.cardGlow}></div>
            <div className={styles.illustrationContainer}>
              <div className={styles.growthContainer}>
                <div className={styles.ratingStars}>
                  <span className={styles.star}>★</span>
                  <span className={styles.star}>★</span>
                  <span className={styles.star}>★</span>
                  <span className={styles.star}>★</span>
                  <span className={styles.star}>★</span>
                </div>
                <div className={styles.miniChart}>
                  <div className={`${styles.bar} ${styles.bar1}`}></div>
                  <div className={`${styles.bar} ${styles.bar2}`}></div>
                  <div className={`${styles.bar} ${styles.bar3}`}></div>
                </div>
              </div>
            </div>
            <h3 className={styles.cardTitle}>{t("4. قيّم تجربتك")}</h3>
            <p className={styles.cardDesc}>
              {t("شارك تقييمك بعد انتهاء العمل لمساعدة الآخرين في اختيار الأفضل.")}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default UserWorkflow;
