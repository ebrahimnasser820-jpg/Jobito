import { useState, useEffect, useRef } from "react";
import styles from "./DoughnutChart.module.css";
import { useJobitoAuth } from "../../context/LinkContxt";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useTranslation } from "../../context/translation-context";
import { useTheme } from "../../context/ThemeContext";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface Application {
  applicationId: string | number;
  status: string;
  appliedAt: string;
  job: {
    title: string;
    jobType?: string;
    company?: {
      name: string;
      logoUrl?: string;
    };
    user?: {
      fullName: string;
      avatarUrl?: string;
    };
  };
}

function DoughnutChartComponent({ chartData }: { chartData: number[] }) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const chartColors = isDark 
      ? ["#6B8CE0", "#FF9A55", "#10b981", "#ef4444"] 
      : ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

    chartRef.current = new Chart(ref.current, {
      type: "doughnut",
      data: {
        labels: [t("الانتظار"), t("قيد المراجعة"), t("تم التوظيف"), t("مرفوض")],
        datasets: [
          {
            data: chartData,
            backgroundColor: chartColors,
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        cutout: "72%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.parsed}` },
          },
        },
        animation: { animateRotate: true, duration: 900 },
      },
    });
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartData, t, isDark]);

  return <canvas ref={ref} />;
}


function CountUp({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setVal(0);
      return;
    }
    let start = 0;
    const step = Math.ceil(target / 30) || 1;
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setVal(target);
        clearInterval(interval);
      } else {
        setVal(start);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [target]);
  return <>{val}</>;
}

