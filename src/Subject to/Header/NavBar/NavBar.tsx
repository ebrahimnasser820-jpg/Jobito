import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./NavBar.module.css";

export type NavLinkType = {
  label: string;
  path: string;
  icon?: React.ReactNode;
};

type NavBarProps = {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  navLinks: NavLinkType[];
};

const navContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3, // Wait for Header to slide down slightly
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, y: -20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function NavBar({ mobileOpen, setMobileOpen, navLinks }: NavBarProps) {
  const location = useLocation();

  return (
    <>
      {/* ── Hamburger (mobile) ── */}
      <button
        className={styles.burger}
        onClick={() => setMobileOpen((p) => !p)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* ── Nav links (desktop) ── */}
      <motion.nav 
        className={styles.nav}
        variants={navContainerVariants}
        initial="hidden"
        animate="show"
      >
        {navLinks.map((link) => {
          const active = decodeURIComponent(location.pathname) === link.path;
          return (
            <motion.div 
              className={styles.navItem} 
              key={link.path}
              variants={navItemVariants}
            >
              <Link
                to={link.path}
                className={`${styles.link} ${active ? styles.linkActive : ""}`}
              >
                {link.icon && <span className={styles.navIcon}>{link.icon}</span>}
                <span className={styles.navLabel}>{link.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>

      {mobileOpen && (
        <nav className={styles.mobileNav}>
          {navLinks.map((link) => {
            const active = decodeURIComponent(location.pathname) === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`${styles.mobileLink} ${active ? styles.mobileLinkActive : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.icon && <span className={styles.navIcon}>{link.icon}</span>}
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
