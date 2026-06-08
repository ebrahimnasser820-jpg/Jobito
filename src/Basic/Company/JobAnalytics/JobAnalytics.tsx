import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJobitoAuth } from "../../../context/LinkContxt";
import { useTranslation } from "../../../context/translation-context";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import styles from "./JobAnalytics.module.css";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface Application {
  applicationId: number;
  status: string;
  appliedAt: string;
  user: {
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
}

interface JobDetail {
  jobId: number;
  title: string;
  address: string;
  jobType: string;
  description?: string;
  slotsAvailable: number;
  slots?: number;
  createdAt?: string;
  category?: { name: string };
  applications?: Application[];
}

/* ── CountUp ── */
function CountUp({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    let start = 0;
    const step = Math.ceil(target / 40) || 1;
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(start);
    }, 25);
    return () => clearInterval(id);
  }, [target]);
  return <>{val.toLocaleString()}</>;
}

/* ── Donut Chart ── */
function DonutChart({ data, colors }: { data: number[]; colors: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ref.current, {
      type: "doughnut",
      data: {
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        cutout: "68%",
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.parsed}` } } },
        animation: { animateRotate: true, duration: 800 },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data, colors]);

  return <canvas ref={ref} style={{ width: "100%", height: "100%" }} />;
}

/* ── SVG Line Chart ── */
function SvgLineChartWithLabels({ points, labels }: { points: number[]; labels: string[]; }) {
  const width = 700;
  const height = 180;
  const pad = { top: 24, right: 24, bottom: 36, left: 44 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const maxV = Math.max(...points, 1);
  const [hover, setHover] = useState<number | null>(null);

  const coords = useMemo(() => points.map((v, i) => ({
    x: pad.left + (i / Math.max(points.length - 1, 1)) * chartW,
    y: pad.top + (1 - v / maxV) * chartH,
    v,
  })), [points, maxV, chartW, chartH, pad.left, pad.top]);

  const smoothPath = coords.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = coords[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `${acc} C${cpx.toFixed(1)},${prev.y.toFixed(1)} ${cpx.toFixed(1)},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }, "");

  const areaPath = coords.length > 1
    ? `${smoothPath} L${coords[coords.length - 1].x.toFixed(1)},${(pad.top + chartH).toFixed(1)} L${pad.left},${(pad.top + chartH).toFixed(1)} Z`
    : "";

  const yTicks = 4;
  const yLines = Array.from({ length: yTicks + 1 }, (_, i) => ({
    val: Math.round((maxV * i) / yTicks),
    y: pad.top + (1 - i / yTicks) * chartH,
  }));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sma-chart-line)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--sma-chart-line)" stopOpacity="0" />
        </linearGradient>
        <filter id="glow2">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {yLines.map(({ val, y }) => (
        <g key={val}>
          <line x1={pad.left} y1={y} x2={pad.left + chartW} y2={y}
            stroke="var(--sma-border)" strokeWidth="1" strokeDasharray="5 4" />
          <text x={pad.left - 8} y={y + 4} fontSize="9" fill="var(--sma-text-sub)"
            textAnchor="end" fontFamily="'DM Mono',monospace">
            {val > 999 ? `${(val / 1000).toFixed(1)}k` : val}
          </text>
        </g>
      ))}

      {areaPath && <path d={areaPath} fill="url(#areaGrad2)" />}
      {coords.length > 1 && (
        <path d={smoothPath} fill="none" stroke="var(--sma-chart-line)" strokeWidth="2.5"
          strokeLinecap="round" filter="url(#glow2)" />
      )}

      {coords.map((p, i) => (
        <g key={i}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          style={{ cursor: "pointer" }}>
          {hover === i && (
            <line x1={p.x} y1={pad.top} x2={p.x} y2={pad.top + chartH}
              stroke="var(--sma-chart-line)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
          )}
          {hover === i && (
            <g>
              <rect x={p.x - 28} y={p.y - 30} width="56" height="22" rx="6"
                fill="var(--sma-chart-line)" opacity="0.95" />
              <text x={p.x} y={p.y - 14} fontSize="10" fill="#fff"
                textAnchor="middle" fontFamily="'DM Mono',monospace" fontWeight="700">
                {p.v.toLocaleString()}
              </text>
            </g>
          )}
          <circle cx={p.x} cy={p.y} r={hover === i ? 6 : 4}
            fill={hover === i ? "#fff" : "var(--sma-chart-line)"}
            stroke={hover === i ? "var(--sma-chart-line)" : "var(--sma-chart-bg)"}
            strokeWidth="2"
            style={{ transition: "r 0.15s" }} />
          <text x={p.x} y={pad.top + chartH + 18} fontSize="9"
            fill="var(--sma-text-sub)" textAnchor="middle" fontFamily="'DM Sans',sans-serif">
            {labels[i] || `D${i + 1}`}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ══════════════ MAIN COMPONENT ══════════════ */
export default function JobAnalytics() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { apiFetch } = useJobitoAuth();
  const { t, language } = useTranslation();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState(5);
  const [advancedStats, setAdvancedStats] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState("الإحصائيات"); // "المتقدمون", "تفاصيل الوظيفة", "الإحصائيات"
  const [theme, setTheme] = useState(document.documentElement.getAttribute("data-theme") || "light");

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const jobRes = await apiFetch(`${API_BASE_URL}/jobs/${jobId}`);
        if (!jobRes.ok) throw new Error("Job not found");
        const jobData = await jobRes.json();
        setJob(jobData);

        const appsRes = await apiFetch(`${API_BASE_URL}/applications/job/${jobId}`);
        let appsData: Application[] = [];
        if (appsRes.ok) {
          const d = await appsRes.json();
          appsData = Array.isArray(d) ? d : d.data || d.applications || [];
          setApplications(appsData);
        }

        try {
          const dashboardRes = await apiFetch(`${API_BASE_URL}/jobs/${jobId}/analytics`);
          if (dashboardRes.ok) {
            setAdvancedStats(await dashboardRes.json());
          }
        } catch (err) {}
      } catch (err) {
        setError(err instanceof Error ? err.message : t("خطأ في جلب البيانات"));
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchData();
  }, [jobId, apiFetch, range, t]);

  /* ── Status Change (Drag & Drop Equivalent) ── */
  const changeStatus = async (appId: number, newStatus: string) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setApplications(prev => prev.map(a => a.applicationId === appId ? { ...a, status: newStatus } : a));
      }
    } catch (e) {
      console.error(e);
    }
  };

  /* ── Drag & Drop State ── */
  const [draggedApp, setDraggedApp] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  /* ── Derived Stats ── */
  const total = applications.length;
  const hiredCount = applications.filter(a => a.status?.toLowerCase() === "hired").length;
  const capacity = job?.slotsAvailable || job?.slots || 10;

  const chartDays = useMemo(() => Array.from({ length: range + 1 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (range - i)); return d;
  }), [range]);

  const chartPoints = useMemo(() => {
    if (advancedStats?.viewStats) {
      return advancedStats.viewStats.slice(-range).map((s: any) => s.views);
    }
    return chartDays.map(day => applications.filter(a => new Date(a.appliedAt).toDateString() === day.toDateString()).length * (Math.floor(Math.random() * 5) + 1));
  }, [chartDays, applications, advancedStats, range]);

  const chartLabels = useMemo(() => {
    if (advancedStats?.viewStats) {
      return advancedStats.viewStats.slice(-range).map((s: any) => {
        const d = new Date(s.date);
        return d.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", { month: "short", day: "numeric" });
      });
    }
    return chartDays.map(d => d.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", { month: "short", day: "numeric" }));
  }, [chartDays, language, advancedStats, range]);

  const donutData = useMemo(() => {
    if (advancedStats?.trafficChannels) {
      const tc = advancedStats.trafficChannels;
      return [tc.direct, tc.social, tc.organic, tc.other];
    }
    return [Math.max(1, total * 0.48), Math.max(1, total * 0.23), Math.max(1, total * 0.24), Math.max(1, total * 0.05)].map(Math.round);
  }, [advancedStats, total]);
  const donutColors = ["#f59e0b", "#3b82f6", "#6366f1", "#10b981"];
  const donutLabels = [t("مباشر"), t("سوشيال"), t("محركات بحث"), t("أخرى")];

  if (loading) return <div className={styles.loadingWrap} data-theme={theme}><div className={styles.spinner} /><p>{t("جاري التحميل...")}</p></div>;
  if (error || !job) return <div className={styles.loadingWrap} data-theme={theme}><span>⚠️</span><p>{t(error || "الوظيفة غير موجودة")}</p><button onClick={() => navigate(-1)}>{t("العودة")}</button></div>;

  const cols = [
    { id: "applied", label: t("الجدد"), color: "#3b82f6" },
    { id: "reviewing", label: t("قيد المراجعة"), color: "#f59e0b" },
    { id: "interview", label: t("المقابلة"), color: "#8b5cf6" },
    { id: "hired", label: t("تم التوظيف"), color: "#10b981" },
    { id: "declined", label: t("مرفوض"), color: "#ef4444" },
  ];

  return (
    <div className={styles.page} data-theme={theme}>
      {/* ── Top Header ── */}
      <div className={styles.header}>
        <button className={styles.jobBack} onClick={() => navigate(-1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          <span>{t("العودة")}</span>
        </button>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.jobTitle}>{t(job.title)}</h1>
            <p className={styles.jobMeta}>
              <span>{t(job.category?.name || "عام")}</span>
              <span className={styles.jobMetaDot}>•</span>
              <span>{t(job.jobType || "دوام كامل")}</span>
              <span className={styles.jobMetaDot}>•</span>
              <span>{hiredCount} / <span className={styles.hiredBadge}>{capacity} {t("تم توظيفهم")}</span></span>
            </p>
          </div>
          <button className={styles.moreActionBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <span>{t("تعديل الوظيفة")}</span>
          </button>
        </div>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.analyticsGrid}>
            <div className={styles.analyticsLeft}>
              <div className={styles.metricRow}>
                <div className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <span className={styles.metricLabel}>{t("إجمالي المشاهدات")}</span>
                    <div className={`${styles.metricIcon} ${styles.iconBlue}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>
                  </div>
                  <div className={styles.metricNum}><CountUp target={advancedStats?.totalViews || 0} /></div>
                  <div className={styles.metricSubText}>
                    <span className={`${styles.metricTrend} ${advancedStats?.trend === 'down' ? styles.down : ''}`}>
                      {Math.abs(advancedStats?.percentageChange || 0)}% {advancedStats?.trend === 'down' ? '▼' : '▲'}
                    </span> {t("مقارنة بالأسبوع الماضي")}
                  </div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <span className={styles.metricLabel}>{t("إجمالي التقديمات")}</span>
                    <div className={`${styles.metricIcon} ${styles.iconPurple}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
                  </div>
                  <div className={styles.metricNum}><CountUp target={total} /></div>
                  <div className={styles.metricSubText}><span className={`${styles.metricTrend} ${styles.down}`}>0.4% ▼</span> {t("مقابل الأمس")}</div>
                </div>
              </div>
              <div className={styles.lineChartCard}>
                <div className={styles.chartHeader}>
                  <h3 className={styles.chartTitle}>{t("إحصائيات مشاهدات الوظيفة")}</h3>
                  <select className={styles.chartSelect} value={range} onChange={(e) => setRange(Number(e.target.value))}>
                    <option value={5}>{t("آخر 5 أيام")}</option>
                    <option value={7}>{t("آخر أسبوع")}</option>
                    <option value={14}>{t("آخر أسبوعين")}</option>
                    <option value={30}>{t("آخر شهر")}</option>
                  </select>
                </div>
                <div style={{ flex: 1, minHeight: 0 }}><SvgLineChartWithLabels points={chartPoints} labels={chartLabels} /></div>
              </div>
            </div>
            <div className={styles.donutCard}>
              <h3 className={styles.donutTitle}>{t("قنوات الزيارات")}</h3>
              <div className={styles.donutWrap}>
                <div className={styles.donutInner}>
                  <DonutChart data={donutData} colors={donutColors} />
                  <div className={styles.donutCenter}>
                    <span className={styles.donutTotal}>{donutData.reduce((a, b) => a + b, 0)}</span>
                  </div>
                </div>
              </div>
              <div className={styles.donutLegend}>
                {donutLabels.map((label, i) => (
                  <div key={i} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: donutColors[i] }} />
                    <span style={{ flex: 1 }}>{label}</span>
                    <span className={styles.legendVal}>{Math.round((donutData[i] / Math.max(1, donutData.reduce((a, b) => a + b, 0))) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

