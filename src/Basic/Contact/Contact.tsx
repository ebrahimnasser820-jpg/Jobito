import { useState } from "react";
import { Facebook, Linkedin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "../../context/translation-context";
import ImgMapComponent from "../../assets/WhatsApp Image 2026-03-22 at 8.08.17 PM.jpeg";
import styles from "./Contact.module.css";
import { useJobitoAuth } from "../../context/LinkContxt";

interface FormData {
  name: string;
  email: string;
  subject: string;
  website: string;
  message: string;
  phone?: string;
  preferredContact: "email" | "phone";
}

interface FormStatus {
  submitted: boolean;
  success: boolean;
  message: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function ContactPage() {
  const { apiFetch } = useJobitoAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    website: "",
    message: "",
    phone: "",
    preferredContact: "email",
  });

  const [formStatus, setFormStatus] = useState<FormStatus>({
    submitted: false,
    success: false,
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/support/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setFormStatus({
          submitted: true,
          success: true,
          message: result.message || t("تم إرسال رسالتك بنجاح!"),
        });
        setFormData({
          name: "",
          email: "",
          subject: "",
          website: "",
          message: "",
          phone: "",
          preferredContact: "email",
        });
      } else {
        throw new Error("Failed to send message");
      }
    } catch {
      setFormStatus({
        submitted: true,
        success: false,
        message: t("حدث خطأ ما. يرجى المحاولة مرة أخرى."),
      });
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = [
    { name: "Facebook", icon: <Facebook size={20} />, url: "https://www.facebook.com/share/1EuiUefJYa/", background: "#1877F2" },
    { name: "WhatsApp", icon: <FaWhatsapp size={20} />, url: "https://wa.me/201009913865", background: "#25D366" },
    { name: "LinkedIn", icon: <Linkedin size={20} />, url: "https://www.linkedin.com/in/saif-mhfuz4u?utm_source=share_via&utm_content=profile&utm_medium=member_android", background: "#0A66C2" },
  ];

  const quickLinks = [
    { title: t("الرئيسية"), path: "/" },
    { title: t("عن جوبيتو"), path: "/about" },
    { title: t("تصفح الشركات"), path: "/Browse Companies" },
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroPattern}></div>
        <div className={styles.heroContent}>
          <h1>{t("اتصل بنا")}</h1>
          <p className={styles.heroSubtitle}>
            {t("نحن هنا لمساعدتك في أي استفسار أو مشكلة.")}
          </p>
          <div className={styles.replyBadge}>
            <span className={styles.pulseDot}></span>
            <span style={{ fontSize: "14px", fontWeight: 600 }}>
              {t("نرد عادة خلال 24 ساعة")}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.mainLayout}>
        <div className={styles.statsGrid}>
          {[
            { label: t("عميل سعيد"), value: "10K+", icon: "😊" },
            { label: t("جلسة مكتملة"), value: "25K+", icon: "📊" },
            { label: t("خبير"), value: "50+", icon: "👥" },
            { label: t("عام من الخبرة"), value: "15+", icon: "⭐" },
          ].map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <span className={styles.statIcon}>{stat.icon}</span>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className={styles.contentCols}>
          {/* Left Column - Contact Form */}
          <div className={styles.formCol}>
            <div className={styles.formCard}>
              <h3>{t("أرسل لنا رسالة")}</h3>
              <p className={styles.formHeaderDesc}>
                {t("املأ النموذج أدناه وسنعاود الاتصال بك في أقرب وقت ممكن.")}
              </p>

              {formStatus.submitted && formStatus.success && (
                <div className={styles.successAlert}>
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formStatus.message}
                </div>
              )}

              {formStatus.submitted &&
                !formStatus.success &&
                formStatus.message && (
                  <div
                    className={styles.errorAlert}
                    style={{ background: "#fee2e2", color: "#b91c1c" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {formStatus.message}
                  </div>
                )}

              <form
                onSubmit={handleSubmit}
                autoComplete="off"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <div className={styles.formGrid}>
                  <div>
                    <label className={styles.formLabel}>{t("الاسم الكامل")}</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className={styles.inputField}
                      placeholder={t("أدخل اسمك الكامل")}
                    />
                  </div>
                  <div>
                    <label className={styles.formLabel}>
                      {t("البريد الإلكتروني")}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className={styles.inputField}
                      placeholder="mohamednasseremam380@gmail.com"
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div>
                    <label className={styles.formLabel}>{t("الموضوع")}</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className={styles.inputField}
                      placeholder={t("كيف يمكننا مساعدتك؟")}
                    />
                  </div>
                  <div>
                    <label className={styles.formLabel}>{t("رقم الهاتف")}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="off"
                      className={styles.inputField}
                      placeholder="+20 15466210"
                    />
                  </div>
                </div>

                <div>
                  <label className={styles.formLabel}>{t("الرسالة")}</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className={styles.textareaField}
                    placeholder={t("اكتب رسالتك هنا...")}
                  ></textarea>
                </div>

                <div className={styles.submitGroup}>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    {loading ? t("جاري الإرسال...") : t("إرسال الرسالة")}
                  </button>
                  <span className={styles.requiredText}>
                    * {t("جميع الحقول مطلوبة")}
                  </span>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Contact Info */}
          <div className={styles.infoCol}>
            <div className={styles.infoCard}>
              <h4>{t("معلومات التواصل")}</h4>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <svg
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div style={{ flex: 1, textAlign: "start" }}>
                  <h5
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "16px",
                      fontWeight: 800,
                    }}
                  >
                    {t("اتصل بنا")}
                  </h5>
                  <p dir="ltr" style={{ color: "#3b5bdb", fontWeight: 700, margin: 0, textAlign: "start", display: "inline-block" }}>
                    +20 1009913865
                  </p>
                  <p
                    style={{
                      color: "#8892a4",
                      fontSize: "12px",
                      marginTop: "4px",
                      margin: 0,
                    }}
                  >
                    {t("الأحد - الخميس (9ص - 6م)")}
                  </p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <svg
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div style={{ flex: 1, textAlign: "start" }}>
                  <h5
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "16px",
                      fontWeight: 800,
                    }}
                  >
                    {t("راسلنا")}
                  </h5>
                  <p style={{ color: "#3b5bdb", fontWeight: 700, margin: 0, wordBreak: "break-all" }}>
                    mohamednasseremam380@gmail.com
                  </p>
                  <p
                    style={{
                      color: "#8892a4",
                      fontSize: "12px",
                      marginTop: "4px",
                      margin: 0,
                    }}
                  >
                    {t("دعم على مدار الساعة")}
                  </p>
                </div>
              </div>

              <div className={styles.socialGrid}>
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIcon}
                    style={{ backgroundColor: social.background }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.MapComponent}>
        <a
          href="https://maps.app.goo.gl/5TzGjG8efNSCDJrT7"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={ImgMapComponent} alt={t("موقعنا على الخريطة")} />
        </a>
      </div>
    </div>
  );
}