export default function JobDashboard() {
  const { user, apiFetch } = useJobitoAuth();
  const { t, language } = useTranslation();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const jobTitle = location.state?.jobTitle;

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const getFullImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/applications/my`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setApplications(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchApplications();
  }, [user, apiFetch]);

  const totalApps = applications.length;
  // Let's treat "reviewing" or "hired" as "interviewed/processed"
  const interviewed = applications.filter((a) =>
    ["reviewing", "hired"].includes(a.status?.toLowerCase()),
  ).length;

  const appliedCount = applications.filter(
    (a) => a.status?.toLowerCase() === "applied",
  ).length;
  const reviewingCount = applications.filter(
    (a) => a.status?.toLowerCase() === "reviewing",
  ).length;
  const hiredCount = applications.filter(
    (a) => a.status?.toLowerCase() === "hired",
  ).length;
  const declinedCount = applications.filter(
    (a) => a.status?.toLowerCase() === "declined",
  ).length;

  const chartData = [appliedCount, reviewingCount, hiredCount, declinedCount];

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "applied":
        return t("الانتظار");
      case "reviewing":
        return t("قيد المراجعة");
      case "hired":
        return t("تم التوظيف");
      case "declined":
        return t("مرفوض");
      default:
        return t(status) || t("غير معروف");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "applied":
        return styles.badgeReview; // Using existing blue/gray style
      case "reviewing":
        return styles.badgeReview;
      case "hired":
        return styles.badgeShortlisted;
      case "declined":
        return styles.badgeDeclined;
      default:
        return "";
    }
  };

  const recentApps = applications.slice(0, 3);

  return (
    <>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <div>
            <h1>
              {t("صباح الخير،")} {t(user?.name || "") || t("الملف الشخصي")}{" "}
              {jobTitle ? ` - ${t(jobTitle)}` : ""}
            </h1>
            <p>
              {jobTitle
                ? t("هذا ما يحدث مع وظيفة \"{{jobTitle}}\" حتى الآن.", {
                    jobTitle,
                  })
                : t("هذا ما يحدث مع طلباتك حتى الآن.")}
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            {t("جاري التحميل...")}
          </div>
        ) : (
          <>
            <div className={styles.topGrid}>
              <div className={styles.statsCol}>
                <div className={`${styles.card} ${styles.statCard}`}>
                  <div className={styles.statLabel}>
                    {t("إجمالي ما تم التقديم عليه")}
                  </div>
                  <div className={styles.statNum}>
                    <CountUp target={totalApps} />
                  </div>
                  <span className={styles.statIcon}>
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ opacity: 0.2, color: "var(--color-primary)" }}
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </span>

                </div>
                <div className={`${styles.card} ${styles.statCard}`}>
                  <div className={styles.statLabel}>{t("تم النظر في طلبك")}</div>
                  <div className={styles.statNum}>
                    <CountUp target={interviewed} />
                  </div>
                  <span className={styles.statIcon}>
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ opacity: 0.2, color: "var(--color-primary)" }}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 6v6l4 2"></path>
                    </svg>
                  </span>

                </div>
              </div>

              {/* Chart */}
              <div className={`${styles.card} ${styles.chartCard}`}>
                <h3>{t("حالة التقديم")}</h3>
                <div className={styles.chartInner}>
                  {totalApps > 0 ? (
                    <>
                      <div className={styles.chartWrap}>
                        <DoughnutChartComponent chartData={chartData} />
                      </div>
                      <div className={styles.legend}>
                        <div className={styles.legendItem}>
                          <div
                            className={styles.legendDot}
                            style={{ background: isDark ? "#6B8CE0" : "#3b82f6" }}
                          />
                          <div>
                            <div className={styles.legendPct}>
                              {appliedCount}
                            </div>
                            <div className={styles.legendLabel}>{t("الانتظار")}</div>
                          </div>
                        </div>
                        <div className={styles.legendItem}>
                          <div
                            className={styles.legendDot}
                            style={{ background: isDark ? "#FF9A55" : "#f59e0b" }}
                          />
                          <div>
                            <div className={styles.legendPct}>
                              {reviewingCount}
                            </div>
                            <div className={styles.legendLabel}>
                              {t("قيد المراجعة")}
                            </div>
                          </div>
                        </div>

                        <div className={styles.legendItem}>
                          <div
                            className={styles.legendDot}
                            style={{ background: "#10b981" }}
                          />
                          <div>
                            <div className={styles.legendPct}>{hiredCount}</div>
                            <div className={styles.legendLabel}>{t("تم التوظيف")}</div>
                          </div>
                        </div>
                        <div className={styles.legendItem}>
                          <div
                            className={styles.legendDot}
                            style={{ background: "#ef4444" }}
                          />
                          <div>
                            <div className={styles.legendPct}>
                              {declinedCount}
                            </div>
                            <div className={styles.legendLabel}>{t("مرفوض")}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        padding: "20px",
                        color: "#888",
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      {t("لا توجد بيانات مخطط بعد")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* History */}
            <div className={styles.historyHeader}>
              <h2>{t("السجل الأخير")}</h2>
            </div>
            <div className={styles.appList}>
              {recentApps.length === 0 ? (
                <div style={{ padding: "20px", color: "#666" }}>
                  {t("لم تقم بالتقديم على أي وظائف بعد.")}
                </div>
              ) : (
                recentApps.map((app, index) => {
                  const isTradesman = !!app.job.user;
                  const displayLogo = isTradesman ? app.job.user?.avatarUrl : app.job.company?.logoUrl;
                  const displayName = isTradesman ? app.job.user?.fullName : app.job.company?.name;

                  return (
                    <div
                      className={styles.appItem}
                      key={app.applicationId}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div
                        className={styles.appLogo}
                        style={{
                          background: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          borderRadius: isTradesman ? "50%" : "8px",
                        }}
                      >
                        {displayLogo ? (
                          <img
                            src={getFullImageUrl(displayLogo) || ""}
                            alt="logo"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          isTradesman ? "👤" : "🏢"
                        )}
                      </div>
                      <div className={styles.appInfo}>
                        <div className={styles.appTitle}>
                          {t(app.job?.title || "") || t("الوظيفة")}
                        </div>
                        <div className={styles.appMeta}>
                          {t(displayName || "") || t("الجهة المعلنة")} ·{" "}
                          {(() => {
                            const jt = app.job?.jobType;
                            const firstType = Array.isArray(jt) ? jt[0] : jt;
                            if (!firstType) return t("دوام كامل");
                            return firstType === "full-time" ? t("دوام كامل") : t(firstType);
                          })()}
                        </div>
                      </div>
                      <div className={styles.appDateCol}>
                        <div className={styles.appDateLabel}>
                          {t("تاريخ التقديم")}
                        </div>
                        <div className={styles.appDateVal}>
                          {new Date(app.appliedAt).toLocaleDateString(
                            language === "ar" ? "ar-EG" : "en-US",
                          )}
                        </div>
                      </div>
                      <span
                        className={`${styles.badge} ${getStatusBadgeClass(app.status)}`}
                      >
                        {getStatusLabel(app.status)}
                      </span>
                      <button
                        className={styles.moreBtn}
                        onClick={() => navigate("/MyApplications")}
                      >
                        ⋯
                      </button>
                    </div>
                  );
                })
              )}
            </div>

          </>
        )}
      </div>
    </>
  );
}
