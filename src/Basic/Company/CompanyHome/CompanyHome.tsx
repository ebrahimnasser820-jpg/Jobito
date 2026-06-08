import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Style from "./CompanyHome.module.css";
import Statistics from "../../../Subject to/CompanyHome/Statistics";
import { useJobitoAuth } from "../../../context/LinkContxt";
import type { AuthUser } from "../../../context/LinkContxt";
import { useTranslation } from "../../../context/translation-context";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface JobCardProps {
  jobId: number;
  title: string;
  company: string;
  location: string;
  type?: string;
  applicantsCount?: number;
  capacity?: number;
  logo?: string;
  tags?: string[];
}

const getLogoUrl = (logoPath: string | undefined) => {
  if (!logoPath) return null;
  if (logoPath.startsWith("http")) return logoPath;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  return `${baseUrl}${logoPath.startsWith("/") ? "" : "/"}${logoPath}`;
};

const JobCard: React.FC<JobCardProps> = ({
  jobId,
  title,
  company,
  location,
  type,
  applicantsCount = 0,
  capacity = 10,
  logo,
  tags = [],
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const rawType = Array.isArray(type) ? type.join(" / ") : type;
  const displayType = String(rawType || t("دوام كامل"));
  return (
    <div className={Style.jobCard}>
      <div className={Style.cardTop}>
        <div className={Style.logoBox}>
          {logo ? (
            <img
              src={getLogoUrl(logo) || ""}
              alt={company}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "6px",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).parentElement!.innerText = "💼";
              }}
            />
          ) : (
            "💼"
          )}
        </div>
        <span className={Style.jobTypeBadge}>
          {t(displayType)}
        </span>
      </div>
      <h4 className={Style.cardTitle}>{title}</h4>
      <p className={Style.cardMeta}>
        {company} • {location}
      </p>
      <div className={Style.tagGroup}>
        {tags.length > 0 ? (
          tags.map((tag, idx) => (
            <span
              key={idx}
              className={`${Style.tag} ${idx % 2 === 0 ? Style.tagOrange : Style.tagBlue}`}
            >
              {tag}
            </span>
          ))
        ) : (
          <>
            <span className={`${Style.tag} ${Style.tagOrange}`}>{t("تكنولوجيا")}</span>
            <span className={`${Style.tag} ${Style.tagBlue}`}>{t("تطوير")}</span>
          </>
        )}
      </div>
      <div className={Style.cardFooter}>
        {applicantsCount} {t("تقدّموا")} <span className={Style.capacityText}>{t("من")} {capacity} {t("متاح")}</span>
      </div>
    </div>
  );
};


interface Job {
  jobId: number;
  title: string;
  address: string;
  jobType: string;
  slotsAvailable: number;
  slots?: number;
  applications?: unknown[];
  category?: { name?: string };
}

// Get current week date range string
function getCurrentWeekRange(t: any): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
 
  const startStr = monday.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endStr = sunday.toLocaleDateString(undefined, { month: "short", day: "numeric" });
 
  return `${startStr} - ${endStr}`;
}

