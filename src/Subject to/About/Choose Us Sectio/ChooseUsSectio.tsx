import React, { useEffect, useRef, useState, useMemo } from "react";
import { BarChart3, Rocket, Shield, Sparkles } from "lucide-react";
import styles from "./ChooseUsSection.module.css";
import { useTranslation } from "../../../context/translation-context";

interface BackendFeature {
  featureId: number;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
}

interface MappedFeature {
  title: string;
  description: string;
  icon: JSX.Element;
  color: string;
  highlighted: boolean;
}

export const ChooseUsSection = () => {
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [features, setFeatures] = useState<MappedFeature[]>([]);
  const { t } = useTranslation();

  const colors = useMemo(() => ["#FF6B6B", "#4ECDC4", "#A78BFA", "#FFA26B"], []);
  
  const iconMap: Record<string, JSX.Element> = useMemo(() => ({
    "sparkles": <Sparkles className={styles.featureIcon} />,
    "shield": <Shield className={styles.featureIcon} />,
    "bar-chart-2": <BarChart3 className={styles.featureIcon} />,
    "monitor": <Sparkles className={styles.featureIcon} />,
    "headphones": <Rocket className={styles.featureIcon} />,
    "rocket": <Rocket className={styles.featureIcon} />,
  }), []);

  useEffect(() => {
    const MOCK_FEATURES_DATA = [
      {
        title: t("البحث الذكي"),
        description: t("نظام متطور يعتمد على الذكاء الاصطناعي لترشيح أفضل الوظائف المناسبة لمهاراتك وخبراتك."),
        icon: "sparkles",
      },
      {
        title: t("حماية البيانات"),
        description: t("نطبق أعلى معايير التشفير لضمان سرية معلوماتك الشخصية وسجل أعمالك المهني."),
        icon: "shield",
      },
      {
        title: t("تحليلات الأداء"),
        description: t("لوحة تحكم شاملة تتيح لك متابعة طلبات التوظيف ومدى توافق ملفك الشخصي مع السوق."),
        icon: "bar-chart-2",
      },
      {
        title: t("سرعة التنفيذ"),
        description: t("نهدف إلى تقليل الوقت المستغرق في عملية التوظيف من خلال أدوات تواصل سريعة وفعالة."),
        icon: "rocket",
      },
    ];

    const mapped = MOCK_FEATURES_DATA.map((f, idx) => ({
      title: f.title,
      description: f.description,
      icon: iconMap[f.icon] || <Sparkles className={styles.featureIcon} />,
      color: colors[idx % colors.length],
      highlighted: idx === 1,
    }));
    setFeatures(mapped);
  }, [colors, iconMap]);

  useEffect(() => {
    const observers: Record<string, IntersectionObserver> = {};

    Object.keys(sectionRefs.current).forEach((key) => {
      const target = sectionRefs.current[key];
      if (target) {
        observers[key] = new IntersectionObserver(
          ([entry]) => {
            setIsVisible((prev) => ({ ...prev, [key]: entry.isIntersecting }));
          },
          { threshold: 0.2, rootMargin: "0px 0px -100px 0px" },
        );
        observers[key].observe(target);
      }
    });

    return () => {
      Object.values(observers).forEach((observer) =>
        observer.disconnect(),
      );
    };
  }, []);

  return (
    <section
      className={styles.whyUsSection}
      ref={(el) => { if (el) sectionRefs.current.whyUs = el; }}
    >

      <div className={styles.container}>
        <div className={styles.headerTop}>
          <span className={styles.subtitle}>{t("لماذا نحن؟")}</span>
          <h2 className={styles.sectionTitle}>{t("ما الذي يميز جوبيتو؟")}</h2>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((item, index) => (
            <div
              key={index}
              className={`${styles.featureCard} ${item.highlighted ? styles.highlighted : ""} ${isVisible.whyUs ? styles.visible : ""}`}
              style={{ transitionDelay: `${index * 0.15}s` }}
            >
              <div
                className={styles.featureIconWrapper}
                style={{ backgroundColor: `${item.color}20` }}
              >
                <div
                  className={styles.featureIconContainer}
                  style={{ color: item.color }}
                >
                  {item.icon}
                </div>
              </div>

              <div className={styles.featureContent}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>

              <div className={styles.featureHoverEffect}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
