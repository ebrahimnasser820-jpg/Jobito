import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./PostJob.module.css";
import { useJobitoAuth } from "../../../context/LinkContxt";
import { useTranslation } from "../../../context/translation-context";
import { useToast } from "../../../context/ToastContext";

type Step = 1 | 2 | 3;

interface Benefit {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

interface JobFormData {
  title: string;
  jobTypes: string[];
  salary: number;
  categoryId?: number;
  fieldOfWork?: string[];
  address: string;
  description: string[];
  responsibilities: string[];
  whoYouAre: string[];
  niceToHaves: string[];
  skills: string[];
  benefits: Benefit[];
  slotsAvailable: number;
  expiresAt: string;
  classification: "تقني" | "غير تقني" | "خدمات" | "";
  images?: string[];
  workTime?: string[];
}

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const XIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const STEPS = [
  { n: 1, label: "معلومات الوظيفة" },
  { n: 2, label: "وصف الوظيفة" },
  { n: 3, label: "المزايا والفوائد" },
];

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function StepBar({
  current,
  onStepClick,
}: {
  current: Step;
  onStepClick: (s: Step) => void;
}) {
  const { t } = useTranslation();
  const steps = [
    { n: 1, label: t("معلومات الوظيفة") },
    { n: 2, label: t("وصف الوظيفة") },
    { n: 3, label: t("المزايا والفوائد") },
  ];

  return (
    <div className={styles.stepBar}>
      {steps.map((s, i) => (
        <div key={s.n} className={styles.stepItem}>
          <div
            className={`${styles.stepCircle} ${current >= s.n ? styles.stepDone : ""} ${current === s.n ? styles.stepActive : ""}`}
            onClick={() => current > s.n && onStepClick(s.n as Step)}
          >
            {current > s.n ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : s.n === 1 ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            ) : s.n === 2 ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            )}
          </div>
          <div className={styles.stepText}>
            <span className={styles.stepNum}>{t("الخطوة")} {s.n}/3</span>
            <span className={styles.stepLabel}>{t(s.label)}</span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`${styles.stepLine} ${current > s.n ? styles.stepLineDone : ""}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

const JOB_TYPE_MAP: Record<string, string> = {
  "Full Time": "full-time",
  "Part Time": "part-time",
  "Freelance": "freelance",
  "Internship": "internship",
  "One-time": "one-time",
  "Remote": "remote",
};

const EMPLOYMENT_TYPES = Object.keys(JOB_TYPE_MAP);

function FieldOfWorkInput({
  fields,
  onChange,
  categories,
  onCategoryClick,
}: {
  fields: string[];
  onChange: (val: string[]) => void;
  categories: any[];
  onCategoryClick: (cat: any) => void;
}) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [showInput, setShowInput] = useState(false);

  const addField = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !fields.includes(trimmed)) {
      onChange([...fields, trimmed]);
      setInputValue("");
    }
  };

  const removeField = (field: string) => {
    onChange(fields.filter((f) => f !== field));
  };

  return (
    <div>
      {/* Current tags */}
      <div className={styles.skillsRow} style={{ marginBottom: fields.length > 0 ? "12px" : "0" }}>
        {fields.map((field) => (
          <span key={field} className={styles.skillTag}>
            {t(field)}
            <button type="button" onClick={() => removeField(field)}>
              <XIcon />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <div className={styles.skillInputRow}>
        {!showInput ? (
          <button
            type="button"
            className={styles.addSkillBtn}
            onClick={() => setShowInput(true)}
          >
            <PlusIcon /> {t("أضف مجال عمل")}
          </button>
        ) : (
          <div className={styles.skillInputFlex}>
            <input
              type="text"
              placeholder={t("مثال: هندسة، تصميم، إدارة...")}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addField();
                }
              }}
              className={styles.textInput}
              autoFocus
            />
            <div className={styles.skillActionBtns}>
              <button
                type="button"
                className={styles.primaryBtnSmall}
                onClick={addField}
              >
                {t("إضافة")}
              </button>
              <button
                type="button"
                className={styles.cancelBtnSmall}
                onClick={() => setShowInput(false)}
              >
                {t("إلغاء")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Existing category suggestions */}
      {categories.length > 0 && (
        <div className={styles.categorySuggestions} style={{ marginTop: "12px" }}>
          <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "8px" }}>
            {t("أقسام موجودة مسبقاً:")}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {categories
              .filter((c) => !["تقني", "غير تقني", "خدمات"].includes(c.name))
              .filter((c) => !fields.includes(c.name))
              .map((cat: any) => (
                <button
                  key={cat.categoryId}
                  type="button"
                  className={styles.tagSmall}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "99px",
                    border: "1px solid var(--color-border)",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: "var(--color-text)",
                  }}
                  onClick={() => onCategoryClick(cat)}
                >
                  {t(cat.name)}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Step1({
  data,
  updateData,
  onNext,
  categories,
}: {
  data: JobFormData;
  updateData: (d: Partial<JobFormData>) => void;
  onNext: () => void;
  categories: any[];
}) {
  const { t } = useTranslation();
  const [skillInput, setSkillInput] = useState("");
  const [showSkillInput, setShowSkillInput] = useState(false);

  const addSkill = () => {
    if (skillInput.trim() && !data.skills.includes(skillInput.trim())) {
      updateData({ skills: [...data.skills, skillInput.trim()] });
      setSkillInput("");
      setShowSkillInput(false);
    }
  };

  return (
    <div className={styles.stepContent}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t("المعلومات الأساسية")}</h2>
        <p className={styles.sectionSubtitle}>{t("هذه المعلومات ستظهر للعامة")}</p>
      </div>
      <div className={styles.divider} />

      <div className={styles.fieldRow}>
        <div className={styles.rowLabel}>
          <strong>{t("عنوان الوظيفة")} <span style={{ color: "red" }}>*</span></strong>
          <span>{t("يجب أن يصف العنوان وظيفة واحدة فقط")}</span>
        </div>
        <div className={styles.rowContent}>
          <input
            type="text"
            placeholder={t("مثال: مهندس برمجيات")}
            className={styles.textInput}
            value={data.title}
            onChange={(e) => updateData({ title: e.target.value })}
          />
          <div className={styles.hint}>{t("على الأقل 80 حرفاً")}</div>
        </div>
      </div>
      <div className={styles.divider} />

      <div className={styles.fieldRow}>
        <div className={styles.rowLabel}>
          <strong>{t("نوع التوظيف")}</strong>
          <span>{t("اختر أنواع التوظيف المتاحة")}</span>
        </div>
        <div className={styles.rowContent}>
          <div className={styles.pillGrid} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
            {EMPLOYMENT_TYPES.map((type) => {
              const isSelected = data.jobTypes.includes(JOB_TYPE_MAP[type]);
              return (
                <div 
                  key={type} 
                  className={`${styles.typePill} ${isSelected ? styles.pillSelected : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                    background: isSelected ? "var(--color-primary-light, #4640de15)" : "var(--color-bg-secondary, #f8f9fc)",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onClick={() => {
                    const value = JOB_TYPE_MAP[type];
                    const newTypes = isSelected 
                      ? data.jobTypes.filter(t => t !== value)
                      : [...data.jobTypes, value];
                    updateData({ jobTypes: newTypes });
                  }}
                >
                  <div style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    border: "2px solid var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isSelected ? "var(--color-primary)" : "transparent"
                  }}>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: isSelected ? "600" : "400", color: "var(--color-text)" }}>
                    {t(type)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className={styles.divider} />

      <div className={styles.fieldRow}>
        <div className={styles.rowLabel}>
          <strong>{t("الراتب (بالجنيه)")}</strong>
          <span>{t("يرجى تحديد الراتب المتوقع. (اكتب 0 إذا كان قابل للتفاوض)")}</span>
        </div>
        <div className={styles.rowContent}>
          <div className={styles.salaryBox}>
            <span className={styles.currencyLabel}>EGP</span>
            <input
              type="number"
              value={data.salary}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                updateData({ salary: val });
              }}
              className={styles.salaryInputInner}
              placeholder={t("مثال: 10000")}
            />
          </div>
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.fieldRow}>
        <div className={styles.rowLabel}>
          <strong>{t("العدد المطلوب")}</strong>
          <span>{t("حدد عدد المقاعد المتاحة لهذا المنصب")}</span>
        </div>
        <div className={styles.rowContent}>
          <input
            type="number"
            min="1"
            className={styles.textInput}
            value={data.slotsAvailable}
            onChange={(e) =>
              updateData({ slotsAvailable: parseInt(e.target.value) || 1 })
            }
          />
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.fieldRow}>
        <div className={styles.rowLabel}>
          <strong>{t("موقع الوظيفة (المحافظة)")}</strong>
          <span>{t("اتركه للوضع الافتراضي لاعتماد مقر الشركة")}</span>
        </div>
        <div className={styles.rowContent}>
          <select
            className={styles.textInput}
            value={data.address}
            onChange={(e) => updateData({ address: e.target.value })}
          >
            <option value="">{t("نفس مقر الشركة")}</option>
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
          <strong>{t("تصنيف الوظيفة")} <span style={{ color: "red" }}>*</span></strong>
          <span>{t("اختر التصنيف العام للوظيفة")}</span>
        </div>
        <div className={styles.rowContent}>
          <div className={styles.categorySuggestions} style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {["تقني", "غير تقني", "خدمات"].map((cls) => (
              <button
                key={cls}
                type="button"
                className={styles.tagSmall}
                style={{
                  padding: "8px 20px",
                  borderRadius: "99px",
                  border: data.classification === cls ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                  background: data.classification === cls ? "var(--color-primary-light, #4640de15)" : "var(--color-bg-secondary, #f8f9fc)",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: data.classification === cls ? "600" : "400",
                  color: data.classification === cls ? "var(--color-primary)" : "var(--color-text)",
                  transition: "all 0.2s ease"
                }}
                onClick={() => updateData({ classification: cls as any })}
              >
                {t(cls)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.divider} />

      <div className={styles.fieldRow}>
        <div className={styles.rowLabel}>
          <strong>{t("مجال العمل")}</strong>
          <span>{t("اكتب مجال العمل الدقيق (مثال: هندسة، تسويق، برمجة)")}</span>
        </div>
        <div className={styles.rowContent}>
          <div className={styles.categorySelectionBox}>
            <FieldOfWorkInput
              fields={data.fieldOfWork || []}
              onChange={(val) => updateData({ fieldOfWork: val, categoryId: undefined })}
              categories={categories}
              onCategoryClick={(cat) => {
                const current = data.fieldOfWork || [];
                if (!current.includes(cat.name)) {
                  updateData({ fieldOfWork: [...current, cat.name] });
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className={styles.divider} />

      <div className={styles.fieldRow}>
        <div className={styles.rowLabel}>
          <strong>{t("المهارات المطلوبة")}</strong>
          <span>{t("أضف المهارات اللازمة للوظيفة")}</span>
        </div>
        <div className={styles.rowContent}>
          <div className={styles.skillInputRow}>
            {!showSkillInput ? (
              <button
                type="button"
                className={styles.addSkillBtn}
                onClick={() => setShowSkillInput(true)}
              >
                <PlusIcon /> {t("أضف مهارات")}
              </button>
            ) : (
              <div className={styles.skillInputFlex}>
                <input
                  type="text"
                  placeholder={t("اكتب المهارة واضغط Enter")}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className={styles.textInput}
                  autoFocus
                />
                <div className={styles.skillActionBtns}>
                  <button
                    type="button"
                    className={styles.primaryBtnSmall}
                    onClick={addSkill}
                  >
                    {t("إضافة")}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelBtnSmall}
                    onClick={() => setShowSkillInput(false)}
                  >
                    {t("إلغاء")}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className={styles.skillsRow}>
            {data.skills.map((s) => (
              <span key={s} className={styles.skillTag}>
                {s}
                <button
                  type="button"
                  onClick={() =>
                    updateData({ skills: data.skills.filter((x) => x !== s) })
                  }
                >
                  <XIcon />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.divider} />

      <div className={styles.fieldRow}>
        <div className={styles.rowLabel}>
          <strong>{t("تاريخ انتهاء التقديم")}</strong>
          <span>{t("متى سيغلق باب التقديم؟")}</span>
        </div>
        <div className={styles.rowContent}>
          <input
            type="date"
            className={styles.textInput}
            value={data.expiresAt}
            onChange={(e) => updateData({ expiresAt: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.nextRow}>
        <motion.button
          className={styles.nextBtn}
          onClick={onNext}
          disabled={!data.title || !data.classification}
          whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(70,64,222,0.35)" }}
          whileTap={{ scale: 0.97 }}
        >
          {t("الخطوة التالية")}
        </motion.button>
      </div>
    </div>
  );
}

function CheckmarkList({
  items,
  onChange,
  placeholder = "مثال: المشاركة المجتمعية لضمان...",
}: {
  items: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
}) {
  const { t } = useTranslation();
  const addItem = () => onChange([...items, ""]);
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems.length > 0 ? newItems : [""]);
  };
  const updateItem = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index] = val;
    onChange(newItems);
  };
 
  return (
    <div className={styles.respList}>
      {items.map((item, index) => (
        <div key={index} className={styles.respItemWrap}>
          <div className={styles.respCheck}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="var(--color-primary)" strokeWidth="2" />
              <path
                d="M8 12L11 15L16 9"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            type="text"
            className={styles.respInput}
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={t(placeholder)}
          />
          {items.length > 1 && (
            <button
              type="button"
              className={styles.respRemove}
              onClick={() => removeItem(index)}
            >
              <XIcon />
            </button>
          )}
        </div>
      ))}
      <button type="button" className={styles.respAddBtn} onClick={addItem}>
        <PlusIcon /> {t("إضافة نقطة أخرى")}
      </button>
    </div>
  );
}
 
function Step2({
  data,
  updateData,
  onNext,
  onPrev,
}: {
  data: JobFormData;
  updateData: (d: Partial<JobFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const { t } = useTranslation();
  const listFields = [
    "description",
    "responsibilities",
    "whoYouAre",
    "niceToHaves",
  ] as const;
  const filledCount = listFields.filter((f) =>
    data[f].some((r) => r.trim()),
  ).length;
 
  const totalFields = 4;
 
  return (
    <div className={styles.stepContent}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerWithBack}>
          <h2 className={styles.sectionTitle}>{t("التفاصيل")}</h2>
        </div>
        <p className={styles.sectionSubtitle}>
          {t("أضف وصف الوظيفة، المسؤوليات، المؤهلات المطلوبة، والمميزات الإضافية.")}
        </p>
      </div>
 
      <div className={styles.completionRow}>
        {listFields.map((fid) => {
          const isFilled = data[fid].some((r) => r.trim());
          return (
            <div
              key={fid}
              className={`${styles.completionDot} ${isFilled ? styles.filled : ""}`}
            />
          );
        })}
        <span className={styles.completionLabel}>
          {t("تم ملء")} <strong>{filledCount}</strong> {t("من أصل")} {totalFields} {t("أقسام")}
        </span>
      </div>
 
      <div className={styles.divider} />
 
      <div className={styles.fieldsGrid}>
        <div className={styles.richFieldStep2}>
          <div className={styles.rowLabel}>
            <strong>{t("الوصف")}</strong>
            <span>{t("قدم ملخصاً للدور الوظيفي")}</span>
          </div>
          <CheckmarkList
            items={data.description}
            placeholder={t("مثال: نحن نبحث عن مصمم مبدع...")}
            onChange={(val) => updateData({ description: val })}
          />
        </div>
 
        <div className={styles.richFieldStep2}>
          <div className={styles.rowLabel}>
            <strong>{t("المسؤوليات")}</strong>
            <span>{t("حدد المسؤوليات الأساسية لهذا المنصب")}</span>
          </div>
          <CheckmarkList
            items={data.responsibilities}
            onChange={(val) => updateData({ responsibilities: val })}
          />
        </div>
 
        <div className={styles.richFieldStep2}>
          <div className={styles.rowLabel}>
            <strong>{t("المؤهلات المطلوبة")}</strong>
            <span>{t("أضف المؤهلات التي تفضلها في المرشحين")}</span>
          </div>
          <CheckmarkList
            items={data.whoYouAre}
            placeholder={t("مثال: أنت مسوق نمو وتعرف كيف...")}
            onChange={(val) => updateData({ whoYouAre: val })}
          />
        </div>
 
        <div className={styles.richFieldStep2}>
          <div className={styles.rowLabel}>
            <strong>{t("مزايا إضافية (Nice-To-Haves)")}</strong>
            <span>{t("شجع مجموعة متنوعة من المرشحين على التقديم")}</span>
          </div>
          <CheckmarkList
            items={data.niceToHaves}
            placeholder={t("مثال: طلاقة في اللغة الإنجليزية، إدارة المشاريع...")}
            onChange={(val) => updateData({ niceToHaves: val })}
          />
        </div>
      </div>

      <div className={styles.footerNav}>
        <button className={styles.backBtnInline} onClick={onPrev}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M9 11L5 7l4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("السابق")}
        </button>
        <span className={styles.stepIndicator}>{t("الخطوة")} 2 {t("من")} 3</span>
        <motion.button
          className={styles.nextBtn}
          onClick={onNext}
          whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(70,64,222,0.35)" }}
          whileTap={{ scale: 0.97 }}
        >
          {t("الخطوة التالية")}
        </motion.button>
      </div>
    </div>
  );
}

const getDefaultBenefits = (t: any): Benefit[] => [
  {
    id: "1",
    icon: "🏥",
    title: t("رعاية صحية كاملة"),
    desc: t("نحن نؤمن بازدهار المجتمعات وهذا يبدأ بكون فريقنا سعيداً وبصحة جيدة."),
  },
  {
    id: "2",
    icon: "🏖️",
    title: t("إجازات غير محدودة"),
    desc: t("نحن نؤمن بأنه يجب أن يكون لديك جدول مرن يفسح المجال للعائلة والرفاهية والمرح."),
  },
  {
    id: "3",
    icon: "🧠",
    title: t("تطوير المهارات"),
    desc: t("نحن نؤمن دائماً بالتعلم ورفع مستوى مهاراتنا، سواء كان ذلك من خلال مؤتمر أو دورة تدريبية."),
  },
];

function Step3({
  data,
  updateData,
  onDone,
  isSubmitting,
}: {
  data: JobFormData;
  updateData: (d: Partial<JobFormData>) => void;
  onDone: () => void;
  isSubmitting: boolean;
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBTitle, setNewBTitle] = useState("");
  const [newBDesc, setNewBDesc] = useState("");

  const confirmAddBenefit = () => {
    if (!newBTitle) return;
    const newBenefit: Benefit = {
      id: Date.now().toString(),
      icon: "⭐",
      title: newBTitle,
      desc: newBDesc,
    };
    updateData({ benefits: [...data.benefits, newBenefit] });
    setNewBTitle("");
    setNewBDesc("");
    setShowAddForm(false);
  };

  return (
    <div className={styles.stepContent}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t("المزايا والفوائد")}</h2>
        <p className={styles.sectionSubtitle}>{t("هذه الوظيفة تأتي مع العديد من المزايا والفوائد")}</p>
      </div>
      <div className={styles.divider} style={{ marginBottom: "24px" }} />

      <div
        className={styles.fieldRow}
        style={{ gridTemplateColumns: "1fr", padding: 0 }}
      >
        <div className={styles.benefitsGrid}>
          <AnimatePresence>
            {data.benefits.map((b) => (
              <motion.div
                key={b.id}
                className={styles.benefitCard}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <strong>{t(b.title)}</strong>
                <p>{t(b.desc)}</p>
                <button
                  className={styles.benefitRemove}
                  onClick={() =>
                    updateData({
                      benefits: data.benefits.filter((x) => x.id !== b.id),
                    })
                  }
                >
                  <XIcon />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {!showAddForm ? (
            <button
              className={styles.addBenefitCard}
              onClick={() => setShowAddForm(true)}
            >
              <PlusIcon /> {t("إضافة ميزة")}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.benefitAddForm}
            >
              <input
                type="text"
                placeholder={t("عنوان الميزة")}
                value={newBTitle}
                onChange={(e) => setNewBTitle(e.target.value)}
                className={styles.textInput}
              />
              <textarea
                placeholder={t("وصف الميزة")}
                value={newBDesc}
                onChange={(e) => setNewBDesc(e.target.value)}
                className={styles.textArea}
                rows={3}
              />
              <div className={styles.benefitAddBtns}>
                <button
                  onClick={confirmAddBenefit}
                  className={styles.primaryBtnSmall}
                >
                  {t("إضافة")}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className={styles.cancelBtnSmall}
                >
                  {t("إلغاء")}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className={styles.nextRow}>
        <motion.button
          className={styles.nextBtn}
          onClick={onDone}
          disabled={isSubmitting}
          whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(70,64,222,0.35)" }}
          whileTap={{ scale: 0.97 }}
        >
          {isSubmitting
            ? t("جاري الحفظ...")
            : (location.state as any)?.editJob
              ? t("تحديث الوظيفة")
              : t("انشر الوظيفة الآن 🎉")}
        </motion.button>
      </div>
    </div>
  );
}

export default function PostJob() {
  const location = useLocation() as { state: { editJob?: any } | null };
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { role, isAuthenticated, apiFetch, user } = useJobitoAuth();

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/jobs/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCats();
  }, [apiFetch]);

  useEffect(() => {
    if (isAuthenticated && user?.classification === "tradesman") {
      navigate("/PostWork", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    jobTypes: [],
    salary: 10000,
    address: "",
    description: [""],
    responsibilities: [""],
    whoYouAre: [""],
    niceToHaves: [""],
    skills: [],
    benefits: getDefaultBenefits(t),
    slotsAvailable: 1,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    fieldOfWork: [],
    classification: "",
    categoryId: undefined,
    images: [],
    workTime: [],
  });

  useEffect(() => {
    if (location.state?.editJob) {
      try {
        const job = location.state.editJob;

        const sections: Record<string, string[]> = {
          "وصف الوظيفة": [],
          "Job Description": [],
          "المؤهلات المطلوبة": [],
          Required: [],
          "مزايا إضافية": [],
          "Nice-To-Haves": [],
          المسؤوليات: [],
          Responsibilities: [],
          المهارات: [],
          Skills: [],
          التصنيف: [],
        };

        let currentSection = "";
        const lines = (job.description || "").split("\n");

        lines.forEach((line: string) => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return;

          const headerMatch = trimmedLine.match(/^\*\*(.*?):\*\*$/);
          if (headerMatch) {
            currentSection = headerMatch[1].trim();
          } else {
            const content = trimmedLine.replace(/^•\s*/, "").trim();
            if (currentSection === "المهارات" || currentSection === "Skills") {
              const skills = content
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              sections["Skills"] = [
                ...new Set([...(sections["Skills"] || []), ...skills]),
              ];
            } else if (sections[currentSection]) {
              sections[currentSection].push(content);
            }
          }
        });

        const safeDate = (dateStr?: string) => {
          if (!dateStr) return "";
          try {
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
          } catch {
            return "";
          }
        };

        setFormData({
          title: job.title || "",
          jobTypes: Array.isArray(job.jobType) ? job.jobType : [job.jobType].filter(Boolean),
          salary: job.salaryMin || job.salary || 0,
          address: job.address || "Remote",
          description: (sections["وصف الوظيفة"].length
            ? sections["وصف الوظيفة"]
            : sections["Job Description"]
          ).length
            ? sections["وصف الوظيفة"].length
              ? sections["وصف الوظيفة"]
              : sections["Job Description"]
            : [""],
          responsibilities: (sections["المسؤوليات"].length
            ? sections["المسؤوليات"]
            : sections["Responsibilities"]
          ).length
            ? sections["المسؤوليات"].length
              ? sections["المسؤوليات"]
              : sections["Responsibilities"]
            : [""],
          whoYouAre: (sections["المؤهلات المطلوبة"].length
            ? sections["المؤهلات المطلوبة"]
            : sections["Required"]
          ).length
            ? sections["المؤهلات المطلوبة"].length
              ? sections["المؤهلات المطلوبة"]
              : sections["Required"]
            : [""],
          niceToHaves: (sections["مزايا إضافية"].length
            ? sections["مزايا إضافية"]
            : sections["Nice-To-Haves"]
          ).length
            ? sections["مزايا إضافية"].length
              ? sections["مزايا إضافية"]
              : sections["Nice-To-Haves"]
            : [""],
          classification: (job.classification || "") as any,
          skills: sections["Skills"]?.length ? sections["Skills"] : [],
          benefits: job.benefits || job.company?.benefits || getDefaultBenefits(t),
          slotsAvailable: job.slotsAvailable || 1,
          categoryId: job.categoryId,
          fieldOfWork: Array.isArray(job.fieldOfWork) 
            ? job.fieldOfWork 
            : (job.fieldOfWork 
              ? [job.fieldOfWork] 
              : (job.categories?.map((c: any) => c.name) || (job.category?.name ? [job.category.name] : []))),
          expiresAt: safeDate(job.expiresAt),
          images: job.images || [],
          workTime: job.workTime || [],
        });
      } catch (err) {
        console.error("Error hydrating form for edit mode:", err);
      }
    }
  }, [location.state, t]);

  const updateData = (newData: Partial<JobFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const getAuthToken = useCallback((): string => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error(t("أنت غير مسجل دخول. يرجى تسجيل الدخول أولاً لنشر وظيفة."));
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "company") {
        throw new Error(
          t("يمكن لحسابات الشركات فقط نشر الوظائف. أنت مسجل دخول كحساب '") +
            payload.role +
            "'.",
        );
      }
    } catch (e: unknown) {
      if (
        e instanceof Error &&
        (e.message.includes("company") || e.message.includes("not logged"))
      ) {
        throw e;
      }
      throw new Error(t("رمز التحقق غير صالح. يرجى تسجيل الدخول مرة أخرى."));
    }
    return token;
  }, [t]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      getAuthToken();

      const combinedDescription = `**وصف الوظيفة:**
${formData.description
  .filter((r) => r.trim())
  .map((r) => `• ${r}`)
  .join("\n")}

**المؤهلات المطلوبة:**
${formData.whoYouAre
  .filter((r) => r.trim())
  .map((r) => `• ${r}`)
  .join("\n")}

**مزايا إضافية:**
${formData.niceToHaves
  .filter((r) => r.trim())
  .map((r) => `• ${r}`)
  .join("\n")}

**المسؤوليات:**
${formData.responsibilities
  .filter((r) => r.trim())
  .map((r) => `• ${r}`)
  .join("\n")}

**المهارات:**
${formData.skills.join(", ")}

**التصنيف:**
${formData.classification}`;

      const payload = {
        title: formData.title,
        description: combinedDescription,
        salaryMin: formData.salary ? Number(formData.salary) : undefined,
        salaryMax: formData.salary ? Number(formData.salary) : undefined,
        salary: formData.salary ? Number(formData.salary) : undefined,
        address: formData.address,
        jobType: formData.jobTypes,
        classification: formData.classification || undefined,
        slotsAvailable: Number(formData.slotsAvailable) || 1,
        categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
        fieldOfWork: formData.fieldOfWork && formData.fieldOfWork.length > 0 ? formData.fieldOfWork : undefined,
        expiresAt: formData.expiresAt || undefined,
        benefits: formData.benefits,
        skills: formData.skills || [],
        images: formData.images || [],
        workTime: formData.workTime || [],
      };

      const isEdit = !!location.state?.editJob;
      const jobFromState = location.state?.editJob;
      const jobId = jobFromState?.jobId || jobFromState?.job_id;

      console.log("🚀 [PostJobForm] Sending payload to:", `${API_BASE_URL}/jobs${isEdit ? `/${jobId}` : ""}`);
      console.log("📦 [PostJobForm] Payload content:", payload);

      const response = await apiFetch(
        `${API_BASE_URL}/jobs${isEdit ? `/${jobId}` : ""}`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        const responseData = await response.clone().json();
        console.log("✅ [PostJobForm] Update success! Server returned:", responseData);
        showToast(isEdit ? t("تم تحديث الوظيفة بنجاح!") : t("تم نشر الوظيفة بنجاح!"), "success");
        navigate("/JobListing");
      } else {
        const err = await response.json();
        console.error("❌ [PostJobForm] Update failed! Server response:", err);
        if (response.status === 401) {
          throw new Error(t("انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى."));
        } else if (response.status === 403) {
          throw new Error(
            t("ليس لديك إذن بنشر الوظائف. يمكن لحسابات الشركات فقط النشر."),
          );
        }
        throw new Error(err.message || t("فشل في نشر الوظيفة"));
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? t(err.message) : String(err);
      showToast(`${t("Error:")} ${errorMessage}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`${styles.page} ${isRTL ? styles.rtl : ""}`} dir={isRTL ? "rtl" : "ltr"}>
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{ fontSize: "24px", marginBottom: "12px", color: "#1a1a2e" }}
          >
            {t("🔒 تسجيل الدخول مطلوب")}
          </h2>
          <p style={{ color: "#666", marginBottom: "24px" }}>
            {t("يجب عليك تسجيل الدخول لتتمكن من نشر وظيفة.")}
          </p>
          <a
            href="/login"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              backgroundColor: "#4640de",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            {t("تسجيل الدخول")}
          </a>
        </div>
      </div>
    );
  }

  if (role !== "company") {
    return (
      <div className={`${styles.page} ${isRTL ? styles.rtl : ""}`} dir={isRTL ? "rtl" : "ltr"}>
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{ fontSize: "24px", marginBottom: "12px", color: "#1a1a2e" }}
          >
            {t("🏢 حساب شركة مطلوب")}
          </h2>
          <p style={{ color: "#666", marginBottom: "24px" }}>
            {t("يمكن لحسابات الشركات فقط نشر الوظائف. أنت مسجل دخول حالياً كحساب")} <strong>{role}</strong>.
          </p>
          <p style={{ color: "#999", fontSize: "14px" }}>
            {t("يرجى تسجيل حساب شركة أو التبديل إليه لنشر الوظائف.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${isRTL ? styles.rtl : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      <StepBar current={step} onStepClick={(s) => setStep(s)} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
            <Step1
              data={formData}
              updateData={updateData}
              onNext={() => setStep(2)}
              categories={categories}
            />
          )}
          {step === 2 && (
            <Step2
              data={formData}
              updateData={updateData}
              onNext={() => setStep(3)}
              onPrev={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step3
              data={formData}
              updateData={updateData}
              onDone={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
