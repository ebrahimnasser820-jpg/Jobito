import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import styles from "./NavBarcompany.module.css";

const navLinkscompany = [
  { label: "Home", path: "/home" },
  { label: "Messages", path: "/chat" },
  { label: "Profile", path: "/Browse Companies" },
  { label: "Job Listings", path: "/JobListing" },
  { label: "Help Center", path: "/Help" },
];

type NavBarProps = {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function NavBarcompany({ mobileOpen, setMobileOpen }: NavBarProps) {
  const location = useLocation();

  return (
    <>
      <button
        className={styles.burger}
        onClick={() => setMobileOpen((p) => !p)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <nav className={styles.nav}>
        {navLinkscompany.map((link, i) => {
          const active = location.pathname === link.path;
          return (
            <div className={styles.navItem} key={link.path}>
              {i > 0 && <span className={styles.sep} aria-hidden />}
              <Link
                to={link.path}
                className={`${styles.link} ${active ? styles.linkActive : ""}`}
              >
                {link.label}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* ── Mobile nav ── */}
      {mobileOpen && (
        <nav className={styles.mobileNav}>
          {navLinkscompany.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.mobileLink} ${
                location.pathname === link.path ? styles.mobileLinkActive : ""
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
