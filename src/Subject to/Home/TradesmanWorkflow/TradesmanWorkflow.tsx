import React from "react";
import styles from "./TradesmanWorkflow.module.css";
import { motion } from "framer-motion";
import { useTranslation } from "../../../context/translation-context";

const TradesmanWorkflow: React.FC = () => {
  const { t } = useTranslation();

  // Handle coordinates for the hover gradient glow effect
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
      transition: {
        staggerChildren: 0.15,
      },
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
            {t("كيف تنمي عملك مع جوبيتو؟")}
          </motion.h2>
          <motion.p 
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t("خطوات بسيطة وسريعة لتصل إلى آلاف العملاء وتبدأ في استقبال الطلبات مباشرة")}
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
            <h3 className={styles.cardTitle}>{t("1. أنشئ حسابك المهني")}</h3>
            <p className={styles.cardDesc}>
              {t("سجل بياناتك، حدد مهنتك، واكتب خبراتك ليراك آلاف العملاء يومياً في منطقتك.")}
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
            <h3 className={styles.cardTitle}>{t("2. اعرض مهاراتك")}</h3>
            <p className={styles.cardDesc}>
              {t("ارفع صوراً لأعمالك السابقة وحدد مناطق خدمتك وأسعارك التقديرية لجذب العملاء.")}
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
            <h3 className={styles.cardTitle}>{t("3. تواصل مباشر")}</h3>
            <p className={styles.cardDesc}>
              {t("استقبل اتصالات ورسائل مباشرة من العملاء المهتمين بخدماتك دون أي وسيط أو عمولة.")}
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
            <h3 className={styles.cardTitle}>{t("4. ابنِ سمعتك وضاعف أرباحك")}</h3>
            <p className={styles.cardDesc}>
              {t("احصل على تقييمات ممتازة من عملائك لتتصدر نتائج البحث وتضمن زيادة أرباحك وعملك باستمرار.")}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default TradesmanWorkflow;
