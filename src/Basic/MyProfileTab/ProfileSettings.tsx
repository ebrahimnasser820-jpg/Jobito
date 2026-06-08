import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ProfileSettings.module.css";
import { useJobitoAuth } from "../../context/LinkContxt";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "../../context/translation-context";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const UploadIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const tabVariants = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    x: -24,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};

const getFullImageUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

type ProfileSubTab = "overview" | "social" | "security";

export default function ProfileSettings() {
  const { t } = useTranslation();
  const { user, role, googleClientId, apiFetch, login, logout } = useJobitoAuth();
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>("overview");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    fullName: "",
    website: "",
    industry: "",
    description: "",
    address: "",
    employees: "",
    foundedDate: "",
    phone: "",
    email: "",
    location: "",
    bio: "",
    locationTags: [] as string[],
    techStack: [] as string[],
    socialLinks: {
      instagram: "",
      twitter: "",
      facebook: "",
      linkedin: "",
      youtube: "",
    },
    logo: "",
    avatar: "",
    classification: "",
    benefits: [] as { title: string; description: string }[],
  });

  const [newBenefit, setNewBenefit] = useState({ title: "", description: "" });
  const [showAddBenefit, setShowAddBenefit] = useState(false);

  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [socialLinkInput, setSocialLinkInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Deletion state
  const [deletionStatus, setDeletionStatus] = useState<{
    scheduled: boolean;
    daysLeft?: number;
    permanentDeleteAt?: string;
  }>({ scheduled: !!user?.deletionRequestedAt });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const endpoint =
          role === "company" ? "/companies/my/profile" : "/users/me";
        const res = await apiFetch(`${API_BASE_URL}${endpoint}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            ...data,
            name: data.name || data.fullName || "",
            fullName: data.fullName || data.name || "",
            logo: data.logoUrl || data.avatarUrl || "",
            avatar: data.avatarUrl || data.logoUrl || "",
            socialLinks: Array.isArray(data.socialLinks)
              ? data.socialLinks
              : (data.socialLinks && typeof data.socialLinks === "object"
                  ? Object.values(data.socialLinks).filter(Boolean)
                  : []),
            locationTags: Array.isArray(data.locationTags)
              ? data.locationTags
              : [],
            techStack: Array.isArray(data.techStack) ? data.techStack : [],
            benefits: Array.isArray(data.benefits) ? data.benefits : [],
            classification: data.classification || "تقني",
            foundedDate:
              data.foundedYear && data.foundedMonth && data.foundedDay
                ? `${data.foundedYear}-${String(data.foundedMonth).padStart(2, "0")}-${String(data.foundedDay).padStart(2, "0")}`
                : "",
          });
          setPreview(data.logoUrl || data.avatarUrl || null);
          setEmail(data.email || "");
        }
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      }
    };
    fetchProfileData();

    const fetchDeletionStatus = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/users/me/deletion-status`);
        if (res.ok) {
          const data = await res.json();
          setDeletionStatus(data);
        }
      } catch { /* ignore */ }
    };
    fetchDeletionStatus();
  }, [role, apiFetch]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let finalImgUrl = formData.logo || formData.avatar;
      if (selectedFile) {
        const fd = new FormData();
        fd.append("file", selectedFile);
        const uploadRes = await apiFetch(`${API_BASE_URL}/images/profile`, {
          method: "PUT",
          body: fd,
        });
        if (uploadRes.ok) {
          const imgData = await uploadRes.json();
          finalImgUrl = imgData.imageUrl || imgData.image_url;
        }
      }

      const endpoint =
        role === "company" ? "/companies/my/profile" : "/users/me";
      let bodyData: any;

      if (role === "company") {
        bodyData = {
          ...formData,
          logo: finalImgUrl,
          classification: formData.classification,
        };
        if (formData.foundedDate) {
          const [y, m, d] = formData.foundedDate.split("-");
          bodyData.foundedYear = y;
          bodyData.foundedMonth = m;
          bodyData.foundedDay = d;
        }
      } else {
        bodyData = {
          ...formData,
          avatar: finalImgUrl,
          fullName: formData.fullName || formData.name,
          classification: formData.classification,
        };
      }

      const res = await apiFetch(`${API_BASE_URL}${endpoint}`, {
        method: role === "company" ? "PATCH" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.access_token) {
          login(resData.access_token);
        }
        window.dispatchEvent(new Event("jobito-profile-updated"));
        alert(t("تم حفظ التعديلات بنجاح!"));
      }
    } catch (err: any) {
      alert(err.message || t("فشل في تحديث الملف الشخصي."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingEmail(true);
      const res = await apiFetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(t("فشل في تحديث البريد الإلكتروني."));
      alert(t("تم تحديث البريد الإلكتروني بنجاح!"));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert(t("كلمات المرور غير متطابقة!"));
      return;
    }
    try {
      setIsSavingPass(true);
      const res = await apiFetch(`${API_BASE_URL}/users/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || t("فشل في تحديث كلمة المرور."));
      }
      alert(t("تم تحديث كلمة المرور بنجاح!"));
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingPass(false);
    }
  };

  const handleGoogleLinkSuccess = async (response: any) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/auth/link-google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ googleToken: response.credential }),
      });
      if (res.ok) {
        alert(t("تم ربط حساب جوجل بنجاح!"));
        window.location.reload();
      } else {
        const error = await res.json();
        throw new Error(error.message || "Failed to link Google account");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteAccount = () => {
    // Send the request in the background (fire and forget)
    // keepalive: true ensures the browser doesn't cancel the request when we redirect
    apiFetch(`${API_BASE_URL}/users/me`, {
      method: "DELETE",
      keepalive: true,
    }).catch(err => console.error("Failed to schedule account deletion:", err));

    // Immediately close the modal, logout, and redirect
    setShowDeleteConfirm(false);
    logout();
    window.location.href = "/";
  };

  const handleCancelDeletion = async () => {
    setIsCancelling(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/users/me/cancel-deletion`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error(t("فشل في إلغاء طلب الحذف"));
      alert(t("تم إلغاء طلب حذف الحساب بنجاح!"));
      setDeletionStatus({ scheduled: false });
      window.dispatchEvent(new Event("auth-changed"));
    } catch (err: any) {
      alert(err.message || t("خطأ"));
    } finally {
      setIsCancelling(false);
    }
  };

  const subTabs = [
    { id: "overview" as ProfileSubTab, label: t("نظرة عامة") },
    { id: "security" as ProfileSubTab, label: t("أمان الحساب") },
  ];

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h2>
          {role === "company" ? t("إعدادات الشركة") : t("إعدادات الملف الشخصي")}
        </h2>
      </div>

      <div className={styles.subTabBar}>
        {subTabs.map((ts) => (
          <button
            key={ts.id}
            className={`${styles.subTabBtn} ${activeSubTab === ts.id ? styles.subTabActive : ""}`}
            onClick={() => setActiveSubTab(ts.id)}
          >
            {ts.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          variants={tabVariants}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          {activeSubTab === "overview" && (
            <>
              <div className={styles.row}>
                <div className={styles.rowLabel}>
                  <strong>{t("الصورة الشخصية")}</strong>
                  <span>
                    {role === "company" ? t("شعار الشركة") : t("صورتك الشخصية")}
                  </span>
                </div>
                <div className={styles.rowContent}>
                  <div className={styles.logoUploadRow}>
                    <div className={styles.logoCirclePreview}>
                      {preview ? (
                        <img
                          src={getFullImageUrl(preview) || ""}
                          alt="avatar"
                        />
                      ) : (
                        <div className={styles.logoPlaceholder}>LOGO</div>
                      )}
                    </div>
                    <div
                      className={styles.logoUploadZone}
                      onClick={() => fileRef.current?.click()}
                    >
                      <UploadIcon />
                      <p>
                        <span className={styles.blueText}>{t("انقر للاستبدال")}</span>{" "}
                        {t("أو سحب وإفلات")}
                      </p>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleFile}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.rowLabel}>
                  <strong>{t("المعلومات الأساسية")}</strong>
                </div>
                <div className={styles.rowContent}>
                  <div className={styles.fieldFull}>
                    <label>
                      {role === "company" ? t("اسم الشركة") : t("الاسم الكامل")}
                    </label>
                    <input
                      name={role === "company" ? "name" : "fullName"}
                      type="text"
                      value={
                        role === "company" ? formData.name : formData.fullName
                      }
                      onChange={handleChange}
                    />
                  </div>
                  {role === "student" && (
                    <>
                      <div className={styles.fieldGrid}>
                        <div className={styles.fieldFull}>
                          <label>{t("الاسم الكامل")}</label>
                          <input
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={handleChange}
                          />
                        </div>
                        <div className={styles.fieldFull}>
                          <label>{t("التصنيف المهني")}</label>
                          <select
                            name="classification"
                            value={formData.classification}
                            onChange={handleChange}
                          >
                            <option value="تقني">{t("تقني")}</option>
                            <option value="غير تقني">{t("غير تقني")}</option>
                          </select>
                        </div>
                      </div>
                      <div className={styles.fieldFull}>
                        <label>{t("نبذة تعريفية")}</label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows={4}
                        />
                      </div>
                    </>
                  )}
                  {role === "company" && (
                    <>
                      <div className={styles.fieldGrid}>
                        <div>
                          <label>{t("الموظفين")}</label>
                          <input
                            name="employees"
                            type="text"
                            value={formData.employees}
                            onChange={handleChange}
                            placeholder={t("مثال: 50-100")}
                          />
                        </div>
                        <div>
                          <label>{t("مجال العمل")}</label>
                          <input
                            name="industry"
                            type="text"
                            value={formData.industry}
                            onChange={handleChange}
                            placeholder={t("مثال: البرمجيات")}
                          />
                        </div>
                      </div>
                      <div className={styles.fieldGrid}>
                        <div>
                          <label>{t("التصنيف")}</label>
                          <select
                            name="classification"
                            value={formData.classification}
                            onChange={handleChange}
                          >
                            <option value="تقني">{t("تقني")}</option>
                            <option value="غير تقني">{t("غير تقني")}</option>
                          </select>
                        </div>
                        <div>
                          <label>{t("الموقع (العنوان)")}</label>
                          <input
                            name="address"
                            type="text"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder={t("مثال: الرياض، السعودية")}
                          />
                        </div>
                      </div>
                      <div className={styles.fieldGrid}>
                        <div>
                          <label>{t("تاريخ التأسيس")}</label>
                          <input
                            name="foundedDate"
                            type="date"
                            value={formData.foundedDate}
                            onChange={handleChange}
                          />
                        </div>
                        <div />
                      </div>
                      <div className={styles.fieldFull}>
                        <label>{t("الوصف")}</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={5}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {role === "company" && (
                <div className={styles.row}>
                  <div className={styles.rowLabel}>
                    <strong>{t("المزايا والفوائد")}</strong>
                    <span>{t("أضف المزايا التي توفرها شركتك للموظفين.")}</span>
                  </div>
                  <div className={styles.rowContent}>
                    <div className={styles.benefitsGrid}>
                      {formData.benefits?.map((benefit: any, index: number) => (
                        <div key={index} className={styles.benefitCard}>
                          <button
                            className={styles.removeBenefitBtn}
                            onClick={() => {
                              const updated = formData.benefits.filter(
                                (_: any, i: number) => i !== index,
                              );
                              setFormData({ ...formData, benefits: updated });
                            }}
                          >
                            ✕
                          </button>
                          <h3>{benefit.title}</h3>
                          <p>{benefit.description}</p>
                        </div>
                      ))}

                      {showAddBenefit ? (
                        <div className={styles.addBenefitCard}>
                          <input
                            type="text"
                            placeholder={t("عنوان الميزة (مثال: تأمين صحي)")}
                            value={newBenefit.title}
                            onChange={(e) =>
                              setNewBenefit({
                                ...newBenefit,
                                title: e.target.value,
                              })
                            }
                          />
                          <textarea
                            placeholder={t("وصف الميزة...")}
                            value={newBenefit.description}
                            onChange={(e) =>
                              setNewBenefit({
                                ...newBenefit,
                                description: e.target.value,
                              })
                            }
                            rows={3}
                          />
                          <div className={styles.benefitAddActions}>
                            <button
                              className={styles.addBtnSmall}
                              onClick={() => {
                                if (!newBenefit.title)
                                  return alert(t("يرجى إدخال عنوان الميزة"));
                                setFormData({
                                  ...formData,
                                  benefits: [
                                    ...(formData.benefits || []),
                                    newBenefit,
                                  ],
                                });
                                setNewBenefit({ title: "", description: "" });
                                setShowAddBenefit(false);
                              }}
                            >
                              {t("إضافة")}
                            </button>
                            <button
                              className={styles.cancelBtnSmall}
                              onClick={() => setShowAddBenefit(false)}
                            >
                              {t("إلغاء")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={styles.addBenefitTrigger}
                          onClick={() => setShowAddBenefit(true)}
                        >
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span>{t("إضافة ميزة جديدة")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className={styles.row}>
              <div className={styles.rowLabel}>
                <strong>{t("روابط التواصل الاجتماعي")}</strong>
                <span>{t("أضف روابط حسابات الشركة على منصات التواصل.")}</span>
              </div>
              <div className={styles.rowContent}>
                <div className={styles.fieldFull}>
                  <div className={styles.skillInputWrapper}>
                    <input
                      type="text"
                      className={styles.input}
                      style={{ flex: 1 }}
                      placeholder={t("أضف رابط واضغط Enter أو زر الـ +")}
                      value={socialLinkInput}
                      onChange={(e) => setSocialLinkInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && socialLinkInput.trim()) {
                          e.preventDefault();
                          const currentLinks = Array.isArray(formData.socialLinks) ? formData.socialLinks : [];
                          if (!currentLinks.includes(socialLinkInput.trim())) {
                            setFormData({
                              ...formData,
                              socialLinks: [...currentLinks, socialLinkInput.trim()],
                            });
                          }
                          setSocialLinkInput("");
                        }
                      }}
                    />
                    <button
                      type="button"
                      className={styles.addSkillBtn}
                      onClick={() => {
                        if (socialLinkInput.trim()) {
                          const currentLinks = Array.isArray(formData.socialLinks) ? formData.socialLinks : [];
                          if (!currentLinks.includes(socialLinkInput.trim())) {
                            setFormData({
                              ...formData,
                              socialLinks: [...currentLinks, socialLinkInput.trim()],
                            });
                          }
                          setSocialLinkInput("");
                        }
                      }}
                    >
                      +
                    </button>
                  </div>

                  <div className={styles.tagContainer}>
                    {Array.isArray(formData.socialLinks) && formData.socialLinks.map((link: string, i: number) => (
                      <span key={i} className={styles.tag}>
                        {link}
                        <span
                          className={styles.tagRemove}
                          onClick={() => {
                            const newLinks = [...formData.socialLinks];
                            newLinks.splice(i, 1);
                            setFormData({
                              ...formData,
                              socialLinks: newLinks,
                            });
                          }}
                        >
                          ×
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            </>
          )}


          {activeSubTab === "security" && (
            <>
              <div className={styles.row}>
                <div className={styles.rowLabel}>
                  <strong>{t("البريد الإلكتروني")}</strong>
                </div>
                <div className={styles.rowContent}>
                  <form
                    onSubmit={handleUpdateEmail}
                    className={styles.inlineForm}
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className={styles.saveBtn}
                      disabled={isSavingEmail}
                    >
                      {t("تحديث")}
                    </button>
                  </form>
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.rowLabel}>
                  <strong>{t("تغيير كلمة المرور")}</strong>
                </div>
                <div className={styles.rowContent}>
                  <form
                    onSubmit={handleUpdatePassword}
                    className={styles.passwordForm}
                  >
                    <input
                      type="password"
                      placeholder={t("كلمة المرور الحالية")}
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords({ ...passwords, current: e.target.value })
                      }
                      required
                    />
                    <input
                      type="password"
                      placeholder={t("كلمة المرور الجديدة")}
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                      required
                    />
                    <input
                      type="password"
                      placeholder={t("تأكيد كلمة المرور")}
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm: e.target.value })
                      }
                      required
                    />
                    <button
                      type="submit"
                      className={styles.saveBtn}
                      disabled={isSavingPass}
                    >
                      {t("تحديث كلمة المرور")}
                    </button>
                  </form>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.rowLabel}>
                  <strong>{t("ربط حساب جوجل")}</strong>
                  <span>{t("اربط حسابك لتتمكن من تسجيل الدخول بلمسة واحدة.")}</span>
                </div>
                <div className={styles.rowContent}>
                  {formData.googleId ? (
                    <div className={styles.linkedBadge}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span>{t("حساب جوجل مرتبط بنجاح")}</span>
                    </div>
                  ) : (
                    <div className={styles.linkAction}>
                      <p className={styles.linkNote}>
                        {t("الحساب غير مرتبط حالياً.")}
                      </p>
                      <div className={styles.googleBtnWrapper}>
                        <GoogleLogin
                          onSuccess={handleGoogleLinkSuccess}
                          onError={() => alert(t("فشل الاتصال بجوجل"))}
                          useOneTap
                          theme="outline"
                          text="continue_with"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.rowLabel}>
                  <h2 style={{ color: "#ef4444", margin: 0, fontSize: "1.1rem" }}>{t("حذف الحساب")}</h2>
                  <span>
                    {deletionStatus.scheduled
                      ? t("حسابك مجدول للحذف النهائي. يمكنك إلغاء ذلك في أي وقت قبل انتهاء المدة.")
                      : t("بمجرد طلب الحذف، سيتم حذف حسابك نهائياً بعد يومين. يمكنك إلغاء الإجراء خلال هذه الفترة.")}
                  </span>
                </div>
                <div className={styles.rowContent}>
                  {deletionStatus.scheduled ? (
                    <div style={{ background: "rgba(239, 68, 68, 0.1)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                      <p style={{ color: "#ef4444", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>⚠️</span>
                        <span>{t("جاري حذف الحساب")} — <strong>{deletionStatus.daysLeft} {t("أيام متبقية")}</strong></span>
                      </p>
                      <button
                        onClick={handleCancelDeletion}
                        disabled={isCancelling}
                        style={{ padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}
                      >
                        {isCancelling ? t("جاري الإلغاء...") : t("إلغاء الحذف")}
                      </button>
                    </div>
                  ) : !showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{ padding: "10px 20px", background: "transparent", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "8px", cursor: "pointer", fontWeight: "500", transition: "all 0.2s" }}
                    >
                      {t("حذف حسابي")}
                    </button>
                  ) : (
                    <div style={{ background: "rgba(239, 68, 68, 0.05)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                      <p style={{ marginBottom: "16px", color: "#e2e8f0" }}>
                        {t("هل أنت متأكد؟ سيتم حذف حسابك نهائياً بعد يومين.")}
                      </p>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          style={{ padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}
                        >
                          {isDeleting ? t("جاري التنفيذ...") : t("نعم، احذف الحساب")}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          style={{ padding: "8px 16px", background: "transparent", color: "#94a3b8", border: "1px solid #475569", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}
                        >
                          {t("إلغاء")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </>
          )}
        </motion.div>
      </AnimatePresence>

      {activeSubTab !== "security" && (
        <div className={styles.saveRow}>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? t("جاري الحفظ...") : t("حفظ التغييرات")}
          </button>
        </div>
      )}
    </div>
  );
}
