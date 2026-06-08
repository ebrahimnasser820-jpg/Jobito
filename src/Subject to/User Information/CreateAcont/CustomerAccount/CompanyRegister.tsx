import { useState, useEffect } from "react";
import {
  LoaderIcon,
  Building2Icon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  SmartphoneIcon,
  LinkIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./CompanyRegister.module.css";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../../../context/translation-context";
import { useToast } from "../../../../context/ToastContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const CompanyRegister: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    companyName: "",
    taxNumber: "",
    companyPhone: "",
    companyAddress: "",
    companyEmail: "",
    commercialRegister: "",
    password: "",
    confirmPassword: "",
    nationalId: "",
  });

  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Verification states
  const [verifyMethod, setVerifyMethod] = useState<null | "code" | "link">(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedStatus, setVerifiedStatus] = useState<null | "success">(null);
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.companyName || !formData.companyEmail || !formData.companyPhone || !formData.companyAddress) {
        showToast(t("Please fill all company details"), "error");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.taxNumber || !formData.commercialRegister || !formData.nationalId) {
        showToast(t("Please upload documents and enter National ID"), "error");
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE_URL}/auth/upload-document`, {
      method: "POST",
      body: formData,
    });
    let data;
    try {
      data = await res.json();
    } catch(e) {
      data = {};
    }
    if (!res.ok) throw new Error(data.message || t("Failed to upload document"));
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (formData.password !== formData.confirmPassword) {
      setFormError(t("Passwords do not match"));
      return;
    }

    try {
      setIsCreating(true);

      // Upload documents in parallel for better speed
      if (!(formData.commercialRegister instanceof File)) {
        throw new Error(t("Commercial register document is required"));
      }
      if (!(formData.taxNumber instanceof File)) {
        throw new Error(t("Tax register document is required"));
      }

      const [crDocumentUrl, taxDocumentUrl] = await Promise.all([
        uploadFile(formData.commercialRegister),
        uploadFile(formData.taxNumber)
      ]);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420"
        },
        body: JSON.stringify({
          name: formData.companyName,
          email: formData.companyEmail,
          password: formData.password,
          role: "company",
          phone: formData.companyPhone,
          address: formData.companyAddress,
          tax_document_url: taxDocumentUrl,
          commercial_register: crDocumentUrl,
          national_id: formData.nationalId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || t("Registration failed"));
      setSuccess(true);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      setIsVerifying(true);
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420"
        },
        body: JSON.stringify({
          email: formData.companyEmail,
          code: verificationCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("Failed to activate"));
      setVerifiedStatus("success");
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={styles.signupwrapper}>
      <motion.div
        className={styles.signupleft}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AnimatePresence mode="wait">
          {verifiedStatus === "success" ? (
            <motion.div
                key="success-verified"
                className={styles.centeredContent}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}
            >
                <div style={{ color: '#10b981', marginBottom: '24px' }}>
                    <CheckCircleIcon size={80} />
                </div>
                <h2 className={styles.title}>{t("Email Verified!")}</h2>
                <p className={styles.subtitle}>{t("Your company account is now active. You can start posting jobs.")}</p>
                <button 
                  className={styles.submitBtn} 
                  onClick={() => navigate("/user-information")}
                >
                    {t("Go to Login")} <ArrowRightIcon size={20} />
                </button>
            </motion.div>
          ) : success ? (
            <motion.div
              key="verify-steps"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}
            >
              {!verifyMethod ? (
                <>
                  <div style={{ color: '#4f46e5', marginBottom: '24px' }}>
                    <ShieldCheckIcon size={64} style={{ margin: '0 auto' }} />
                  </div>
                  <h2 className={styles.title}>{t("Verify Company Account")}</h2>
                  <p className={styles.subtitle}>
                    {t("We sent a code to")} <b>{formData.companyEmail}</b>. {t("Please check your inbox.")}
                  </p>

                  <div style={{ display: 'grid', gap: '16px', marginTop: '40px' }}>
                    <button
                      className={styles.submitBtn}
                      onClick={() => setVerifyMethod("code")}
                    >
                      <SmartphoneIcon size={20} />
                      {t("Enter Verification Code")}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ width: "100%" }}>
                  <h2 className={styles.title}>{t("Enter OTP Code")}</h2>
                  <p className={styles.subtitle}>
                    {t("Type the 6-digit code from your company email.")}
                  </p>
                  <form onSubmit={handleVerifyCode} style={{ marginTop: '40px' }}>
                    {formError && <div className={styles.errorBox}>{formError}</div>}
                    <input
                      type="text"
                      className={styles.inputField}
                      style={{
                        textAlign: 'center',
                        fontSize: '32px',
                        letterSpacing: '12px',
                        fontWeight: 'bold',
                        padding: '16px',
                        marginBottom: '24px'
                      }}
                      maxLength={6}
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                    <button
                      className={styles.submitBtn}
                      type="submit"
                      disabled={isVerifying}
                    >
                      {isVerifying ? <LoaderIcon className="animate-spin" /> : t("Verify & Activate")}
                    </button>
                  </form>
                  <button
                    className={styles.resendBtn}
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch(`${API_BASE_URL}/auth/resend-code`, {
                          method: "POST",
                          headers: { 
                            "Content-Type": "application/json",
                            "ngrok-skip-browser-warning": "69420"
                          },
                          body: JSON.stringify({ email: formData.companyEmail }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message || t("فشل إرسال الرمز"));
                        showToast(t("تم إعادة إرسال الرمز بنجاح"), "success");
                      } catch (err: any) {
                        showToast(err.message, "error");
                      }
                    }}
                  >
                    {t("إعادة إرسال الرمز")}
                  </button>
                  <button
                    onClick={() => setVerifyMethod(null)}
                    style={{ background: 'none', border: 'none', color: '#64748b', marginTop: '24px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ← {t("Back to options")}
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="register-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={styles.header}>
                  <div className={styles.titleContainer}>
                      <div className={styles.buildingIconBox}>
                          <Building2Icon size={32} />
                      </div>
                      <h1 className={styles.title}>{t("Company registration")}</h1>
                  </div>
                  <p className={styles.subtitle}>{t("Create a business account to hire top talent on Jobito")}</p>
              </div>

              {/* Progress Indicator */}
              <div className={styles.stepIndicator}>
                <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ""}`}>1</div>
                <div className={styles.stepLine}></div>
                <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ""}`}>2</div>
                <div className={styles.stepLine}></div>
                <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ""}`}>3</div>
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
                {formError && <div className={styles.errorBox}>{formError}</div>}

                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={styles.stepContent}
                    >
                      <div className={styles.formGrid2}>
                        <div className={styles.inputGroup}>
                          <label>{t("Company Name")}</label>
                          <input
                            className={styles.inputField}
                            type="text"
                            placeholder={t("Example: Akem")}
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            dir="auto"
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>{t("Company Email")}</label>
                          <input
                            className={styles.inputField}
                            type="email"
                            placeholder="hr@acme-inc.com"
                            value={formData.companyEmail}
                            onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                            dir="auto"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className={styles.formGrid2}>
                        <div className={styles.inputGroup}>
                          <label>{t("Company Phone")}</label>
                          <input
                            className={styles.inputField}
                            type="tel"
                            placeholder={t("+20 (123) 456-7890")}
                            value={formData.companyPhone}
                            onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                            dir="auto"
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>{t("Company Address")}</label>
                          <select
                            className={styles.inputField}
                            value={formData.companyAddress}
                            onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                            dir="auto"
                            required
                          >
                            <option value="" disabled>{t("Select Governorate")}</option>
                            {[
                              "Cairo", "Alexandria", "Giza", "Qalyubia", "Port Said", "Suez", "Gharbia",
                              "Dakahlia", "Ismailia", "Asyut", "Fayoum", "Minya", "Qena", "Sohag",
                              "Beni Suef", "Aswan", "Red Sea", "New Valley", "Matrouh", "North Sinai",
                              "South Sinai", "Kafr El Sheikh", "Beheira", "Damietta", "Sharqia", "Monufia", "Luxor"
                            ].map(gov => (
                              <option key={gov} value={gov}>{t(gov)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <button type="button" className={styles.submitBtn} onClick={nextStep}>
                        {t("Next Step")}
                      </button>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={styles.stepContent}
                    >
                      <div className={styles.formGrid2}>
                        <div className={styles.inputGroup}>
                          <label>{t("Tax Register (PDF)")}</label>
                          <input
                            className={styles.inputField}
                            type="file"
                            onChange={(e) => setFormData({ ...formData, taxNumber: e.target.files ? e.target.files[0] : '' as any })}
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>{t("Commercial Register (PDF)")}</label>
                          <input
                            className={styles.inputField}
                            type="file"
                            onChange={(e) => setFormData({ ...formData, commercialRegister: e.target.files ? e.target.files[0] : '' as any })}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className={styles.inputGroup}>
                        <label>{t("National ID of the official")}</label>
                        <input
                          className={styles.inputField}
                          type="text"
                          placeholder="Example: 29901011234567"
                          value={formData.nationalId}
                          onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                          dir="auto"
                          required
                        />
                      </div>

                      <div className={styles.buttonRow}>
                        <button type="button" className={styles.backStepBtn} onClick={prevStep}>{t("Back")}</button>
                        <button type="button" className={styles.submitBtn} onClick={nextStep}>{t("Next Step")}</button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={styles.stepContent}
                    >
                      <div className={styles.formGrid2}>
                        <div className={styles.inputGroup}>
                          <label>{t("Password")}</label>
                          <div className={styles.passwordWrapper}>
                            <input
                              className={styles.inputField}
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              dir="ltr"
                              required
                            />
                            <button type="button" className={styles.eyeButton} onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                            </button>
                          </div>
                        </div>
                        <div className={styles.inputGroup}>
                          <label>{t("Confirm password")}</label>
                          <div className={styles.passwordWrapper}>
                            <input
                              className={styles.inputField}
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              dir="ltr"
                              required
                            />
                            <button type="button" className={styles.eyeButton} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                              {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className={styles.buttonRow}>
                        <button type="button" className={styles.backStepBtn} onClick={prevStep}>{t("Back")}</button>
                        <button className={styles.submitBtn} type="submit" disabled={isCreating}>
                          {isCreating ? <LoaderIcon className="animate-spin" /> : t("Create a business account")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
