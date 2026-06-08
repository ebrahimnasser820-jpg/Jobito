import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./About.module.css";
import { useTranslation } from "../../context/translation-context";
import careerImg from "../../assets/Img/Gemini_Generated_Image_lk4biqlk4biqlk4b.png";
import projectLogo from "../../assets/412ec68f361b4f49b52fb8d584c317ccf197a403.png";
import advisorImg from "../../assets/Img/Gemini_Generated_Image_vzjw8dvzjw8dvzjw.png";

const Icon = ({ d, children, size = 24, className = "", stroke = "currentColor", fill = "none" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {d ? <path d={d} /> : children}
  </svg>
);

const FEATURES = [
  {
    title: "البحث والفلترة عن الوظائف",
    desc: "اكتشف دورك القادم باستخدام فلاتر قوية للموقع ونطاقات الرواتب والتقنيات المحددة.",
    icon: <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    color: "var(--color-accent)",
    bg: "var(--color-accent-light)",
    highlight: true,
  },
  {
    title: "الاستشارات المهنية",
    desc: "توجيهات خبيرة حول مفاوضات الرواتب، وتخطيط المسار المهني، والنجاح في الانتقالات الوظيفية.",
    icon: <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    color: "var(--color-primary)",
    bg: "var(--color-primary-light)",
  },
  {
    title: "رؤى سوق الشركات",
    desc: "وصول إلى بيانات حول ثقافة الشركات، ومعايير الرواتب، واتجاهات التوظيف في قطاعك المستهدف.",
    icon: (
      <Icon>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </Icon>
    ),
    color: "var(--color-accent)",
    bg: "var(--color-accent-light)",
  },
  {
    title: "شارات مهارات معتمدة",
    desc: "قم بإجراء تقييمات للتحقق من مهاراتك التقنية والتميز أمام مسؤولي التوظيف بشارات معتمدة.",
    icon: <Icon d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />,
    color: "var(--color-primary)",
    bg: "var(--color-primary-light)",
  },
];

const SERVICES = [
  {
    title: "البحث والفلترة عن الوظائف",
    desc: "اكتشف دورك القادم باستخدام فلاتر قوية للموقع ونطاقات الرواتب والتقنيات المحددة.",
    icon: <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />,
    ca: "var(--color-accent)",
    cb: "var(--color-accent-light)",
  },
  {
    title: "الاستشارات المهنية",
    desc: "توجيهات خبيرة حول مفاوضات الرواتب، وتخطيط المسار المهني، والنجاح في الانتقالات الوظيفية.",
    icon: <Icon d="M3 18v-6a9 9 0 0 1 18 0v6 M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3 M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />,
    ca: "var(--color-muted)",
    cb: "var(--color-bg-secondary)",
  },
  {
    title: "رؤى سوق الشركات",
    desc: "وصول إلى بيانات حول ثقافة الشركات، ومعايير الرواتب، واتجاهات التوظيف في قطاعك المستهدف.",
    icon: <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    ca: "var(--color-accent)",
    cb: "var(--color-accent-light)",
  },
  {
    title: "شارات مهارات معتمدة",
    desc: "قم بإجراء تقييمات للتحقق من مهاراتك التقنية والتميز أمام مسؤولي التوظيف بشارات معتمدة.",
    icon: <Icon d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
    ca: "var(--color-muted)",
    cb: "var(--color-bg-secondary)",
  },
];

const STATS = [
  { num: "10k+", label: "وظائف نشطة" },
  { num: "500+", label: "شركات موثوقة" },
  { num: "95%", label: "نسبة النجاح" },
];


function useReveal() {
  const observersRef = useRef({});
  const [vis, setVis] = useState({});

  const r = useCallback(
    (key) => (el) => {
      if (!el) {
        if (observersRef.current[key]) {
          observersRef.current[key].disconnect();
          delete observersRef.current[key];
        }
        return;
      }
      if (observersRef.current[key]) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVis((prev) => ({ ...prev, [key]: true }));
            obs.disconnect();
            delete observersRef.current[key];
          }
        },
        { threshold: 0.12 },
      );
      obs.observe(el);
      observersRef.current[key] = obs;
    },
    [],
  );

  useEffect(() => {
    return () => {
      Object.values(observersRef.current).forEach((o) => o.disconnect());
    };
  }, []);

  return { r, vis };
}

