import { useNavigate } from "react-router-dom";
import { useJobitoAuth } from "../../../context/LinkContxt";
import styles from "./HeaderActionscompany.module.css";
import { useTranslation } from "../../../context/translation-context";

export const HeaderActionscompany = () => {
  const { logout, user } = useJobitoAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handlePostJob = () => {
    if (user?.classification === "tradesman") {
      navigate("/PostWork");
    } else {
      navigate("/PostJob");
    }
  };

  return (
    <section className={styles.section}>
      <button className={styles.primaryBtn} onClick={handlePostJob}>
        {user?.classification === "tradesman" ? t("إضافة خدمة") : t("نشر وظيفة")}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_1152_21157)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 4C12.5523 4 13 4.44772 13 5V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V5C11 4.44772 11.4477 4 12 4Z"
              fill="white"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4 12C4 11.4477 4.44772 11 5 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H5C4.44772 13 4 12.5523 4 12Z"
              fill="white"
            />
          </g>
          <defs>
            <clipPath id="clip0_1152_21157">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </button>

      <div className={styles.avatarContainer}>
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          title={t("تسجيل الخروج")}
        >
          <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    </section>
  );
};
