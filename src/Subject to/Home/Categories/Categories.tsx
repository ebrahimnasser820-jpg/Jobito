import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import styles from "./Categories.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "../../../context/translation-context";
import { 
  FiLayout, 
  FiBarChart2, 
  FiTarget,
  FiHeadphones,
  FiBookOpen,
  FiUsers,
  FiActivity,
  FiEdit3,
  FiBriefcase,
  FiTruck,
  FiCoffee,
  FiEdit2,
  FiTrendingUp,
  FiTool,
  FiCpu,
  FiDollarSign,
  FiPlus
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface Category {
  categoryId: number;
  name: string;
  nameEn?: string;
  jobCount?: number;
}

const CATEGORY_MAP: Record<string, { icon: React.ReactNode; color: string }> = {
  "تقني": { icon: <FiCpu />, color: "#4f46e5" },
  "غير تقني": { icon: <FiUsers />, color: "#f59e0b" },
  "خدمات": { icon: <FiTool />, color: "#f97316" }, 
};

const Categories = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/jobs/categories`);
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        
        // Priority map for sorting (Tech, Non-Tech, Trades)
        const priority: Record<string, number> = {
          "تقني": 3,
          "غير تقني": 2,
          "خدمات": 1,
        };

        // Normalize names (Map legacy names to 'خدمات') and filter
        const processed = data.map((c: Category) => ({
          ...c,
          name: (c.name.trim() === "حرفي" || c.name.trim() === "صنيعي") ? "خدمات" : c.name.trim()
        }));

        const filtered = processed.filter((c: Category) => priority[c.name] !== undefined);
        const sorted = filtered.sort((a: Category, b: Category) => {
          const pA = priority[a.name] || 0;
          const pB = priority[b.name] || 0;
          return pB - pA;
        });

        setCategories(sorted); 
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("فشل تحميل الفئات");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { y: 40, x: 40, opacity: 0 },
    visible: {
      y: 0,
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const getMapping = (name: string) => {
    return CATEGORY_MAP[name] || { icon: <FiPlus />, color: "#6b7280" };
  };

  return (
    <motion.div 
      className={styles.pageContainer} 
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: "-100px" }}
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div className={styles.sectionHeader} variants={cardVariants}>
        <h2>
          {t("استكشف حسب")} <span>{t("الفئات")}</span>
        </h2>
        <Link to="/Find Jobs" className={styles.showAll}>
          {t("عرض كل الوظائف ←")}
        </Link>
      </motion.div>

      {/* Categories Grid */}
      {loading ? (
        <div className={styles.loading}>{t("جاري التحميل...")}</div>
      ) : error ? (
        <div className={styles.error}>{t(error)}</div>
      ) : (
        <motion.div className={styles.categoriesGrid} variants={containerVariants}>
          {categories.map((cat) => {
            const { icon, color } = getMapping(cat.name);
            return (
              <motion.div 
                key={cat.categoryId} 
                className={styles.categoryCard}
                variants={cardVariants}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/Find Jobs?category=${encodeURIComponent(cat.name)}`)}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  transition: { duration: 0.2 }
                }}
              >
                <div className={styles.content}>
                  <h3>{t(cat.name)}</h3>
                  <p>{cat.jobCount || 0} {t("وظيفة متاحة")}</p>
                </div>
                <div 
                  className={styles.icon}
                  style={{ 
                    backgroundColor: `${color}15`, 
                    color: color 
                  }}
                >
                  {icon}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Categories;
