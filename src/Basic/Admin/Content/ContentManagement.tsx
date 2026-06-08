import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobitoAuth } from '../../../context/LinkContxt';
import { API_BASE_URL } from '../../../services/api';
import { useTranslation } from '../../../context/translation-context';
import { useTheme } from '../../../context/ThemeContext';
import styles from './ContentManagement.module.css';

// ── Types ─────────────────────────────────────────────────────────
type ReasonTag = "Academic Cheating" | "Fraud / Spam" | "Hate Speech" | "Misinformation" | string;

const ContentManagement: React.FC = () => {
  const { t, language } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { apiFetch, user: authUser } = useJobitoAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [rows, setRows] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'job' | 'company'>('company');

  const filteredRows = rows.filter((r) => {
    if (activeFilter === 'job') return r.contentType === 'job';
    if (activeFilter === 'company') return r.contentType !== 'job';
    return true;
  });

  const fetchContent = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/ops/content/reported`);
      if (res.ok) {
        const data = await res.json();
        setRows(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [apiFetch, language]);

  const handleDelete = async (id: number, notify: boolean = false) => {
    setDeletingId(id);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/ops/content/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: id, action: 'delete', notifyViolation: notify })
      });
      if (res.ok) {
        setRows((prev) => prev.filter((r) => r.reportId !== id));
      }
    } catch (err) {
      console.error(err);
    }
    setDeletingId(null);
  };

  const handleDismiss = async (id: number, notify: boolean = false) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/ops/content/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: id, action: 'dismiss', notifyViolation: notify })
      });
      if (res.ok) {
        setRows((prev) => prev.filter((r) => r.reportId !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleView = (row: any) => {
    if (row.contentType === 'job') {
      navigate('/Job details', { state: { jobId: row.contentId } });
    } else if (row.contentType === 'company' || row.contentType === 'company_review') {
      navigate(`/Company/${row.contentId}`);
    } else {
      navigate(`/Profile/${row.contentId}`);
    }
  };

  const getReasonBadgeClass = (reason: ReasonTag) => {
    // In a real app, you might have specific classes in CSS for each reason
    // For now, we can use inline colors for dynamic reasons or mapping
    const map: Record<ReasonTag, { bg: string; color: string }> = {
      "Academic Cheating": { bg: "var(--color-accent-light)", color: "var(--color-accent)" },
      "Fraud / Spam":      { bg: "rgba(229, 62, 62, 0.1)", color: "#E53E3E" },
      "Hate Speech":       { bg: "var(--color-primary-light)", color: "var(--color-primary)" },
      "Misinformation":    { bg: "var(--color-bg-tertiary)", color: "var(--color-text-secondary)" },
    };
    return map[reason] || { bg: "var(--color-bg-tertiary)", color: "var(--color-text-secondary)" };
  };

  return (
    <div className={styles.root} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>{t("Reported Content")}</h2>
            <div style={{ display: 'flex', backgroundColor: 'var(--color-bg-tertiary, #EDF2F7)', padding: '4px', borderRadius: '8px', gap: '4px' }}>
              <button 
                onClick={() => setActiveFilter('company')}
                style={{ 
                  padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                  backgroundColor: activeFilter === 'company' ? 'var(--color-primary, #3182CE)' : 'transparent',
                  color: activeFilter === 'company' ? '#fff' : 'var(--color-text-secondary, #4A5568)',
                  transition: 'all 0.2s ease'
                }}
              >
                {t("الشركات")} 🏢
              </button>
              <button 
                onClick={() => setActiveFilter('job')}
                style={{ 
                  padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                  backgroundColor: activeFilter === 'job' ? 'var(--color-primary, #3182CE)' : 'transparent',
                  color: activeFilter === 'job' ? '#fff' : 'var(--color-text-secondary, #4A5568)',
                  transition: 'all 0.2s ease'
                }}
              >
                {t("الوظائف")} 💼
              </button>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>{t("Post Owner")}</th>
                  <th className={styles.th}>{t("Content")}</th>
                  <th className={styles.th}>{t("Reason")}</th>
                  <th className={styles.th}>{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.td} style={{ textAlign: 'center', padding: '40px' }}>
                      {t("No flagged content — all clear ✓")}
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.reportId} className={styles.tr}>
                      <td className={styles.td} data-label={t("Post Owner")}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img 
                            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${row.postOwnerId || row.postOwner}`} 
                            alt={row.postOwner} 
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                          />
                          <div>
                            <div style={{ fontWeight: 700 }}>{row.postOwner}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #718096)', marginTop: '4px' }}>
                              ID: {row.postOwnerId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.td} data-label={t("Content")}>
                        <div style={{ fontWeight: 500 }}>{row.content}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #718096)', marginTop: '4px' }}>
                          {t("Type:")} {row.contentType} <br/>
                          ID: {row.contentId}
                        </div>
                      </td>
                      <td className={styles.td} data-label={t("Reason")}>
                        <span 
                          className={styles.badge} 
                          style={{ 
                            backgroundColor: getReasonBadgeClass(row.reason).bg, 
                            color: getReasonBadgeClass(row.reason).color,
                            border: `1px solid ${getReasonBadgeClass(row.reason).color}33`,
                            display: 'inline-block'
                          }}
                        >
                          {t(row.reason)}
                        </span>
                        {row.customReason && (
                          <div style={{ fontSize: '13px', color: 'var(--color-text, #2D3748)', marginTop: '8px', maxWidth: '250px', lineHeight: '1.4' }}>
                            <strong>{t("التفاصيل:")}</strong> {row.customReason}
                          </div>
                        )}
                      </td>
                      <td className={styles.td} data-label={t("Actions")}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {activeFilter === 'company' && (
                            <button 
                              className={`${styles.btn} ${styles.btnDanger}`}
                              onClick={() => handleDismiss(row.reportId, true)}
                              title={t("إرسال إنذار وحذف البلاغ")}
                              style={{ opacity: 0.85 }}
                            >
                              {t("إنذار")}
                            </button>
                          )}
                          {activeFilter === 'job' && (
                            <button 
                              className={`${styles.btn} ${styles.btnDanger}`}
                              onClick={() => handleDelete(row.reportId, true)}
                              title={t("حذف الوظيفة وإرسال إنذار للشركة")}
                              style={{ opacity: 0.85 }}
                            >
                              {t("حذف بإنذار")}
                            </button>
                          )}
                          <button 
                            className={`${styles.btn} ${styles.btnOutline}`}
                            onClick={() => handleDismiss(row.reportId, false)}
                            title={t("Reject Report")}
                            style={{ color: '#E53E3E', borderColor: '#E53E3E' }}
                          >
                            {t("رفض")}
                          </button>
                          <button 
                            className={`${styles.btn} ${styles.btnOutline}`}
                            onClick={() => handleView(row)}
                          >
                            {t("عرض")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          {filteredRows.length} {t("flagged items pending review")}
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
