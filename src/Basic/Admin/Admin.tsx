import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import SuperAdminDashboard from './SuperAdmin/SuperAdmin';
import OpsManagerDashboard from './OpsManager/OpsManager';
import UserManagement from './UserManagement/UserManagement';
import SupportDashboard from './Support/SupportDashboard';
import ContentManagement from './Content/ContentManagement';
import CompanyReview from './CompanyReview/CompanyReview';
import SystemRequests from './SystemRequests/SystemRequests';
import { useJobitoAuth } from '../../context/LinkContxt';
import { useTranslation } from '../../context/translation-context';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { API_BASE_URL } from '../../services/api';
import styles from './Admin.module.css';
import {
  Sun, 
  Moon, 
  LogOut, 
  Plus,
  ChevronDown
} from 'lucide-react';

/**
 * Main Admin Entry Point
 * This component handles switching between all Admin dashboard modules.
 * It also protects the route and ensures only authorized admins can enter.
 */
const Admin: React.FC = () => {
  const { user, isAuthenticated, role, logout, apiFetch, isInitialLoading } = useJobitoAuth();
  const { t, language, setLanguage } = useTranslation();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  
  const userAdminRole = user?.adminRole?.toLowerCase() || 'super_admin';

  const [adminRole, setAdminRole] = useState<'SUPER_ADMIN' | 'OPS_MANAGER' | 'USER_MANAGEMENT' | 'SUPPORT' | 'CONTENT' | 'COMPANY_REVIEW' | 'SYSTEM_REQUESTS'>('SUPER_ADMIN');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [supportUser, setSupportUser] = useState<any>(null);

  const toggleLanguage = () => {
    console.log('[Admin.tsx] Language toggle button clicked. Current language:', language);
    try {
      const nextLang = language === 'ar' ? 'en' : 'ar';
      console.log('[Admin.tsx] Setting language to:', nextLang);
      setLanguage(nextLang);
    } catch (error) {
      console.error('[Admin.tsx] Error while setting language:', error);
    }
  };

  // Determine if we should redirect away from admin
  const shouldRedirect = React.useMemo(() => {
    if (isInitialLoading) return false;
    if (isAuthenticated && role === 'admin') return false;
    // Check token directly as fallback
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        if (decoded.role === 'admin' && decoded.exp && decoded.exp * 1000 > Date.now()) {
          return false; // valid admin token, just waiting for context
        }
      } catch { /* invalid token */ }
    }
    return true;
  }, [isInitialLoading, isAuthenticated, role]);

  React.useEffect(() => {
    if (shouldRedirect) {
      navigate('/');
    }
  }, [shouldRedirect, navigate]);

  // Show loading while initializing or while context catches up with a valid admin token
  if (isInitialLoading || (!isAuthenticated && !shouldRedirect)) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <p>{t("Loading Admin Dashboard...")}</p>
      </div>
    );
  }

  if (shouldRedirect) {
    return null;
  }

  const allNavItems = [
    { id: 'SUPER_ADMIN', label: userAdminRole === 'super_admin' ? t("Super Admin") : t("Dashboard"), role: 'both' },
    { id: 'OPS_MANAGER', label: t("Operations Monitor"), role: 'super_admin' },
    { id: 'USER_MANAGEMENT', label: t("User Management"), role: 'operation_manager' },
    { id: 'SUPPORT', label: t("Technical Support"), role: 'operation_manager' },
    { id: 'CONTENT', label: t("Content Moderation"), role: 'operation_manager' },
    { id: 'COMPANY_REVIEW', label: t("Verification & Approvals"), role: 'operation_manager' },
    { id: 'SYSTEM_REQUESTS', label: t("System Requests"), role: 'super_admin' },
  ];

  const navItems = allNavItems.filter(item => item.role === 'both' || item.role === userAdminRole || userAdminRole === 'super_admin');

  return (
    <div className={`${styles.layout} ${isDark ? styles.dark : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <header className={styles.adminHeader}>
        <div className={styles.headerContent}>
          {/* Left Actions */}
          <div className={styles.headerLeft}>
              
            <div className={styles.iconActions}>
              <button className={styles.iconBtn} onClick={toggleLanguage} style={{ fontSize: '13px', fontWeight: 'bold' }}>
                {language === 'ar' ? 'EN' : 'عربي'}
              </button>
              <button className={styles.iconBtn} onClick={toggleTheme}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>

          {/* Right Branding & Tabs */}
          <div className={styles.headerRight}>
            <div className={styles.greetingRow}>
              <div className={styles.greetingTitle}>{t("Hello,")} {user?.name || t('Admin')}</div>
            </div>
            
            <div className={styles.tabsRow}>
              {/* Desktop Tabs */}
              <div className={styles.desktopTabs}>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAdminRole(item.id as any)}
                    className={`${styles.headerTab} ${adminRole === item.id ? styles.headerTabActive : ''}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Mobile Dropdown Selector */}
              <div className={`${styles.menuContainer} ${styles.mobileMenu}`}>
                <button 
                  className={styles.menuTrigger} 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <span className={styles.menuTriggerLabel}>
                    {navItems.find(item => item.id === adminRole)?.label || t("Dashboard")}
                  </span>
                  <span className={`${styles.menuArrow} ${isMenuOpen ? styles.menuArrowOpen : ''}`}>
                    <ChevronDown size={14} />
                  </span>
                </button>
                
                {isMenuOpen && (
                  <>
                    <div className={styles.menuOverlay} onClick={() => setIsMenuOpen(false)} />
                    <div className={styles.dropdownMenu}>
                      {navItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setAdminRole(item.id as any);
                            setIsMenuOpen(false);
                          }}
                          className={`${styles.dropdownItem} ${adminRole === item.id ? styles.dropdownItemActive : ''}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {userAdminRole === 'operation_manager' && (
                <button 
                  className={styles.addAssistantBtn} 
                  onClick={() => setIsAssistantModalOpen(true)}
                >
                  <Plus size={16} /> {t("Request Assistant Addition")}
                </button>
              )}

              <button className={styles.headerLogout} onClick={logout}>
                <LogOut size={16} />
                <span style={{ fontSize: '12px', fontWeight: 700, marginLeft: '8px', marginRight: '8px' }}>{t("Logout")}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Assistant Request Modal */}
      {isAssistantModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAssistantModalOpen(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} style={{
            background: 'var(--color-card-bg)', padding: '30px', borderRadius: '20px',
            width: '90%', maxWidth: '500px', border: '1px solid var(--color-border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ marginBottom: '10px', fontFamily: 'Syne' }}>👤 {t("Request Assistant Addition")}</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              {t("Nominate a colleague to assist you. This request will be sent to the Super Admin.")}
            </p>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>{t("Candidate Name")}</label>
              <input 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)' }}
                placeholder={t("Enter name")}
                value={candidateName}
                onChange={e => setCandidateName(e.target.value)}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>{t("Candidate Email")}</label>
              <input 
                type="email"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)' }}
                placeholder="email@jobito.com"
                value={candidateEmail}
                onChange={e => setCandidateEmail(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>{t("Reason")}</label>
              <textarea 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', minHeight: '80px' }}
                placeholder={t("Why do you need an assistant?")}
                value={requestReason}
                onChange={e => setRequestReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsAssistantModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', cursor: 'pointer' }}>
                {t("Cancel")}
              </button>
              <button 
                onClick={async () => {
                  if(!candidateName || !candidateEmail) {
                    showToast(t("Please fill in candidate name and email"));
                    return;
                  }
                  try {
                    const res = await apiFetch(`${API_BASE_URL}/admin/ops/system-request`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        requestType: 'ADD_ASSISTANT',
                        candidateName,
                        candidateEmail,
                        reason: requestReason
                      })
                    });
                    if(res.ok) {
                      showToast(t("Request sent successfully"));
                      setIsAssistantModalOpen(false);
                      setCandidateName("");
                      setCandidateEmail("");
                      setRequestReason("");
                    } else {
                      const errData = await res.json().catch(() => ({}));
                      let errMsg = errData.message;
                      if (Array.isArray(errMsg)) errMsg = errMsg[0];
                      showToast(t(errMsg || "Failed to send request. Please try again."));
                    }
                  } catch (err) {
                    console.error(err);
                    showToast(t("Network error. Please check your connection."));
                  }
                }}
                style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'var(--gradient-primary)', color: 'white', fontWeight: 700, cursor: 'pointer' }}
              >
                {t("Send Request")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render the appropriate dashboard based on role */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {adminRole === 'SUPER_ADMIN' && <SuperAdminDashboard />}
        {adminRole === 'OPS_MANAGER' && <OpsManagerDashboard />}
        {adminRole === 'USER_MANAGEMENT' && <UserManagement onGoToSupport={(user) => { setSupportUser(user); setAdminRole('SUPPORT'); }} />}
        {adminRole === 'SUPPORT' && <SupportDashboard preselectedUser={supportUser} />}
        {adminRole === 'CONTENT' && <ContentManagement />}
        {adminRole === 'COMPANY_REVIEW' && <CompanyReview />}
        {adminRole === 'SYSTEM_REQUESTS' && <SystemRequests />}
      </div>
    </div>
  );
};

export default Admin;
