import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./AllJobs.module.css";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useJobitoAuth } from "../../../context/LinkContxt.js";
import { useRef } from "react";
import { useTranslation } from "../../../context/translation-context";
import { useToast } from "../../../context/ToastContext";
import { useTheme } from "../../../context/ThemeContext";
import {
  FiGrid,
  FiList,
  FiChevronUp,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { API_BASE_URL } from "../../../services/api.js";

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

  // Priority 4: Fallback based on classification or default
  const categorySeed = seed || "company";
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${categorySeed}`;
};

interface Job {
  jobId: string | number;
  title: string;
  company?: {
    name: string;
    address?: string;
    logoUrl?: string;
  };
  address: string;
  jobType: string | string[];
  slotsAvailable: number;
  salary?: number;
  salaryMin?: number;
  salaryMax?: number;
  description?: string;
  expiresAt?: string;
  createdAt?: string;
  appliedCount?: number;
  acceptedCount?: number;
  category?: { name: string };
  user?: {
    avatarUrl?: string;
    fullName?: string;
  };
  applications?: any[];
  classification?: string;
  images?: string[];
  skills?: string[];
  avgRating?: number;
}

const sidebarVariant: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

interface AllJobsProps {
  searchKeyword?: string;
  location?: string;
}

const AllJobs: React.FC<AllJobsProps> = ({
  searchKeyword = "",
  location = "",
}) => {
  const { apiFetch, isAuthenticated, role, user } = useJobitoAuth();
  const { isDark } = useTheme();
  const classification = user?.classification;
  const [jobs, setJobs] = useState<Job[]>([]);
  const { t } = useTranslation();

  const cleanDescription = (text: string) => {
    if (!text) return "";
    return t(text)
      .replace(/\*\*(Job Description|الوصف الوظيفي|المتطلبات|Requirements|Responsibilities|وصف الوظيفة|المؤهلات المطلوبة|مزايا إضافية)s?:?\s*\*\*/gi, "")
      .replace(/^(Job Description|الوصف الوظيفي|وصف الوظيفة|المؤهلات المطلوبة|مزايا إضافية):\s*/gi, "")
      .replace(/\*\*/g, "")
      .replace(/#/g, "")
      .replace(/\s*\n\s*[-•*]?\s*/g, " • ")
      .replace(/[\s•:\-]{2,}/g, " • ")
      .replace(/^[\s•:\-]+|[\s•:\-]+$/g, "")
      .trim();
  };

  const matchesType = (job: Job, t: string) => {
    const types = Array.isArray(job.jobType)
      ? job.jobType
      : [job.jobType].filter(Boolean);
    return types.some((jt) => {
      const lowerJt = String(jt || "").toLowerCase();
      if (t === "Full-time") return lowerJt === "full-time" || lowerJt === "1" || lowerJt === "دوام كامل";
      if (t === "Part-time") return lowerJt === "part-time" || lowerJt === "0" || lowerJt === "دوام جزئي";
      if (t === "Remote") return lowerJt === "remote" || lowerJt === "عن بعد";
      if (t === "Internship") return lowerJt === "internship" || lowerJt === "intern" || lowerJt === "تدريب";
      if (t === "Freelance") return lowerJt === "freelance" || lowerJt === "عمل حر";
      if (t === "One-time") return lowerJt === "one-time" || lowerJt === "2" || lowerJt === "quick service" || lowerJt === "عمل لمرة واحدة";
      return lowerJt.includes(t.toLowerCase());
    });
  };

  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">(() => {
    return (localStorage.getItem("jobs_view") as "grid" | "list") || "list";
  });
  const [likedJobs, setLikedJobs] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch Guards
  const fetchInProgress = useRef(false);
  const lastFetchParams = useRef<string | null>(null);
  const renderCount = useRef(0);
  renderCount.current++;

  // Persist view preference
  useEffect(() => {
    localStorage.setItem("jobs_view", view);
  }, [view]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedSalaries, setSelectedSalaries] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Category Auto-Filter from URL
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      console.log(`🎯 [AllJobs] Activating filter from URL: ${categoryParam}`);
      
      let mappedLevel = categoryParam;
      const lowerParam = categoryParam.trim().toLowerCase();
      if (lowerParam === "تقني" || lowerParam === "technical") {
        mappedLevel = "Technical";
      } else if (lowerParam === "غير تقني" || lowerParam === "non-technical") {
        mappedLevel = "Non-Technical";
      } else if (lowerParam === "خدمات" || lowerParam === "services" || lowerParam === "صنيعي" || lowerParam === "حرفي") {
        mappedLevel = "Services";
      } else if (lowerParam === "tradesman") {
        mappedLevel = "Tradesman";
      }
      
      setSelectedLevels([mappedLevel]);
      // Remove query param from URL without refreshing
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("category");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const currentParams = JSON.stringify({ searchKeyword, location });
    const abortController = new AbortController();
    const currentRender = renderCount.current;

    const fetchData = async () => {
      // 1. Prevent concurrent identical fetches
      if (
        fetchInProgress.current &&
        lastFetchParams.current === currentParams
      ) {
        console.log(
          `🚫 [AllJobs] [Render ${currentRender}] Skipping redundant fetch for same params.`,
        );
        return;
      }

      // 2. Track current fetch operation
      console.log(
        `🔍 [AllJobs] [Render ${currentRender}] Starting fetchData...`,
        { searchKeyword, location },
      );
      fetchInProgress.current = true;
      lastFetchParams.current = currentParams;

      setLoading(true);
      try {
        // Fetch Jobs: Use AI Smart Search when search keyword exists
        let jobsList: Job[] = [];

        // Ensure location is a string to avoid [object Object]
        const safeLocation = typeof location === "string" ? location : "";

        if (searchKeyword && searchKeyword.trim() !== "") {
          // 🧠 AI Smart Search - uses role tagging, query expansion, and scoring
          const smartParams = new URLSearchParams({ q: searchKeyword });
          const isTradesman =
            classification === "tradesman" || classification === "industrial";
          if (safeLocation) smartParams.append("location", safeLocation);

          const smartRes = await fetch(
            `${API_BASE_URL}/ai/smart-search?${smartParams.toString()}`,
            {
              headers: {
                "ngrok-skip-browser-warning": "69420",
              },
              signal: abortController.signal,
            },
          );

          console.log(
            `🧠 [AllJobs] Smart Search API Status: ${smartRes.status} for query: "${searchKeyword}"`,
          );

          if (!smartRes.ok) {
            throw new Error(`Smart Search error: ${smartRes.status}`);
          }

          const smartData = await smartRes.json();
          if (abortController.signal.aborted) return;

          jobsList = smartData.data || [];
          console.log(
            `✅ [AllJobs] Smart Search returned ${jobsList.length} jobs. Expanded tags: ${(smartData.expandedTags || []).join(", ")}`,
          );
        } else {
          // Regular fetch when no search keyword
          const queryParams = new URLSearchParams({
            limit: "100",
            ...(location && { location: location }),
          });

          const jobsRes = await fetch(
            `${API_BASE_URL}/jobs?${queryParams.toString()}`,
            {
              headers: {
                "ngrok-skip-browser-warning": "69420",
              },
              signal: abortController.signal,
            },
          );

          console.log(`🌐 [AllJobs] Jobs API Status: ${jobsRes.status}`);

          if (!jobsRes.ok) {
            const errorText = await jobsRes.text();
            console.error(`❌ [AllJobs] Jobs API Error Detail:`, errorText);
            throw new Error(
              `Server returned ${jobsRes.status}: ${jobsRes.statusText}`,
            );
          }

          const jobsData = await jobsRes.json();
          if (abortController.signal.aborted) return;

          jobsList =
            jobsData && jobsData.data
              ? jobsData.data
              : Array.isArray(jobsData)
                ? jobsData
                : [];
        }

        console.log(`✅ [AllJobs] Received ${jobsList.length} jobs.`);
        setJobs(jobsList);

        // Fetch Favorites
        if (isAuthenticated) {
          try {
            const favsRes = await apiFetch(`${API_BASE_URL}/favorites`, {
              signal: abortController.signal,
            });

            if (favsRes.ok && !abortController.signal.aborted) {
              const favIds = await favsRes.json();
              if (Array.isArray(favIds)) {
                const favMap: Record<string, boolean> = {};
                favIds.forEach((id) => {
                  if (id) favMap[id.toString()] = true;
                });
                setLikedJobs(favMap);
              }
            }
          } catch (favErr) {
            if (favErr instanceof Error && favErr.name === "AbortError") return;
            console.error("❌ [AllJobs] Error fetching favorites:", favErr);
          }
        }

        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log("⏹️ [AllJobs] Fetch aborted by cleanup.");
          return;
        }
        console.error("❌ [AllJobs] CRITICAL Error fetching data:", err);
        setError(
          `${t("فشل في تحميل البيانات")}: ${err instanceof Error ? err.message : t("خطأ غير معروف")}`,
        );
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
          fetchInProgress.current = false;
        }
      }
    };

    fetchData();

    return () => {
      // Cancel pending request on unmount or dependency change
      console.log(
        `🚮 [AllJobs] [Render ${currentRender}] Cleaning up effect...`,
      );
      abortController.abort();
      fetchInProgress.current = false;
    };
  }, [searchKeyword, location, isAuthenticated, apiFetch, classification]);

  const toggleLike = async (
    e: React.MouseEvent,
    jobId: string | number | undefined,
  ) => {
    e.stopPropagation();
    if (!jobId) return;

    const token =
      localStorage.getItem("access_token") || localStorage.getItem("token");
    if (!token) {
      showToast(t("يرجى تسجيل الدخول لحفظ الوظائف المفضلة."), "error");
      return;
    }

    try {
      const res = await apiFetch(`${API_BASE_URL}/favorites/toggle/${jobId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const result = await res.json();
        setLikedJobs((prev) => ({
          ...prev,
          [jobId.toString()]: result.isFavorite,
        }));
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const getJobLevel = (job: Job) => {
    const text = (
      String(job.title || "") +
      " " +
      String(job.description || "")
    ).toLowerCase();

    // Check if the content is technical (for a "Sanaie" / Tradesman)
    const isTechnicalContent =
      text.includes("تقني") ||
      text.includes("صيانة") ||
      text.includes("سباكة") ||
      text.includes("كهرباء") ||
      text.includes("فني") ||
      text.includes("تركيب") ||
      job.classification === "تقني";

    // 1. Individual Tradesmen (Always "tradesman")
    if (!!job.user) return "tradesman";

    // 2. Company Services
    if (
      job.classification === "خدمات" ||
      job.classification === "services" ||
      job.classification === "Services"
    ) {
      return "services";
    }

    // 3. Regular Company Jobs (Fallback logic)
    if (isTechnicalContent) return "تقني";
    if (text.includes("غير تقني") || job.classification === "غير تقني")
      return "غير تقني";

    if (text.includes("director") || text.includes("مدير")) return "مدير";
    if (text.includes("senior") || text.includes("خبير")) return "خبير";
    if (text.includes("mid") || text.includes("متوسط")) return "متوسط الخبرة";
    if (text.includes("vp") || text.includes("نائب")) return "نائب رئيس وأعلى";
    return "مبتدئ";
  };

  const getTagColorClass = (tagName: any = "") => {
    const name = String(tagName || "").toLowerCase();
    if (name.includes("design") || name.includes("تصميم"))
      return styles.tagDesign;
    if (name.includes("marketing") || name.includes("تسويق"))
      return styles.tagMarketing;
    if (
      name.includes("tech") ||
      name.includes("تقني") ||
      name.includes("برمجة")
    )
      return styles.tagTech;
    if (name.includes("sales") || name.includes("مبيعات"))
      return styles.tagSales;
    if (
      name.includes("maintenance") ||
      name.includes("صيانة") ||
      name.includes("سباكة") ||
      name.includes("كهرباء")
    )
      return styles.tagTech;
    return styles.tagDefault;
  };

  const getSalaryRange = (job: Job) => {
    const s = job.salary || job.salaryMin || 0;
    if (s >= 3000) return "3000+";
    if (s >= 1500) return "1500-2000";
    if (s >= 1000) return "1000-1500";
    if (s >= 700) return "700-1000";
    return null;
  };

  const filteredJobs = jobs.filter((job, index) => {
    const isTradesmanUser =
      user?.classification === "tradesman" ||
      user?.classification === "industrial";
      
    if (role === "user" && isTradesmanUser) {
      // Tradesman sees ONLY company jobs that are classified as "services"
      if (!job.company) return false;
      if (getJobLevel(job) !== "services") return false;
    }

    const jobAddress = String(job.address || "").toLowerCase();
    const compAddress = String(job.company?.address || "").toLowerCase();
    const locLower = location.toLowerCase();
    const map: Record<string, string[]> = {
      cairo: ["القاهرة"], alexandria: ["الإسكندرية", "الاسكندرية"], giza: ["الجيزة"], qalyubia: ["القليوبية"],
      "port said": ["بورسعيد"], suez: ["السويس"], gharbia: ["الغربية"], dakahlia: ["الدقهلية"],
      ismailia: ["الإسماعيلية", "الاسماعيلية"], asyut: ["أسيوط", "اسيوط"], fayoum: ["الفيوم"],
      minya: ["المنيا"], qena: ["قنا"], sohag: ["سوهاج"], "beni suef": ["بني سويف"],
      aswan: ["أسوان", "اسوان"], "red sea": ["البحر الأحمر", "البحر الاحمر"],
      "new valley": ["الوادي الجديد"], matrouh: ["مطروح"], "north sinai": ["شمال سيناء"],
      "south sinai": ["جنوب سيناء"], "kafr el sheikh": ["كفر الشيخ"], beheira: ["البحيرة"],
      damietta: ["دمياط"], sharqia: ["الشرقية"], monufia: ["المنوفية"], luxor: ["الأقصر", "الاقصر"]
    };
    const arNames = map[locLower] || [];
    const isMatch = (addr: string) => addr ? (addr.includes(locLower) || arNames.some(name => addr.includes(name))) : false;
    
    const locationMatch = !location || isMatch(jobAddress) || isMatch(compAddress);

    const keywordMatch = true;

    const typeMatch =
      selectedTypes.length === 0 ||
      selectedTypes.some((t) => matchesType(job, t));

    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.some((cat) => {
        const cn = (job.category?.name || "").toLowerCase();
        if (cat === "تصميم")
          return cn.includes("design") || job.categoryId === 16;
        if (cat === "مبيعات")
          return cn.includes("sales") || job.categoryId === 15;
        if (cat === "تسويق")
          return cn.includes("marketing") || job.categoryId === 14;
        if (cat === "أعمال") return cn.includes("business");
        if (cat === "موارد بشرية")
          return cn.includes("hr") || job.categoryId === 3;
        if (cat === "مالية")
          return cn.includes("finance") || job.categoryId === 13;
        if (cat === "هندسة")
          return cn.includes("engineering") || job.categoryId === 11;
        if (cat === "تكنولوجيا")
          return cn.includes("technology") || job.categoryId === 12;
        return cn.includes(cat.toLowerCase());
      });

    const levelMatch =
      selectedLevels.length === 0 ||
      selectedLevels.some((level) => {
        const jobLevel = getJobLevel(job);
        if (level === "Technical") return jobLevel === "تقني";
        if (level === "Non-Technical") return jobLevel === "غير تقني";
        if (level === "Services") return jobLevel === "services";
        if (level === "Tradesman") return jobLevel === "tradesman";
        return jobLevel.toLowerCase() === level.toLowerCase();
      });

    const salaryMatch =
      selectedSalaries.length === 0 ||
      selectedSalaries.includes(getSalaryRange(job) || "");

    const result =
      keywordMatch &&
      locationMatch &&
      typeMatch &&
      categoryMatch &&
      levelMatch &&
      salaryMatch;
    if (index === 0)
      console.log(`🔍 [AllJobs] Filter Debug: Job[0] match=${result}`, {
        keywordMatch,
        locationMatch,
        typeMatch,
        categoryMatch,
        levelMatch,
        salaryMatch,
      });
    return result;
  });

  console.log(
    `📊 [AllJobs] Displaying ${filteredJobs.length} jobs out of ${jobs.length} total.`,
  );

  const displayJobs = filteredJobs;
  const totalItems = displayJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / jobsPerPage));
  const adjustedPage = Math.min(currentPage, totalPages);

  const currentJobs = displayJobs.slice(
    (adjustedPage - 1) * jobsPerPage,
    adjustedPage * jobsPerPage,
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`${styles.jobsPage} ${isDark ? styles.darkJobsPage : ""}`}>
      {classification !== "tradesman" && (
        <motion.aside
          className={styles.sidebar}
          variants={sidebarVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Category Filter including Tradesman items */}
          <Filter
            title={t("Employment Type")}
            items={[
              {
                name: "Full-time",
                count: jobs.filter((j) => matchesType(j, "Full-time")).length,
                value: "Full-time",
              },
              {
                name: "Part-time",
                count: jobs.filter((j) => matchesType(j, "Part-time")).length,
                value: "Part-time",
              },
              {
                name: "Freelance",
                count: jobs.filter((j) => matchesType(j, "Freelance")).length,
                value: "Freelance",
              },
              {
                name: "Internship",
                count: jobs.filter((j) => matchesType(j, "Internship")).length,
                value: "Internship",
              },
              {
                name: "One-time",
                count: jobs.filter((j) => matchesType(j, "One-time")).length,
                value: "One-time",
              },
              {
                name: "Remote",
                count: jobs.filter((j) => matchesType(j, "Remote")).length,
                value: "Remote",
              },
            ]}
            selected={selectedTypes}
            setSelected={setSelectedTypes}
          />

          <Filter
            title={t("Job Category")}
            items={[
              {
                name: "Technical",
                count: jobs.filter((j) => getJobLevel(j) === "تقني").length,
                value: "Technical",
              },
              {
                name: "Non-Technical",
                count: jobs.filter((j) => getJobLevel(j) === "غير تقني").length,
                value: "Non-Technical",
              },
              {
                name: "Services",
                count: jobs.filter((j) => getJobLevel(j) === "services").length,
                value: "Services",
              },
              {
                name: "Tradesman",
                count: jobs.filter((j) => getJobLevel(j) === "tradesman").length,
                value: "Tradesman",
              },
            ]}
            selected={selectedLevels}
            setSelected={setSelectedLevels}
          />


          <Filter
            title={t("Salary Range")}
            items={[
              {
                name: "700$ - 1000$",
                count: jobs.filter((j) => getSalaryRange(j) === "700-1000").length,
                value: "700-1000",
              },
              {
                name: "1000$ - 1500$",
                count: jobs.filter((j) => getSalaryRange(j) === "1000-1500").length,
                value: "1000-1500",
              },
              {
                name: "1500$ - 2000$",
                count: jobs.filter((j) => getSalaryRange(j) === "1500-2000").length,
                value: "1500-2000",
              },
              {
                name: "3000$ or more",
                count: jobs.filter((j) => getSalaryRange(j) === "3000+").length,
                value: "3000+",
              },
            ]}
            selected={selectedSalaries}
            setSelected={setSelectedSalaries}
          />
        </motion.aside>
      )}

      <main className={styles.jobsContent}>
        {error && <div className={styles.apiStatus}>⚠️ {error}</div>}

        <div className={styles.jobsHeader}>
          <div>
            <h2>{t("جميع الوظائف")}</h2>
            <p>
              {t("عرض")} {filteredJobs.length} {t("نتائج")}
            </p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.sort}>
              {t("Sort by", "ترتيب حسب")}:
              <select
                defaultValue="Newest"
                onChange={(e) => {
                  const sortType = e.target.value;
                  const sorted = [...jobs].sort((a, b) => {
                    if (sortType === "Newest")
                      return (
                        new Date(b.createdAt || 0).getTime() -
                        new Date(a.createdAt || 0).getTime()
                      );
                    if (sortType === "Oldest")
                      return (
                        new Date(a.createdAt || 0).getTime() -
                        new Date(b.createdAt || 0).getTime()
                      );
                    return 0;
                  });
                  setJobs(sorted);
                }}
              >
                <option value="Newest">{t("الأحدث")}</option>
                <option value="Oldest">{t("الأقدم")}</option>
              </select>
            </div>
            <div className={styles.viewToggles}>
              <button
                className={`${styles.toggleBtn} ${view === "grid" ? styles.active : ""}`}
                onClick={() => setView("grid")}
              >
                <FiGrid size={20} />
              </button>
              <button
                className={`${styles.toggleBtn} ${view === "list" ? styles.active : ""}`}
                onClick={() => setView("list")}
              >
                <FiList size={20} />
              </button>
            </div>
          </div>
        </div>

        <div
          className={`${styles.list} ${view === "grid" ? styles.gridView : ""}`}
        >
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className={styles.loading}>{t("جاري التحميل...")}</div>
            ) : currentJobs.length === 0 ? (
              <div className={styles.loading}>
                {t("لم يتم العثور على وظائف.")}
              </div>
            ) : (
              currentJobs.map((job, index) => (
                <motion.div
                  key={job.jobId || `job-${index}`}
                  className={view === "grid" ? styles.jobCard : styles.jobRow}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  layout
                  onClick={() =>
                    navigate("/Job details", { state: { jobId: job.jobId } })
                  }
                >
                  {view === "list" ? (
                    <div className={styles.jobRowContent}>
                      {/* Determine if it's a Tradesman/Service job */}
                      {!!job.user ? (
                        /* --- TRADESMAN LIST VIEW (As per image) --- */
                        <>
                          <div className={styles.jobRowLeft}>
                            <div className={styles.tradesmanAvatarCircle}>
                              <img
                                src={getFullImageUrl(
                                  job.user?.avatarUrl,
                                  job.user?.fullName || job.jobId?.toString(),
                                  job,
                                )}
                                alt={t("صورة المستخدم")}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${job.jobId}`;
                                }}
                              />
                            </div>
                            <div className={styles.jobInfoColumn}>
                              <h3 className={styles.tradesmanJobTitle}>
                                {t(job.title)}
                              </h3>
                              <div className={styles.jobRowMeta}>
                                <span className={styles.locationNameText}>
                                  {t(
                                    job.company?.name ||
                                      job.user?.fullName ||
                                      "مزود الخدمة",
                                  )}{" "}
                                  •{" "}
                                  {t(
                                    job.address === "Remote"
                                      ? "بعيد"
                                      : job.address || job.company?.address || "غير محدد",
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className={styles.jobRatingMiddle}>
                            <span className={styles.starIconSmall}>★</span>
                            <span className={styles.ratingValueText}>
                              {(job.avgRating || 0).toFixed(2)}
                            </span>
                          </div>

                          <div className={styles.jobRowRight}>
                            <button
                              className={styles.premiumApplyBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/Job details", {
                                  state: { jobId: job.jobId },
                                });
                              }}
                            >
                              {t("تقدم الآن")}
                            </button>
                          </div>
                        </>
                      ) : (
                        /* --- COMPANY LIST VIEW (As previously designed) --- */
                        <>
                          <div className={styles.jobRowLeft}>
                            <div className={styles.jobLogoContainer}>
                              <img
                                src={getFullImageUrl(
                                  job.company?.logoUrl,
                                  job.company?.name || job.jobId?.toString(),
                                  job,
                                )}
                                alt={t("شعار الشركة")}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${job.company?.name || job.jobId}`;
                                }}
                              />
                            </div>
                            <div className={styles.jobInfoColumn}>
                              <h3 className={styles.companyJobTitle}>
                                {t(job.title)}
                              </h3>
                              <div className={styles.jobRowMeta}>
                                <span className={styles.companyNameText}>
                                  {t(
                                    job.company?.name ||
                                      job.user?.fullName ||
                                      "جوبيتو",
                                  )}
                                </span>
                                <span className={styles.metaCircle}>•</span>
                                <span className={styles.locationNameText}>
                                  {t(job.address || job.company?.address || "الموقع")}
                                </span>
                              </div>
                              <div className={styles.jobRowTags}>
                                {/* Display ONLY Job Type as requested */}
                                {Array.isArray(job.jobType) ? (
                                  job.jobType.map((type, idx) => (
                                    <span key={idx} className={styles.typePill}>
                                      {type === "full-time"
                                        ? t("دوام كامل")
                                        : type === "part-time"
                                          ? t("دوام جزئي")
                                          : t(type)}
                                    </span>
                                  ))
                                ) : (
                                  <span className={styles.typePill}>
                                    {job.jobType === "full-time"
                                      ? t("دوام كامل")
                                      : job.jobType === "part-time"
                                        ? t("دوام جزئي")
                                        : t(job.jobType)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={styles.jobRowRight}>
                            <button
                              className={styles.premiumApplyBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/Job details", {
                                  state: { jobId: job.jobId },
                                });
                              }}
                            >
                              {t("تقدم الآن")}
                            </button>
                            <div className={styles.capacityWrapper}>
                              <div className={styles.capacityBar}>
                                <div
                                  className={styles.capacityFill}
                                  style={{
                                    width: `${Math.min(((job.acceptedCount || 0) / (job.slotsAvailable || 1)) * 100, 100)}%`,
                                  }}
                                ></div>
                              </div>
                              <span className={styles.capacityLabel}>
                                {job.acceptedCount || 0} {t("من")}{" "}
                                {job.slotsAvailable || 10} {t("مقبول")}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* --- GRID VIEW --- */}
                      <div className={styles.cardHeader}>
                        <div className={styles.cardLogo}>
                          <img
                            src={getFullImageUrl(
                              job.company?.logoUrl,
                              job.company?.name || job.jobId?.toString(),
                              job,
                            )}
                            alt={t("شعار")}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${job.company?.name || job.jobId}`;
                            }}
                          />
                        </div>
                        <div
                          className={`${styles.like} ${job.jobId && likedJobs[job.jobId.toString()] ? styles.liked : ""}`}
                          onClick={(e) => toggleLike(e, job.jobId)}
                        >
                          {job.jobId && likedJobs[job.jobId.toString()] ? (
                            <FaHeart size={22} />
                          ) : (
                            <FaRegHeart size={22} />
                          )}
                        </div>
                      </div>
                      <div className={styles.cardBody}>
                        <h3>{t(job.title || "عنوان الوظيفة")}</h3>
                        <p
                          style={{
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                            color: "var(--color-text-secondary)",
                            marginBottom: "8px",
                          }}
                        >
                          {t(job.company?.name || "جوبيتو")}
                        </p>
                        <p className={styles.cardDesc}>
                          {(() => {
                            if (!job.description) return t("لا يوجد وصف لهذه الوظيفة حالياً.");
                            const clean = cleanDescription(job.description);
                            return clean.length > 80 ? clean.substring(0, 80) + "..." : clean;
                          })()}
                        </p>
                      </div>
                      <div className={styles.cardFooter}>
                        <span className={`${styles.tag} ${styles.fulltime}`}>
                          {(() => {
                            const types = Array.isArray(job.jobType)
                              ? job.jobType
                              : [job.jobType].filter(Boolean);
                            return types
                              .map((jt) => {
                                if (jt === "full-time") return t("دوام كامل");
                                if (jt === "part-time") return t("دوام جزئي");
                                if (jt === "remote") return t("عن بعد");
                                if (jt === "internship") return t("تدريب");
                                if (jt === "contract") return t("خدمة لمرة واحدة");
                                return t(jt);
                              })
                              .join(" / ");
                          })()}
                        </span>
                        {(job.address || job.company?.address) && (
                          <span
                            className={`${styles.tag} ${styles.tagBusiness}`}
                          >
                            {t(job.address || job.company?.address || "")}
                          </span>
                        )}
                      </div>
                      <div className={styles.cardAction}>
                        <div className={styles.statusContainerGrid}>
                          <span className={styles.appliedBadge}>
                            <strong>
                              {job.applications?.length ||
                                job.appliedCount ||
                                0}
                            </strong>{" "}
                            {t("المتقدمين")}
                          </span>
                        </div>
                        <button
                          className={styles.applyBtnGrid}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isAuthenticated) {
                              navigate("/user-information");
                            } else {
                              navigate("/Job details", {
                                state: { jobId: job.jobId },
                              });
                            }
                          }}
                        >
                          {t("تقديم")}
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.navBtn}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <FiChevronRight />
            </button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    className={`${styles.pageBtn} ${currentPage === pageNumber ? styles.active : ""}`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return (
                  <span key={pageNumber} className={styles.pageBtn}>
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              className={styles.navBtn}
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <FiChevronLeft />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

interface FilterItem {
  name: string;
  count: number;
  value?: string;
}
interface FilterProps {
  title: string;
  items: FilterItem[];
  selected: string[];
  setSelected: (items: string[]) => void;
}

const Filter: React.FC<FilterProps> = ({
  title,
  items,
  selected,
  setSelected,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useTranslation();
  const toggleItem = (name: string) =>
    selected.includes(name)
      ? setSelected(selected.filter((i) => i !== name))
      : setSelected([...selected, name]);

  return (
    <div className={styles.filter}>
      <div className={styles.filterHeader} onClick={() => setIsOpen(!isOpen)}>
        <h4>{title}</h4>
        <span className={styles.chevron}>
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </span>
      </div>
      {isOpen && (
        <div className={styles.filterList}>
          {items.map((item) => {
            const itemValue = item.value || item.name;
            return (
              <label key={item.name}>
                <span className={styles.filterLabelGroup}>
                  <input
                    type="checkbox"
                    checked={selected.includes(itemValue)}
                    onChange={() => toggleItem(itemValue)}
                  />
                  <span>{t(item.name)}</span>
                </span>
                <span className={styles.itemCount}>({item.count})</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllJobs;