const CompanyHome = () => {
  const { user, apiFetch } = useJobitoAuth();
  const { t, language } = useTranslation();
  const userName = user?.name || t("عضو");

  const [dashboardData, setDashboardData] = useState({
    newCandidates: 0,
    scheduleToday: 0,
    messagesReceived: 0,
    acceptedCandidates: 0,
  });
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companyData, setCompanyData] = useState<AuthUser | null>(null);
  const [dateRange] = useState(getCurrentWeekRange(t));

  const isInitialized = React.useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    const initDashboard = async () => {
      try {
        isInitialized.current = true;
        let activeCompanyId;

        // 1. Fetch company profile
        try {
          const profileRes = await apiFetch(
            `${API_BASE_URL}/companies/my/profile`,
          );

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            const cid =
              profileData.companyId || profileData.company_id || profileData.id;
            if (cid) {
              activeCompanyId = cid;
              setCompanyId(cid);
              setCompanyData(profileData);
            }
          }
        } catch (e) {
          console.warn("Could not fetch company profile:", e);
        }

        setCompanyId(activeCompanyId);

        // 2. Fetch Dashboard Summary
        if (activeCompanyId) {
          try {
            const summaryRes = await apiFetch(
              `${API_BASE_URL}/companies/my/dashboard-summary`,
            );
            if (summaryRes.ok) {
              const summaryData = await summaryRes.json();
              setDashboardData({
                newCandidates: summaryData.new_candidates || 0,
                scheduleToday: summaryData.schedule_today || 0,
                messagesReceived: summaryData.messages_received || 0,
                acceptedCandidates: summaryData.accepted_candidates || 0,
              });
            }
          } catch (e) {
            console.error("Failed to fetch dashboard summary", e);
          }

          // 3. Fetch Latest 4 Jobs
          try {
            const jobsRes = await apiFetch(
              `${API_BASE_URL}/jobs?companyId=${activeCompanyId}&limit=4`,
            );
            if (jobsRes.ok) {
              const jobsData = await jobsRes.json();
              setLatestJobs(
                jobsData.data ||
                  jobsData.jobs ||
                  (Array.isArray(jobsData) ? jobsData : []),
              );
            }
          } catch (e) {
            console.error("Failed to fetch jobs", e);
          }
        }
      } catch (error) {
        console.error("Failed to initialize dashboard", error);
      }
    };
    initDashboard();
  }, [apiFetch]);

  const summaryStats = [
    {
      count: dashboardData.newCandidates,
      label: t("مرشحين جدد للمراجعة"),
      link: "/AllApplicants"
    },
    {
      count: dashboardData.acceptedCandidates,
      label: t("عدد المقبولين"),
      link: "/chat"
    }
  ];


  return (
    <div className={Style.wrapper}>
      <main className={Style.main}>
        <div className={Style.container}>
          <div className={Style.headerSection}>
            <div className={Style.headerTop}>
              <div>
                <h2 className={Style.headerTitle}>{t("صباح الخير،")} {userName}</h2>
                <p className={Style.headerSubtitle}>
                  {t("إليك تقرير إحصائيات الوظائف من")} {dateRange}.
                </p>
              </div>

              <div className={Style.dateSelector}>
                <span>{dateRange}</span>
                <button className={Style.calendarBtn}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_673_19405)">
                      <path
                        d="M14.9999 4.16602H4.99992C4.07944 4.16602 3.33325 4.91221 3.33325 5.83268V15.8327C3.33325 16.7532 4.07944 17.4993 4.99992 17.4993H14.9999C15.9204 17.4993 16.6666 16.7532 16.6666 15.8327V5.83268C16.6666 4.91221 15.9204 4.16602 14.9999 4.16602Z"
                        stroke="#578BC7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13.3333 2.5V5.83333"
                        stroke="#578BC7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6.66675 2.5V5.83333"
                        stroke="#578BC7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3.33325 9.16602H16.6666"
                        stroke="#578BC7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.33341 12.5H6.66675V14.1667H8.33341V12.5Z"
                        stroke="#578BC7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_673_19405">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              </div>
            </div>

            <div className={Style.Percentages}>
              {summaryStats.map((stat, index) => (
                <div 
                  key={index} 
                  className={Style.NewCandidates} 
                >
                  <div className={Style.NewCandiTExt}>
                    <h3>{stat.count}</h3>
                    <p>
                      {stat.label.split(" ").slice(0, 2).join(" ")} <br />{" "}
                      {stat.label.split(" ").slice(2).join(" ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
            {companyId && <Statistics companyId={companyId} />}
          </div>

          <div className={Style.updatesSection}>
            <div className={Style.updatesHeader}>
              <h3 className={Style.updatesTitle}>{t("آخر تحديثات الوظائف")}</h3>
              <button className={Style.viewAllBtn}>{t("عرض الكل ←")}</button>
            </div>

            <div className={Style.jobGrid}>
              {latestJobs.length > 0 ? (
                latestJobs.map((job) => (
                  <JobCard
                    key={job.jobId}
                    jobId={job.jobId}
                    title={job.title}
                    company={user?.name || t("الشركة")}
                    location={job.address || t("عن بُعد")}
                    type={job.jobType || t("دوام كامل")}
                    applicantsCount={job.applications?.length || 0}
                    capacity={job.slotsAvailable || job.slots || 10}
                    tags={
                      job.category?.name
                        ? [job.category.name, t("تصميم")]
                        : undefined
                    }
                    logo={
                      companyData?.logoUrl ||
                      companyData?.logo_url ||
                      companyData?.logo ||
                      companyData?.avatarUrl ||
                      companyData?.avatar ||
                      user?.avatar
                    }
                  />
                ))
              ) : (
                <p style={{ color: "#6B7280" }}>{t("لا توجد تحديثات وظائف بعد.")}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyHome;
