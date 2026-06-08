import React, { useState, useEffect } from "react";
import { useTranslation } from "../../../context/translation-context";
import { useJobitoAuth } from "../../../context/LinkContxt";
import { useToast } from "../../../context/ToastContext";
import styles from "./ApplyJobModal.module.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId?: number | string;
  jobTitle?: string;
  companyName?: string;
  location?: string;
  jobType?: string;
  isActive?: boolean;
  logoUrl?: string;
  isTradesman?: boolean;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  companyName,
  location,
  jobType,
  isActive = true,
  logoUrl,
  isTradesman = false,
}) => {
  const { t } = useTranslation();
  const { apiFetch, user } = useJobitoAuth();
  const { showToast } = useToast();

  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [address, setAddress] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);

  useEffect(() => {
    if (isOpen && jobId) {
      const checkStatus = async () => {
        try {
          const res = await apiFetch(`${API_BASE_URL}/applications/status/${jobId}`);
          if (res.ok) {
            const data = await res.json();
            setExistingApplication(data);
          }
        } catch (err) {
          console.error("Error checking status:", err);
        }
      };
      checkStatus();
    }
  }, [isOpen, jobId, apiFetch]);

  // Lock background scroll when modal is open
  useEffect(() => {
    const mainLayout = document.querySelector('.main-layout') as HTMLElement;
    
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (mainLayout) mainLayout.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (mainLayout) mainLayout.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (mainLayout) mainLayout.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) return;

    // CV upload is now optional, so we removed the enforcement block.

    // Validate Portfolio URL if filled
    if (!isTradesman && portfolioUrl.trim()) {
      const trimmedPort = portfolioUrl.trim();
      const isUrlValid = trimmedPort.startsWith("http://") || trimmedPort.startsWith("https://") || (trimmedPort.includes(".") && !trimmedPort.includes(" "));
      if (!isUrlValid || trimmedPort.length < 5) {
        showToast(t("الرجاء إدخال رابط معرض أعمال صحيح (مثال: https://mywork.com)"), "error");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      let resumeUrl = "";

      // 1. Upload Resume if exists
      if (resumeFile) {
        const formData = new FormData();
        formData.append("file", resumeFile);
        formData.append("entity_type", "user");
        formData.append("entity_id", user?.id || "anonymous");
        formData.append("image_type", "gallery");
        
        const uploadRes = await apiFetch(`${API_BASE_URL}/auth/upload-document`, {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          resumeUrl = uploadData.url || uploadData.imageUrl;
        } else {
          throw new Error(t("فشل رفع السيرة الذاتية"));
        }
      }

      // 2. Submit Application
      const finalCoverLetter = isTradesman 
        ? `Address: ${address}\n\nIssue Description: ${issueDescription}` 
        : coverLetter;

      // Clean up portfolioUrl format before sending
      let finalPortfolioUrl = portfolioUrl.trim();
      if (finalPortfolioUrl && !finalPortfolioUrl.startsWith("http")) {
        finalPortfolioUrl = `https://${finalPortfolioUrl}`;
      }

      const res = await apiFetch(`${API_BASE_URL}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: Number(jobId),
          portfolioUrl: finalPortfolioUrl,
          coverLetter: finalCoverLetter,
          resumeUrl,
        }),
      });

      if (res.ok) {
        showToast(t("تم التقديم بنجاح"), "success");
        onClose();
      } else {
        const errorData = await res.json();
        showToast(errorData.message || t("فشل التقديم"), "error");
      }
    } catch (err: any) {
      showToast(err.message || t("حدث خطأ في الاتصال"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        {existingApplication ? (
          <div className={styles.closedMessage}>
            <h2>{t("لقد تقدمت بالفعل")}</h2>
            <div className={styles.statusBox}>
              <div className={styles.statusLabel}>{t("حالة الطلب:")}</div>
              <div className={styles.statusValue}>{t(existingApplication.status)}</div>
            </div>
            <button className={styles.submitButton} onClick={onClose}>{t("إغلاق")}</button>
          </div>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <div className={styles.headerLeft}>
                {logoUrl && (
                  <div className={styles.companyLogo}>
                    <img src={logoUrl} alt={companyName || ""} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                )}
                <div className={styles.headerTitles}>
                  <h2>{t("التقديم على وظيفة")} {jobTitle}</h2>
                  {companyName && (
                    <p>
                      {companyName} {location && <span className={styles.dot}>•</span>} {location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <hr className={styles.divider} />

            <form onSubmit={handleSubmit} className={styles.applyForm}>
              {isTradesman ? (
                <>
                  <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px', display: 'block' }}>{t("Address")}</label>
                    <input 
                      type="text" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      required
                      style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#0B223F', color: '#fff' }}
                    />
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px', display: 'block' }}>{t("issue Descriptions")}</label>
                    <div className={styles.textareaWrapper}>
                      <textarea 
                        value={issueDescription} 
                        onChange={(e) => setIssueDescription(e.target.value)} 
                        required
                        style={{ width: '100%', minHeight: '120px', padding: '12px', border: '1px solid #ccc', borderRadius: '24px', backgroundColor: '#0B223F', color: '#fff' }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                    <label>{t("رابط الأعمال (Portfolio)")} <span className={styles.optionalText}>({t("اختياري")})</span></label>
                    <input 
                      type="text" 
                      value={portfolioUrl} 
                      onChange={(e) => setPortfolioUrl(e.target.value)} 
                      placeholder="https://..."
                    />
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: '24px' }}>
                    <label>{t("رسالة التغطية")} <span className={styles.optionalText}>({t("اختياري")})</span></label>
                    <div className={styles.textareaWrapper}>
                      <textarea 
                        value={coverLetter} 
                        onChange={(e) => setCoverLetter(e.target.value)} 
                        placeholder={t("لماذا أنت مناسب لهذه الوظيفة؟ تحدث عن خبراتك ومهاراتك...")}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroupResume} style={{ marginBottom: '32px' }}>
                    <div className={styles.resumeTop}>
                      <span className={styles.resumeLabel}>{t("السيرة الذاتية (PDF)")} <span className={styles.optionalText}>({t("اختياري")})</span></span>
                      <label className={styles.uploadButton}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        {resumeFile ? resumeFile.name : t("اختر ملف")}
                        <input 
                          type="file" 
                          accept=".pdf" 
                          onChange={(e) => setResumeFile(e.target.files?.[0] || null)} 
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className={styles.submitSection}>
                <button 
                  type="submit" 
                  className={styles.submitButton} 
                  disabled={isSubmitting}
                  style={isTradesman ? { backgroundColor: '#5888bd', width: '100%', padding: '12px', borderRadius: '18px', color: '#1a1a1a', fontWeight: 'bold' } : undefined}
                >
                  {isSubmitting ? (isTradesman ? t("Submitting...") : t("جاري الإرسال...")) : (isTradesman ? t("Submit Application") : t("إرسال الطلب"))}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};