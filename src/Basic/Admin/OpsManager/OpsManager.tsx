import React, { useState, useEffect, useCallback } from 'react';
import { useJobitoAuth } from '../../../context/LinkContxt';
import { useTranslation } from "../../../context/translation-context";
import { API_BASE_URL } from '../../../services/api';
import { 
  Activity,
  Users,
  Building2,
  ShieldCheck,
  LogIn,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  FileText,
  AlertTriangle,
  Server,
  Wrench,
  UserCheck,
  KeyRound
} from 'lucide-react';
import styles from './OpsManager.module.css';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ActivityLog {
  logId: number;
  adminName: string;
  adminEmail: string;
  actionType: string;
  targetEntity: string;
  targetId: string | null;
  description: string;
  createdAt: string;
}

interface ChartPoint {
  hour: string;
  count: number;
}

interface ActionBreakdown {
  action_type: string;
  count: string;
}

// ─── Helper Functions ────────────────────────────────────────────────────────
function getEntityClass(entity: string): string {
  const e = entity?.toLowerCase() || '';
  if (e.includes('user')) return 'user';
  if (e.includes('company') || e.includes('compan')) return 'company';
  if (e.includes('admin')) return 'admin';
  if (e.includes('content') || e.includes('report')) return 'content';
  return 'system';
}

function getActionClass(action: string): string {
  const a = action?.toUpperCase() || '';
  if (a.includes('LOGIN') || a.includes('LOGOUT')) return 'login';
  if (a.includes('CREATE') || a.includes('APPROVE') || a.includes('INVITE') || a.includes('UNSUSPEND') || a.includes('UNBAN')) return 'create';
  if (a.includes('WARN') || a.includes('SUSPEND')) return 'warning';
  if (a.includes('BAN') || a.includes('DELETE') || a.includes('REJECT')) return 'danger';
  if (a.includes('REGISTERED') || a.includes('VERIFIED') || a.includes('PASSWORD_RESET') || a.includes('MAINTENANCE') || a.includes('SYSTEM')) return 'system';
  return 'info';
}

function getActionIcon(action: string): React.ReactNode {
  const a = action?.toUpperCase() || '';
  if (a.includes('REGISTERED')) return <UserCheck size={14} />;
  if (a.includes('PASSWORD_RESET')) return <KeyRound size={14} />;
  if (a.includes('MAINTENANCE')) return <Wrench size={14} />;
  if (a.includes('VERIFIED')) return <UserCheck size={14} />;
  return null;
}

function getAvatarInitials(name: string): string {
  if (!name) return 'SY';
  const parts = name.split(' ');
  return parts.length > 1 
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
    : name.substring(0, 2).toUpperCase();
}

function timeAgo(dateStr: string, t: (key: string, opts?: Record<string, string | number>) => string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('Just now');
  if (mins < 60) return `${mins}${t('m ago')}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}${t('h ago')}`;
  const days = Math.floor(hrs / 24);
  return `${days}${t('d ago')}`;
}