function rv(vis, key, dir) {
  return `${styles.rv} ${styles[dir]}${vis[key] ? ` ${styles.visible}` : ""}`;
}

export function About() {
  const { r, vis } = useReveal();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const TICKER_ITEMS = [
    t("تدريب متخصص"),
    t("جذب المواهب"),
    t("استراتيجيات الموارد البشرية"),
    t("تطوير المسار المهني"),
    t("تحفيز الموظفين"),
    t("إدارة الأداء"),
    t("التطوير التنظيمي"),
    t("التخطيط الاستراتيجي"),
  ];

  return (
    <>
      <div>
        <section className={styles.hero}>
          <div className={styles["hero-bg1"]} />
          <div className={styles["hero-bg2"]} />
          <div className={styles.container}>
            <div className={styles["hero-grid"]}>
              <div ref={r("hero")} className={rv(vis, "hero", "l")}>
                <div className={styles["hero-tag"]}>✦ {t("مرحباً بك في Jobito")}</div>
                <h1 className={styles["hero-h1"]}>
                  <span style={{ display: "block" }}>{t("جد وظيفة أحلامك في")}</span>
                  <span className={styles["co-t"]}>
                    {t("Jobito")}
                    <svg viewBox="0 0 280 12" fill="none" height="12">
                      <path
                        d="M4 9 Q70 2 140 9 T276 9"
                        stroke="#4A6ED1"
                        fill="none"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>
                <p className={styles["hero-desc"]}>
                  <span style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>{t("مرحباً بك في Jobito")} - {t("تمكين رحلتك المهنية")}</span>
                  {t("Jobito هي منصة عالمية مصممة لربط المواهب الاستثنائية بالمنظمات الرائدة في جميع أنحاء العالم. مسارك نحو مسيرة مهنية أفضل يبدأ هنا، مدعوماً بتجربة بحث عن عمل ذكية وفعالة.")}
                </p>
                <div className={styles["hero-btns"]}>
                  <button className={styles["btn-pri"]} onClick={() => navigate("/user-information", { state: { showLogin: true } })}>{t("ابدأ رحلتك")} ←</button>
                </div>
              </div>

              <div ref={r("hero-vis")} className={rv(vis, "hero-vis", "rr")}>
                <div className={styles["hero-vis"]}>
                  <div className={styles["hv-stack"]}>
                    <div className={`${styles["hv-card"]} ${styles["hv-b1"]}`} />
                    <div className={`${styles["hv-card"]} ${styles["hv-b2"]}`} />
                    <div className={`${styles["hv-card"]} ${styles["hv-main"]}`}>
                      <div
                        className={styles["hv-badge"]}
                        style={{ background: "#EEF2FF", color: "#4A6ED1" }}
                      >
                        <Icon size={14} style={{ marginRight: 6 }}>
                          <rect x="18" y="11" width="4" height="10" />
                          <rect x="12" y="7" width="4" height="14" />
                          <rect x="6" y="15" width="4" height="6" />
                        </Icon>
                        {t("نظرة عامة على الأداء")}
                      </div>
                      <div className={styles["hv-num"]}>98%</div>
                      <div className={styles["hv-lbl"]}>{t("نسبة رضا العملاء")}</div>
                      <div className={styles["hv-bar"]}>
                        <div className={styles["hv-fill"]} style={{ width: "98%" }} />
                      </div>
                      <div className={styles["hv-mini-grid"]}>
                        {[
                          ["500+", t("عميل")],
                          ["10+", t("سنوات")],
                          ["24/7", t("دعم")],
                          ["100%", t("التزام")],
                        ].map(([n, l]) => (
                          <div key={l} className={styles["hv-mini"]}>
                            <div className={styles["hv-mini-n"]}>{n}</div>
                            <div className={styles["hv-mini-l"]}>{l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={`${styles["fl-badge"]} ${styles["fl-b1"]}`}>
                      <div
                        className={styles["fl-icon"]}
                        style={{ background: "#EEF2FF" }}
                      >
                        ✓
                      </div>
                      <div>
                        <div className={styles["fl-val"]}>{t("شريك معتمد")}</div>
                        <div className={styles["fl-sub"]}>{t("شهادة ISO")}</div>
                      </div>
                    </div>
                    <div className={`${styles["fl-badge"]} ${styles["fl-b2"]}`}>
                      <div
                        className={styles["fl-icon"]}
                        style={{ background: "#FFF4EE" }}
                      >
                        🏆
                      </div>
                      <div>
                        <div className={styles["fl-val"]}>{t("الأعلى تقييماً")}</div>
                        <div className={styles["fl-sub"]}>{t("منذ 2014")}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Ticker ── */}
        <div className={styles.ticker}>
          <div className={styles["ticker-inner"]}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <div key={i} className={styles["ticker-item"]}>
                {item}
                <span className={styles.dot}>·</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ SERVICES ═══ */}
        <section className={styles["svc-section"]}>
          <div className={styles.container}>
            <div
              ref={r("svc-h")}
              className={`${styles["sec-header"]} ${rv(vis, "svc-h", "u")}`}
            >
              <div className={`${styles.eyebrow} ${styles.co}`}>
                <span className={styles.pdot} />
                {t("ماذا نقدم")}
              </div>
              <h2 className={styles.dtitle}>
                {t("الخدمات")} <span className={styles.acc}>{t("التي نوفرها")}</span>
              </h2>
              <p className={styles.lead}>
                {t("يوفر Jobito حلول توظيف مخصصة لأعمالك بأكثر الطرق مرونة واعتماداً على القيمة.")}
              </p>
            </div>
            <div className={styles["svc-grid"]}>
              {SERVICES.map((s, i) => (
                <div
                  key={i}
                  ref={r(`s${i}`)}
                  className={`${styles["svc-card"]} ${rv(vis, `s${i}`, "u")}`}
                  style={{ animationDelay: `${i * 55}ms` }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: s.ca,
                      borderRadius: "20px 20px 0 0",
                    }}
                  />
                  <div className={styles["svc-icon-w"]} style={{ background: s.cb }}>
                    {s.icon}
                  </div>
                  <div className={styles["svc-ttl"]}>{t(s.title)}</div>
                  <div className={styles["svc-dsc"]}>{t(s.desc)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ DARK BANNER ═══ */}
        <section className={styles.banner}>
          <div className={styles["banner-line"]} />
          <div className={styles.container}>
            <div className={styles["banner-grid"]}>
              <div ref={r("ban-t")} className={rv(vis, "ban-t", "l")}>
                <div className={styles["ban-eyebrow"]}>✦ {t("رؤيتنا")}</div>
                <h2 className={styles["ban-h2"]}>
                  {t("تمكين")}
                  <br />
                  <span className={styles.acc}>{t("المستقبل")}</span>
                </h2>
                <p className={styles["ban-p"]}>
                  {t("في Jobito، نؤمن بأن العثور على وظيفة يجب أن يكون ممتعاً بقدر البدء فيها. لقد بنينا منصة تزيل العقبات من عملية التوظيف، مما يسهل على المرشحين التألق وعلى الشركات العثور على نجومهم القادمين.")}
                </p>
                <div className={styles["ban-author"]}>
                  <div className={styles["ban-av"]}>
                    <img src={projectLogo} alt="Jobito" style={{ height: "100%", objectFit: "contain" }} />
                  </div>
                </div>
              </div>
              <div ref={r("ban-v")} className={rv(vis, "ban-v", "rr")}>
                <div className={styles["ban-img-wrap"]}>
                  <div className={styles["hv-ripple"]} style={{ inset: "-15px" }} />
                  <div className={styles["hv-ripple-2"]} style={{ inset: "-30px" }} />
                  <img 
                    src={careerImg} 
                    alt={t("Career Growth")} 
                    className={styles["ban-img"]} 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ WHY CHOOSE US ═══ */}
        <section className={styles["why-section"]}>
          <div className={styles.container}>
            <div
              ref={r("why-h")}
              className={`${styles["sec-header"]} ${rv(vis, "why-h", "u")}`}
            >
              <div className={`${styles.eyebrow} ${styles.or}`}>
                <span className={styles.pdot} />
                {t("أفضل التقنيات")}
              </div>
              <h2 className={styles.dtitle}>
                {t("لماذا تختارنا")}
              </h2>
              <p className={styles.lead}>
                {t("نحن نجمع بين الخبرة والتكنولوجيا والاهتمام الحقيقي لتقديم حلول توظيف تحدث فرقاً ملموساً.")}
              </p>
            </div>
            <div className={styles["feat-grid"]}>
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  ref={r(`f${i}`)}
                  className={`${styles["feat-card"]} ${rv(vis, `f${i}`, "u")}${f.highlight ? ` ${styles.hl}` : ""}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={styles["feat-icon-w"]} style={{ background: f.bg }}>
                    {f.icon}
                  </div>
                  <div>
                    <div className={styles["feat-ttl"]}>{t(f.title)}</div>
                    <div className={styles["feat-dsc"]}>{t(f.desc)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ═══ HELP SECTION ═══ */}
        <section className={styles["help-sec"]}>
          <div className={styles.container}>
            <div className={styles["help-grid"]}>
              <div ref={r("help-t")} className={rv(vis, "help-t", "l")}>
                <div className={`${styles.eyebrow} ${styles.or}`}>
                  <span className={styles.pdot} />
                  {t("جسر النجاح")}
                </div>
                <h2 className={styles.dtitle}>
                  {t("دعم مهني")} <br />
                  <span className={styles.ita}>{t("عندما تحتاجه")}</span>
                </h2>
                <p className={styles.lead}>
                  {t("سواء كنت تبحث عن وظيفتك الأولى أو منصب تنفيذي رفيع، يوفر Jobito التوجيه والدعم اللازمين للتنقل في سوق العمل التنافسي بنجاح.")}
                </p>

              </div>

              <div ref={r("help-v")} className={rv(vis, "help-v", "rr")}>
                <div className={styles["help-vis"]}>
                  <div className={styles["hv-blob-wrap"]}>
                    <div className={styles["hv-ripple"]} />
                    <div className={styles["hv-ripple-2"]} />
                    <div className={styles["hv-blob"]}>
                      <img src={advisorImg} alt={t("دعم مهني")} className={styles["hv-img"]} />
                    </div>
                    <div className={styles["hv-exp"]}>
                      <span className={styles["hv-exp-n"]}>10+</span>
                      <span className={styles["hv-exp-l"]}>{t("سنوات خبرة")}</span>
                    </div>
                    <div className={styles["hv-checks"]}>
                      {[t("Flexible Support"), t("Expert Advice"), t("Fast Response")].map(
                        (c) => (
                          <div key={c} className={styles.hck}>
                            <div className={styles["hck-dot"]}>✓</div>
                            {c}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER CTA ═══ */}
        <section className={styles.fcta}>
          <div className={styles["fcta-in"]}>
            <div className={styles.container}>
              <h2 className={styles["fcta-ttl"]}>
                {t("جاهز للانطلاق في مسيرتك المهنية؟")}
              </h2>
              <p className={styles["fcta-sub"]}>
                {t("انضم لآلاف المحترفين الذين يجدون وظائف أحلامهم يومياً على Jobito.")}
              </p>
              <div className={styles["fcta-btns"]}>
                <button className={styles["btn-wh"]} onClick={() => navigate("/Find Jobs")}>{t("ابحث عن وظائف الآن")}</button>
                <button className={styles["btn-gh"]} onClick={() => navigate("/user-information", { state: { showLogin: false, isCustomer: false } })}>{t("لأصحاب الأعمال")}</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
