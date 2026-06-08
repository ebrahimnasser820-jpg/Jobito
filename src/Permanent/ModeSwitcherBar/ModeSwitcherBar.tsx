import React, { useState, useRef, useEffect } from "react";
import styles from "./ModeSwitcherBar.module.css";
import { useJobitoAuth } from "../../context/LinkContxt";
import { useTranslation } from "../../context/translation-context";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, PlusCircle, UploadCloud, X, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { useToast } from "../../context/ToastContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const AVAILABLE_SERVICES = ["كهربائي", "فني سباكة", "نجار", "منظف بيوت", "نقاش", "ميكانيكي", "حداد"];
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

const ModeSwitcherBar: React.FC = () => {
  const { user, isAuthenticated, role, apiFetch, updateUser, login, logout } = useJobitoAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [criminalRecordFile, setCriminalRecordFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isIndividual = role === "user" || role === "student" || (user?.role as string) === "student";

  const classification = user?.classification || "job_seeker";

  // Pre-check what data already exists
  const hasCriminalRecord = !!user?.criminalRecordUrl;
  const hasServices = Array.isArray(user?.services) && user.services.length > 0;

  // Determine what's missing
  const missingCriminalRecord = !hasCriminalRecord;
  const missingServices = !hasServices;
  const isProfileComplete = !missingCriminalRecord && !missingServices;

  const handleToggleMode = async () => {
    const newType = classification === "job_seeker" ? "tradesman" : "job_seeker";
    
    // Switching back to job_seeker → always allow immediately
    if (newType === "job_seeker") {
      setIsSwitching(true);
      await performSwitch(newType);
      setIsSwitching(false);
      showToast(t("تم العودة إلى وضع باحث عن عمل بنجاح!"));
      navigate("/");
      return;
    }

    // Switching to tradesman → check if profile is already complete
    if (isProfileComplete) {
      // All data exists → switch immediately, no modal needed
      setIsSwitching(true);
      await performSwitch(newType);
      setIsSwitching(false);
      showToast(t("تم تفعيل الوضع الحرفي بنجاح!"));
      navigate("/");
      return;
    }

    // Data is missing → open modal showing only what's needed
    // Pre-fill services if they already exist
    if (hasServices && user?.services) {
      setSelectedServices([...user.services]);
    } else {
      setSelectedServices([]);
    }
    setCriminalRecordFile(null);
    setFileError("");
    setIsModalOpen(true);
  };

  const performSwitch = async (newType: string, extraPayload: any = {}) => {
    try {
      const payload = {
        role: "user",
        classification: newType,
        ...extraPayload
      };

      const response = await apiFetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (newType === "tradesman" && extraPayload.criminalRecordUrl) {
          setIsModalOpen(false);
          showToast(t("تم تقديم طلبك بنجاح! حسابك قيد المراجعة الآن، وسيتم تسجيل خروجك لحين موافقة الإدارة."), "success");
          setTimeout(() => {
            logout();
            navigate("/login");
          }, 3000);
          return;
        }

        const data = await response.json();
        if (data.access_token) {
          login(data.access_token);
        }
        updateUser({ classification: newType, ...extraPayload });
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to toggle mode", error);
    }
  };

  const validateFile = (file: File): boolean => {
    setFileError("");

    // Check MIME type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      // Fallback: check extension if MIME is generic
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setFileError(t("صيغة الملف غير مدعومة. الصيغ المسموحة: PDF، JPG، PNG"));
        return false;
      }
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError(t("حجم الملف كبير جداً. الحد الأقصى 10 ميغابايت"));
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setCriminalRecordFile(file);
        setFileError("");
      } else {
        setCriminalRecordFile(null);
        // Reset the input so the same file can be re-selected
        e.target.value = "";
      }
    }
  };

  const handleModalSubmit = async () => {
    // Only validate fields that are actually missing
    if (missingServices && selectedServices.length === 0) {
      showToast(t("الرجاء اختيار خدمة واحدة على الأقل"));
      return;
    }
    if (missingCriminalRecord && !criminalRecordFile) {
      showToast(t("الرجاء رفع صحيفة الحالة الجنائية"));
      return;
    }

    setUploading(true);
    let uploadedUrl = user?.criminalRecordUrl;

    try {
      // Only upload if criminal record is missing AND a file was selected
      if (missingCriminalRecord && criminalRecordFile) {
        const formData = new FormData();
        formData.append("file", criminalRecordFile);
        const res = await apiFetch(`${API_BASE_URL}/auth/upload-document`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        uploadedUrl = data.url;
      }

      // Build extra payload only with missing fields
      const extraPayload: any = {};
      if (missingCriminalRecord) {
        extraPayload.criminalRecordUrl = uploadedUrl;
      }
      if (missingServices) {
        extraPayload.services = selectedServices;
      }

      await performSwitch("tradesman", extraPayload);
      showToast(t("تم تفعيل الوضع الحرفي بنجاح!"));
      navigate("/");

    } catch (err) {
      console.error(err);
      showToast(t("حدث خطأ أثناء رفع الملفات"));
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const handleTrigger = () => {
      handleToggleMode();
    };
    window.addEventListener("trigger-mode-switch", handleTrigger);
    return () => {
      window.removeEventListener("trigger-mode-switch", handleTrigger);
    };
  }, [handleToggleMode]);

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  if (!isAuthenticated || !isIndividual) {
    return null;
  }

  return (
    <>
      <div className={styles.switcherBar}>
        <div className={styles.leftSide}>
          <button className={styles.switchBtn} onClick={handleToggleMode} disabled={isSwitching}>
            <ArrowLeftRight size={16} />
            {isSwitching ? t("جاري التبديل...") : (classification === "tradesman" ? t("العودة إلى باحث عن عمل") : t("التبديل إلى الوضع الحرفي"))}
          </button>
          <span className={styles.statusText}>
            {t("الوضع الحالي:")} {classification === "tradesman" ? t("الحرفي", "Tradesman") : t("باحث عن عمل")}
          </span>
        </div>

        <div className={styles.rightSide}>
          {classification === "tradesman" && (
            <button className={styles.postJobBtn} onClick={() => navigate("/PostWork")}>
              <PlusCircle size={16} />
              {t("أضف خدمة / وظيفة")}
            </button>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !uploading && setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => !uploading && setIsModalOpen(false)}>
              <X size={20} />
            </button>
            <h2 className={styles.modalTitle}>{t("أكمل الملف الصناعي")}</h2>
            
            {/* Info banner showing what's missing */}
            <div className={styles.missingInfoBanner}>
              <AlertTriangle size={18} />
              <span>
                {missingCriminalRecord && missingServices
                  ? t("يجب رفع صحيفة الحالة الجنائية واختيار الخدمات للمتابعة")
                  : missingCriminalRecord
                  ? t("يجب رفع صحيفة الحالة الجنائية للمتابعة")
                  : t("يجب اختيار خدمة واحدة على الأقل للمتابعة")}
              </span>
            </div>

            {/* Criminal Record Section - only show if missing */}
            {missingCriminalRecord ? (
              <div className={styles.formGroup}>
                <div className={styles.docLabel}>
                  <strong>{t("فحص السجل الجنائي")}</strong>
                  <p>{t("هي وثيقة رسمية توضح التاريخ الإجرامي للشخص.")}</p>
                </div>
                <div 
                  className={`${styles.uploadBox} ${criminalRecordFile ? styles.uploadBoxSuccess : ""} ${fileError ? styles.uploadBoxError : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {criminalRecordFile ? (
                    <>
                      <CheckCircle size={28} />
                      <p className={styles.uploadedFileName}>{criminalRecordFile.name}</p>
                      <span className={styles.uploadedFileSize}>
                        {(criminalRecordFile.size / 1024).toFixed(0)} KB
                      </span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={28} />
                      <p>{t("انقر للتحميل أو السحب والإفلات")}</p>
                      <span className={styles.fileFormats}>PDF، JPG، PNG</span>
                    </>
                  )}
                </div>
                {fileError && (
                  <p className={styles.fileErrorText}>{fileError}</p>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className={styles.completedSection}>
                <CheckCircle size={18} />
                <span>{t("صحيفة الحالة الجنائية")} — {t("تم الرفع")}</span>
              </div>
            )}

            {/* Services Section - only show if missing */}
            {missingServices ? (
              <div className={styles.formGroup}>
                <label className={styles.servicesLabel}>{t("اختر الخدمات")}</label>
                <div className={styles.servicesGrid}>
                  {AVAILABLE_SERVICES.map(srv => (
                    <button 
                      key={srv}
                      className={`${styles.serviceBtn} ${selectedServices.includes(srv) ? styles.activeService : ''}`}
                      onClick={() => toggleService(srv)}
                    >
                      {t(srv)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.completedSection}>
                <CheckCircle size={18} />
                <span>{t("الخدمات")} — {user?.services?.join("، ")}</span>
              </div>
            )}

            <button 
              className={styles.submitBtn} 
              onClick={handleModalSubmit}
              disabled={uploading}
            >
              {uploading ? t("جاري الرفع...") : t("تقديم الطلب")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ModeSwitcherBar;