// ─── Main Component ──────────────────────────────────────────────────────────
const OpsManagerDashboard: React.FC = () => {
  const { apiFetch } = useJobitoAuth();
  const { t, language } = useTranslation();

  // ─── State ─────────────────────────────────────────────────────
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterEntity, setFilterEntity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Chart & Breakdown
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [totalChartActions, setTotalChartActions] = useState(0);
  const [actionBreakdown, setActionBreakdown] = useState<ActionBreakdown[]>([]);

  // ─── Fetch Activity Logs ───────────────────────────────────────
  const fetchActivities = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/ops-activities?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.data || []);
        setTotalActivities(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch, language]);

  // ─── Fetch Chart Data ─────────────────────────────────────────
  const fetchChart = useCallback(async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/ops-chart`);
      if (res.ok) {
        const data = await res.json();
        setChartData(data.hourly || []);
        setTotalChartActions(data.totalActions || 0);
        setActionBreakdown(data.actionBreakdown || []);
      }
    } catch (err) {
      console.error('Failed to fetch chart data:', err);
    }
  }, [apiFetch, language]);

  useEffect(() => {
    fetchActivities(currentPage);
  }, [fetchActivities, currentPage]);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  // ─── Derived Data ─────────────────────────────────────────────
  const filteredActivities = activities.filter(a => {
    const matchEntity = filterEntity === 'all' || getEntityClass(a.targetEntity) === filterEntity;
    const matchSearch = !searchQuery || 
      a.adminName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.actionType?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchEntity && matchSearch;
  });

  // Count KPIs comprehensively from actionBreakdown
  const getActionSum = (condition: (action_type: string) => boolean) => {
    return actionBreakdown
      .filter(a => condition(a.action_type?.toUpperCase() || ''))
      .reduce((sum, a) => sum + Number(a.count), 0);
  };

  const loginCount = getActionSum(a => a.includes('LOGIN'));
  const userActionCount = getActionSum(a => a.includes('USER'));
  const companyActionCount = getActionSum(a => a.includes('COMPANY') || a.includes('COMPAN'));
  const systemCount = getActionSum(a => a.includes('SYSTEM') || a.includes('REGISTERED') || a.includes('VERIFIED') || a.includes('PASSWORD_RESET') || a.includes('MAINTENANCE'));
  const alertCount = getActionSum(a => 
    a.includes('BAN') || 
    a.includes('SUSPEND') ||
    a.includes('DELETE') ||
    a.includes('FAILED_LOGIN')
  );

  // Build chart SVG path
  const chartWidth = 500;
  const chartHeight = 180;
  const chartPadding = 20;

  // Pad chart data to always have the last 24 hours
  const getPaddedChartData = () => {
    const padded: ChartPoint[] = [];
    const now = new Date();
    
    // Create map of existing data
    const dataMap = new Map<string, number>();
    chartData.forEach(d => {
      try {
        const hourDate = new Date(d.hour);
        if (!isNaN(hourDate.getTime())) {
          const key = `${hourDate.getFullYear()}-${hourDate.getMonth()}-${hourDate.getDate()} ${hourDate.getHours()}`;
          dataMap.set(key, Number(d.count));
        }
      } catch (e) {}
    });

    // Generate last 24 hours
    for (let i = 23; i >= 0; i--) {
      const hourDate = new Date(now.getTime() - i * 60 * 60 * 1000);
      const key = `${hourDate.getFullYear()}-${hourDate.getMonth()}-${hourDate.getDate()} ${hourDate.getHours()}`;
      
      const count = dataMap.get(key) || 0;
      
      // Format hour for display
      const formattedHour = hourDate.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
        hour: 'numeric',
        hour12: true
      });

      padded.push({
        hour: formattedHour,
        count
      });
    }

    return padded;
  };

  const paddedChartData = getPaddedChartData();

  const buildChartPath = (data: ChartPoint[]) => {
    if (data.length < 2) return { linePath: '', fillPath: '', dots: [] as {x: number, y: number, count: number}[] };

    const maxCount = Math.max(...data.map(d => Number(d.count)), 1);
    const stepX = (chartWidth - chartPadding * 2) / (data.length - 1);
    
    const points = data.map((d, i) => ({
      x: chartPadding + i * stepX,
      y: chartHeight - chartPadding - ((Number(d.count) / maxCount) * (chartHeight - chartPadding * 2)),
      count: Number(d.count),
    }));

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const fillPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - chartPadding} L ${points[0].x} ${chartHeight - chartPadding} Z`;

    return { linePath, fillPath, dots: points };
  };

  const { linePath, fillPath, dots } = buildChartPath(paddedChartData);

  // Breakdown categories
  const breakdownCategories = [
    { key: 'login', label: t('Login Activity'), icon: <LogIn size={16} />, count: loginCount },
    { key: 'user', label: t('User Actions'), icon: <Users size={16} />, count: userActionCount },
    { key: 'company', label: t('Company Actions'), icon: <Building2 size={16} />, count: companyActionCount },
    { key: 'admin', label: t('Admin Actions'), icon: <ShieldCheck size={16} />, count: actionBreakdown.filter(a => a.action_type?.includes('INVITE') || a.action_type?.includes('ADMIN')).reduce((s, a) => s + Number(a.count), 0) },
    { key: 'content', label: t('Content Actions'), icon: <FileText size={16} />, count: actionBreakdown.filter(a => a.action_type?.includes('CONTENT') || a.action_type?.includes('REPORT')).reduce((s, a) => s + Number(a.count), 0) },
    { key: 'system', label: t('System Events'), icon: <Server size={16} />, count: systemCount },
  ];

  const maxBreakdown = Math.max(...breakdownCategories.map(b => b.count), 1);

  return (
    <div className={styles.container}>

      {/* ── Page Title ── */}
      <div className={styles.pageTitle}>
        <div className={styles.pageTitleIcon}>
          <Activity size={22} />
        </div>
        {t("Operations Monitor")}
        <div className={styles.liveIndicator}>
          <div className={styles.liveDot} />
          {t("Live")}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>{t("Login Sessions")}</span>
            <div className={`${styles.kpiIcon} ${styles.blue}`}><LogIn size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{loginCount}</div>
          <div className={styles.kpiSub}>{t("Total overall")}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>{t("User Events")}</span>
            <div className={`${styles.kpiIcon} ${styles.green}`}><Users size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{userActionCount}</div>
          <div className={styles.kpiSub}>{t("Warn, suspend, ban actions")}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>{t("Company Events")}</span>
            <div className={`${styles.kpiIcon} ${styles.orange}`}><Building2 size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{companyActionCount}</div>
          <div className={styles.kpiSub}>{t("Review & approval actions")}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>{t("System Events")}</span>
            <div className={`${styles.kpiIcon} ${styles.purple}`}><Server size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{systemCount}</div>
          <div className={styles.kpiSub}>{t("Registration, verification, resets")}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>{t("Security Alerts")}</span>
            <div className={`${styles.kpiIcon} ${styles.red}`}><AlertTriangle size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{alertCount}</div>
          <div className={styles.kpiSub}>{t("Bans, suspensions, failed logins")}</div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className={styles.mainGrid}>

        {/* Hourly Activity Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <TrendingUp size={18} className={styles.chartTitleIcon} />
            {t("Hourly Activity (Last 24h)")}
          </div>
          <div className={styles.chartArea}>
            {paddedChartData.length < 2 ? (
              <div className={styles.emptyState} style={{ padding: '40px 0' }}>
                <div className={styles.emptyIcon}>📊</div>
                <div className={styles.emptyText}>{t("No chart data available yet")}</div>
              </div>
            ) : (
              <>
                <svg className={styles.chartSvg} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.00"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {[0, 1, 2, 3, 4].map((grid, idx) => {
                    const y = chartPadding + (idx * (chartHeight - chartPadding * 2)) / 4;
                    return (
                      <line 
                        key={idx} 
                        x1={chartPadding} 
                        y1={y} 
                        x2={chartWidth - chartPadding} 
                        y2={y} 
                        className={styles.chartGrid} 
                      />
                    );
                  })}

                  {/* Area Fill */}
                  <path d={fillPath} className={styles.chartFill} />

                  {/* Line */}
                  <path d={linePath} className={styles.chartLine} />

                  {/* Dots */}
                  {dots.map((dot, idx) => (
                    <circle 
                      key={idx} 
                      cx={dot.x} 
                      cy={dot.y} 
                      r={4} 
                      className={styles.chartDot} 
                    >
                      <title>{`${dot.count} ${t('actions')} at ${paddedChartData[idx]?.hour}`}</title>
                    </circle>
                  ))}
                </svg>

                {/* X Axis Labels */}
                <div className={styles.chartLabels}>
                  {paddedChartData.map((d, idx) => {
                    const shouldShow = idx === 0 || idx === paddedChartData.length - 1 || idx % 4 === 0;
                    return (
                      <span key={idx} className={styles.chartLabel} style={{ opacity: shouldShow ? 1 : 0 }}>
                        {d.hour}
                      </span>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Breakdown */}
        <div className={styles.breakdownCard}>
          <div className={styles.breakdownTitle}>
            <BarChart3 size={18} className={styles.chartTitleIcon} />
            {t("Activity Breakdown")}
          </div>
          <div className={styles.breakdownList}>
            {breakdownCategories.map(cat => (
              <div key={cat.key} className={styles.breakdownItem}>
                <div className={`${styles.breakdownIcon} ${styles[cat.key as keyof typeof styles] || ''}`}>
                  {cat.icon}
                </div>
                <div className={styles.breakdownInfo}>
                  <div className={styles.breakdownName}>{cat.label}</div>
                  <div className={styles.breakdownBar}>
                    <div 
                      className={`${styles.breakdownBarFill} ${styles[cat.key as keyof typeof styles] || ''}`}
                      style={{ width: `${Math.max(2, (cat.count / maxBreakdown) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className={styles.breakdownCount}>{cat.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Activity Log Table ── */}
      <div className={styles.activitySection}>
        <div className={styles.activityHeader}>
          <div className={styles.activityTitle}>
            <Activity size={18} />
            {t("System Activity Log")}
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 8 }}>
              ({totalActivities} {t("total")})
            </span>
          </div>
          <div className={styles.filterRow}>
            <select 
              className={styles.filterSelect} 
              value={filterEntity} 
              onChange={e => setFilterEntity(e.target.value)}
            >
              <option value="all">{t("All Entities")}</option>
              <option value="user">{t("Users")}</option>
              <option value="company">{t("Companies")}</option>
              <option value="admin">{t("Admins")}</option>
              <option value="content">{t("Content")}</option>
              <option value="system">{t("System")}</option>
            </select>
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} />
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder={t("Search activity...")} 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className={styles.tableHead}>
          <span>{t("Admin")}</span>
          <span>{t("Description")}</span>
          <span>{t("Target")}</span>
          <span>{t("Action")}</span>
          <span>{t("Time")}</span>
        </div>

        {/* Table Body */}
        <div className={styles.tableBody}>
          {isLoading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              {t("Loading activity data...")}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📋</div>
              <div className={styles.emptyText}>{t("No activity records found")}</div>
            </div>
          ) : (
            filteredActivities.map((log) => {
              const isSystemEvent = !log.adminName;
              const entityClass = getEntityClass(log.targetEntity);
              const avatarClass = isSystemEvent ? 'system' : 'admin';
              return (
                <div key={log.logId} className={styles.tableRow}>
                  {/* Admin */}
                  <div className={styles.cellUser}>
                    <div className={`${styles.cellAvatar} ${styles[avatarClass as keyof typeof styles] || ''}`}>
                      {isSystemEvent ? <Server size={14} /> : getAvatarInitials(log.adminName)}
                    </div>
                    <span className={styles.cellName}>{log.adminName || t('System')}</span>
                  </div>
                  {/* Description */}
                  <span className={styles.cellDesc} title={log.description}>
                    {log.description || log.actionType}
                  </span>
                  {/* Target Entity */}
                  <div className={styles.cellEntity}>
                    <span className={`${styles.entityBadge} ${styles[entityClass as keyof typeof styles] || ''}`}>
                      {t(log.targetEntity || 'System')}
                    </span>
                  </div>
                  {/* Action */}
                  <span className={`${styles.actionBadge} ${styles[getActionClass(log.actionType) as keyof typeof styles] || ''}`}>
                    {getActionIcon(log.actionType)} {t(log.actionType)}
                  </span>
                  {/* Time */}
                  <span className={styles.cellTime} title={new Date(log.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-GB')}>
                    {timeAgo(log.createdAt, t)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              className={styles.pageBtn} 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (pageNum > totalPages) return null;
              return (
                <button 
                  key={pageNum} 
                  className={`${styles.pageBtn} ${currentPage === pageNum ? styles.active : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <span className={styles.pageInfo}>
              {t("Page")} {currentPage} / {totalPages}
            </span>
            <button 
              className={styles.pageBtn} 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpsManagerDashboard;
