import React, { useState, useEffect } from 'react';
import { useJobitoAuth } from '../../../context/LinkContxt';
import { API_BASE_URL } from '../../../services/api';
import { useTranslation } from '../../../context/translation-context';
import { useTheme } from '../../../context/ThemeContext';
import styles from './CompanyReview.module.css';

// ── Types ─────────────────────────────────────────────────────────
type FilterTab = "ALL" | "PENDING" | "APPROVED" | "REJECTED";
type ViewMode = "COMPANIES" | "CRIMINAL_RECORDS";

interface Company {
  companyId: number;
  companyName: string;
  registrationDate: string;
  status: string;
  contactEmail: string;
  phone?: string;
  taxId?: string;
  licenseNumber?: string;
  officialNationalId?: string;
  crDocumentUrl?: string;
  taxDocumentUrl?: string;
  address?: string;
  logoUrl?: string;
}

interface CriminalRecordUser {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  criminalRecordUrl: string;
  avatarUrl?: string;
  status: string; // PENDING, VERIFIED, REJECTED
  classification?: string;
  registrationDate: string;
}

// Helper to construct complete backend URL for documents
const getAbsoluteDocUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Detect file type from URL
const getFileType = (url: string): 'image' | 'pdf' | 'unknown' => {
  const lower = url.toLowerCase();
  if (lower.match(/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/)) return 'image';
  if (lower.match(/\.pdf$/)) return 'pdf';
  return 'unknown';
};

// Inline Document Preview component
function InlineDocumentPreview({ url, title, t }: { url: string; title: string; t: any }) {
  const [lightbox, setLightbox] = useState(false);
  const fileType = getFileType(url);

  return (
    <div className={styles.inlinePreview}>
      {fileType === 'image' ? (
        <>
          <img
            src={url}
            alt={title}
            className={styles.previewImage}
            onClick={() => setLightbox(true)}
            title={t("Click to enlarge")}
          />
          {lightbox && (
            <div className={styles.lightboxOverlay} onClick={() => setLightbox(false)}>
              <img src={url} alt={title} className={styles.lightboxImage} />
            </div>
          )}
        </>
      ) : fileType === 'pdf' ? (
        <iframe
          src={url}
          title={title}
          className={styles.previewIframe}
        />
      ) : (
        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          📄 {t("Preview not available")}
        </div>
      )}
      <div className={styles.previewActions}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.openNewTabLink}
        >
          🔗 {t("Open in new tab")}
        </a>
      </div>
    </div>
  );
}

// ── Review Modals ──────────────────────────────────────────────────
function CompanyModal({ company, onClose, onReject, onApprove, loading, t }: {
  company: Company;
  onClose: () => void;
  onReject: () => void;
  onApprove: () => void;
  loading: boolean;
  t: any;
}) {
  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>
              {t("Commercial Registration Review")}
            </div>
            <div className={styles.modalSubtitle}>{company.companyName}</div>
          </div>
          <button onClick={onClose} className={styles.btnClose}>✕</button>
        </div>

        {/* Company Details */}
        <div className={styles.modalBody}>
          <div className={styles.modalDetailsGrid}>
            <DetailItem icon="📧" label={t("Email")} value={company.contactEmail} />
            <DetailItem icon="📞" label={t("Phone")} value={company.phone || '—'} />
            <DetailItem icon="🏢" label={t("Tax ID")} value={company.taxId || '—'} />
            <DetailItem icon="📋" label={t("License Number")} value={company.licenseNumber || '—'} />
            <DetailItem icon="🪪" label={t("National ID")} value={company.officialNationalId || '—'} />
            <DetailItem icon="📍" label={t("Address")} value={company.address || '—'} />
          </div>

          {/* Document Previews */}
          <div className={styles.modalDocsGrid}>
            <div className={styles.modalDocItem}>
              <div className={styles.modalDocTitle}>
                {t("Commercial Register")}
              </div>
              <div className={styles.documentCard}>
                {company.crDocumentUrl ? (
                  <InlineDocumentPreview
                    url={getAbsoluteDocUrl(company.crDocumentUrl)}
                    title={t("Commercial Register")}
                    t={t}
                  />
                ) : (
                  <>
                    <div className={styles.noDocIcon}>📄</div>
                    <span className={styles.noDocText}>{t("No document uploaded")}</span>
                  </>
                )}
              </div>
            </div>

            <div className={styles.modalDocItem}>
              <div className={styles.modalDocTitle}>
                {t("Tax Register")}
              </div>
              <div className={styles.documentCard}>
                {company.taxDocumentUrl ? (
                  <InlineDocumentPreview
                    url={getAbsoluteDocUrl(company.taxDocumentUrl)}
                    title={t("Tax Register")}
                    t={t}
                  />
                ) : (
                  <>
                    <div className={styles.noDocIcon}>📄</div>
                    <span className={styles.noDocText}>{t("No document uploaded")}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.modalFooter}>
          <button
            onClick={onReject}
            disabled={loading}
            className={`${styles.btnAction} ${styles.btnActionReject}`}
          >
            <span style={{ fontSize: '16px' }}>✕</span>
            {loading ? '...' : t("Reject")}
          </button>
          <button
            onClick={onApprove}
            disabled={loading}
            className={`${styles.btnAction} ${styles.btnActionApprove}`}
          >
            <span style={{ fontSize: '16px' }}>✓</span>
            {loading ? '...' : t("Approve")}
          </button>
        </div>
      </div>
    </div>
  );
}

