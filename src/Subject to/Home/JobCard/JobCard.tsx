import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import styles from "./JobCard.module.css";
import { useTranslation } from "../../../context/translation-context";
import { useJobitoAuth } from "../../../context/LinkContxt";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface Job {
  jobId: string | number;
  title: string;
  company?: {
    name: string;
    logo?: string;
    logoUrl?: string;
  };
  address: string;
  jobType: string | string[];
  salary: number | string;
  createdAt: string;
  category?: { name: string };
  description?: string;
  rating?: number;
  user?: {
    avatarUrl?: string;
    name?: string;
  };
  images?: string[];
}

const getFullImageUrl = (url?: string, seed?: string, job?: Job) => {
  // Priority 1: Use the Tradesman's personal avatar if available
  if (job?.user?.avatarUrl) {
    const avatar = job.user.avatarUrl;
    if (avatar.startsWith("http")) return avatar;
    return `${API_BASE_URL}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
  }

  // Priority 2: Use the logoUrl (Company Logo)
  if (url) {
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  }

  // Priority 3: Fallback to the first image from the job's own images array
  if (job?.images && job.images.length > 0) {
    const firstImg = job.images[0];
    if (firstImg.startsWith("http")) return firstImg;
    return `${API_BASE_URL}${firstImg.startsWith("/") ? "" : "/"}${firstImg}`;
  }

  // Priority 4: Fallback based on default identicon
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed || "company"}`;
};

/* ═══════════════════════════════════════
   COMPANY CARD — Horizontal row
   ═══════════════════════════════════════ */
const CompanyJobCard: React.FC<{ job: Job; variants: Variants }> = ({
  job,
  variants,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Determine if it's a service (tradesman) job based on classification or provider type
  const isServiceJob = (job as any).classification === "خدمات" || !!job.user;

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/Job details", { state: { jobId: job.jobId } });
    window.scrollTo(0, 0);
  };

  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
    >
      <div onClick={handleCardClick} className={styles.todayCard} style={{ cursor: 'pointer' }}>

        <div className={styles.cardHeader}>
          <div className={styles.mainLogo}>
             <img
              src={getFullImageUrl(
                job.company?.logoUrl || job.company?.logo,
                job.company?.name || job.jobId?.toString(),
                job
              )}
              alt={job.company?.name || "Company"}
            />
          </div>
          <div className={styles.topInfo}>
            <p className={styles.topMeta}>
              {t(job.company?.name || "Jobito")} <span className={styles.dot}>•</span>
            </p>
            <h3 className={styles.mainTitle}>{t(job.title)}</h3>
          </div>
        </div>

        <div className={styles.cardBody}>
          {job.description && (
            <p className={styles.jobDesc}>
              {t(job.description)
                .replace(/\*\*(Job Description|الوصف الوظيفي|المتطلبات|Requirements|Responsibilities|وصف الوظيفة|المؤهلات المطلوبة|مزايا إضافية)s?:?\s*\*\*/gi, "")
                .replace(/^(Job Description|الوصف الوظيفي|وصف الوظيفة|المؤهلات المطلوبة|مزايا إضافية):\s*/gi, "")
                .replace(/\*\*/g, "")
                .replace(/#/g, "")
                .replace(/\s*\n\s*[-•*]?\s*/g, " • ")
                .replace(/[\s•:\-]{2,}/g, " • ")
                .replace(/^[\s•:\-]+|[\s•:\-]+$/g, "")
                .trim()}
            </p>
          )}
        </div>

        <div className={styles.cardFooter}>
           <span className={styles.salaryText}>
             {(!job.salaryMin && !job.salary) || job.salaryMin === 0 || job.salary === 0
               ? t("قابل للتفاوض")
               : job.salaryMin === job.salaryMax || !job.salaryMax
                 ? `${job.salaryMin || job.salary} ${t("جنيه مصري")}`
                 : `${job.salaryMin} - ${job.salaryMax} ${t("جنيه مصري")}`}
           </span>
           <span className={styles.applyBtn}>
             {t("Apply")}
           </span>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════ */
export default function JobsDashboard() {
  const { t } = useTranslation();
  const { user } = useJobitoAuth();
  const classification = user?.classification;
  const isTradesman = classification === "tradesman";
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // Fetch jobs for everyone without filtering by tradesman classification
        const response = await fetch(`${API_BASE_URL}/jobs`);
        if (!response.ok) throw new Error("Failed to fetch jobs");
        const result = await response.json();
        const jobsData = result.data || (Array.isArray(result) ? result : []);

        let allJobs = jobsData;
        const isTradesmanUser = classification === "tradesman" || classification === "industrial";
        if (isTradesmanUser) {
          allJobs = allJobs.filter((job: any) => {
            if (!job.company) return false;
            return job.classification === "services" || job.classification === "خدمات" || job.classification === "Services";
          });
        }

        // Sort jobs to show newest first
        const sortedJobs = allJobs.sort((a: Job, b: Job) => {
          return (
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
        });

        // Show latest 8 jobs for the dashboard
        setJobs(sortedJobs.slice(0, 8));
        setError(null);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("حدث خطأ في جلب الوظائف");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [classification]);

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className={styles.dashboard}
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: "-100px" }}
      variants={containerVariants}
    >
      <div className={styles.container}>
        {/* Header */}
        <motion.div className={styles.header} variants={cardVariants}>
          <div className={styles.headerContent}>
            <h1 className={styles.todayTitle}>
              {t("الوظائف المتاحة")} <span className={styles.jobOpenText}>{t("اليوم")}</span>
            </h1>
          </div>
          <Link to="/Find Jobs" className={styles.showAllLink}>
            {t("Show all jobs")} →
          </Link>
        </motion.div>

        {/* Jobs List */}
        {loading ? (
          <div className={styles.loading}>{t("جاري التحميل...")}</div>
        ) : error ? (
          <div className={styles.error}>{t(error)}</div>
        ) : jobs.length === 0 ? (
          <div className={styles.emptyState}>
            {t("لا توجد وظائف متاحة حالياً.")}
          </div>
        ) : (
          <motion.div className={styles.todayGrid} variants={containerVariants}>
            {jobs.map((job) => (
               <CompanyJobCard key={job.jobId} job={job} variants={cardVariants} />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
