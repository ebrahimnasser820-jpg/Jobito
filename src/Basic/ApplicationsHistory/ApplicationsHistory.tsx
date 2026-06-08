import { useState, useEffect } from "react";
import "./ApplicationsHistory.css";
import { useJobitoAuth } from "../../context/LinkContxt";
import { useTranslation } from "../../context/translation-context";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface Application {
  applicationId: string | number;
  status: string;
  appliedAt: string;
  job: {
    title: string;
    titleEn?: string;
    company?: {
      name: string;
      nameEn?: string;
      logoUrl?: string;
    };
    user?: {
      fullName: string;
      avatarUrl?: string;
    };
  };
}

export const ApplicationsHistory = () => {
  const { user, apiFetch } = useJobitoAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getFullImageUrl = (url?: string) => {
    if (!url)
      return `https://api.dicebear.com/7.x/identicon/svg?seed=${Math.random().toString(36).substring(7)}`;
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const tabs = [
    { id: "all", label: t("الكل") },
    { id: "applied", label: t("الانتظار") },
    { id: "reviewing", label: t("قيد المراجعة") },
    { id: "accepted", label: t("تم قبولك") },
    { id: "hired", label: t("تم التوظيف") },
    { id: "declined", label: t("مرفوض") },
  ];

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(`${API_BASE_URL}/applications/my`);
        if (!response.ok) throw new Error("Failed to fetch applications");

        const data = await response.json();
        const applicationsList = Array.isArray(data) ? data : data.data || [];
        setApplications(applicationsList);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchApplications();
    }
  }, [user, apiFetch]);

  const filteredApplications = applications.filter((app) => {
    const status = (app.status || "applied").toLowerCase();
    const tabMatch =
      activeTab === "all" ||
      status === activeTab ||
      (activeTab === "applied" && status === "waitlisted") ||
      (activeTab === "declined" && status === "rejected");

    const searchMatch =
      searchQuery === "" ||
      (app.job?.title?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      ) ||
      (app.job?.company?.name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      ) ||
      (app.job?.user?.fullName?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      );
    return tabMatch && searchMatch;
  });

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "applied":
        return t("الانتظار");
      case "waitlisted":
        return t("في الانتظار");
      case "reviewing":
        return t("قيد المراجعة");
      case "hired":
        return t("تم التوظيف");
      case "accepted":
        return t("تم قبولك");
      case "declined":
      case "rejected":
        return t("مرفوض");
      default:
        return status;
    }
  };

  return (
    <div className="ah-page">
      <div className="ah-header-section">
        <div className="ah-header-content">
          <div>
            <h1 className="ah-title">
              {t("استمر في العمل الجيد،")} {user?.name || t("الملف الشخصي")}
            </h1>
            <p className="ah-subtitle">
              {t("إليك ما يحدث مع طلباتك اعتباراً من")}{" "}
              {new Date().toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
              .
            </p>
          </div>
          <button className="ah-date-btn">
            {new Date().toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: 8 }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="ah-main-content">
        {/* Tabs */}
        <div className="ah-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`ah-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile dropdown select menu */}
        <div className="ah-mobile-select-container">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="ah-mobile-select"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
          <div className="ah-mobile-select-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        {/* Table Area */}
        <div className="ah-table-container">
          <div className="ah-table-header">
            <h2 className="ah-table-title">{t("سجل التقديم")}</h2>
            <div className="ah-table-actions">
              {showSearch ? (
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="text"
                    placeholder={t("ابحث عن شركة، وظيفة...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      padding: "10px 16px 10px 40px",
                      borderRadius: "4px",
                      border: "1px solid #d6ddeb",
                      outline: "none",
                      fontSize: "14px",
                      width: "250px",
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                    style={{
                      position: "absolute",
                      left: "12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#7c8493",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  className="ah-action-btn"
                  style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)" }}
                  onClick={() => setShowSearch(true)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginLeft: 8 }}
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  {t("بحث")}
                </button>
              )}
            </div>
          </div>

          <table className="ah-table">
            <thead>
              <tr>
                <th style={{ width: "5%" }}>#</th>
                <th style={{ width: "25%" }}>{t("مقدم الخدمة / الشركة")}</th>
                <th style={{ width: "25%" }}>{t("المسمى الوظيفي")}</th>
                <th style={{ width: "20%" }}>{t("تاريخ التقديم")}</th>
                <th style={{ width: "15%" }}>{t("الحالة")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    {t("جاري التحميل...")}
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    {t("لم يتم العثور على طلبات.")}
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app, index) => {
                  const isTradesman = !!app.job.user;
                  const displayName = isTradesman ? app.job.user?.fullName : app.job.company?.name;
                  const displayLogo = isTradesman ? app.job.user?.avatarUrl : app.job.company?.logoUrl;
                  
                  return (
                    <tr key={app.applicationId}>
                      <td data-label="#">{index + 1}</td>
                      <td data-label={t("مقدم الخدمة / الشركة")}>
                        <div className="ah-company-cell">
                          <img
                            src={getFullImageUrl(displayLogo)}
                            alt={displayName || t("Logo")}
                            className="ah-company-logo"
                            style={{ borderRadius: isTradesman ? "50%" : "4px" }}
                          />
                          <span className="ah-company-name">
                            {displayName || t("غير معروف")}
                          </span>
                        </div>
                      </td>
                      <td className="ah-role" data-label={t("المسمى الوظيفي")}>
                        {app.job?.title || t("عنوان غير معروف")}
                      </td>
                      <td data-label={t("تاريخ التقديم")}>
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td data-label={t("الحالة")}>
                        <span
                          className={`ah-status-badge ${app.status.toLowerCase()}`}
                        >
                          {getStatusLabel(app.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {filteredApplications.length > 10 && (
            <div className="ah-pagination">
              <button className="ah-page-btn ah-nav-btn" disabled>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              <button className="ah-page-btn active">1</button>
              <button className="ah-page-btn ah-nav-btn" disabled>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsHistory;
