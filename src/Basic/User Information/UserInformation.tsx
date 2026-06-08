import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./User_Information.module.css";
import { useTranslation } from "../../context/translation-context";
import { useTheme } from "../../context/ThemeContext";
import { Globe, Moon, Sun, ArrowLeft } from "lucide-react";

import LoginPage from "../../Subject to/User Information/Login/Login";
import UI from "../../Subject to/User Information/CreateAcont/Up/UP";

export const UserInformation: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);
  const [isCustomer, setIsCustomer] = useState(true);
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state) {
      if (location.state.showLogin !== undefined)
        setShowLogin(location.state.showLogin);
      if (location.state.isCustomer !== undefined)
        setIsCustomer(location.state.isCustomer);
    }
  }, [location.state]);

  const toggleLogin = () => setShowLogin(!showLogin);
  const toggleLanguage = () => setLanguage(language === "ar" ? "en" : "ar");

  const pageVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: -50,
      scale: 0.95,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  return (
    <div 
      className={styles.page} 
      dir={language === "ar" ? "rtl" : "ltr"}
      data-lang={language}
    >
      {/* ─── Left Panel: Welcome / Branding ─── */}
      <div className={styles.leftPanel}>
        {/* Decorative 3D elements */}
        <div className={styles.sphere}></div>
        <div className={styles.blobTop}></div>

        <div className={styles.brandContent}> 
          <div className={styles.logoMark}>JOBITO</div>
          <h1 className={styles.welcomeTitle}>{t("WELCOME")}</h1>
          <p className={styles.welcomeSub}>{t("YOUR HEADLINE NAME")}</p>
          <p className={styles.welcomeDesc}>
            {t(
              "Join thousands of professionals and companies. Create your account to find opportunities, connect with employers, and grow your career.",
            )}
          </p>
        </div>

        <footer className={styles.leftFooter}>
          © {t("Jobito 2026")} · {t("Privacy Policy")}
        </footer>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.floatingActions}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={styles.roundActionBtn}
            onClick={() => navigate("/")}
            title={t("Back to Home")}
          >
            <ArrowLeft size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={styles.roundActionBtn}
            onClick={toggleTheme}
            title={isDark ? t("Light Mode") : t("Dark Mode")}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={styles.roundActionBtn}
            onClick={toggleLanguage}
            title={language === "ar" ? "English" : "العربية"}
          >
            <Globe size={20} />
          </motion.button>
        </div>
        {/* Top bar: toggle link */}
        <div className={styles.topBar}>
          {!showLogin && (
            <motion.button
              className={styles.toggleTypeBtn}
              onClick={() => setIsCustomer(!isCustomer)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isCustomer ? t("صاحب عمل؟") : t("مستخدم؟")}
            </motion.button>
          )}
          <button className={styles.toggleBtn} onClick={toggleLogin}>
            {showLogin ? t("Sign up") : t("Sign in")}
          </button>
        </div>

        <div className={styles.formWrapper}>
          <AnimatePresence mode="wait">
            {showLogin ? (
              <motion.div
                key="login"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ width: "100%" }}
              >
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ width: "100%" }}
                >
                  <LoginPage setShowLogin={setShowLogin} />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ width: "100%" }}
              >
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ width: "100%" }}
                >
                  <UI
                    setShowLogin={setShowLogin}
                    isCustomer={isCustomer}
                    setIsCustomer={setIsCustomer}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
