import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import styles from './SuperAdmin.module.css';
import { useTranslation } from '../../../context/translation-context';
import { useToast } from '../../../context/ToastContext';
import { useJobitoAuth } from '../../../context/LinkContxt';
import { API_BASE_URL } from '../../../services/api';
import { Settings, PieChart, TrendingUp, Clock, EyeIcon, EyeOffIcon } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Filler, Tooltip, Legend);

// ─── Sparkline Component ─────────────────────────────────────────────────────
const SparkLine = ({ data, color }: { data: number[]; color: string }) => {
  const colors: Record<string, { border: string; bg: string }> = {
    success: { border: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    info:    { border: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
    warn:    { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  };

  const c = colors[color] || colors.info;

  return (
    <div className={styles.sparklineContainer}>
      <Line
        data={{
          labels: ['M','T','W','T','F','S','S'],
          datasets: [{
            data,
            borderColor: c.border,
            backgroundColor: c.bg,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHitRadius: 0,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { display: false },
            y: { display: false, min: Math.min(...data) - 5 },
          },
          animation: { duration: 0 },
        }}
      />
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const SuperAdminDashboard: React.FC = () => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const { apiFetch, user } = useJobitoAuth();
  const isSuperAdmin = user?.adminRole === 'super_admin' || user?.adminRole === 'operation_manager';

  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceOn, setMaintenanceOn] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [monitoringReports, setMonitoringReports] = useState<any[]>([]);

  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [newAdminRole, setNewAdminRole] = useState('operation_manager');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (isSuperAdmin) {
          const [statsRes, chartRes, maintRes, monitorRes] = await Promise.all([
            apiFetch(`${API_BASE_URL}/admin/dashboard/stats`),
            apiFetch(`${API_BASE_URL}/admin/dashboard/charts`),
            apiFetch(`${API_BASE_URL}/admin/maintenance`),
            apiFetch(`${API_BASE_URL}/monitoring/reports`),
          ]);
          if (statsRes.ok) setStatsData(await statsRes.json());
          if (chartRes.ok) setChartData(await chartRes.json());
          if (maintRes.ok) setMaintenanceOn((await maintRes.json()).maintenanceMode);
          if (monitorRes.ok) setMonitoringReports(await monitorRes.json());
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [apiFetch, isSuperAdmin, language]);

  const handleToggleMaintenance = async () => {
    const newVal = !maintenanceOn;
    setMaintenanceOn(newVal);
    try {
      await apiFetch(`${API_BASE_URL}/admin/maintenance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newVal })
      });
    } catch (err) {
      setMaintenanceOn(!newVal);
    }
  };

  const handleInviteAdmin = async () => {
    if (!newAdminName || !newAdminEmail || !newAdminPassword) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fullName: newAdminName, 
          email: newAdminEmail, 
          password: newAdminPassword, 
          role: newAdminRole
        })
      });
      if (res.ok) {
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminPassword('');
        showToast(t('Admin invited successfully'));
      } else {
        const data = await res.json();
        showToast(t(data.message || 'Failed to invite admin'));
      }
    } catch (err) {
      console.error('Error inviting admin:', err);
    }
  };

  // ─── Chart Configurations ──────────────────────────────────────────────────
  const activityData = chartData?.activity || [];
  const barLabels = activityData.map((a: any) => {
    const d = new Date(a.date);
    return d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short' });
  });
  const barValues = activityData.map((a: any) => parseInt(a.count));
  const displayLabels = barLabels.length > 0 ? barLabels : Array(12).fill('');
  const displayValues = barValues.length > 0 ? barValues : [240, 330, 260, 360, 390, 330, 360, 240, 390, 440, 500, 500];

  const barData = {
    labels: displayLabels,
    datasets: [
      {
        data: displayValues,
        backgroundColor: '#3b82f6',
        borderRadius: 4,
        barPercentage: 0.35,
        categoryPercentage: 1.0,
      },
      {
        data: Array(displayValues.length).fill(Math.max(...displayValues, 100) * 1.15), // Background bars
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        barPercentage: 0.35,
        categoryPercentage: 1.0,
        grouped: false,
      }
    ],
  };

  const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: { 
        beginAtZero: true, 
        max: Math.max(...displayValues, 100) * 1.2,
        ticks: { stepSize: 100, color: '#94a3b8', font: { size: 11, weight: '500' } },
        grid: { display: false },
        border: { display: false }
      },
    },
    layout: { padding: { top: 10, bottom: 0 } }
  };

  const dist = statsData?.userDistribution || { trainees: 0, companies: 0, staff: 0 };
  const totalDist = dist.trainees + dist.companies + dist.staff;

  const doughnutData = {
    labels: [t('Trainees'), t('Companies'), t('Staff')],
    datasets: [{
      data: [dist.trainees, dist.companies, dist.staff],
      backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b'],
      borderWidth: 0,
      cutout: '78%',
    }]
  };

  const doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  };

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() - (13 - i));
    return d;
  });

  const reportsLabels = last14Days.map((d, i) => {
    if (i === 0) return t('2 Weeks Ago');
    if (i === 6) return t('1 Week Ago');
    if (i === 13) return t('Today');
    return '';
  });

  const reportsValues = last14Days.map(day => {
    return monitoringReports.filter(r => {
      const rd = new Date(r.createdAt);
      return rd.toDateString() === day.toDateString();
    }).length;
  });

  const lineData = {
    labels: reportsLabels,
    datasets: [{
      data: reportsValues,
      borderColor: '#f43f5e',
      borderWidth: 2,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#f43f5e',
      pointBorderWidth: 2,
      pointRadius: 4,
      fill: false,
      tension: 0.1,
    }],
  };

  const lineOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { 
        grid: { color: '#f1f5f9' }, 
        border: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      y: { display: false, min: 0 },
    },
  };

  const revenueValue = statsData?.operationsRevenue ?? statsData?.revenue ?? statsData?.totalRevenue ?? statsData?.totalOperationsRevenue;

  return (
    <div className={styles.container} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <main className={styles.mainContent}>
        
        {/* KPI Cards */}
        <div className={styles.statsGrid}>
          {/* Card 1: Active Users */}
          <div className={styles.kpiCard}>
            {isLoading ? (
              <div className={styles.kpiHeader} style={{ width: '100%' }}>
                <div className={styles.kpiLabelBox} style={{ width: '60%' }}>
                  <span className={styles.kpiLabel}>{t("Active Users")}</span>
                  <div className={`${styles.skeleton} ${styles.skeletonText}`} />
                </div>
                <div className={`${styles.skeleton} ${styles.skeletonBadge}`} />
              </div>
            ) : (
              <div className={styles.kpiHeader}>
                <div className={styles.kpiLabelBox}>
                  <span className={styles.kpiLabel}>{t("Active Users")}</span>
                  <h2 className={styles.kpiValue}>
                    {statsData?.activeUsers !== undefined && statsData?.activeUsers !== null 
                      ? Number(statsData.activeUsers).toLocaleString() 
                      : '0'}
                  </h2>
                </div>
                <span className={`${styles.kpiBadge} ${styles.badgeSuccess}`}>20% ↗</span>
              </div>
            )}
            {isLoading ? (
              <div className={`${styles.skeleton} ${styles.skeletonSparkline}`} />
            ) : (
              <SparkLine data={[10, 15, 12, 20, 18, 25, 22]} color="success" />
            )}
          </div>

          {/* Card 2: Companies */}
          <div className={styles.kpiCard}>
            {isLoading ? (
              <div className={styles.kpiHeader} style={{ width: '100%' }}>
                <div className={styles.kpiLabelBox} style={{ width: '60%' }}>
                  <span className={styles.kpiLabel}>{t("Companies")}</span>
                  <div className={`${styles.skeleton} ${styles.skeletonText}`} />
                </div>
                <div className={`${styles.skeleton} ${styles.skeletonBadge}`} />
              </div>
            ) : (
              <div className={styles.kpiHeader}>
                <div className={styles.kpiLabelBox}>
                  <span className={styles.kpiLabel}>{t("Companies")}</span>
                  <h2 className={styles.kpiValue}>
                    {statsData?.userDistribution?.companies !== undefined && statsData?.userDistribution?.companies !== null 
                      ? Number(statsData.userDistribution.companies).toLocaleString() 
                      : '0'}
                  </h2>
                </div>
                <span className={`${styles.kpiBadge} ${styles.badgeInfo}`}>12% ↗</span>
              </div>
            )}
            {isLoading ? (
              <div className={`${styles.skeleton} ${styles.skeletonSparkline}`} />
            ) : (
              <SparkLine data={[5, 10, 8, 12, 15, 20, 18]} color="info" />
            )}
          </div>

          {/* Card 3: System Uptime */}
          <div className={styles.kpiCard}>
            {isLoading ? (
              <div className={styles.kpiHeader} style={{ width: '100%' }}>
                <div className={styles.kpiLabelBox} style={{ width: '60%' }}>
                  <span className={styles.kpiLabel}>{t("System Uptime")}</span>
                  <div className={`${styles.skeleton} ${styles.skeletonText}`} />
                </div>
                <div className={`${styles.skeleton} ${styles.skeletonBadge}`} />
              </div>
            ) : (
              <div className={styles.kpiHeader}>
                <div className={styles.kpiLabelBox}>
                  <span className={styles.kpiLabel}>{t("System Uptime")}</span>
                  <h2 className={styles.kpiValue}>{statsData?.systemUptime || '100'}%</h2>
                </div>
                <span className={`${styles.kpiBadge} ${styles.badgeWarn}`}>{statsData?.systemUptime || '100'}% ↗</span>
              </div>
            )}
            {isLoading ? (
              <div className={`${styles.skeleton} ${styles.skeletonSparkline}`} />
            ) : (
              <SparkLine data={[90, 92, 91, 95, 94, 98, 97]} color="warn" />
            )}
          </div>

          {/* Card 4: Active Security Alerts */}
          <div className={`${styles.kpiCard} ${styles.kpiCardAlert}`}>
            {isLoading ? (
              <div className={styles.kpiHeader} style={{ width: '100%' }}>
                <div className={styles.kpiLabelBox} style={{ width: '80%' }}>
                  <span className={styles.kpiLabel}>{t("Active Security Alerts")}</span>
                  <div className={`${styles.skeleton} ${styles.skeletonText}`} />
                </div>
              </div>
            ) : (
              <div className={styles.kpiHeader}>
                <div className={styles.kpiLabelBox}>
                  <span className={styles.kpiLabel}>{t("Active Security Alerts")}</span>
                  <h2 className={styles.kpiValue}>{statsData?.activeSecurityAlerts || '0'}</h2>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Layout */}
        <div className={styles.dashboardLayout}>
          
          {/* Left Column */}
          <div className={styles.leftCol}>
            <div className={styles.barChartCard}>
              {isLoading ? (
                <div className={`${styles.skeleton} ${styles.skeletonChart}`} />
              ) : (
                <div className={styles.barChartContainer}>
                  <Bar data={barData} options={barOptions} />
                </div>
              )}
            </div>

            <div className={styles.lineChartCard}>
              <div className={styles.chartHeaderRow}>
                <div className={styles.chartTitleBox}>
                  <TrendingUp size={16} color="#f43f5e" />
                  <h3 className={styles.chartTitle}>{t("Content Reports Trend (بلاغات)")}</h3>
                </div>
                <span className={styles.timeBadge}>{t("Last 14 Days")}</span>
              </div>
              <div className={styles.lineChartContainer}>
                {isLoading ? (
                  <div className={`${styles.skeleton} ${styles.skeletonChart}`} />
                ) : (
                  <Line data={lineData} options={lineOptions} />
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightCol}>
            <div className={styles.donutCard}>
              <div className={styles.donutHeader}>
                <PieChart size={16} color="#6366f1" />
                <h3>{t("User Distribution")}</h3>
              </div>
              
              {isLoading ? (
                <div className={styles.donutBody} style={{ minHeight: '150px', justifyContent: 'center', alignItems: 'center' }}>
                  <div className={`${styles.skeleton} ${styles.skeletonCircle}`} />
                </div>
              ) : (
                <div className={styles.donutBody}>
                  <div className={styles.donutChartContainer}>
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                    <div className={styles.donutCenter}>
                      <h4>
                        {statsData?.activeUsers !== undefined && statsData?.activeUsers !== null
                          ? statsData.activeUsers >= 1000
                            ? `${(statsData.activeUsers / 1000).toFixed(1)}k`
                            : statsData.activeUsers
                          : '0'}
                      </h4>
                      <span>{t("Users")}</span>
                    </div>
                  </div>
                  
                  <div className={styles.donutLegend}>
                    <div className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: '#3b82f6' }}></span>
                      <span className={styles.legendText}>{t("Trainees")} ({totalDist > 0 ? Math.round((dist.trainees / totalDist) * 100) : 0}%)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: '#8b5cf6' }}></span>
                      <span className={styles.legendText}>{t("Companies")} ({totalDist > 0 ? Math.round((dist.companies / totalDist) * 100) : 0}%)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: '#f59e0b' }}></span>
                      <span className={styles.legendText}>{t("Staff")} ({totalDist > 0 ? Math.round((dist.staff / totalDist) * 100) : 0}%)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.controlsCard}>
              <div className={styles.controlsHeader}>
                <Settings size={18} color="#94a3b8" />
                <h3>{t("Quick Controls")}</h3>
              </div>
              <p className={styles.controlsSub}>{t("Quick Access To Critical Functions")}</p>
              
              <div className={styles.controlItem}>
                <div className={styles.controlInfo}>
                  <h4>{t("Maintenance Mode")}</h4>
                  <p>{t("Disable External User Access")}</p>
                </div>
                <div 
                  className={`${styles.toggle} ${maintenanceOn ? styles.toggleOn : ''}`}
                  onClick={handleToggleMaintenance}
                >
                  <div className={styles.toggleCircle}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Form */}
        <div className={styles.adminFormCard}>
          <div className={styles.formHeaderRow}>
            <div>
              <h2 className={styles.formTitle}>{t("Add New Admin")}</h2>
              <p className={styles.formSub}>{t("Invite A New Member To Join The Dashboard With Specific Permissions")}</p>
            </div>
            <span className={styles.exclusiveBadge}>{t("Exclusive Access")}</span>
          </div>

          <div className={styles.formInputsRow}>
            <div className={styles.inputGroup}>
              <label>{t("Full Name")}</label>
              <input 
                type="text" 
                value={newAdminName}
                onChange={e => setNewAdminName(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>{t("Email Address")}</label>
              <input 
                type="email" 
                placeholder={t("Admin @jobito.com")}
                value={newAdminEmail}
                onChange={e => setNewAdminEmail(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>{t("Password")}</label>
              <div className={styles.passwordWrapper}>
                <input 
                  type={showAdminPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={newAdminPassword}
                  onChange={e => setNewAdminPassword(e.target.value)}
                  dir="ltr"
                />
                <button 
                  type="button" 
                  className={styles.eyeButton} 
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                >
                  {showAdminPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>{t("Role")}</label>
              <select 
                value={newAdminRole}
                onChange={e => setNewAdminRole(e.target.value)}
              >
                <option value="operation_manager">{t("Operation Manager")}</option>
                <option value="super_admin">{t("Super Admin")}</option>
              </select>
            </div>
            <button className={styles.inviteBtn} onClick={handleInviteAdmin}>
              {t("Send invitation")}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default SuperAdminDashboard;
