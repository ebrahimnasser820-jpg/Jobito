import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./HeaderActions.module.css";
import { useTranslation } from "../../../context/translation-context";

type HeaderActionsProps = {
  isAuthenticated: boolean;
  user?: { name?: string; avatar?: string; avatarUrl?: string } | null;
  onLoginClick?: () => void;
  onLogout?: () => void;
};

const getAvatarUrl = (path: string | undefined | null) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

export function HeaderActions({
  isAuthenticated,
  user,
  onLogout,
}: HeaderActionsProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [avatarError, setAvatarError] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
    if (onLogout) onLogout();
  };

  return (
    <>
      <div className={styles.right}>
        {isAuthenticated ? (
          <div className={styles.avatarWrap}>
            <div
              className={styles.avatar}
              title={user?.name || t("nav.profile")}
              style={{ cursor: "default" }}
            >
              { (user?.avatarUrl || user?.avatar) && !avatarError ? (
                <img
                  src={getAvatarUrl(user.avatarUrl || user.avatar) || ""}
                  alt={user.name || "avatar"}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <button
              className={styles.logoutBtn}
              onClick={handleLogoutClick}
              title={t("تسجيل الخروج")}
            >
              <div className={styles.logoutSign}>
                <svg viewBox="0 0 512 512">
                  <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
                </svg>
              </div>
            </button>
          </div>
        ) : (
          <button
            className={styles.loginBtn}
            onClick={() => {
              navigate("/user-information");
            }}
            title={t("nav.login")}
          >
            <i className="fa-solid fa-user"></i>
          </button>
        )}
      </div>
    </>
  );
}
