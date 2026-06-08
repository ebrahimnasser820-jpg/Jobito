import React, { useState, useEffect } from 'react';
import { useJobitoAuth } from '../../../context/LinkContxt';
import { useTranslation } from '../../../context/translation-context';
import { useToast } from '../../../context/ToastContext';
import { API_BASE_URL } from '../../../services/api';
import { 
  Search, 
  MessageSquare, 
  AlertTriangle, 
  Pause, 
  Ban,
  Play
} from 'lucide-react';
import styles from './UserManagement.module.css';

type ModalType = "warn" | "suspend" | "block" | null;


function ActionBadge({ action }: { action: string }) {
  const { t } = useTranslation();
  const isNegative = action === "Delete Account" || action === "Inactive" || action === "Suspended" || action === "Banned";
  const isNeutral = action === "Log Out" || action === "Warned";
  const cls = isNegative ? styles.badgeDelete : isNeutral ? styles.badgeLogout : styles.badgeLogin;
  const icon = action === "Log Out" ? "↗" : isNegative ? "✕" : "↙";

  return <span className={`${styles.actionBadge} ${cls}`}>{icon} {t(action)}</span>;
}

function AccountChip({ type }: { type: string }) {
  const { t } = useTranslation();
  const cls = type.includes("Student") ? styles.chipStudent : styles.chipBusiness;

  return <span className={`${styles.accountChip} ${cls}`}>{t(type)}</span>;
}

function RatingDisplay({ r }: { r: number }) {
  const { t } = useTranslation();
  const cls = r >= 4 ? styles.ratingHigh : r >= 3 ? styles.ratingMid : styles.ratingLow;
  return <span className={`${styles.rating} ${cls}`}>{r.toFixed(1)}/5.0 <span className={styles.star}>★</span></span>;
}

// ── Modals ─────────────────────────────────────────────────────

const WarningModal = ({ user, onClose, onConfirm }: { user: any; onClose: () => void, onConfirm: (reason: string) => void }) => {
  const [reason, setReason] = useState("");
  const { t } = useTranslation();
  return (
  <div className={styles.overlay} onClick={onClose}>
    <div className={styles.modal} onClick={e => e.stopPropagation()}>
      <div className={`${styles.accentBar} ${styles.accentOrange}`} />
      <div className={styles.modalHeader}>
        <h2>⚠️ {t("Confirm Action: Warning")}</h2>
      </div>
      <div className={styles.modalBody}>
        <div className={styles.targetUser}>
          <span className={styles.fieldLabel}>{t("Target User")}:</span>
          <span style={{fontWeight: 700, color: 'var(--color-text)'}}>{user?.name}</span>
        </div>
        <div className={styles.fieldGroup}>
          <textarea className={styles.fieldInput} rows={4} placeholder={t("Enter the reason for this warning clearly...")} value={reason} onChange={e => setReason(e.target.value)} />
        </div>
      </div>
      <div className={styles.modalFooter}>
        <button className={styles.btnCancel} onClick={onClose}>{t("Cancel")}</button>
        <button className={`${styles.btnConfirm} ${styles.orange}`} onClick={() => onConfirm(reason)}>⚡ {t("Confirm & Execute")}</button>
      </div>
    </div>
  </div>
)};

const SuspensionModal = ({ user, onClose, onConfirm }: { user: any; onClose: () => void, onConfirm: (reason: string) => void }) => {
  const [reason, setReason] = useState("");
  const { t } = useTranslation();
  return (
  <div className={styles.overlay} onClick={onClose}>
    <div className={styles.modal} onClick={e => e.stopPropagation()}>
      <div className={`${styles.accentBar} ${styles.accentWarning}`} />
      <div className={styles.modalHeader}>
        <h2>⏸ {t("Confirm Action: Temporary Suspension")}</h2>
      </div>
      <div className={styles.modalBody}>
        <div className={styles.targetUser}>
          <span className={styles.fieldLabel}>{t("Target User")}:</span>
          <span style={{fontWeight: 700, color: 'var(--color-text)'}}>{user?.name}</span>
        </div>
        <div className={styles.fieldGroup}>
          <textarea className={styles.fieldInput} rows={4} placeholder={t("Enter the reason for this Temporary Suspension clearly...")} value={reason} onChange={e => setReason(e.target.value)} />
        </div>
      </div>
      <div className={styles.modalFooter}>
        <button className={styles.btnCancel} onClick={onClose}>{t("Cancel")}</button>
        <button className={`${styles.btnConfirm} ${styles.warning}`} onClick={() => onConfirm(reason)}>⚡ {t("Confirm & Execute")}</button>
      </div>
    </div>
  </div>
)};

