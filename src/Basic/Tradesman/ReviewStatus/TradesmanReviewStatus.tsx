import React from 'react';
import { useJobitoAuth } from '../../../context/LinkContxt';
import { useTranslation } from '../../../context/translation-context';
import { AlertCircle, Clock, ShieldX, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const TradesmanReviewStatus: React.FC = () => {
  const { user, updateUser, apiFetch, login } = useJobitoAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isPending = user?.accountStatus === 'pending';
  const isRejected = user?.accountStatus === 'cr_rejected';

  const handleSwitchBack = async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classification: "job_seeker" }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          login(data.access_token);
        }
        updateUser({ classification: "job_seeker" });
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to switch back", error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        backgroundColor: 'var(--color-card-bg)',
        borderRadius: '20px',
        padding: '40px 30px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--color-border)',
        textAlign: 'center'
      }}>
        {isPending ? (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Clock size={40} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px', color: 'var(--color-text)' }}>
              {t("Account Under Review", "حسابك قيد المراجعة")}
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '32px' }}>
              {t("We have received your criminal record document and it is currently being reviewed by our operations team. You will be notified via email once your account is approved.", "لقد استلمنا وثيقة السجل الجنائي الخاصة بك وهي الآن قيد المراجعة من قبل فريق العمليات. سيتم إعلامك عبر البريد الإلكتروني بمجرد الموافقة على حسابك.")}
            </p>
          </>
        ) : isRejected ? (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <ShieldX size={40} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px', color: 'var(--color-text)' }}>
              {t("Request Rejected", "تم رفض طلبك")}
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '32px' }}>
              {t("Unfortunately, your criminal record document was rejected. Your access to tradesman features has been restricted. Please check your email for more details or contact support.", "للأسف، تم رفض وثيقة السجل الجنائي الخاصة بك. تم تقييد وصولك إلى ميزات الحرفيين. يرجى التحقق من بريدك الإلكتروني للحصول على مزيد من التفاصيل أو التواصل مع الدعم.")}
            </p>
          </>
        ) : null}

        <button 
          onClick={handleSwitchBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-bg-tertiary)',
            color: 'var(--color-text)',
            border: 'none',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <ArrowLeft size={18} />
          {t("Return to Job Seeker Mode", "العودة إلى وضع باحث عن عمل")}
        </button>
      </div>
    </div>
  );
};

export default TradesmanReviewStatus;
