import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, MapPin } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import styles from "./CompaniesJobs.module.css";
import { useTranslation } from "../../context/translation-context";
import { useTheme } from "../../context/ThemeContext";
import lightBg from "../../assets/image copy 2.png";
import darkBg from "../../assets/WhatsApp Image 2026-05-10 at 2.06.47 AM.jpeg";



const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface Company {
  id: number;
  name: string;
  desc: string;
  tags: string[];
  jobsCount: number;
  logoUrl?: string;
  industry?: string;
  classification?: string;
  employees?: string;
}

const DEFAULT_CLASSIFICATIONS = [
  "تقني", "غير تقني"
];

const heroContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const searchBarVariant: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.45 },
  },
};

const CompaniesJobs = () => {
  const { t, language } = useTranslation();
  const { isDark } = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const itemsPerPage = 6;

  useEffect(() => {
    let isMounted = true;
    const debounceTimer = setTimeout(() => {
      const fetchCompanies = async () => {
        try {
          setIsLoading(true);
          const params = new URLSearchParams();
          if (searchTerm) params.append("search", searchTerm);
          if (location) params.append("location", location);
          const response = await fetch(`${API_BASE_URL}/companies?${params.toString()}`);
          if (!response.ok) {
            throw new Error(t("خطأ في الخادم:") + ` ${response.status}`);
          }
          const rawData = await response.json();
          const data = rawData.data || (Array.isArray(rawData) ? rawData : []);
          if (!Array.isArray(data)) {
            console.error("API returned non-array data:", data);
            if (isMounted) setCompanies([]);
            return;
          }
          const uniqueCompaniesMap = new Map<string, Company>();
          (data as any[]).forEach((item) => {
            const tagsSet = new Set<string>();
            item.jobs?.forEach((job: any) => {
              if (job.category?.name) tagsSet.add(job.category.name);
            });
            let description = item.description || t("شركة رائدة في مجالها.");
            if (description.includes("figmeta") || description.includes("figma")) {
              description = "شركة رائدة في مجالها.";
            }
            const companyObj: Company = {
              id: item.companyId,
              name: item.name || "شركة غير مسماة",
              desc: description,
              tags: Array.from(tagsSet),
              jobsCount: item.jobs?.length || 0,
              logoUrl: item.logoUrl,
              industry: item.industry,
              classification: item.classification,
              employees: item.employees,
            };
            const existing = uniqueCompaniesMap.get(companyObj.id.toString());
            if (
              !existing ||
              (companyObj.jobsCount > 0 && existing.jobsCount === 0) ||
              (companyObj.classification && !existing.classification)
            ) {
              uniqueCompaniesMap.set(companyObj.id.toString(), companyObj);
            }
          });
          if (isMounted) {
            setCompanies(Array.from(uniqueCompaniesMap.values()));
            setError(null);
          }
        } catch (err) {
          console.error("Error fetching companies:", err);
          if (isMounted) {
            setError(t("تعذر تحميل البيانات."));
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };
      fetchCompanies();
    }, 300);
    return () => {
      clearTimeout(debounceTimer);
      isMounted = false;
    };
  }, [searchTerm, location]);

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesIndustry =
      selectedIndustries.length === 0 ||
      (company.classification && selectedIndustries.includes(company.classification));

    return matchesSearch && matchesIndustry;
  });

  const industryCounts = companies.reduce((acc, company) => {
    if (company.classification) {
      acc[company.classification] = (acc[company.classification] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Add defaults to industryCounts
  DEFAULT_CLASSIFICATIONS.forEach(ind => {
    if (industryCounts[ind] === undefined) industryCounts[ind] = 0;
  });

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = filteredCompanies.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const handleSearchClick = () => {
    setCurrentPage(1);
    // Trigger immediate fetch by clearing debounce timer
    setSearchTerm(searchTerm); // forces effect
  };

  const handleIndustryChange = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry],
    );
    setCurrentPage(1);
  };

  return (
    <div>
      <section 
        className={styles.heroSection}
        dir="ltr"
        style={{
          backgroundImage: `url(${isDark ? darkBg : lightBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <img
          src={isDark ? darkBg : lightBg}
          alt="Banner"
          className={styles.mobileBanner}
        />
        <div className={styles.container}>
          <motion.div
            className={styles.content}
            variants={heroContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className={`${styles.searchBar} ${isDark ? styles.darkSearchBar : ""}`}
              variants={searchBarVariant}
              dir="ltr"
            >
              <div className={styles.inputGroup}>
                <Search className={styles.icon} size={20} />
                <input
                  type="text"
                  placeholder={t("اسم الشركة أو المجال...")}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className={styles.divider}></div>

              <div className={styles.inputGroup}>
                <MapPin className={styles.icon} size={20} />
                <select
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">{t("أي مكان")}</option>
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
                </select>
              </div>

              <button 
                className={styles.searchBtn}
                onClick={handleSearchClick}
              >
                {t("Search", "Search")}
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className={styles.Companiespage}>
        <aside className={styles.sidebar}>
          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>{t("التصنيف")}</h4>
            <div className={styles.filterList}>
              {Object.entries(industryCounts).map(([ind, count]) => (
                <label key={ind} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selectedIndustries.includes(ind)}
                    onChange={() => handleIndustryChange(ind)}
                  />
                  <span className={styles.labelSpan}>
                    {t(ind)} <span className={styles.countText}>({count})</span>
                  </span>
                </label>
              ))}
              {Object.keys(industryCounts).length === 0 && !isLoading && (
                <p className={styles.emptyText}>{t("لا توجد قطاعات.")}</p>
              )}
            </div>
          </div>

        </aside>

        <main className={styles.Companiespagemu}>
          <div className={styles.CompaniesHeader}>
            <div>
              <h2>{t("جميع الشركات")}</h2>
              <p>
                {t("إجمالي الشركات المدرجة:")} {filteredCompanies.length}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className={styles.loaderContainer}>
              <div className={styles.spinner}></div>
              <p>{t("جاري التحميل...")}</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: "10px",
                  padding: "5px 15px",
                  cursor: "pointer",
                }}
              >
                {t("إعادة المحاولة")}
              </button>
            </div>
          ) : filteredCompanies.length > 0 ? (
            <>
              <div className={styles.Companiesgrid}>
                {currentCompanies.map((company) => (
                  <div 
                    key={company.id} 
                    className={styles.Companycard}
                    onClick={() => navigate(`/Company/${company.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.Cardtop}>
                      <div className={styles.Logoplaceholder}>
                        {company.logoUrl ? (
                          <img
                            src={
                              company.logoUrl.startsWith("http")
                                ? company.logoUrl
                                : `${API_BASE_URL}${company.logoUrl}`
                            }
                            alt={company.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "inherit",
                            }}
                          />
                        ) : (
                          <Building2 size={24} color="#4640de" />
                        )}
                      </div>
                      <span className={styles.Jobscount}>
                        {company.jobsCount} {t("وظائف شاغرة")}
                      </span>
                    </div>

                    <h3>{t(company.name)}</h3>
                    <p className={styles.desc}>{t(company.desc)}</p>

                    <div className={styles.tags}>
                      {company.tags.length > 0 ? (
                        company.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`${styles.tag} ${styles.paymentgateway}`}
                          >
                            {t(tag)}
                          </span>
                        ))
                      ) : (
                        <span className={styles.noTag}>{t("خدمات عامة")}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    {" > "}
                  </button>
                  <div className={styles.pageNumbers}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={
                            currentPage === page ? styles.activePage : ""
                          }
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                     {" < "}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.noResults}>
              <h3>{t("لم يتم العثور على نتائج.")}</h3>
              <p>{t("حاول البحث بكلمات أخرى.")}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CompaniesJobs;
