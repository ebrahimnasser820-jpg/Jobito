import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../context/translation-context";
import { useJobitoAuth } from "../../context/LinkContxt";
import { useTheme } from "../../context/ThemeContext";
import { LogOut, ArrowLeftRight, Globe, Moon, Sun } from "lucide-react";  
import styles from "./SidebarMenu.module.css";
import LogoIMG from "../../assets/412ec68f361b4f49b52fb8d584c317ccf197a403.png";

interface SidebarMenuProps {
  navLinks: Array<{
    label: string;
    path: string;
    icon?: React.ReactNode;
  }>;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ navLinks }) => {
  const { isAuthenticated, logout, user, role, apiFetch } = useJobitoAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const [companyData, setCompanyData] = useState<any>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    if (role === "company") {
      const fetchProfile = async () => {
        try {
          const res = await apiFetch(`${API_BASE_URL}/companies/my/profile`);
          if (res.ok) {
            const data = await res.json();
            setCompanyData(data);
          }
        } catch (e) {
          console.error("Failed to load company profile", e);
        }
      };
      fetchProfile();
      window.addEventListener("jobito-profile-updated", fetchProfile);
      return () => window.removeEventListener("jobito-profile-updated", fetchProfile);
    }
  }, [role, apiFetch, API_BASE_URL]);

  const getAvatarUrl = (url?: string) => {
    if (url) {
      if (url.startsWith("http")) return url;
      return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
    }
    return "";
  };

  const companyLogo = getAvatarUrl(companyData?.logo_url || companyData?.logoUrl);
  const companyName = companyData?.name || t("Company");

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <div className={styles.sidebarWrapper}>
      <label className={styles.hamburger}>
        <input
          type="checkbox"
          checked={isOpen}
          onChange={() => setIsOpen(!isOpen)}
        />
        <svg viewBox="0 0 32 32">
          <path
            className={`${styles.line} ${styles.lineTopBottom}`}
            d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
          ></path>
          <path className={styles.line} d="M7 16 27 16"></path>
        </svg>
      </label>

      <div
        className={`${styles.menuDropdown} ${isOpen ? styles.menuOpen : ""}`}
      >
        {role === "company" ? (
          <div className={styles.menuLogo}>
            <img src={companyLogo} alt={companyName} className={styles.menuLogoImg} />
            <span className={styles.menuLogoName}>{companyName}</span>
          </div>
        ) : (
          <div className={styles.menuLogo}>
            <img src={LogoIMG} alt="Jobito" />
          </div>
        )}
        <div className={styles.navLinks}>
          {navLinks.map((link, index) => (
            <button
              key={index}
              className={styles.menuItem}
              onClick={() => handleNavigate(link.path)}
            >
              {link.icon}
              <span>{link.label}</span>
            </button>
          ))}

          {isAuthenticated && (role === "user" || role === "student" || user?.role === "student") && (
            <button
              className={`${styles.menuItem} ${styles.switchModeBtn}`}
              onClick={() => {
                window.dispatchEvent(new CustomEvent("trigger-mode-switch"));
                setIsOpen(false);
              }}
            >
              <ArrowLeftRight size={16} />
              <span>
                {user?.classification === "tradesman"
                  ? t("العودة إلى باحث عن عمل")
                  : t("التبديل إلى الوضع الحرفي")}
              </span>
            </button>
          )}
        </div>

        <div className={styles.divider} />

        <div className={styles.settingsActions}>
          <button
            className={styles.menuItem}
            onClick={() => {
              setLanguage(language === "ar" ? "en" : "ar");
            }}
          >
            <Globe size={16} />
            <span>{language === "ar" ? "English" : "العربية"}</span>
          </button>
          <button
            className={styles.menuItem}
            onClick={() => {
              toggleTheme();
            }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDark ? t("الوضع الفاتح") : t("الوضع الداكن")}</span>
          </button>
        </div>

        {isAuthenticated && (
          <div className={styles.authActions}>
            <div className={styles.divider} />
            <button
              className={`${styles.menuItem} ${styles.logoutBtn}`}
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>{t("تسجيل الخروج")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarMenu;
