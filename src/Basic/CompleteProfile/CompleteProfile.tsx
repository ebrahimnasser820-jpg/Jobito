import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import styles from "./CompleteProfile.module.css";
import { useJobitoAuth } from "../../context/LinkContxt";
import { useTranslation } from "../../context/translation-context";
import { useToast } from "../../context/ToastContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";



const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد", "الشرقية", "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد", "دمياط", "جنوب سيناء", "كفر الشيخ", "مطروح", "قنا", "شمال سيناء", "سوهاج", "الأقصر"
];

interface Experience {
  role: string;
  period: string;
}

interface Education {
  school: string;
  degree: string;
  period: string;
}

const UploadIcon = () => (
  <svg
    className={styles.uploadIcon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export default function CompleteProfile() {
  const { t, language, setLanguage } = useTranslation();
  const { user, apiFetch, logout } = useJobitoAuth();
  const navigate = useNavigate();

  // Role state
  const [role, setRole] = useState<"job_seeker" | "tradesman">("job_seeker");

  // Profile photo
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wallpaper
  const [wallpaperPreview, setWallpaperPreview] = useState<string | null>(null);
  const [selectedWallpaper, setSelectedWallpaper] = useState<File | null>(null);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);

  // Personal Details
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    dob: user?.dob || "",
    gender: user?.gender || "",
    location: user?.location || "",
  });

  // Validation errors state
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  // Toast System
  const { showToast } = useToast();

  // About me
  const [bio, setBio] = useState("");

  // Experience
  const [experiences, setExperiences] = useState<Experience[]>([]);

  // Education
  const [educations, setEducations] = useState<Education[]>([]);

  // Skills & Languages
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  // Project Links
  const [projectLinks, setProjectLinks] = useState<string[]>([]);
  const [projectLinkInput, setProjectLinkInput] = useState("");



  // Social Links
  const [socialLinks, setSocialLinks] = useState<string[]>(
    Array.isArray(user?.socialLinks) ? user.socialLinks : []
  );
  const [socialLinkInput, setSocialLinkInput] = useState("");

  // Work Images
  const [workImages, setWorkImages] = useState<string[]>([]);
  const [workImageFiles, setWorkImageFiles] = useState<File[]>([]);
  const workImageRef = useRef<HTMLInputElement>(null);

  // Criminal Record (Tradesman Only)
  const [criminalRecordPreview, setCriminalRecordPreview] = useState<string | null>(null);
  const [selectedCriminalRecord, setSelectedCriminalRecord] = useState<File | null>(null);
  const criminalRecordInputRef = useRef<HTMLInputElement>(null);

  // Services (Tradesman Only)
  const PREDEFINED_SERVICES = ["كهربائي", "فني سباكة", "نجار", "منظف بيوت", "نقاش", "ميكانيكي", "حداد"];
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showServiceInput, setShowServiceInput] = useState(false);
  const [customService, setCustomService] = useState("");

  // Saving
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  // Deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // ─── Upload helper with retry ─────────────────
  const uploadWithRetry = async (
    url: string,
    formData: FormData,
    method: "PUT" | "POST" = "PUT",
    maxRetries = 2,
  ): Promise<Response> => {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await apiFetch(url, { method, body: formData });
        return res;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`Upload attempt ${attempt}/${maxRetries} failed for ${url}:`, lastError.message);
        if (attempt < maxRetries) {
          // Wait 1.5s before retrying
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
    }
    throw lastError!;
  };

  // ─── Handlers ─────────────────────────────────
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedWallpaper(file);
      const reader = new FileReader();
      reader.onloadend = () => setWallpaperPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleWorkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        setWorkImageFiles((prev) => [...prev, file]);
        const reader = new FileReader();
        reader.onloadend = () =>
          setWorkImages((prev) => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleCriminalRecordUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCriminalRecord(file);
      const reader = new FileReader();
      reader.onloadend = () => setCriminalRecordPreview(reader.result as string);
      reader.readAsDataURL(file);
      if (formErrors.criminalRecord) {
        setFormErrors((prev) => {
          const newErrs = { ...prev };
          delete newErrs.criminalRecord;
          return newErrs;
        });
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };



  const addExperience = () => {
    setExperiences([...experiences, { role: "", period: "" }]);
  };

  const addEducation = () => {
    setEducations([...educations, { school: "", degree: "", period: "" }]);
  };

  // ─── Save Profile ─────────────────────────────
  const validateForm = () => {
    const errors: Record<string, boolean> = {};
    let isValid = true;

    if (!formData.fullName.trim()) { errors.fullName = true; isValid = false; }
    if (!formData.phone.trim()) { errors.phone = true; isValid = false; }
    if (!formData.email.trim()) { errors.email = true; isValid = false; }
    if (!formData.dob.trim()) { errors.dob = true; isValid = false; }
    if (!formData.gender.trim()) { errors.gender = true; isValid = false; }
    if (!formData.location.trim()) { errors.location = true; isValid = false; }

    if (!bio.trim()) {
      errors.bio = true;
      isValid = false;
    }

    // Tradesman-specific validations
    if (role === "tradesman") {
      if (selectedServices.length === 0) {
        errors.services = true;
        isValid = false;
      }
      if (!selectedCriminalRecord && !criminalRecordPreview) {
        errors.criminalRecord = true;
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      if (role === "tradesman" && (formErrors.services || formErrors.criminalRecord)) {
        showToast(t("يجب رفع الفيش الجنائي واختيار خدمة واحدة على الأقل للتسجيل كحرفي."), "error");
      } else {
        showToast(t("يرجى إكمال جميع الحقول المطلوبة (المشار إليها بنجمة *) قبل الحفظ."), "error");
      }
      return;
    }

    try {
      setIsSaving(true);
      setSaveStatus(t("جاري رفع الصور..."));

      // ─── Upload all images in PARALLEL with retry ───
      let avatarUrl = user?.avatar || "";
      let bannerUrl = "";
      let criminalRecordUrl = "";

      const uploadTasks: Array<{
        key: "avatar" | "banner" | "criminal";
        promise: Promise<Response>;
      }> = [];

      if (selectedFile) {
        const fd = new FormData();
        fd.append("file", selectedFile);
        uploadTasks.push({
          key: "avatar",
          promise: uploadWithRetry(`${API_BASE_URL}/images/profile`, fd, "PUT"),
        });
      }

      if (selectedWallpaper) {
        const fd = new FormData();
        fd.append("file", selectedWallpaper);
        uploadTasks.push({
          key: "banner",
          promise: uploadWithRetry(`${API_BASE_URL}/images/banner`, fd, "PUT"),
        });
      }

      if (selectedCriminalRecord) {
        const fd = new FormData();
        fd.append("file", selectedCriminalRecord);
        fd.append("entity_type", "user");
        fd.append("entity_id", user?.id || "anonymous");
        uploadTasks.push({
          key: "criminal",
          promise: uploadWithRetry(`${API_BASE_URL}/images/upload`, fd, "POST"),
        });
      }

      // Run all uploads simultaneously
      if (uploadTasks.length > 0) {
        const uploadResults = await Promise.allSettled(
          uploadTasks.map((t) => t.promise)
        );

        const failedUploads: string[] = [];

        for (let i = 0; i < uploadResults.length; i++) {
          const result = uploadResults[i];
          const task = uploadTasks[i];

          if (result.status === "fulfilled" && result.value.ok) {
            const imgData = await result.value.json();
            const url = imgData.imageUrl || imgData.image_url;
            if (task.key === "avatar") avatarUrl = url;
            else if (task.key === "banner") bannerUrl = url;
            else if (task.key === "criminal") criminalRecordUrl = url;
          } else if (result.status === "rejected") {
            const label =
              task.key === "avatar" ? t("الصورة الشخصية") :
              task.key === "banner" ? t("صورة الغلاف") :
              t("الفيش الجنائي");
            failedUploads.push(label);
          }
        }

        if (failedUploads.length > 0) {
          throw new Error(
            `${t("فشل رفع:")} ${failedUploads.join("، ")}. ${t("تأكد من اتصالك بالإنترنت وحاول مرة أخرى.")}`
          );
        }
      }

      // ─── Upload gallery/work images ───
      const uploadedWorkImageUrls: string[] = [];
      if (workImageFiles.length > 0) {
        for (const file of workImageFiles) {
          try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("entity_type", "user");
            fd.append("entity_id", user?.id || "anonymous");
            fd.append("image_type", "portfolio");
            const uploadRes = await uploadWithRetry(`${API_BASE_URL}/images/upload`, fd, "POST");
            if (uploadRes.ok) {
              const imgData = await uploadRes.json();
              uploadedWorkImageUrls.push(imgData.imageUrl || imgData.image_url);
            }
          } catch (err) {
            console.error("Failed to upload work image:", err);
          }
        }
      }

      // Combine existing server URLs (non-base64) with newly uploaded URLs
      const existingServerUrls = workImages.filter(
        (img) => !img.startsWith("data:")
      );
      const finalPortfolios = [...existingServerUrls, ...uploadedWorkImageUrls];

      // ─── Build update payload ───
      setSaveStatus(t("جاري حفظ البيانات..."));

      const updateData: Record<string, unknown> = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        dob: formData.dob,
        gender: formData.gender,
        location: formData.location,
        bio,
        socialLinks,
        experiences: experiences,
        educations: educations,
        skills,
        projectLinks,
        portfolios: finalPortfolios,
        avatarUrl: avatarUrl,
        avatar: avatarUrl,
        banner_url: bannerUrl,
        role: "user",
        classification: role,
        services: selectedServices,
        criminalRecordUrl: criminalRecordUrl, 
      };

      const res = await apiFetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const result = await res.json();

      // Tradesman flow: must logout and wait for admin approval
      if (role === "tradesman") {
        showToast(t("تم تقديم طلبك بنجاح! حسابك قيد المراجعة الآن، وسيتم تسجيل خروجك لحين موافقة الإدارة."), "success");
        setTimeout(() => {
          logout();
          navigate("/");
        }, 3000);
        return;
      }

      // Job seeker flow: save token and proceed
      if (result.access_token) {
        localStorage.setItem("token", result.access_token);
        window.dispatchEvent(new Event("auth-changed"));
      }

      navigate("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("حدث خطأ غير متوقع");
      showToast(`${t("فشل الحفظ:")} ${message}`, "error");
    } finally {
      setIsSaving(false);
      setSaveStatus("");
    }
  };

  // ─── Delete Account Handler ─────────────────
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await apiFetch(`${API_BASE_URL}/users/me`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || t("فشل حذف الحساب"));
      }
      showToast(t("تم حذف حسابك بنجاح."), "success");
      logout();
      navigate("/");
    } catch (error) {
      const msg = error instanceof Error ? error.message : t("خطأ غير متوقع");
      showToast(`${t("فشل الحذف:")} ${msg}`, "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // ─── Animation Variants ───────────────────────
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <div className={styles.page}>
      {/* ─── Language Toggle ─────────────────────── */}
      <div className={styles.topActions}>
        <button
          className={styles.langBtn}
          onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
          title={language === "ar" ? "English" : "العربية"}
        >
          {language === "ar" ? "EN" : "AR"}
        </button>
      </div>

      {/* ─── Hero Header ─────────────────────────── */}
      <motion.div
        className={styles.heroHeader}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className={styles.heroTitle}>
          {t("يمكنك التسجيل")} <span className={styles.highlight}>{t("كحرفي")}</span>
          <br />
          {t("أو")} <span className={styles.accentText}>{t("باحث عن عمل")}</span>{" "}
          {t("مع")} <span className={styles.brandText}>Jobito</span>
          <motion.svg
            className={styles.heroUnderline}
            viewBox="0 0 120 6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
          >
            <motion.path
              d="M2 4 Q 30 0, 60 4 T 118 4"
              stroke="var(--color-accent)"
              fill="transparent"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
            />
          </motion.svg>
        </h1>
      </motion.div>

      {/* ─── Role Switcher ───────────────────────── */}
      <motion.div
        className={styles.roleSwitcher}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.button
          className={`${styles.roleBtn} ${role === "job_seeker" ? styles.roleBtnActive : ""}`}
          onClick={() => setRole("job_seeker")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t("باحث عن عمل")}
        </motion.button>

        <span className={styles.roleDivider}>{t("أو")}</span>

        <motion.button
          className={`${styles.roleBtn} ${role === "tradesman" ? styles.roleBtnAccent : ""}`}
          onClick={() => setRole("tradesman")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t("حرفي")}
        </motion.button>
      </motion.div>

      <div className={styles.container}>
        {/* ═══════════════════════════════════════════
            ─── Section 1: Profile Photo ──────────────
            ═══════════════════════════════════════════ */}
        <motion.div
          className={styles.section}
          custom={0}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className={styles.sectionRow}>
            <div className={styles.sectionLabel}>
              <h3>{t("صورة الملف الشخصي")}</h3>
              <p>
                {t(
                  "تُعرض هذه الصورة للعامة وتساعد أصحاب العمل في التعرف عليك."
                )}
              </p>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.photoUploadRow}>
                <div className={styles.avatarPreview}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Avatar" />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <i className="fas fa-user" />
                    </div>
                  )}
                </div>
                <div
                  className={styles.uploadZone}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon />
                  <p className={styles.uploadText}>
                    <span className={styles.uploadLink}>
                      {t("انقر للاستبدال")}
                    </span>{" "}
                    {t("أو سحب وإفلات")}
                  </p>
                  <p className={styles.uploadHint}>
                    SVG, PNG, JPG or GIF (max. 400 x 400px)
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            ─── Section 2: Wallpaper ──────────────────
            ═══════════════════════════════════════════ */}
        <motion.div
          className={styles.section}
          custom={1}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className={styles.sectionRow}>
            <div className={styles.sectionLabel}>
              <h3>{t("صورة الغلاف")}</h3>
              <p>
                {t(
                  "تُعرض هذه الصورة في خلفية ملفك الشخصي."
                )}
              </p>
            </div>
            <div className={styles.sectionContent}>
              <div
                className={styles.wallpaperZone}
                onClick={() => wallpaperInputRef.current?.click()}
              >
                {wallpaperPreview ? (
                  <>
                    <img
                      src={wallpaperPreview}
                      alt="Wallpaper"
                      className={styles.wallpaperPreviewImg}
                    />
                    <div className={styles.wallpaperOverlay}>
                      <UploadIcon />
                      <span>{t("تغيير الصورة")}</span>
                    </div>
                  </>
                ) : (
                  <div className={styles.wallpaperPlaceholder}>
                    <UploadIcon />
                    <p className={styles.uploadText}>
                      <span className={styles.uploadLink}>
                        {t("انقر للاستبدال")}
                      </span>{" "}
                      {t("أو سحب وإفلات")}
                    </p>
                    <p className={styles.uploadHint}>
                      SVG, PNG, JPG or GIF (max. 1600 x 600px)
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={wallpaperInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleWallpaperUpload}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            ─── Section 3: Personal Details ───────────
            ═══════════════════════════════════════════ */}
        <motion.div
          className={styles.section}
          custom={2}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className={styles.sectionRow}>
            <div className={styles.sectionLabel}>
              <h3>{t("التفاصيل الشخصية")}</h3>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>
                    {t("الاسم الكامل")} <span>*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className={`${styles.input} ${formErrors.fullName ? styles.inputError : ''}`}
                    placeholder="Jake Gyll"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                  {formErrors.fullName && (
                    <div className={styles.errorMessage}>{t("هذا الحقل مطلوب")}</div>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    {t("رقم الهاتف")} <span>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className={`${styles.input} ${formErrors.phone ? styles.inputError : ''}`}
                    placeholder="+44 1245 572 135"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {formErrors.phone && (
                    <div className={styles.errorMessage}>{t("هذا الحقل مطلوب")}</div>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    {t("البريد الإلكتروني")} <span>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className={`${styles.input} ${formErrors.email ? styles.inputError : ''}`}
                    placeholder="jakegyll@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {formErrors.email && (
                    <div className={styles.errorMessage}>{t("هذا الحقل مطلوب")}</div>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    {t("تاريخ الميلاد")} <span>*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    className={`${styles.input} ${formErrors.dob ? styles.inputError : ''}`}
                    value={formData.dob}
                    onChange={handleChange}
                    max="2026-12-31"
                  />
                  {formErrors.dob && (
                    <div className={styles.errorMessage}>{t("هذا الحقل مطلوب")}</div>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    {t("الجنس")} <span>*</span>
                  </label>
                  <select
                    name="gender"
                    className={`${styles.select} ${formErrors.gender ? styles.inputError : ''}`}
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">{t("اختر...")}</option>
                    <option value="male">{t("ذكر")}</option>
                    <option value="female">{t("أنثى")}</option>
                  </select>
                  {formErrors.gender && (
                    <div className={styles.errorMessage}>{t("هذا الحقل مطلوب")}</div>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    {t("المحافظة")} <span>*</span>
                  </label>
                  <select
                    name="location"
                    className={`${styles.select} ${formErrors.location ? styles.inputError : ''}`}
                    value={formData.location}
                    onChange={handleChange}
                  >
                    <option value="">{t("اختر المحافظة...")}</option>
                    {GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                  {formErrors.location && (
                    <div className={styles.errorMessage}>{t("هذا الحقل مطلوب")}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            ─── Service (Tradesman Only) ──────────────
            ═══════════════════════════════════════════ */}
        {role === "tradesman" && (
          <motion.div
            className={styles.section}
            custom={2.5}
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className={styles.sectionRow}>
              <div className={styles.sectionLabel}>
                <h3>{t("الخدمة")} <span>*</span></h3>
                <p>{t("اختر الخدمات التي تقدمها لعملائك.")}</p>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.servicesGrid}>
                  <div className={styles.serviceTagGroup}>
                    {PREDEFINED_SERVICES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`${styles.serviceItem} ${
                          selectedServices.includes(s) ? styles.serviceItemActive : ""
                        }`}
                        onClick={() => {
                          if (selectedServices.includes(s)) {
                            setSelectedServices(selectedServices.filter((item) => item !== s));
                          } else {
                            setSelectedServices([...selectedServices, s]);
                            if (formErrors.services) {
                              setFormErrors((prev) => {
                                const newErrs = { ...prev };
                                delete newErrs.services;
                                return newErrs;
                              });
                            }
                          }
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {showServiceInput ? (
                    <div className={styles.customServiceInputRow}>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder={t("اكتب الخدمة هنا...")}
                        value={customService}
                        onChange={(e) => setCustomService(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className={styles.addBtnSmall}
                        onClick={() => {
                          if (customService.trim()) {
                            setSelectedServices([...selectedServices, customService.trim()]);
                            setCustomService("");
                            setShowServiceInput(false);
                          }
                        }}
                      >
                        {t("إضافة")}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={styles.addServiceBtn}
                      onClick={() => setShowServiceInput(true)}
                    >
                      <i className="fas fa-plus" /> {t("Add new Serves")}
                    </button>
                  )}
                </div>
                {formErrors.services && (
                  <div className={styles.errorMessage}>{t("يجب اختيار خدمة واحدة على الأقل")}</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════
            ─── Section 4: About Me ───────────────────
            ═══════════════════════════════════════════ */}
        <motion.div
          className={styles.section}
          custom={3}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className={styles.sectionRow}>
            <div className={styles.sectionLabel}>
              <h3>{t("نبذة عني")}</h3>
              <p>{t("صف مهاراتك وخبراتك باختصار.")}</p>
            </div>
            <div className={styles.sectionContent}>
              <textarea
                className={`${styles.textarea} ${formErrors.bio ? styles.inputError : ""}`}
                placeholder={t("أضف نبذة عن نفسك...")}
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  if (formErrors.bio) {
                    setFormErrors((prev) => {
                      const newErrs = { ...prev };
                      delete newErrs.bio;
                      return newErrs;
                    });
                  }
                }}
              />
              {formErrors.bio && (
                <div className={styles.errorMessage}>{t("هذا الحقل مطلوب")}</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            ─── Section 5: Experiences ────────────────
            ═══════════════════════════════════════════ */}
        {role !== "tradesman" && (
          <motion.div
            className={styles.section}
            custom={4}
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className={styles.sectionRow}>
              <div className={styles.sectionLabel}>
                <h3>{t("الخبرات")}</h3>
                <p>{t("أضف خبراتك العملية السابقة.")}</p>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.listContainer}>
                  <AnimatePresence>
                    {experiences.map((exp, index) => (
                      <motion.div
                        key={index}
                        className={styles.listItem}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className={styles.listHeader}>
                          <span className={styles.label}>
                            {t("خبرة")} {index + 1}
                          </span>
                          <button
                            className={styles.removeBtn}
                            onClick={() =>
                              setExperiences(
                                experiences.filter((_, i) => i !== index)
                              )
                            }
                          >
                            {t("حذف")}
                          </button>
                        </div>
                        <div className={styles.formGrid}>
                          <div className={`${styles.field} ${styles.fieldFull}`}>
                            <label className={styles.label}>
                              {t("المسمى الوظيفي")}
                            </label>
                            <input
                              type="text"
                              className={styles.input}
                              value={exp.role}
                              onChange={(e) => {
                                const updated = [...experiences];
                                updated[index].role = e.target.value;
                                setExperiences(updated);
                              }}
                            />
                          </div>
                          <div className={`${styles.field} ${styles.fieldFull}`}>
                            <label className={styles.label}>{t("المدة")}</label>
                            <input
                              type="text"
                              className={styles.input}
                              placeholder={t("مثل: يناير 2020 - مارس 2023")}
                              value={exp.period}
                              onChange={(e) => {
                                const updated = [...experiences];
                                updated[index].period = e.target.value;
                                setExperiences(updated);
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <motion.button
                    className={styles.addBtn}
                    onClick={addExperience}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    + {t("إضافة خبرة جديدة")}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}


        {/* ═══════════════════════════════════════════
            ─── Section 6: Education ──────────────────
            ═══════════════════════════════════════════ */}
        <motion.div
          className={styles.section}
          custom={5}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className={styles.sectionRow}>
            <div className={styles.sectionLabel}>
              <h3>{t("التعليم")}</h3>
              <p>{t("أضف مؤهلاتك العلمية.")}</p>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.listContainer}>
                <AnimatePresence>
                  {educations.map((edu, index) => (
                    <motion.div
                      key={index}
                      className={styles.listItem}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={styles.listHeader}>
                        <span className={styles.label}>
                          {t("تعليم")} {index + 1}
                        </span>
                        <button
                          className={styles.removeBtn}
                          onClick={() =>
                            setEducations(
                              educations.filter((_, i) => i !== index)
                            )
                          }
                        >
                          {t("حذف")}
                        </button>
                      </div>
                      <div className={styles.formGrid}>
                        <div className={styles.field}>
                          <label className={styles.label}>
                            {t("المؤسسة التعليمية")}
                          </label>
                          <input
                            type="text"
                            className={styles.input}
                            value={edu.school}
                            onChange={(e) => {
                              const updated = [...educations];
                              updated[index].school = e.target.value;
                              setEducations(updated);
                            }}
                          />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>
                            {t("الدرجة العلمية")}
                          </label>
                          <input
                            type="text"
                            className={styles.input}
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = [...educations];
                              updated[index].degree = e.target.value;
                              setEducations(updated);
                            }}
                          />
                        </div>
                        <div className={`${styles.field} ${styles.fieldFull}`}>
                          <label className={styles.label}>{t("المدة")}</label>
                          <input
                            type="text"
                            className={styles.input}
                            value={edu.period}
                            onChange={(e) => {
                              const updated = [...educations];
                              updated[index].period = e.target.value;
                              setEducations(updated);
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <motion.button
                  className={styles.addBtn}
                  onClick={addEducation}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  + {t("إضافة تعليم جديد")}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            ─── Section 7: Skills ─────────────────────
            ═══════════════════════════════════════════ */}
        <motion.div
          className={styles.section}
          custom={6}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className={styles.sectionRow}>
            <div className={styles.sectionLabel}>
              <h3>{t("المهارات")}</h3>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.formGrid}>
                <div className={styles.fieldFull}>
                  <label className={styles.label}>{t("المهارات")}</label>
                  <div className={styles.skillInputWrapper}>
                    <input
                      type="text"
                      className={styles.input}
                      style={{ flex: 1 }}
                      placeholder={t("أضف مهارة واضغط Enter أو زر الـ +")}
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && skillInput.trim()) {
                          e.preventDefault();
                          setSkills([...skills, skillInput.trim()]);
                          setSkillInput("");
                        }
                      }}
                    />
                    <button
                      type="button"
                      className={styles.addSkillBtn}
                      onClick={() => {
                        if (skillInput.trim()) {
                          setSkills([...skills, skillInput.trim()]);
                          setSkillInput("");
                        }
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div className={styles.tagContainer}>
                    {skills.map((skill, i) => (
                      <span key={i} className={styles.tag}>
                        {skill}
                        <span
                          className={styles.tagRemove}
                          onClick={() =>
                            setSkills(skills.filter((_, idx) => idx !== i))
                          }
                        >
                          ×
                        </span>
                      </span>
                    ))}
                  </div>

                </div>
        
              </div>
            </div>
          </div>
        </motion.div>


        {/* ═══════════════════════════════════════════
            ─── Section 8: Social Links ───────────────
            ═══════════════════════════════════════════ */}
        <motion.div
          className={styles.section}
          custom={7}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className={styles.sectionRow}>
            <div className={styles.sectionLabel}>
              <h3>{t("روابط التواصل الاجتماعي")}</h3>
              <p>{t("أضف روابط أعمالك أو حساباتك المهنية.")}</p>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.formGrid}>
                <div className={styles.fieldFull}>
                  <label className={styles.label}>{t("الروابط")}</label>
                  <div className={styles.skillInputWrapper}>
                    <input
                      type="url"
                      className={styles.input}
                      style={{ flex: 1 }}
                      placeholder={t("أضف رابط واضغط Enter أو زر الـ +")}
                      value={socialLinkInput}
                      onChange={(e) => setSocialLinkInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && socialLinkInput.trim()) {
                          e.preventDefault();
                          setSocialLinks([...socialLinks, socialLinkInput.trim()]);
                          setSocialLinkInput("");
                        }
                      }}
                    />
                    <button
                      type="button"
                      className={styles.addSkillBtn}
                      onClick={() => {
                        if (socialLinkInput.trim()) {
                          setSocialLinks([...socialLinks, socialLinkInput.trim()]);
                          setSocialLinkInput("");
                        }
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div className={styles.tagContainer}>
                    {socialLinks.map((link, i) => (
                      <span key={i} className={styles.tag}>
                        {link}
                        <span
                          className={styles.tagRemove}
                          onClick={() =>
                            setSocialLinks(socialLinks.filter((_, idx) => idx !== i))
                          }
                        >
                          ×
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            ─── Criminal Record Check (Tradesman) ─────
            ═══════════════════════════════════════════ */}
        {role === "tradesman" && (
          <motion.div
            className={styles.section}
            custom={7.5}
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className={styles.sectionRow}>
              <div className={styles.sectionLabel}>
                <h3>{t("Criminal Record Check")} <span>*</span></h3>
                <p>
                  {t(
                    "Is An Official Document That Shows A Person's Criminal History."
                  )}
                </p>
              </div>
              <div className={styles.sectionContent}>
                <div
                  className={`${styles.criminalRecordZone} ${formErrors.criminalRecord ? styles.inputError : ''}`}
                  onClick={() => criminalRecordInputRef.current?.click()}
                >
                  {criminalRecordPreview ? (
                    <div className={styles.previewContainer}>
                      <img
                        src={criminalRecordPreview}
                        alt="Criminal Record"
                        className={styles.previewImg}
                      />
                      <div className={styles.previewOverlay}>
                        {t("تغيير الملف")}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.placeholderBox}>
                      <UploadIcon />
                      <p className={styles.uploadText}>
                        <span className={styles.uploadLink}>
                          {t("Click to replace")}
                        </span>{" "}
                        {t("or drag and drop")}
                      </p>
                      <p className={styles.uploadHint}>
                        SVG, PNG, JPG or GIF (max. 400 x 400px)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={criminalRecordInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleCriminalRecordUpload}
                  />
                </div>
                {formErrors.criminalRecord && (
                  <div className={styles.errorMessage}>{t("يجب رفع صورة الفيش الجنائي")}</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════
            ─── Section 9: Work Images ────────────────
            ═══════════════════════════════════════════ */}
        <motion.div
          className={styles.section}
          custom={8}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className={styles.sectionRow}>
            <div className={styles.sectionLabel}>
              <h3>{t("صور الأعمال")}</h3>
              <p>{t("أضف صور لأعمالك السابقة.")}</p>
            </div>
            <div className={styles.sectionContent}>
              <div
                className={styles.workImageZone}
                onClick={() => workImageRef.current?.click()}
              >
                <div className={styles.wallpaperPlaceholder}>
                  <UploadIcon />
                  <p className={styles.uploadText}>
                    <span className={styles.uploadLink}>
                      {t("انقر للاستبدال")}
                    </span>{" "}
                    {t("أو سحب وإفلات")}
                  </p>
                  <p className={styles.uploadHint}>
                    SVG, PNG, JPG or GIF (max. 400 x 400px)
                  </p>
                </div>
                <input
                  type="file"
                  ref={workImageRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  multiple
                  onChange={handleWorkImageUpload}
                />
              </div>
              {workImages.length > 0 && (
                <div className={styles.workImageGrid}>
                  {workImages.map((img, i) => (
                    <div key={i} className={styles.workImageThumb}>
                      <img src={img} alt={`Work ${i + 1}`} />
                      <button
                        className={styles.workImageRemove}
                        onClick={(e) => {
                          e.stopPropagation();
                          setWorkImages(
                            workImages.filter((_, idx) => idx !== i)
                          );
                          setWorkImageFiles(
                            workImageFiles.filter((_, idx) => idx !== i)
                          );
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            ─── Submit Row ────────────────────────────
            ═══════════════════════════════════════════ */}
        <motion.div
          className={styles.submitRow}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button
            className={styles.submitBtn}
            onClick={handleSave}
            disabled={isSaving}
            whileHover={{ scale: isSaving ? 1 : 1.03 }}
            whileTap={{ scale: isSaving ? 1 : 0.97 }}
          >
            {isSaving ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                <span className={styles.loader} />
                {saveStatus && <span>{saveStatus}</span>}
              </span>
            ) : (
              t("حفظ وإكمال الملف الشخصي")
            )}
          </motion.button>
          <motion.button
            className={styles.deleteBtn}
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            whileHover={{ scale: isDeleting ? 1 : 1.03 }}
            whileTap={{ scale: isDeleting ? 1 : 0.97 }}
          >
            {t("حذف الحساب نهائيًا")}
          </motion.button>
        </motion.div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeButton} onClick={() => setShowDeleteModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <h2>{t("تأكيد حذف الحساب")}</h2>
              <p>{t("بمجرد طلب الحذف، سيتم حذف حسابك نهائياً بعد يومين. يمكنك إلغاء الإجراء خلال هذه الفترة.")}</p>
              <div className={styles.modalFooter}>
                <button className={styles.cancelButton} onClick={() => setShowDeleteModal(false)}>{t("إلغاء")}</button>
                <button className={styles.submitButton} onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? t("جاري الحذف...") : t("حذف الحساب")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
