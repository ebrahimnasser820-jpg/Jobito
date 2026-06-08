import React, { useState, useEffect } from 'react';
import { useJobitoAuth } from '../../../context/LinkContxt';
import { useTranslation } from '../../../context/translation-context';
import { useToast } from '../../../context/ToastContext';
import { useTheme } from '../../../context/ThemeContext';
import { API_BASE_URL } from '../../../services/api';
import {
  ClipboardList,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  Mail,
  User,
  FileText,
  ChevronRight,
  UserCog,
} from 'lucide-react';
import styles from './SystemRequests.module.css';

interface SystemRequest {
  requestId: number;
  requestType: string;
  candidateName: string;
  candidateEmail: string;
  reason: string;
  status: string;
  requesterName: string;
  createdAt: string;
}

const SystemRequests: React.FC = () => {
  const { apiFetch } = useJobitoAuth();
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [requests, setRequests] = useState<SystemRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/system-requests`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [apiFetch, language]);

  const handleReview = async (id: number, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/system-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewNote: t('Reviewed by Super Admin') }),
      });
      if (res.ok) {
        showToast(t(action === 'approve' ? 'Request approved successfully' : 'Request rejected'));
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
    setActionLoading(null);
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return { icon: <CheckCircle2 size={16} />, label: t('Approved'), cls: styles.statusApproved };
      case 'rejected':
        return { icon: <XCircle size={16} />, label: t('Rejected'), cls: styles.statusRejected };
      default:
        return { icon: <Hourglass size={16} />, label: t('Pending'), cls: styles.statusPending };
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.headerIconBox}>
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>{t('System Requests')}</h1>
            <p className={styles.pageSubtitle}>
              {t('Review and manage assistant addition requests from Operations Managers')}
            </p>
          </div>
        </div>
        <div className={styles.statsRow}>
          <div className={`${styles.statChip} ${styles.statPending}`}>
            <Hourglass size={14} /> {pendingCount} {t('Pending')}
          </div>
          <div className={`${styles.statChip} ${styles.statApproved}`}>
            <CheckCircle2 size={14} /> {approvedCount} {t('Approved')}
          </div>
          <div className={`${styles.statChip} ${styles.statRejected}`}>
            <XCircle size={14} /> {rejectedCount} {t('Rejected')}
          </div>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <span>{t('Loading')}...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h3>{t('No requests yet')}</h3>
          <p>{t('No system requests have been submitted by Operations Managers')}</p>
        </div>
      ) : (
        <div className={styles.requestsGrid}>
          {requests.map((req) => {
            const statusInfo = getStatusInfo(req.status);
            const isPending = req.status === 'pending';
            return (
              <div key={req.requestId} className={`${styles.requestCard} ${isPending ? styles.pendingCard : ''}`}>
                <div className={styles.cardTop}>
                  <div className={styles.requestType}>
                    <UserPlus size={16} />
                    <span>{req.requestType === 'ADD_ASSISTANT' ? t('Add Assistant') : t(req.requestType)}</span>
                  </div>
                  <div className={`${styles.statusBadge} ${statusInfo.cls}`}>
                    {statusInfo.icon}
                    {statusInfo.label}
                  </div>
                </div>

                {/* Requester Info */}
                <div className={styles.requesterRow}>
                  <UserCog size={14} />
                  <span>{t('Requested by')}: <strong>{req.requesterName}</strong></span>
                </div>

                {/* Candidate Info */}
                <div className={styles.candidateInfo}>
                  <div className={styles.candidateAvatar}>
                    {req.candidateName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className={styles.candidateName}>{req.candidateName}</div>
                    <div className={styles.candidateEmail}>{req.candidateEmail}</div>
                  </div>
                </div>

                {req.reason && (
                  <div className={styles.reasonBox}>
                    <FileText size={14} />
                    <span>{req.reason}</span>
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <div className={styles.dateInfo}>
                    <Clock size={13} />
                    <span>
                      {new Date(req.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {isPending && (
                    <div className={styles.actionBtns}>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => handleReview(req.requestId, 'reject')}
                        disabled={actionLoading === req.requestId}
                      >
                        <XCircle size={14} />
                        {t('Reject')}
                      </button>
                      <button
                        className={styles.approveBtn}
                        onClick={() => handleReview(req.requestId, 'approve')}
                        disabled={actionLoading === req.requestId}
                      >
                        <CheckCircle2 size={14} />
                        {t('Approve')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SystemRequests;
