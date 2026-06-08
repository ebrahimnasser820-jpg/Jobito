import { MapPin, Search } from "lucide-react";
import Styles from "./JobBoard.module.css";
import AllJobs from "../../Subject to/JobBoard/AllJobs/AllJobs";
import { motion, type Variants } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "../../context/translation-context";
import { useJobitoAuth } from "../../context/LinkContxt";
import { useTheme } from "../../context/ThemeContext";
import darkBg from "../../assets/WhatsApp Image 2026-05-10 at 1.22.54 AM.jpeg";
import lightBg from "../../assets/WhatsApp Image 2026-05-10 at 1.40.25 AM.jpeg";

const sectionVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.2 },
  },
};

export default function JobBoard() {
  const { apiFetch, isAuthenticated, role, user } = useJobitoAuth();
  const { isDark } = useTheme();
  const classification = user?.classification;
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const { t } = useTranslation();

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    location: "",
  });

  const handleSearch = () => {
    setAppliedFilters({ search, location });
  };

  return (
    <div className={Styles.page}>
      {/* ── Hero Section ── */}
      <section
        className={Styles.heroSection}
        dir="ltr"
        style={{
          backgroundImage: `url(${!isDark ? darkBg : lightBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <img
          src={!isDark ? darkBg : lightBg}
          alt="Banner"
          className={Styles.mobileBanner}
        />
        <div className={Styles.container}>
          <div className={Styles.content}>
            {/* Search Bar */}
            <motion.div
              className={`${Styles.searchBar} ${isDark ? Styles.darkSearchBar : ""}`}
              initial={{ opacity: 1, y: 0 }}
              dir="ltr"
            >
              <div className={Styles.inputGroup}>
                <Search className={Styles.icon} size={20} />
                <input
                  type="text"
                  placeholder={
                    classification === "tradesman"
                      ? t("ما هي الخدمة التي تستطيع تقديمها؟ (سباكة، نجارة...)")
                      : t("مسمى الوظيفة أو الكلمة الرئيسية...")
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <div className={Styles.divider}></div>

              <div className={Styles.inputGroup}>
                <MapPin className={Styles.icon} size={20} />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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

              <button className={Styles.searchBtn} onClick={handleSearch}>
                {t("بحث")}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Jobs Section ── */}
      <motion.div
        className={Styles.cardJobBoard}
        variants={sectionVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <AllJobs
          searchKeyword={appliedFilters.search}
          location={appliedFilters.location}
        />
      </motion.div>
    </div>
  );
}