const BlockModal = ({ user, onClose, onConfirm }: { user: any; onClose: () => void, onConfirm: (reason: string) => void }) => {
  const [reason, setReason] = useState("");
  const { t } = useTranslation();
  return (
  <div className={styles.overlay} onClick={onClose}>
    <div className={styles.modal} onClick={e => e.stopPropagation()}>
      <div className={`${styles.accentBar} ${styles.accentDanger}`} />
      <div className={styles.modalHeader}>
        <h2>🚫 {t("Confirm Action: Block")}</h2>
      </div>
      <div className={styles.modalBody}>
        <div className={styles.targetUser}>
          <span className={styles.fieldLabel}>{t("Target User")}:</span>
          <span style={{fontWeight: 700, color: 'var(--color-text)'}}>{user?.name}</span>
        </div>
        <div className={styles.fieldGroup}>
          <textarea className={styles.fieldInput} rows={4} placeholder={t("Enter the reason for this block clearly...")} value={reason} onChange={e => setReason(e.target.value)} />
        </div>
      </div>
      <div className={styles.modalFooter}>
        <button className={styles.btnCancel} onClick={onClose}>{t("Cancel")}</button>
        <button className={`${styles.btnConfirm} ${styles.danger}`} onClick={() => onConfirm(reason)}>⚡ {t("Confirm & Execute")}</button>
      </div>
    </div>
  </div>
)};


// ── Main Component ────────────────────────────────────────────────

interface UserManagementProps {
  onGoToSupport?: (user?: any) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onGoToSupport }) => {
  const { apiFetch, user: authUser } = useJobitoAuth();
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const [modal, setModal] = useState<{ type: ModalType; user: any } | null>(null);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/ops/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [apiFetch, language]);

  const executeAction = async (targetUserId: string, actionType: string, reason: string) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/ops/users/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, actionType, reason })
      });
      if (res.ok) {
        showToast(t("Action executed successfully"));
        setModal(null);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.contactInfo?.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div className={styles.container}>
      {/* Header */}

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} color="#8896B0" />
          <input placeholder={t("search user name or email...")} value={search} onChange={e => setSearch(e.target.value)} />
        </div>

      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>{t("Name")}</th>
              <th className={styles.th}>{t("Info")}</th>
              <th className={styles.th}>{t("Action Type")}</th>
              <th className={styles.th}>{t("Account Type")}</th>
              <th className={styles.th}>{t("Status & Rating")}</th>
              <th className={styles.th}>{t("Quick Actions")}</th>
              <th className={styles.th}>{t("Contact")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.userId}>
                <td className={styles.td} data-label={t("Name")}><span className={styles.userName}>{u.name}</span></td>
                <td className={styles.td} data-label={t("Info")}><span className={styles.userInfo}>{u.contactInfo}</span></td>
                <td className={styles.td} data-label={t("Action Type")}><ActionBadge action={u.lastActionType || 'Active'} /></td>
                <td className={styles.td} data-label={t("Account Type")}><AccountChip type={u.accountType} /></td>
                <td className={styles.td} data-label={t("Status & Rating")}><RatingDisplay r={u.rating?.average || 0} /></td>
                <td className={styles.td} data-label={t("Quick Actions")}>
                  <div className={styles.quickActions}>
                    <button className={`${styles.qaBtn} ${styles.qaBlock}`} title={t("Block")} onClick={() => setModal({type: "block", user: u})}>
                      <Ban size={14} />
                    </button>
                    <button 
                      className={`${styles.qaBtn} ${styles.qaSusp}`} 
                      title={u.status === 'suspended' ? t("Unsuspend") : t("Suspend")} 
                      onClick={() => {
                        if (u.status === 'suspended') {
                          if (window.confirm(t("Are you sure you want to unsuspend this user?"))) {
                            executeAction(u.userId, 'unsuspend', t('Manual unsuspend by admin'));
                          }
                        } else {
                          setModal({type: "suspend", user: u});
                        }
                      }}
                    >
                      {u.status === 'suspended' ? <Play size={14} /> : <Pause size={14} />}
                    </button>
                    <button className={`${styles.qaBtn} ${styles.qaWarn}`} title={t("Warn")} onClick={() => setModal({type: "warn", user: u})}>
                      <AlertTriangle size={14} />
                    </button>
                  </div>
                </td>
                <td className={styles.td} data-label={t("Contact")}>
                  <button className={styles.msgBtn} onClick={() => onGoToSupport?.(u)}>
                    <MessageSquare size={14} />
                    {t("Messages")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modal?.type === "warn"    && <WarningModal    user={modal.user} onClose={() => setModal(null)} onConfirm={(r) => executeAction(modal.user.userId, 'warning', r)} />}
      {modal?.type === "suspend" && <SuspensionModal user={modal.user} onClose={() => setModal(null)} onConfirm={(r) => executeAction(modal.user.userId, 'suspend', r)} />}
      {modal?.type === "block"   && <BlockModal      user={modal.user} onClose={() => setModal(null)} onConfirm={(r) => executeAction(modal.user.userId, 'ban', r)} />}
    </div>
  );
};

export default UserManagement;
