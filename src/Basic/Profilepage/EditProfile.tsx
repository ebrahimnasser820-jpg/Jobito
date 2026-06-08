import React, { useState, useRef, useEffect } from "react";
import styles from "./EditProfile.module.css";
import { useJobitoAuth } from "../../context/LinkContxt";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../../context/translation-context";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد", "الشرقية", "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد", "دمياط", "جنوب سيناء", "كفر الشيخ", "مطروح", "قنا", "شمال سيناء", "سوهاج", "الأقصر"
];

const PREDEFINED_SERVICES = [
  "كهربائى",
  "فني سباكه",
  "نجار",
  "منظف بيوت",
  "نقاش",
  "ميكانيكي",
  "حداد",

];
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

interface Experience {
  role: string;
  period: string;
  location: string;
  desc: string;
}

interface Education {
  school: string;
  degree: string;
  period: string;
  desc: string;
}

type Tab = "profile" | "login" | "notifications";

const getAvatarUrl = (path: string | undefined | null) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function EditProfile() {
  const { t } = useTranslation();
  const { user, apiFetch } = useJobitoAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [services, setServices] = useState<string[]>([]);
  const [isAddingService, setIsAddingService] = useState(false);
  const [newServiceInput, setNewServiceInput] = useState("");

  // Advanced Profile State
  const [profileData, setProfileData] = useState({
    fullName: user?.name || "",
    phone: user?.phone || t("غير محدد"),
    email: user?.email || "mohamednasseremam380@gmail.com",
    dob: user?.dob || "",
    gender: user?.gender || "",
    bio: user?.bio || "",
    accountType: user?.role === "company" ? "employer" : "job_seeker",
    location: user?.location || "",
    banner_url: user?.banner_url || "",
    role: user?.role || "user",
    classification: user?.classification || "job_seeker",
  });

  const [experience, setExperience] = useState<Experience[]>(
    user?.experiences || [],
  );
  const [education, setEducation] = useState<Education[]>(
    user?.educations || [],
  );
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [gallery, setGallery] = useState<string[]>(user?.portfolios || []);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const [projectLinks, setProjectLinks] = useState<string[]>(user?.projectLinks || []);
  const [projectLinkInput, setProjectLinkInput] = useState("");

  const [socialLinks, setSocialLinks] = useState<string[]>(Array.isArray(user?.socialLinks) ? user.socialLinks : []);
  const [socialLinkInput, setSocialLinkInput] = useState("");

  const [skillInput, setSkillInput] = useState("");

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);

  // Login Details State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [deletionStatus, setDeletionStatus] = useState<{
    scheduled: boolean;
    daysLeft?: number;
    permanentDeleteAt?: string;
  }>({ scheduled: !!user?.deletionRequestedAt });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchDeletionStatus = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/users/me/deletion-status`);
        if (res.ok) {
          const data = await res.json();
          setDeletionStatus(data);
        }
      } catch { /* ignore */ }
    };
    if (user?.deletionRequestedAt) {
      fetchDeletionStatus();
    }
  }, [apiFetch, user?.deletionRequestedAt]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/users/me`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(t("فشل في طلب حذف الحساب"));
      const data = await res.json();
      showToast(data.message || t("تم جدولة حذف الحساب خلال يومين"), "success");
      setDeletionStatus({ scheduled: true, daysLeft: 2 });
      setShowDeleteConfirm(false);
      window.dispatchEvent(new Event("auth-changed"));
    } catch (err: any) {
      showToast(err.message || "Error", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDeletion = async () => {
    setIsCancelling(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/users/me/cancel-deletion`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error(t("فشل في إلغاء طلب الحذف"));
      showToast(t("تم إلغاء طلب حذف الحساب بنجاح!"), "success");
      setDeletionStatus({ scheduled: false });
      window.dispatchEvent(new Event("auth-changed"));
    } catch (err: any) {
      showToast(err.message || "Error", "error");
    } finally {
      setIsCancelling(false);
    }
  };
  const [showPass, setShowPass] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState({
    email: true,
    jobAlerts: true,
    applications: false,
    marketing: false,
  });

  const handleProfileChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const setProfileFieldValue = (name: string, value: any) => {
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        setGalleryFiles((prev) => [...prev, file]);
        const reader = new FileReader();
        reader.onloadend = () =>
          setGallery((prev) => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addExperience = () => {
    setExperience([...experience, { role: "", period: "", location: "", desc: "" }]);
  };

  const addEducation = () => {
    setEducation([...education, { school: "", degree: "", period: "", desc: "" }]);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/users/me`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfileData({
          fullName: data.fullName || "",
          phone: data.phone || "",
          email: data.email || "",
          dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : "",
          gender: data.gender || "",
          bio: data.bio || "",
          accountType: data.role === "company" ? "employer" : "job_seeker",
          location: data.location || "",
          banner_url: data.banner_url || "",
          role: data.role || "user",
          classification: data.classification || "job_seeker",
        });

        if (Array.isArray(data.socialLinks)) {
          setSocialLinks(data.socialLinks);
        }
        setExperience(data.experiences || []);
        setEducation(data.educations || []);
        setSkills(data.skills || []);
        setProjectLinks(data.projectLinks || []);
        setGallery(data.portfolios || []);
        setServices(data.services || []);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    fetchProfile();
  }, [apiFetch]);



  const handleSave = async () => {
    if (activeTab === "login" && passwords.new !== passwords.confirm) {
      showToast(t("كلمات المرور الجديدة غير متطابقة!"), "error");
      return;
    }

    try {
      setIsSaving(true);

      const uploadPromises: Promise<void>[] = [];

      let finalAvatarUrl = user?.avatar || "";
      if (selectedFile) {
        uploadPromises.push((async () => {
          const fd = new FormData();
          fd.append("file", selectedFile);
          const uploadRes = await apiFetch(`${API_BASE_URL}/images/profile`, {
            method: "PUT",
            body: fd,
          });
          if (uploadRes.ok) {
            const imgData = await uploadRes.json();
            finalAvatarUrl = imgData.imageUrl || imgData.image_url;
          }
        })());
      }

      let finalBannerUrl = user?.banner_url || "";
      if (selectedBannerFile) {
        uploadPromises.push((async () => {
          const fd = new FormData();
          fd.append("file", selectedBannerFile);
          const uploadRes = await apiFetch(`${API_BASE_URL}/images/banner`, {
            method: "PUT",
            body: fd,
          });
          if (uploadRes.ok) {
            const imgData = await uploadRes.json();
            finalBannerUrl = imgData.imageUrl || imgData.image_url;
          }
        })());
      }

      // Upload new gallery images to server concurrently
      const uploadedGalleryUrls: string[] = [];
      if (galleryFiles.length > 0) {
        const galleryPromises = galleryFiles.map(async (file) => {
          try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("entity_type", "user");
            fd.append("entity_id", user?.id || "anonymous");
            fd.append("image_type", "portfolio");
            const uploadRes = await apiFetch(`${API_BASE_URL}/images/upload`, {
              method: "POST",
              body: fd,
            });
            if (uploadRes.ok) {
              const imgData = await uploadRes.json();
              uploadedGalleryUrls.push(imgData.imageUrl || imgData.image_url);
            }
          } catch (err) {
            console.error("Failed to upload gallery image:", err);
          }
        });
        uploadPromises.push(...galleryPromises);
      }

      await Promise.all(uploadPromises);

      // Combine existing server URLs (non-base64) with newly uploaded URLs
      const existingServerUrls = gallery.filter(
        (img) => !img.startsWith("data:")
      );
      const finalPortfolios = [...existingServerUrls, ...uploadedGalleryUrls];

      if (activeTab === "login") {
        if (passwords.new) {
          const passRes = await apiFetch(`${API_BASE_URL}/users/me/password`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              oldPassword: passwords.current,
              newPassword: passwords.new,
            }),
          });
          if (!passRes.ok) {
            const err = await passRes.json();
            throw new Error(err.message || t("فشل تحديث كلمة المرور"));
          }
        }
      } else {
        const updateData = {
          fullName: profileData.fullName,
          phone: profileData.phone,
          email: profileData.email,
          dob: profileData.dob,
          gender: profileData.gender,
          bio: profileData.bio,
          socialLinks: socialLinks,
          experiences: experience,
          educations: education,
          skills: skills,
          projectLinks: projectLinks,
          portfolios: finalPortfolios,
          avatarUrl: finalAvatarUrl,
          avatar: finalAvatarUrl,
          banner_url: finalBannerUrl,
          location: profileData.location,
          services: services,
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
        if (result.access_token) {
          localStorage.setItem("token", result.access_token);
          window.dispatchEvent(new Event("auth-changed"));
        }
      }

      showToast(t("تم حفظ التعديلات بنجاح!"), "success");
      navigate("/Profile");
      setSelectedFile(null);
      setPhotoPreview(null);
      setSelectedBannerFile(null);
      setBannerPreview(null);
      setGalleryFiles([]);
      if (activeTab === "login") {
        setPasswords({ current: "", new: "", confirm: "" });
      }
    } catch (error: any) {
      showToast(`${t("فشل الحفظ:")} ${error.message}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1 className={styles.title}>{t("تعديل الملف الشخصي")}</h1>
          {user?.deletionRequestedAt && (
            <div className={styles.deletionNotice}>
              ⚠️ {t("حسابك مجدول للحذف. تم إيقاف التعديلات.")}
            </div>
          )}
        </div>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === "profile" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            {t("الملف الشخصي")}
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "login" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("login")}
          >
            {t("بيانات الدخول")}
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "notifications" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            {t("الإشعارات")}
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              {/* Basic Info */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{t("المعلومات الأساسية")}</h3>
                <p className={styles.sectionSub}>
                  {t("هذه معلوماتك الشخصية التي يمكنك تحديثها في أي وقت.")}
                </p>

                <div className={styles.row}>
                  <div className={styles.labelGroup}>
                    <p className={styles.label}>{t("صورة الغلاف")}</p>
                    <p className={styles.sectionSub}>
                      {t("تُعرض هذه الصورة في خلفية ملفك الشخصي.")}
                    </p>
                  </div>
                  <div className={styles.fieldFull}>
                    <div
                      className={styles.bannerPreview}
                      onClick={() => bannerInputRef.current?.click()}
                      style={{
                        backgroundImage: `url(${bannerPreview || getAvatarUrl(user?.banner_url) || ""})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {!bannerPreview && !user?.banner_url && (
                        <div className={styles.bannerPlaceholder}>
                          <UploadIcon />
                          <p>{t("انقر لرفع صورة غلاف")}</p>
                        </div>
                      )}
                      {(bannerPreview || user?.banner_url) && (
                        <div className={styles.bannerOverlay}>
                          <UploadIcon />
                          <span>{t("تغيير الصورة")}</span>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={bannerInputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={handleBannerUpload}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.labelGroup}>
                    <p className={styles.label}>{t("صورة الملف الشخصي")}</p>
                    <p className={styles.sectionSub}>
                      {t("تُعرض هذه الصورة للعامة وتساعد أصحاب العمل في التعرف عليك.")}
                    </p>
                  </div>
                  <div className={styles.photoSection}>
                    <img
                      src={
                        photoPreview ||
                        getAvatarUrl(user?.avatar) ||
                        "https://i.pravatar.cc/150?u=fake"
                      }
                      alt="Avatar"
                      className={styles.avatar}
                    />
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

              {/* Personal Details */}
              <div className={styles.section}>
                <div className={styles.row}>
                  <div className={styles.labelGroup}>
                    <p className={styles.label}>{t("التفاصيل الشخصية")}</p>
                  </div>
                  <div className={styles.formGrid}>
                    <div className={`${styles.field} ${styles.fieldFull}`}>
                      <label className={styles.label}>
                        {t("الاسم الكامل")} <span>*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        className={styles.input}
                        value={profileData.fullName}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>
                        {t("رقم الهاتف")} <span>*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className={styles.input}
                        value={profileData.phone}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>
                        {t("البريد الإلكتروني")} <span>*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        className={styles.input}
                        value={profileData.email}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>
                        {t("تاريخ الميلاد")} <span>*</span>
                      </label>
                      <input
                        type="date"
                        name="dob"
                        className={styles.input}
                        value={profileData.dob}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>
                        {t("النوع")} <span>*</span>
                      </label>
                      <select
                        name="gender"
                        className={styles.select}
                        value={profileData.gender}
                        onChange={handleProfileChange}
                      >
                        <option value="">{t("اختر...")}</option>
                        <option value="male">{t("ذكر")}</option>
                        <option value="female">{t("أنثى")}</option>
                      </select>
                    </div>
                    <div className={styles.fieldFull}>
                      <label className={styles.label}>{t("المحافظة")}</label>
                      <select
                        name="location"
                        className={styles.select}
                        value={profileData.location}
                        onChange={handleProfileChange}
                      >
                        <option value="">{t("اختر المحافظة...")}</option>
                        {GOVERNORATES.map((gov) => (
                          <option key={gov} value={gov}>
                            {t(gov)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className={styles.section}>
                <div className={styles.row}>
                  <div className={styles.labelGroup}>
                    <p className={styles.label}>{t("نبذة عني")}</p>
                    <p className={styles.sectionSub}>
                      {t("صف مهاراتك وخبراتك باختصار.")}
                    </p>
                  </div>
                  <div className={styles.fieldFull}>
                    <textarea
                      name="bio"
                      className={styles.textarea}
                      placeholder={t("أضف نبذة عن نفسك...")}
                      value={profileData.bio}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className={styles.section}>
                  <div className={styles.row}>
                    <div className={styles.labelGroup}>
                      <p className={styles.label}>{t("الخبرات")}</p>
                      <p className={styles.sectionSub}>
                        {t("أضف خبراتك العملية السابقة.")}
                      </p>
                    </div>
                    <div className={styles.listContainer}>
                      {experience.map((exp, index) => (
                        <div key={index} className={styles.listItem}>
                          <div className={styles.listHeader}>
                            <p className={styles.label}>{t("خبرة")} {index + 1}</p>
                            <button
                              className={styles.removeBtn}
                              onClick={() =>
                                setExperience(
                                  experience.filter((_, i) => i !== index),
                                )
                              }
                            >
                              {t("حذف")}
                            </button>
                          </div>
                          <div className={styles.fieldFull}>
                            <label className={styles.label}>{t("المسمى الوظيفي")}</label>
                            <input
                              type="text"
                              className={styles.input}
                              value={exp.role}
                              onChange={(e) => {
                                setExperience(
                                  experience.map((item, i) =>
                                    i === index
                                      ? { ...item, role: e.target.value }
                                      : item,
                                  ),
                                );
                              }}
                            />
                          </div>
                          <div className={styles.formGrid}>
                            <div className={styles.field}>
                              <label className={styles.label}>{t("المدة")}</label>
                              <input
                                type="text"
                                className={styles.input}
                                placeholder={t("مثل: يناير 2020 - مارس 2023")}
                                value={exp.period}
                                onChange={(e) => {
                                  setExperience(
                                    experience.map((item, i) =>
                                      i === index
                                        ? { ...item, period: e.target.value }
                                        : item,
                                    ),
                                  );
                                }}
                              />
                            </div>
                            <div className={styles.field}>
                              <label className={styles.label}>{t("الموقع")}</label>
                              <input
                                type="text"
                                className={styles.input}
                                value={exp.location}
                                onChange={(e) => {
                                  setExperience(
                                    experience.map((item, i) =>
                                      i === index
                                        ? { ...item, location: e.target.value }
                                        : item,
                                    ),
                                  );
                                }}
                              />
                            </div>
                          </div>
                          <div className={styles.fieldFull}>
                            <label className={styles.label}>{t("الوصف")}</label>
                            <textarea
                              className={styles.textarea}
                              style={{ minHeight: "80px" }}
                              value={exp.desc}
                              onChange={(e) => {
                                setExperience(
                                  experience.map((item, i) =>
                                    i === index
                                      ? { ...item, desc: e.target.value }
                                      : item,
                                  ),
                                );
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      <button className={styles.addBtn} onClick={addExperience}>
                        + {t("إضافة خبرة جديدة")}
                      </button>
                    </div>
                  </div>
              </div>

              {/* Education */}
              <div className={styles.section}>
                <div className={styles.row}>
                  <div className={styles.labelGroup}>
                    <p className={styles.label}>{t("التعليم")}</p>
                    <p className={styles.sectionSub}>
                      {t("أضف المؤسسات التعليمية التي درست بها والدرجات العلمية التي حصلت عليها.")}
                    </p>
                  </div>
                  <div className={styles.formGrid}>
                    <div className={styles.fieldFull}>
                      {education.map((edu, index) => (
                        <div key={index} className={styles.experienceBlock}>
                          <div className={styles.listHeader}>
                            <p className={styles.label}>{t("تعليم")} {index + 1}</p>
                            <button
                              className={styles.removeBtn}
                              onClick={() =>
                                setEducation(education.filter((_, i) => i !== index))
                              }
                            >
                              {t("حذف")}
                            </button>
                          </div>
                          <div className={styles.formGrid}>
                            <div className={styles.field}>
                              <label className={styles.label}>{t("المدرسة / الجامعة")}</label>
                              <input
                                type="text"
                                className={styles.input}
                                value={edu.school}
                                onChange={(e) => {
                                  const newEdu = [...education];
                                  newEdu[index].school = e.target.value;
                                  setEducation(newEdu);
                                }}
                              />
                            </div>
                            <div className={styles.field}>
                              <label className={styles.label}>{t("الدرجة العلمية")}</label>
                              <input
                                type="text"
                                className={styles.input}
                                value={edu.degree}
                                onChange={(e) => {
                                  const newEdu = [...education];
                                  newEdu[index].degree = e.target.value;
                                  setEducation(newEdu);
                                }}
                              />
                            </div>
                            <div className={styles.field}>
                              <label className={styles.label}>{t("الفترة")}</label>
                              <input
                                type="text"
                                className={styles.input}
                                placeholder="2018 - 2022"
                                value={edu.period}
                                onChange={(e) => {
                                  const newEdu = [...education];
                                  newEdu[index].period = e.target.value;
                                  setEducation(newEdu);
                                }}
                              />
                            </div>
                            <div className={styles.field}>
                              <label className={styles.label}>{t("الموقع")}</label>
                              <input
                                type="text"
                                className={styles.input}
                                value={edu.location}
                                onChange={(e) => {
                                  const newEdu = [...education];
                                  newEdu[index].location = e.target.value;
                                  setEducation(newEdu);
                                }}
                              />
                            </div>
                            <div className={styles.fieldFull}>
                              <label className={styles.label}>{t("الوصف")}</label>
                              <textarea
                                className={styles.textarea}
                                value={edu.desc}
                                onChange={(e) => {
                                  const newEdu = [...education];
                                  newEdu[index].desc = e.target.value;
                                  setEducation(newEdu);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button className={styles.addBtn} onClick={addEducation}>
                        + {t("إضافة تعليم جديد")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills & Languages */}
              <div className={styles.section}>
                <div className={styles.row}>
                  <div className={styles.labelGroup}>
                    <p className={styles.label}>{t("المهارات واللغات")}</p>
                  </div>
                  <div className={styles.formGrid}>
                    {/* Specialized Service Selection and Skills for Tradesmen */}
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

              {/* Social Links */}
              <div className={styles.section}>
                <div className={styles.row}>
                  <div className={styles.labelGroup}>
                    <p className={styles.label}>{t("روابط التواصل الاجتماعي")}</p>
                    <p className={styles.sectionSub}>
                      {t("أضف روابط حساباتك على منصات التواصل الاجتماعي.")}
                    </p>
                  </div>
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
                            if (!socialLinks.includes(socialLinkInput.trim())) {
                              setSocialLinks([...socialLinks, socialLinkInput.trim()]);
                            }
                            setSocialLinkInput("");
                          }
                        }}
                      />
                      <button 
                        type="button"
                        className={styles.addSkillBtn}
                        onClick={() => {
                          if (socialLinkInput.trim() && !socialLinks.includes(socialLinkInput.trim())) {
                            setSocialLinks([...socialLinks, socialLinkInput.trim()]);
                          }
                          setSocialLinkInput("");
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
                            onClick={() => setSocialLinks(socialLinks.filter((_, idx) => idx !== i))}
                          >
                            ×
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>




              {/* Services Section - Only for Tradesmen */}
              {(user?.classification === "tradesman" || profileData.classification === "tradesman") && (
              <div className={styles.section}>
                <div className={styles.row}>
                  <div className={styles.labelGroup}>
                    <p className={styles.label}>{t("الخدمات")}</p>
                    <p className={styles.sectionSub}>
                      {t("اختر الخدمات التي تقدمها للعملاء.")}
                    </p>
                  </div>
                  <div className={styles.fieldFull}>
                    <div className={styles.skillInputWrapper}>
                      <input
                        type="text"
                        className={styles.input}
                        style={{ flex: 1 }}
                        placeholder={t("أضف خدمة واضغط Enter أو زر الـ +")}
                        value={newServiceInput}
                        onChange={(e) => setNewServiceInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newServiceInput.trim()) {
                            e.preventDefault();
                            if (!services.includes(newServiceInput.trim())) {
                              setServices([...services, newServiceInput.trim()]);
                            }
                            setNewServiceInput("");
                          }
                        }}
                      />
                      <button 
                        type="button"
                        className={styles.addSkillBtn}
                        onClick={() => {
                          if (newServiceInput.trim() && !services.includes(newServiceInput.trim())) {
                            setServices([...services, newServiceInput.trim()]);
                          }
                          setNewServiceInput("");
                        }}
                      >
                        +
                      </button>
                    </div>

                    <div className={styles.tagContainer}>
                      {services.map((srv, i) => (
                        <span key={i} className={styles.tag}>
                          {t(srv)}
                          <span
                            className={styles.tagRemove}
                            onClick={() => setServices(services.filter((_, idx) => idx !== i))}
                          >
                            ×
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              )}


              {/* Portfolio / Exhibition */}
              <div className={styles.section}>
                <div className={styles.row}>
                  <div className={styles.labelGroup}>
                    <p className={styles.label}>{t("المعرض")}</p>
                    <p className={styles.sectionSub}>
                      {t("أضف صور أعمالك ومشاريعك السابقة لعرضها في ملفك الشخصي.")}
                    </p>
                  </div>
                  <div className={styles.fieldFull}>
                    <div className={styles.galleryGrid}>
                      {gallery.map((img, idx) => (
                        <div className={styles.galleryItem} key={idx}>
                          <img
                            src={
                              img.startsWith("data:") || img.startsWith("http")
                                ? img
                                : getAvatarUrl(img) || ""
                            }
                            alt={`Portfolio ${idx + 1}`}
                            className={styles.galleryImg}
                          />
                          <button
                            className={styles.galleryRemoveBtn}
                            onClick={() => {
                              // If removing a newly added image (base64), also remove corresponding file
                              const removedImg = gallery[idx];
                              if (removedImg.startsWith("data:")) {
                                // Count how many base64 images come before this index
                                const base64IndexBefore = gallery.slice(0, idx).filter(g => g.startsWith("data:")).length;
                                setGalleryFiles(prev => prev.filter((_, fi) => fi !== base64IndexBefore));
                              }
                              setGallery(gallery.filter((_, i) => i !== idx));
                            }
                            }
                            title={t("حذف")}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <div
                        className={styles.galleryAddBtn}
                        onClick={() => galleryInputRef.current?.click()}
                      >
                        <UploadIcon />
                        <span>{t("إضافة صورة")}</span>
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={galleryInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                    />
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{t("أمان الحساب")}</h3>
                <p className={styles.sectionSub}>
                  {t("قم بتحديث كلمة المرور الخاصة بك بانتظام للحفاظ على أمان حسابك.")}
                </p>
                <div className={styles.formGrid}>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>{t("كلمة المرور الحالية")}</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPass ? "text" : "password"}
                        name="current"
                        className={styles.input}
                        placeholder="••••••••"
                        value={passwords.current}
                        onChange={handlePasswordChange}
                      />
                      <button
                        className={styles.toggleBtn}
                        onClick={() => setShowPass(!showPass)}
                      >
                        {showPass ? t("إخفاء") : t("إظهار")}
                      </button>
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{t("كلمة المرور الجديدة")}</label>
                    <input
                      type={showPass ? "text" : "password"}
                      name="new"
                      className={styles.input}
                      placeholder="••••••••"
                      value={passwords.new}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{t("تأكيد كلمة المرور")}</label>
                    <input
                      type={showPass ? "text" : "password"}
                      name="confirm"
                      className={styles.input}
                      placeholder="••••••••"
                      value={passwords.confirm}
                      onChange={handlePasswordChange}
                    />
                  </div>
                </div>

                <div className={styles.section} style={{ marginTop: "2.5rem", borderTop: "1px solid var(--border, #eee)", paddingTop: "2rem" }}>
                  <h3 className={styles.sectionTitle} style={{ color: "#dc2626" }}>{t("حذف الحساب")}</h3>
                  <p className={styles.sectionSub}>
                    {deletionStatus.scheduled
                      ? t("حسابك مجدول للحذف. يمكنك إلغاء هذا الإجراء قبل انتهاء المدة.")
                      : t("بمجرد طلب الحذف، سيتم حذف حسابك نهائياً بعد يومين.")}
                  </p>
                  
                  <div style={{ marginTop: "1rem" }}>
                    {deletionStatus.scheduled ? (
                      <div style={{ background: "rgba(220, 38, 38, 0.05)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
                        <p style={{ color: "#dc2626", fontWeight: "bold", marginBottom: "1.5rem", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "8px" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                          {t("جاري حذف الحساب")} — {deletionStatus.daysLeft} {t("يوم متبقي")}
                        </p>
                        <button
                          type="button"
                          style={{ background: "#2563eb", color: "#fff", border: "none", padding: "0.75rem 1.5rem", borderRadius: "8px", cursor: "pointer", fontWeight: "600", transition: "all 0.2s" }}
                          onClick={handleCancelDeletion}
                          disabled={isCancelling}
                        >
                          {isCancelling ? t("جاري الإلغاء...") : t("إلغاء حذف الحساب")}
                        </button>
                      </div>
                    ) : !showDeleteConfirm ? (
                      <button
                        type="button"
                        style={{ background: "transparent", color: "#dc2626", border: "1px solid #dc2626", padding: "0.75rem 1.5rem", borderRadius: "8px", cursor: "pointer", fontWeight: "600", transition: "all 0.2s" }}
                        onMouseOver={(e) => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "#fff"; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#dc2626"; }}
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        {t("حذف حسابي")}
                      </button>
                    ) : (
                      <div style={{ background: "var(--bg-card, #fff)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border, #eee)" }}>
                        <p style={{ marginBottom: "1.5rem", fontWeight: "600", color: "var(--text-primary, #111)" }}>
                          {t("هل أنت متأكد؟ سيتم حذف حسابك نهائياً بعد يومين.")}
                        </p>
                        <div style={{ display: "flex", gap: "1rem" }}>
                          <button
                            type="button"
                            style={{ background: "#dc2626", color: "#fff", border: "none", padding: "0.75rem 1.5rem", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                          >
                            {isDeleting ? t("جاري المعالجة...") : t("نعم، احذف حسابي")}
                          </button>
                          <button
                            type="button"
                            style={{ background: "transparent", color: "var(--text-secondary, #666)", border: "1px solid var(--border, #ccc)", padding: "0.75rem 1.5rem", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                            onClick={() => setShowDeleteConfirm(false)}
                          >
                            {t("إلغاء")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{t("إعدادات الإشعارات")}</h3>
                <p className={styles.sectionSub}>
                  {t("اختر كيف ومتى تود استلام الإشعارات منا.")}
                </p>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleLabel}>
                    <span className={styles.radioTitle}>
                      {t("إشعارات البريد الإلكتروني")}
                    </span>
                    <span className={styles.radioDesc}>
                      {t("استلم ملخصاً أسبوعياً للوظائف والمقالات")}
                    </span>
                  </div>
                  <div
                    className={`${styles.toggleSwitch} ${notifications.email ? styles.active : ""}`}
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        email: !notifications.email,
                      })
                    }
                  >
                    <div className={styles.toggleSlider} />
                  </div>
                </div>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleLabel}>
                    <span className={styles.radioTitle}>{t("تنبيهات الوظائف")}</span>
                    <span className={styles.radioDesc}>
                      {t("عند نشر وظيفة جديدة تناسب مهاراتك")}
                    </span>
                  </div>
                  <div
                    className={`${styles.toggleSwitch} ${notifications.jobAlerts ? styles.active : ""}`}
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        jobAlerts: !notifications.jobAlerts,
                      })
                    }
                  >
                    <div className={styles.toggleSlider} />
                  </div>
                </div>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleLabel}>
                    <span className={styles.radioTitle}>{t("تحديثات الطلبات")}</span>
                    <span className={styles.radioDesc}>
                      {t("عند تغيير حالة طلبات التوظيف الخاصة بك")}
                    </span>
                  </div>
                  <div
                    className={`${styles.toggleSwitch} ${notifications.applications ? styles.active : ""}`}
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        applications: !notifications.applications,
                      })
                    }
                  >
                    <div className={styles.toggleSlider} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={isSaving || !!user?.deletionRequestedAt}
        >
          {isSaving ? t("جاري الحفظ...") : t("حفظ الملف الشخصي")}
        </button>
      </div>
    </div>
  );
}
