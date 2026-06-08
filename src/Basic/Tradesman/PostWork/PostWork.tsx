import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import styles from "./PostWork.module.css";
import { useTranslation } from "../../../context/translation-context";
import { useJobitoAuth } from "../../../context/LinkContxt";
import { API_BASE_URL } from "../../../services/api";

const DAYS = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];

const PostWork = () => {
  const { t, isRTL } = useTranslation();
  const { user, apiFetch } = useJobitoAuth();
  const navigate = useNavigate();

  const location = useLocation() as { state: { editJob?: any } | null };
  const editJob = location.state?.editJob;
  const isEditMode = !!editJob;

  const [formData, setFormData] = useState({
    title: editJob?.title || "",
    description: editJob?.description || "",
    address: editJob?.address || "",
    skills: editJob?.skills || ([] as string[]),
    workTime: editJob?.workTime || ([] as string[]),
    images: editJob?.images || ([] as string[]),
    slotsAvailable: editJob?.slotsAvailable || 1,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(editJob?.images || []);
  const [skillInput, setSkillInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      workTime: prev.workTime.includes(day)
        ? prev.workTime.filter((d) => d !== day)
        : [...prev.workTime, day],
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter for images only
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    setSelectedFiles((prev) => [...prev, ...imageFiles]);

    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToServer = async (): Promise<string[]> => {
    const uploadPromises = selectedFiles.map(async (file) => {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("entity_type", "job");
      formDataUpload.append("entity_id", user?.id || "anonymous"); // Temporary ID
      formDataUpload.append("image_type", "gallery");

      try {
        const response = await fetch(`${API_BASE_URL}/images/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "ngrok-skip-browser-warning": "69420",
          },
          body: formDataUpload,
        });

        if (response.ok) {
          const data = await response.json();
          return data.imageUrl;
        } else {
          console.error("Failed to upload image:", file.name);
          return null;
        }
      } catch (err) {
        console.error("Error uploading image:", err);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      alert(t("يرجى ملء الحقول الأساسية"));
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload new images
      const newImageUrls = await uploadImagesToServer();
      // Keep existing images (that weren't removed) and add new ones
      const finalImages = [...formData.images.filter(img => previews.includes(img)), ...newImageUrls];

      const payload = {
        ...formData,
        images: finalImages,
        classification: "tradesman_work",
        jobType: ["one-time"],
        isActive: true,
        slotsAvailable: Number(formData.slotsAvailable) || 1,
      };

      const url = isEditMode 
        ? `${API_BASE_URL}/jobs/${editJob.jobId || editJob.job_id}` 
        : `${API_BASE_URL}/jobs`;
      const method = isEditMode ? "PATCH" : "POST";

      const response = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(isEditMode ? t("تم تعديل العمل بنجاح") : t("تم نشر العمل بنجاح"));
        navigate("/JobListing");
      } else {
        alert(t("حدث خطأ أثناء الحفظ"));
      }
    } catch (error) {
      console.error("Error posting work:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.page} ${isRTL ? styles.rtl : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      <h1 className={styles.pageTitle}>
        {isEditMode ? t("تعديل العمل") : t("نشر عملا")}
      </h1>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t("معلومات أساسية")}</h2>
        <p className={styles.sectionSubtitle}>
          {t("هذه المعلومات ستظهر للعامة.")}
        </p>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.rowLabel}>
          <strong>{t("عنوان العمل")}</strong>
          <span>{t("اكتب عنوانا قصيرا وواضحا للمهمة المطلوبة.")}</span>
        </div>
        <div className={styles.rowContent}>
          <input
            type="text"
            className={styles.textInput}
            placeholder={t("مثال: صيانة سباكة حمام")}
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.fieldRow}>
        <div className={styles.rowLabel}>
          <strong>{t("العدد المطلوب")}</strong>
          <span>{t("حدد عدد المقاعد أو الأشخاص المطلوبين لهذا العمل.")}</span>
        </div>
        <div className={styles.rowContent}>
          <input
            type="number"
            min="1"
            className={styles.textInput}
            value={formData.slotsAvailable}
            onChange={(e) =>
              setFormData({ ...formData, slotsAvailable: parseInt(e.target.value) || 1 })
            }
          />
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.fieldRow}>
        <div className={styles.rowLabel}>
          <strong>{t("وصف العمل")}</strong>
          <span>{t("اشرح المهام والمتطلبات بالتفصيل.")}</span>
        </div>
        <div className={styles.rowContent}>
          <textarea
            className={styles.textArea}
            placeholder={t("أدخل وصف العمل هنا")}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.fieldRow}>
        <div className={styles.rowLabel}>
          <strong>{t("المهارات المطلوبة")}</strong>
          <span>{t("أضف المهارات اللازمة لهذا العمل.")}</span>
        </div>
        <div className={styles.rowContent}>
          <div className={styles.skillsInputContainer}>
            <div className={styles.skillInputRow}>
              <input
                type="text"
                className={styles.textInput}
                placeholder={t("أضف مهارة...")}
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSkill()}
              />
              <button className={styles.addBtn} onClick={addSkill}>
                <Plus size={20} />
              </button>
            </div>
            <div className={styles.skillsRow}>
              {formData.skills.map((skill) => (
                <div key={skill} className={styles.skillTag}>
                  {t(skill)}
                  <button onClick={() => removeSkill(skill)}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.fieldRow}>
        <div className={styles.rowLabel}>
          <strong>{t("مكان العمل")}</strong>
        </div>
        <div className={styles.rowContent}>
          <select
            className={styles.selectInput}
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          >
            <option value="">{t("نفس العنوان")}</option>
            <option value="Cairo">{t("القاهرة")}</option>
            <option value="Alexandria">{t("الإسكندرية")}</option>
            <option value="Giza">{t("الجيزة")}</option>
            <option value="Qalyubia">{t("القليوبية")}</option>
            <option value="Port Said">{t("بورسعيد")}</option>
            <option value="Suez">{t("السويس")}</option>
            <option value="Gharbia">{t("الغربية")}</option>
            <option value="Dakahlia">{t("الدقهلية")}</option>
            <option value="Ismailia">{t("الإسماعيلية")}</option>
            <option value="Asyut">{t("أسيوط")}</option>
            <option value="Fayoum">{t("الفيوم")}</option>
            <option value="Minya">{t("المنيا")}</option>
            <option value="Qena">{t("قنا")}</option>
            <option value="Sohag">{t("سوهاج")}</option>
            <option value="Beni Suef">{t("بني سويف")}</option>
            <option value="Aswan">{t("أسوان")}</option>
            <option value="Red Sea">{t("البحر الأحمر")}</option>
            <option value="New Valley">{t("الوادي الجديد")}</option>
            <option value="Matrouh">{t("مطروح")}</option>
            <option value="North Sinai">{t("شمال سيناء")}</option>
            <option value="South Sinai">{t("جنوب سيناء")}</option>
            <option value="Kafr El Sheikh">{t("كفر الشيخ")}</option>
            <option value="Beheira">{t("البحيرة")}</option>
            <option value="Damietta">{t("دمياط")}</option>
            <option value="Sharqia">{t("الشرقية")}</option>
            <option value="Monufia">{t("المنوفية")}</option>
            <option value="Luxor">{t("الأقصر")}</option>
            <option value="Remote">{t("عن بعد (Remote)")}</option>
          </select>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.fieldRow}>
        <div className={styles.rowLabel}>
          <strong>{t("أيام العمل")}</strong>
        </div>
        <div className={styles.rowContent}>
          <div className={styles.daySelector}>
            {DAYS.map((day) => (
              <button
                key={day}
                className={`${styles.dayBtn} ${formData.workTime.includes(day) ? styles.dayBtnActive : ""}`}
                onClick={() => toggleDay(day)}
              >
                {t(day)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.fieldRow}>
        <div className={styles.rowLabel}>
          <strong>{t("صور العمل")}</strong>
          <span>{t("أضف صورا توضيحية للعمل")}</span>
        </div>
        <div className={styles.rowContent}>
          <input
            type="file"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <div
            className={styles.dropzone}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} color="var(--color-accent)" />
            <p>
              <span>{t("اضغط للاستبدال")}</span> {t("أو اسحب وأفلت")}
            </p>
            <p>{t("SVG, PNG, JPG أو GIF (بحد أقصى 400x400 بكسل)")}</p>
          </div>

          {previews.length > 0 && (
            <div className={styles.previewGrid}>
              {previews.map((url, index) => (
                <div key={url} className={styles.previewItem}>
                  <img 
                    src={url.startsWith("blob:") || url.startsWith("http") ? url : `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`} 
                    alt="Work preview" 
                  />
                  <button
                    className={styles.removePreview}
                    onClick={() => removeFile(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.nextRow}>
        {user?.deletionRequestedAt && (
          <p className={styles.deletionWarning}>
            {t(
              "لا يمكن نشر عمل جديد لأن حسابك مجدول للحذف. يرجى إلغاء طلب الحذف لاستعادة هذه الميزة.",
            )}
          </p>
        )}
        <button
          className={styles.nextBtn}
          onClick={handleSubmit}
          disabled={isSubmitting || !!user?.deletionRequestedAt}
        >
          {isSubmitting ? t("جاري الحفظ...") : isEditMode ? t("تحديث العمل") : t("نشر العمل")}
        </button>
      </div>
    </div>
  );
};

export default PostWork;
