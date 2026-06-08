import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Eye, ClipboardList, ChevronUp, ChevronDown } from "lucide-react";
import { useJobitoAuth } from "../../context/LinkContxt";
import { useTranslation } from "../../context/translation-context";
import styles from "./Statistics.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface StatSummary {
  views: { total: string; trend: string; isUp: boolean };
  applied: { total: string; trend: string; isUp: boolean };
  jobOpen: number;
  applicants: Array<{ label: string; count: number; color: string }>;
}

interface PeriodData {
  labels: string[];
  views: number[];
  applied: number[];
  summary: StatSummary;
}

// ChartOptions are generated dynamically inside the component
export default function Statistics({
  companyId,
  jobId,
}: {
  companyId: number | null;
  jobId?: number | null;
}) {
  const { apiFetch } = useJobitoAuth();
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState("Overview");
  const [activePeriod, setActivePeriod] = useState<"Week" | "Month" | "Year">("Week");
  const [data, setData] = useState<PeriodData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(document.documentElement.getAttribute("data-theme") || "light");

  useEffect(() => {
    // Observer to seamlessly track root dark mode changes and instantly re-render the chart!
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  // Compute precise chart style strings based on the live theme
  const isDark = theme === "dark";
  const axisTextColor = isDark ? "#E2E8F0" : "#26292D"; // strict --color-text

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? "#141B2D" : "#FFFFFF",
        titleColor: isDark ? "#E2E8F0" : "#111827",
        bodyColor: isDark ? "#94A3B8" : "#4B5563",
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true,
        borderColor: isDark ? "#1E2A45" : "#E5E7EB",
        borderWidth: 1,
      },
    },
    animation: { duration: 500 },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: {
          color: axisTextColor,
          font: {
            size: typeof window !== "undefined" && window.innerWidth < 480 
              ? (language === "ar" ? 11 : 9) 
              : (language === "ar" ? 16 : 13),
            weight: "bold"
          },
        },
      },
      y: {
        stacked: true,
        display: false,
        grid: { display: false },
      },
    },
  };

  useEffect(() => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        let url = `${API_BASE_URL}/companies/${companyId}/statistics?period=${activePeriod}`;
        if (jobId) {
          url += `&jobId=${jobId}`;
        }
        const response = await apiFetch(url);
        if (!response.ok) throw new Error("Failed to fetch statistics");
        const result = await response.json();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        // Fallback to demo data...
        if (isMounted) {
          setData({
            labels: [
              t("الاثنين"),
              t("الثلاثاء"),
              t("الأربعاء"),
              t("الخميس"),
              t("الجمعة"),
              t("السبت"),
              t("الأحد"),
            ],
            views: [0, 0, 0, 0, 0, 0, 0],
            applied: [0, 0, 0, 0, 0, 0, 0],
            summary: {
              views: { total: "0", trend: "0%", isUp: true },
              applied: { total: "0", trend: "0%", isUp: false },
              jobOpen: 0,
              applicants: [],
            },
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [activePeriod, companyId, jobId, apiFetch]);

  // Handle Initial Loading
  if (!data && isLoading) {
    return (
      <div className={styles.wrapper}>
        <div
          style={{ padding: "100px", textAlign: "center", color: "#578BC7" }}
        >
          {t("جاري تحميل إحصائيات المشروع...")}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const tabs = ["Overview", "Jobs View", "Jobs Applied"];
  const periods = ["Week", "Month", "Year"];

  const tabLabels: Record<string, string> = {
    Overview: t("نظرة عامة"),
    "Jobs View": t("مشاهدات الوظائف"),
    "Jobs Applied": t("طلبات التقديم"),
  };

  const periodLabels: Record<string, string> = {
    Week: t("أسبوع"),
    Month: t("شهر"),
    Year: t("سنة"),
  };

  const summary = data.summary;
  const applicantTypes = summary.applicants;
  const totalApplicants = applicantTypes.reduce(
    (acc, curr) => acc + curr.count,
    0,
  );

  const datasets = [];

  if (activeTab === "Overview" || activeTab === "Jobs Applied") {
    datasets.push({
      label: t("طلبات التقديم"),
      data: data.applied,
      backgroundColor: "#5484C4",
      borderRadius: activeTab === "Jobs Applied" ? 4 : 0,
      stack: "stack1",
      barThickness: activePeriod === "Year" ? 30 : 20,
    });
  }

  if (activeTab === "Overview" || activeTab === "Jobs View") {
    datasets.push({
      label: t("مشاهدات الوظائف"),
      data: data.views,
      backgroundColor: "#FFA524",
      borderRadius: {
        topLeft: 4,
        topRight: 4,
        bottomLeft: 0,
        bottomRight: 0,
      } as any,
      stack: "stack1",
      barThickness: activePeriod === "Year" ? 30 : 20,
    });
  }

  const chartLabelsMap: Record<string, string> = {
    // Week days
    Mon: t("الأثنين"),
    Tue: t("الثلاثاء"),
    Wed: t("الأربعاء"),
    Thu: t("الخميس"),
    Fri: t("الجمعة"),
    Sat: t("السبت"),
    Sun: t("الأحد"),
    // Weeks
    W1: t("الأسبوع 1"),
    W2: t("الأسبوع 2"),
    W3: t("الأسبوع 3"),
    W4: t("الأسبوع 4"),
    // Months
    Jan: t("يناير"),
    Mar: t("مارس"),
    May: t("مايو"),
    Jul: t("يوليو"),
    Sep: t("سبتمبر"),
    Nov: t("نوفمبر"),
  };

  const chartData: ChartData<"bar"> = {
    labels: data.labels.map((l) => chartLabelsMap[l] || l),
    datasets: datasets,
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.mainLayout}
        style={{ opacity: isLoading ? 0.6 : 1, transition: "opacity 0.2s" }}
      >
        {/* LEFT CARD */}
        <div className={styles.statisticsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>{t("إحصائيات الوظائف")}</h2>
              <p className={styles.subtitle}>
                {t("عرض")} {tabLabels[activeTab]} {t("لـ")} {periodLabels[activePeriod]} {jobId ? t("(وظيفة محددة)") : ""}
              </p>
            </div>
            <div className={styles.periodSwitcher}>
              {periods.map((p) => (
                <button
                  key={p}
                  disabled={isLoading}
                  onClick={() => setActivePeriod(p as any)}
                  className={`${styles.periodBtn} ${activePeriod === p ? styles.periodBtnActive : ""}`}
                >
                  {periodLabels[p]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.tabList}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${styles.tabItem} ${activeTab === tab ? styles.tabItemActive : ""}`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          <div className={styles.cardContent}>
            <div className={styles.chartContainer}>
              <div className={styles.chartArea}>
                <div style={{ width: "100%", height: "100%" }}>
                  <Bar
                    data={chartData}
                    options={chartOptions}
                    key={`${activePeriod}-${theme}`}
                  />
                </div>
              </div>

              <div className={styles.legend}>
                {(activeTab === "Overview" || activeTab === "Jobs View") && (
                  <div className={styles.legendItem}>
                    <span
                      className={`${styles.legendDot} ${styles.dotOrange}`}
                    />
                    <span className={styles.legendLabel}>{t("مشاهدات الوظائف")}</span>
                  </div>
                )}
                {(activeTab === "Overview" || activeTab === "Jobs Applied") && (
                  <div className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.dotBlue}`} />
                    <span className={styles.legendLabel}>{t("طلبات التقديم")}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.miniStatsColumn}>
              <div className={styles.miniStatCard}>
                <div className={styles.miniStatHeader}>
                  <div className={styles.miniStatInfo}>
                    <p className={styles.miniStatLabel}>{t("مشاهدات الوظائف")}</p>
                    <h3 className={styles.miniStatValue}>
                      {summary.views.total === "NaN" ? "0" : summary.views.total}
                    </h3>
                  </div>
                  <div
                    className={`${styles.miniStatIcon} ${styles.iconBgOrange}`}
                  >
                    <Eye size={18} color="#FFA524" />
                  </div>
                </div>
              </div>

              <div className={styles.miniStatCard}>
                <div className={styles.miniStatHeader}>
                  <div className={styles.miniStatInfo}>
                    <p className={styles.miniStatLabel}>{t("طلبات التقديم")}</p>
                    <h3 className={styles.miniStatValue}>
                      {summary.applied.total === "NaN" ? "0" : summary.applied.total}
                    </h3>
                  </div>
                  <div
                    className={`${styles.miniStatIcon} ${styles.iconBgBlue}`}
                  >
                    <ClipboardList size={18} color="#5484C4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.rightColumn}>
          <div className={styles.sideCard}>
            <p className={styles.sideCardLabel}>{t("الوظائف المفتوحة")}</p>
            <div className={styles.sideCardValueRow}>
              <span className={styles.sideCardValue}>{Number.isNaN(summary.jobOpen) ? "0" : summary.jobOpen}</span>
              <span className={styles.sideCardUnit}>{t("وظيفة مفتوحة")}</span>
            </div>
          </div>

          <div className={`${styles.sideCard} ${styles.applicantsSummaryCard}`}>
            <h3 className={styles.sideCardHeaderTitle}>{t("ملخص المتقدمين")}</h3>
            <div className={styles.sumValueArea}>
              <span className={styles.sumHugeNumber}>{Number.isNaN(totalApplicants) ? "0" : totalApplicants}</span>
              <span className={styles.sumLabelText}>{t("متقدم")}</span>
            </div>

            <div className={styles.progressBar}>
              {applicantTypes.map((t, idx) => (
                <div
                  key={idx}
                  className={styles.progressSegment}
                  style={{
                    width: `${totalApplicants > 0 ? (t.count / totalApplicants) * 100 : 0}%`,
                    backgroundColor: t.color,
                  }}
                />
              ))}
            </div>

            <div className={styles.applicantsLegendGrid}>
              {applicantTypes.map((tItem, idx) => {
                const arabicLabels: Record<string, string> = {
                  "Full Time": t("دوام كامل"),
                  "Part-Time": t("دوام جزئي"),
                  Remote: t("عن بعد"),
                  Internship: t("تدريب"),
                  Contract: t("خدمة لمرة واحدة"),
                };
                return (
                  <div key={idx} className={styles.applicantLegendItem}>
                    <span
                      className={styles.applicantLegendBox}
                      style={{ backgroundColor: tItem.color }}
                    />
                    <span className={styles.applicantLegendLabel}>
                      {arabicLabels[tItem.label] || t(tItem.label)} :{" "}
                      <strong>{Number.isNaN(tItem.count) ? "0" : tItem.count}</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
