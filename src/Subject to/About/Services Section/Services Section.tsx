import React, { useEffect, useState, useMemo } from "react";
import {
  Users,
  Briefcase,
  Target,
  HeadphonesIcon,
  TrendingUp,
  Star,
  Zap,
  Building2,
} from "lucide-react";
import styles from "./Services Section.module.css";
import { motion, type Variants } from "framer-motion";
import { useTranslation } from "../../../context/translation-context";

interface BackendService {
  serviceId: number;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
}

interface MappedService {
  title: string;
  description: string;
  icon: JSX.Element;
  gradient: string;
}

// ✅ Header variants
const headerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

// ✅ Grid container
const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

// ✅ Card variants
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};


export const ServicesSection = () => {
  const [services, setServices] = useState<MappedService[]>([]);
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_loading, setLoading] = useState(true);

  const gradients = useMemo(() => [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
  ], []);

  const iconMap: Record<string, JSX.Element> = useMemo(() => ({
    "trending-up": <TrendingUp className={styles.serviceIcon} />,
    "layout": <TrendingUp className={styles.serviceIcon} />, 
    "refresh-cw": <Zap className={styles.serviceIcon} />, 
    "users": <Users className={styles.serviceIcon} />,
    "help-circle": <Star className={styles.serviceIcon} />,
    "bar-chart": <Zap className={styles.serviceIcon} />,
    "target": <Target className={styles.serviceIcon} />,
    "heart": <Zap className={styles.serviceIcon} />,
    "monitor": <Zap className={styles.serviceIcon} />,
    "shield": <Zap className={styles.serviceIcon} />,
    "headphones": <HeadphonesIcon className={styles.serviceIcon} />,
    "briefcase": <Briefcase className={styles.serviceIcon} />,
    "building-2": <Building2 className={styles.serviceIcon} />,
  }), []);

  useEffect(() => {
    const MOCK_SERVICES_DATA = [
      {
        title: t("توظيف المحترفين"),
        description: t("نساعد الشركات في الوصول إلى أفضل الكفاءات والكوادر المهنية المتخصصة في مختلف المجالات التقنية والإدارية."),
        icon: "briefcase",
      },
      {
        title: t("تطوير المسار المهني"),
        description: t("نقدم استشارات مهنية وورش عمل لتطوير المهارات الشخصية والتقنية بما يتناسب مع متطلبات سوق العمل الحديث."),
        icon: "trending-up",
      },
      {
        title: t("حلول الشركات"),
        description: t("منصة متكاملة لإدارة عمليات التوظيف وتصفية المرشحين بكل سهولة وكفاءة لضمان اختيار الشخص المناسب."),
        icon: "building-2",
      },
      {
        title: t("دعم فني متواصل"),
        description: t("فريق دعم مخصص لمساعدة المستخدمين والشركات في حل أي مشكلات تقنية وضمان تجربة استخدام سلسة."),
        icon: "headphones",
      },
      {
        title: t("تحليل البيانات"),
        description: t("توفير تقارير وإحصائيات دقيقة حول سوق العمل واتجاهات التوظيف لمساعدة الشركات في اتخاذ قرارات مدروسة."),
        icon: "bar-chart",
      },
      {
        title: t("الأمن والموثوقية"),
        description: t("نضمن حماية كاملة لبيانات المستخدمين والشركات مع تطبيق أعلى معايير الخصوصية والأمان الرقمي."),
        icon: "shield",
      },
    ];

    const mapped = MOCK_SERVICES_DATA.map((s, idx) => ({
      title: s.title,
      description: s.description,
      icon: iconMap[s.icon] || <Zap className={styles.serviceIcon} />,
      gradient: gradients[idx % gradients.length],
    }));
    setServices(mapped);
    setLoading(false);
  }, [gradients, iconMap]);

  return (
    <section className={styles.servicesSection}>
      <div className={styles.container}>

        {/* ✅ Section Header */}
        <motion.div
          className={styles.sectionHeader}
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2>
            {t("ماذا نحن")} <span>{t("نقدم لكم")}</span>
          </h2>
          <p>{t("نحن نوفر مجموعة متكاملة من الخدمات التي تلبي احتياجات الباحثين عن عمل والشركات على حد سواء، مع التركيز على الجودة والاحترافية.")}</p>
        </motion.div>

        {/* ✅ Cards Grid */}
        <motion.div
          className={styles.servicesGrid}
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              className={styles.serviceCard}
              variants={cardVariants}
              whileHover={{
                y: -6,
                transition: { duration: 0.25, ease: "easeOut" },
              }}
            >
              <div className={styles.serviceCardInner}>

                {/* Front */}
                <div className={styles.serviceFront}>
                  <motion.div
                    className={styles.serviceIconWrapper}
                    style={{ background: service.gradient }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    {service.icon}
                  </motion.div>
                  <h3>{service.title}</h3>
                  <p>{service.description.substring(0, 80)}...</p>
                  <span className={styles.serviceHoverHint}>{t("اقرأ المزيد")}</span>
                </div>

                {/* Back */}
                <div
                  className={styles.serviceBack}
                  style={{ background: service.gradient }}
                >
                  <div className={styles.serviceBackContent}>
                    <h4>{service.title}</h4>
                    <p>{service.description}</p>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};