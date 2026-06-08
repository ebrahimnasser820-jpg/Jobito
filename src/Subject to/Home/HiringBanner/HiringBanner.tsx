import React from "react";
import styles from "./HiringBanner.module.css";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../../context/translation-context";

const HiringBanner: React.FC = () => {
  const { t, language } = useTranslation();
  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: 0, y: 10 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };
  const navigate = useNavigate();

  return (
    <motion.div 
      className={styles.bannerWrapper}
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: "-100px" }}
      variants={containerVariants}
    >
      <div className={styles.bannerContainer}>
        {/* Left Side: Illustration & Text */}
        <div className={styles.leftContent}>
          <div className={styles.textStack}>
            <motion.h2 className={styles.hiringTitle} variants={itemVariants}>{t("We are hiring!")}</motion.h2>
            <motion.p className={styles.description} variants={itemVariants}>
              {t("All companies")}
              <br />&{" "}
              <span className={styles.mutedText}>{t("And explore opportunities")}</span>
            </motion.p>
          </div>
        </div>

        {/* Right Side: Button & Team Illustration */}
        <div className={styles.rightContent}>
          <motion.button 
            className={styles.applyBtn}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/user-information")}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {t("قدم الآن")}
          </motion.button>
        </div>

        {/* Decorative Background Elements */}
        <div className={styles.decorGrid}>
          {[...Array(9)].map((_, i) => (
            <motion.div 
              key={i} 
              className={styles.dot}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
            ></motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default HiringBanner;

