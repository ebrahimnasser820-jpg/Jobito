import { useState, useMemo } from "react";
import { NavBar } from "../../Subject to/Header/NavBar/NavBar";
import styles from "./Header.module.css";
import { HeaderActions } from "../../Subject to/Header/HeaderActions/HeaderActions";
import { Logo } from "../../Subject to/Header/Logo/Logo";
import { HeaderActionscompany } from "../../Subject to/Header/HeaderActionscompany/HeaderActionscompany";
import { useJobitoAuth } from "../../context/LinkContxt";
import { Logocompany } from "../../Subject to/Header/Logocompany/Logocompany";
import { useTranslation } from "../../context/translation-context";
import { useTheme } from "../../context/ThemeContext";
import SidebarMenu from "../../Basic/SidebarMenu/SidebarMenu";
import {
  Home,
  Search,
  Building2,
  Info,
  Mail,
  LayoutDashboard,
  UserCircle,
  FileText,
  MessageSquare,
  List,
  Plus,
  Moon,
  Sun,
  Menu,
  Star,
  ShieldCheck,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";


export function Header() {
  const { isAuthenticated, user, role } = useJobitoAuth();
  const { language, setLanguage, t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const guestNavLinks = useMemo(() => [
    { label: t("الرئيسية"), path: "/", icon: <Home size={16} /> },
    { label: t("بحث عن وظائف"), path: "/Find Jobs", icon: <Search size={16} /> },
    { label: t("تصفح الشركات"), path: "/Browse Companies", icon: <Building2 size={16} /> },
    { label: t("عن المنصة"), path: "/about", icon: <Info size={16} /> },
    { label: t("اتصل بنا"), path: "/contact", icon: <Mail size={16} /> },
  ], [t]);

  const authNavLinks = useMemo(() => [
    { label: t("الرئيسية"), path: "/", icon: <Home size={16} /> },
    { label: t("بحث عن وظائف"), path: "/Find Jobs", icon: <Search size={16} /> },
    { label: t("لوحة التحكم"), path: "/JobDashboard", icon: <LayoutDashboard size={16} /> },
    { label: t("طلبات التقديم"), path: "/MyApplications", icon: <FileText size={16} /> },
    { label: t("تصفح الشركات"), path: "/Browse Companies", icon: <Building2 size={16} /> },
    { label: t("الملف الشخصي"), path: "/Profile", icon: <UserCircle size={16} /> },
    { label: t("الرسائل"), path: "/chat", icon: <MessageSquare size={16} /> },
  ], [t]);

  const navLinkscompany = useMemo(() => [
    { label: t("الرئيسية"), path: "/home", icon: <Home size={16} /> },
    { label: t("التقييمات"), path: "/CompanyRatings", icon: <Star size={16} /> },
    { label: t("الرسائل"), path: "/chat", icon: <MessageSquare size={16} /> },
    { label: t("الملف الشخصي"), path: "/Profile", icon: <UserCircle size={16} /> },
    { label: t("قائمة الوظائف"), path: "/JobListing", icon: <List size={16} /> },
  ], [t]);

  const navLinkstradesman = useMemo(() => [

    { label: t("الرئيسية"), path: "/", icon: <Home size={16} /> },
    { label: t("البحث عن عمل"), path: "/Find Jobs", icon: <Search size={16} /> },
    { label: t("الوظائف"), path: "/JobListing", icon: <List size={16} /> },
    { label: t("طلبات التقديم"), path: "/MyApplications", icon: <FileText size={16} /> },
    { label: t("التقييمات"), path: "/CompanyRatings", icon: <Star size={16} /> },
    { label: t("تصفح الشركات"), path: "/Browse Companies", icon: <Building2 size={16} /> },
    { label: t("الملف الشخصي"), path: "/Profile", icon: <UserCircle size={16} /> },
    { label: t("الدردشة"), path: "/chat", icon: <MessageSquare size={16} /> },
  ], [t]);

  const adminNavLinks = useMemo(() => [
    { label: t("الرئيسية"), path: "/", icon: <Home size={16} /> },
    { label: t("لوحة الإدارة"), path: "/admin", icon: <ShieldCheck size={16} /> },
    { label: t("الرسائل"), path: "/chat", icon: <MessageSquare size={16} /> },
    { label: t("الملف الشخصي"), path: "/Profile", icon: <UserCircle size={16} /> },
  ], [t]);

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  const navLinksuser = isAuthenticated 
    ? (role === "admin" ? adminNavLinks : (user?.classification === "tradesman" ? navLinkstradesman : authNavLinks)) 
    : guestNavLinks;
  const navLinks = role === "company" ? navLinkscompany : navLinksuser;

  const desktopNavLinks = useMemo(() => {
    return navLinks.filter(link => link.path !== "/MyApplications");
  }, [navLinks]);

  const desktopMenuLinks = useMemo(() => {
    const links: Array<{label: string; path: string; icon: JSX.Element}> = [];
    if (role !== "company") {
      links.push({ label: t("عن المنصة"), path: "/about", icon: <Info size={16} /> });
      links.push({ label: t("اتصل بنا"), path: "/contact", icon: <Mail size={16} /> });
    }
    if (isAuthenticated && role !== "company" && role !== "admin") {
      links.push({ label: t("طلبات التقديم"), path: "/MyApplications", icon: <FileText size={16} /> });
    }
    return links;
  }, [t, isAuthenticated, role, user]);

  const mobileMenuLinks = useMemo(() => {
    const links = [...navLinks];
    if (isAuthenticated && role !== "company") {
      const hasAbout = links.some(l => l.path === "/about");
      const hasContact = links.some(l => l.path === "/contact");
      
      if (!hasAbout) {
        links.push({ label: t("عن المنصة"), path: "/about", icon: <Info size={16} /> });
      }
      if (!hasContact) {
        links.push({ label: t("اتصل بنا"), path: "/contact", icon: <Mail size={16} /> });
      }
    }
    return links;
  }, [navLinks, isAuthenticated, t]);

  const isDarkHeader = role === "company";
  const LogoComponent = role === "company" ? Logocompany : Logo;
  const HeaderActionsComponent = role === "company" ? HeaderActionscompany : HeaderActions;

  return (
    <>
      <motion.header 
        key={`${language}-${role}-${user?.classification || ""}`}
        className={isDarkHeader ? styles.rootcompany : styles.rootUser}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div className={styles.mobileMenuOnly}>
            <SidebarMenu navLinks={mobileMenuLinks} />
          </div>

          <div className={styles.desktopMenuOnly}>
            {role !== "company" && (
              <SidebarMenu navLinks={desktopMenuLinks} />
            )}
          </div>
          
          <div className={styles.logoWrapper}>
            <LogoComponent />
          </div>

          <div className={styles.desktopNavOnly}>
            <NavBar
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              navLinks={desktopNavLinks}
            />
          </div>
        </div>
        
        <motion.div 
          key={language}
          style={{ display: "flex", alignItems: "center", gap: "15px" }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
        >

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              className={styles.themeToggleBtn}
              onClick={toggleTheme}
              title={theme === "light" ? "Dark Mode" : "Light Mode"}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ y: -10, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 10, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                </motion.div>
              </AnimatePresence>
            </button>
            <button className={styles.langBtn} onClick={toggleLanguage} title={language === "ar" ? "English" : "العربية"}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={language}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {language === "ar" ? "EN" : "AR"}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {role === "company" ? (
              <motion.div
                key="company-actions"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <HeaderActionscompany />
              </motion.div>
            ) : (
              <motion.div
                key="user-actions"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <HeaderActions isAuthenticated={isAuthenticated} user={user} />
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </motion.header>
    </>
  );
}