function CriminalRecordModal({ user, onClose, onReject, onApprove, loading, t }: {
  user: CriminalRecordUser;
  onClose: () => void;
  onReject: () => void;
  onApprove: () => void;
  loading: boolean;
  t: any;
}) {
  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>
              {t("Criminal Record Review")}
            </div>
            <div className={styles.modalSubtitle}>{user.fullName}</div>
          </div>
          <button onClick={onClose} className={styles.btnClose}>✕</button>
        </div>

        {/* User Details */}
        <div className={styles.modalBody}>
          <div className={styles.modalDetailsGrid}>
            <DetailItem icon="📧" label={t("Email")} value={user.email} />
            <DetailItem icon="📞" label={t("Phone")} value={user.phone || '—'} />
            <DetailItem icon="👷" label={t("Classification")} value={user.classification || '—'} />
          </div>

          {/* Document Previews */}
          <div style={{ marginTop: '20px' }}>
            <div className={styles.modalDocTitle}>
              {t("Criminal Record Document")}
            </div>
            <div className={styles.documentCard}>
              {user.criminalRecordUrl ? (
                <InlineDocumentPreview
                  url={getAbsoluteDocUrl(user.criminalRecordUrl)}
                  title={t("Criminal Record Document")}
                  t={t}
                />
              ) : (
                <>
                  <div className={styles.noDocIcon}>📄</div>
                  <span className={styles.noDocText}>{t("No document uploaded")}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.modalFooter}>
          <button
            onClick={onReject}
            disabled={loading}
            className={`${styles.btnAction} ${styles.btnActionReject}`}
          >
            <span style={{ fontSize: '16px' }}>✕</span>
            {loading ? '...' : t("Reject")}
          </button>
          <button
            onClick={onApprove}
            disabled={loading}
            className={`${styles.btnAction} ${styles.btnActionApprove}`}
          >
            <span style={{ fontSize: '16px' }}>✓</span>
            {loading ? '...' : t("Approve")}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className={styles.modalDetailItem}>
      <span className={styles.detailIcon}>{icon}</span>
      <div>
        <div className={styles.detailLabel}>{label}</div>
        <div className={styles.detailValue}>{value}</div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
const CompanyReview: React.FC = () => {
  const { t, language } = useTranslation();
  const { theme } = useTheme();
  const { apiFetch } = useJobitoAuth();

  const [viewMode, setViewMode] = useState<ViewMode>("COMPANIES");
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [criminalRecords, setCriminalRecords] = useState<CriminalRecordUser[]>([]);
  
  const [reviewCompanyId, setReviewCompanyId] = useState<number | null>(null);
  const [reviewUserId, setReviewUserId] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<FilterTab>("PENDING");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Companies
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const pendingRes = await apiFetch(`${API_BASE_URL}/admin/ops/companies/pending`);
      let pendingCompanies: Company[] = [];
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        pendingCompanies = (data.data || []).map((c: any) => ({ 
          ...c, 
          status: c.status || 'PENDING' 
        }));
      } else {
        console.error("Failed to fetch pending companies:", pendingRes.status);
      }

      const allRes = await apiFetch(`${API_BASE_URL}/admin/ops/companies`);
      let allCompanies: Company[] = [];
      if (allRes.ok) {
        const data = await allRes.json();
        allCompanies = (data.data || []).map((c: any) => ({ 
          ...c, 
          status: c.status || 'PENDING' 
        }));
      }

      const companyMap = new Map<number, Company>();
      allCompanies.forEach(c => companyMap.set(c.companyId, c));
      pendingCompanies.forEach(c => companyMap.set(c.companyId, c));
      
      const finalResult = Array.from(companyMap.values());
      console.log("Fetched companies:", finalResult);
      setCompanies(finalResult);
    } catch (err) {
      console.error("Error in fetchCompanies:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Criminal Records
  const fetchCriminalRecords = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/ops/criminal-records`);
      if (res.ok) {
        const data = await res.json();
        setCriminalRecords(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === "COMPANIES") {
      fetchCompanies();
    } else {
      fetchCriminalRecords();
    }
  }, [apiFetch, viewMode, language]);

  // Actions
  const handleCompanyAction = async (id: number, action: "Approved" | "Rejected") => {
    setActionLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/ops/companies/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: id, action: action === "Approved" ? "approve" : "reject" })
      });
      if (res.ok) {
        setReviewCompanyId(null);
        await fetchCompanies();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCrAction = async (id: string, action: "Approved" | "Rejected") => {
    setActionLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/ops/criminal-records/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: action === "Approved" ? "approve" : "reject" })
      });
      if (res.ok) {
        setReviewUserId(null);
        await fetchCriminalRecords();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Rendering Helpers
  const getStatusBadge = (status: string) => {
    if (!status) return { bg: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', text: t('Unknown'), icon: '?' };
    const s = status.toUpperCase();
    if (s === 'PENDING') return { bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#fff', text: t('Pending'), icon: '⏳' };
    if (s === 'APPROVED' || s === 'VERIFIED') return { bg: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', text: t('Approved'), icon: '✓' };
    if (s === 'REJECTED') return { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', text: t('Rejected'), icon: '✕' };
    return { bg: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', text: status, icon: '?' };
  };

  const reviewCompanyTarget = companies.find(c => c.companyId === reviewCompanyId) ?? null;
  const reviewCrTarget = criminalRecords.find(u => u.userId === reviewUserId) ?? null;

  const currentList = viewMode === "COMPANIES" ? companies : criminalRecords;
  const filteredList = activeTab === "ALL"
    ? currentList
    : currentList.filter(item => {
        // companies use 'status', users use 'status' too but mapping 'APPROVED'/'VERIFIED'
        const s = (item as any).status.toUpperCase();
        if (activeTab === "APPROVED") return s === "APPROVED" || s === "VERIFIED";
        return s === activeTab;
      });

  const pendingCount = currentList.filter(i => (i as any).status.toUpperCase() === "PENDING").length;
  const approvedCount = currentList.filter(i => {
    const s = (i as any).status.toUpperCase();
    return s === "APPROVED" || s === "VERIFIED";
  }).length;
  const rejectedCount = currentList.filter(i => (i as any).status.toUpperCase() === "REJECTED").length;

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "ALL", label: t("All"), count: currentList.length },
    { key: "PENDING", label: t("Pending"), count: pendingCount },
    { key: "APPROVED", label: t("Approved"), count: approvedCount },
    { key: "REJECTED", label: t("Rejected"), count: rejectedCount },
  ];

  return (
    <div className={styles.root} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className={styles.body}>
        
        {/* Top Header & Switcher */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            {viewMode === "COMPANIES" ? t("Company Registration Requests") : t("Criminal Record Reviews")}
          </h1>

          <div className={styles.modeSwitcher}>
            <button
              onClick={() => { setViewMode("COMPANIES"); setActiveTab("PENDING"); }}
              className={`${styles.modeBtn} ${viewMode === "COMPANIES" ? styles.modeBtnActive : ''}`}
            >
              🏢 {t("Companies")}
            </button>
            <button
              onClick={() => { setViewMode("CRIMINAL_RECORDS"); setActiveTab("PENDING"); }}
              className={`${styles.modeBtn} ${viewMode === "CRIMINAL_RECORDS" ? styles.modeBtnActive : ''}`}
            >
              👷 {t("Tradesmen")}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={styles.tabsContainer}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`${styles.tab} ${styles[`tab_${tab.key.toLowerCase()}`]} ${activeTab === tab.key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className={`${styles.tabBadge} ${activeTab === tab.key ? styles.tabBadgeActive : ''}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableScroll}>
            {loading ? (
              <div className={styles.spinnerCell}>
                <div className={styles.spinner} />
                <div style={{ marginTop: '12px' }}>{t("Loading")}...</div>
              </div>
            ) : filteredList.length === 0 ? (
              <div className={styles.emptyCell}>
                <div className={styles.emptyIcon}>
                  {viewMode === "COMPANIES" ? '🏢' : '📋'}
                </div>
                <div className={styles.emptyText}>
                  {activeTab === "PENDING" ? t("No pending requests") : t("No records found")}
                </div>
              </div>
            ) : (
              <table className={styles.table}>
                <thead className={styles.thead}>
                  <tr className={styles.tableHeader}>
                    <th className={styles.th}>
                      {viewMode === "COMPANIES" ? t("Company") : t("Applicant")}
                    </th>
                    <th className={styles.th}>{t("Email")}</th>
                    <th className={styles.th}>{t("Submission Date")}</th>
                    <th className={styles.th}>{t("Status")}</th>
                    <th className={styles.th}>{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((item: any) => {
                    const isCompany = viewMode === "COMPANIES";
                    const itemId = isCompany ? item.companyId : item.userId;
                    const itemName = isCompany ? item.companyName : item.fullName;
                    const itemEmail = isCompany ? item.contactEmail : item.email;
                    
                    const badge = getStatusBadge(item.status);
                    const isPending = item.status.toUpperCase() === 'PENDING';
                    
                    return (
                      <tr key={itemId} className={styles.tableRow}>
                        {/* Name + Avatar */}
                        <td className={styles.td} data-label={isCompany ? t("Company") : t("Applicant")}>
                          <div className={styles.nameAvatarWrapper}>
                            <div className={styles.companyAvatar}>
                              {itemName?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className={styles.itemNameText}>{itemName}</span>
                          </div>
                        </td>
                        {/* Email */}
                        <td className={styles.td} data-label={t("Email")}>
                          <span className={styles.cellText}>{itemEmail || '—'}</span>
                        </td>
                        {/* Date */}
                        <td className={styles.td} data-label={t("Submission Date")}>
                          <span className={styles.cellText}>
                            {item.registrationDate ? new Date(item.registrationDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB') : '—'}
                          </span>
                        </td>
                        {/* Status Badge */}
                        <td className={styles.td} data-label={t("Status")}>
                          <span style={{
                            background: badge.bg,
                            color: badge.color,
                          }} className={styles.statusBadge}>
                            {badge.icon} {badge.text}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className={styles.td} data-label={t("Actions")}>
                          {isPending ? (
                            <div className={styles.actionsWrapper}>
                              {/* View Details */}
                              <button
                                onClick={() => isCompany ? setReviewCompanyId(itemId) : setReviewUserId(itemId)}
                                className={styles.btnTableAction}
                                title={t("View Details")}
                              >
                                📄 {t("Review")}
                              </button>
                              {/* Reject */}
                              <button
                                onClick={() => isCompany ? handleCompanyAction(itemId, "Rejected") : handleCrAction(itemId, "Rejected")}
                                className={`${styles.btnIcon} ${styles.btnIconReject}`}
                                title={t("Reject")}
                              >
                                ✕
                              </button>
                              {/* Approve */}
                              <button
                                onClick={() => isCompany ? handleCompanyAction(itemId, "Approved") : handleCrAction(itemId, "Approved")}
                                className={`${styles.btnIcon} ${styles.btnIconApprove}`}
                                title={t("Approve")}
                              >
                                ✓
                              </button>
                            </div>
                          ) : (
                            <span className={styles.reviewedText}>
                              {t("Reviewed")}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Summary Footer */}
        <div className={styles.summaryFooter}>
          <span>⏳ {pendingCount} {t("Pending review")}</span>
          <span>✓ {approvedCount} {t("Approved")}</span>
          <span>✕ {rejectedCount} {t("Rejected")}</span>
        </div>
      </div>

      {/* Modals */}
      {reviewCompanyTarget && viewMode === "COMPANIES" && (
        <CompanyModal
          company={reviewCompanyTarget as Company}
          onClose={() => setReviewCompanyId(null)}
          onReject={() => handleCompanyAction(reviewCompanyTarget.companyId, "Rejected")}
          onApprove={() => handleCompanyAction(reviewCompanyTarget.companyId, "Approved")}
          loading={actionLoading}
          t={t}
        />
      )}
      
      {reviewCrTarget && viewMode === "CRIMINAL_RECORDS" && (
        <CriminalRecordModal
          user={reviewCrTarget as CriminalRecordUser}
          onClose={() => setReviewUserId(null)}
          onReject={() => handleCrAction(reviewCrTarget.userId, "Rejected")}
          onApprove={() => handleCrAction(reviewCrTarget.userId, "Approved")}
          loading={actionLoading}
          t={t}
        />
      )}
    </div>
  );
};

export default CompanyReview;

