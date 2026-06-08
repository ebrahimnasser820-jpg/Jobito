import { useEffect, useState } from "react";
import styles from "./Logocompany.module.css";
import { useJobitoAuth } from "../../../context/LinkContxt";
import { useTranslation } from "../../../context/translation-context";

export const Logocompany = () => {
  const { role, apiFetch } = useJobitoAuth();
  const { t } = useTranslation();
  const [dbCompany, setDbCompany] = useState<any>(null);
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    if (role === "company") {
      const fetchProfile = async () => {
        try {
          const res = await apiFetch(`${API_BASE_URL}/companies/my/profile`);
          if (res.ok) {
            const data = await res.json();
            setDbCompany(data);
          }
        } catch (e) {
          console.error("Failed to load company profile from DB", e);
        }
      };
      fetchProfile();

      window.addEventListener("jobito-profile-updated", fetchProfile);
      return () => {
        window.removeEventListener("jobito-profile-updated", fetchProfile);
      };
    }
  }, [role, apiFetch, API_BASE_URL]);

  const getAvatarUrl = (url?: string) => {
    if (url) {
      if (url.startsWith("http")) return url;
      return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
    }
    return "";
  };

  const currentLogo = getAvatarUrl(dbCompany?.logo_url || dbCompany?.logoUrl);
  const companyName = dbCompany?.name || t("Company");

  return (
    <div className={styles.Logocompanycompany}>
      <div className={styles.companyLogo}>
        <img src={currentLogo} alt={companyName} />
      </div>
      <div className={styles.companyInfo}>
        <div className={styles.companyName}>{companyName}</div>
      </div>
    </div>
  );
};
