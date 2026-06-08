import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'DM Sans',sans-serif; background:#f5f6fa; min-height:100vh; }

  .page { min-height:100vh; background:#f5f6fa; display:flex; flex-direction:column; }

  /* ── Topbar ── */
  .topbar {
    display:flex; align-items:center; justify-content:space-between;
    background:#fff; border-bottom:1px solid #e8eaf0;
    padding:0 28px; height:56px; flex-shrink:0; position:sticky; top:0; z-index:100;
  }
  .brand { display:flex; align-items:center; gap:10px; }
  .brand-logo { width:32px; height:32px; border-radius:8px; background:linear-gradient(135deg,#10b981,#3b82f6); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:800; font-size:14px; color:#fff; }
  .brand-info { line-height:1.2; }
  .brand-company { font-size:10px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; }
  .brand-name { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#111827; display:flex; align-items:center; gap:4px; cursor:pointer; }
  .topbar-right { display:flex; align-items:center; gap:12px; }
  .notif-btn { width:36px; height:36px; border-radius:10px; border:none; background:#f5f6fa; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#6b7280; position:relative; }
  .notif-dot { position:absolute; top:7px; right:7px; width:7px; height:7px; background:#ef4444; border-radius:50%; border:2px solid #f5f6fa; }
  .post-job-btn { display:flex; align-items:center; gap:7px; padding:9px 18px; background:#6366f1; border:none; border-radius:10px; color:#fff; font-size:13px; font-weight:700; font-family:'DM Sans',sans-serif; cursor:pointer; }
  .post-job-btn:hover { background:#4f46e5; }

  /* ── Content ── */
  .content { max-width:1060px; margin:0 auto; padding:28px 24px 80px; width:100%; }

  /* Job header */
  .job-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; }
  .job-back { display:flex; align-items:center; gap:8px; color:#6b7280; font-size:13px; cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; margin-bottom:8px; padding:0; }
  .job-back:hover { color:#111827; }
  .job-title { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; color:#111827; margin-bottom:5px; }
  .job-meta { display:flex; align-items:center; gap:6px; font-size:13px; color:#6b7280; }
  .job-meta-dot { color:#d1d5db; }
  .hired-badge { color:#6366f1; font-weight:700; }
  .more-action-btn { display:flex; align-items:center; gap:6px; padding:9px 16px; background:#fff; border:1.5px solid #e5e7eb; border-radius:10px; color:#374151; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer; }
  .more-action-btn:hover { border-color:#6366f1; color:#6366f1; }

  /* Tabs */
  .tabs { display:flex; border-bottom:2px solid #e5e7eb; margin-bottom:24px; }
  .tab { padding:10px 20px; font-size:13px; font-weight:600; color:#9ca3af; background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; position:relative; }
  .tab:hover { color:#374151; }
  .tab.active { color:#6366f1; }
  .tab.active::after { content:''; position:absolute; bottom:-2px; left:0; right:0; height:2px; background:#6366f1; border-radius:2px 2px 0 0; }

  /* ── Two-col layout ── */
  .two-col { display:grid; grid-template-columns:1fr 300px; gap:24px; align-items:flex-start; }

  /* ── Main content card ── */
  .main-card { background:#fff; border:1px solid #ebebf0; border-radius:18px; overflow:hidden; }

  /* Company banner */
  .company-banner {
    background:linear-gradient(135deg,#f0f4ff 0%,#e8f5e9 100%);
    padding:28px 28px 20px;
    display:flex; align-items:flex-start; justify-content:space-between;
    border-bottom:1px solid #ebebf0;
  }
  .company-logo-wrap { display:flex; align-items:center; gap:16px; }
  .company-logo { width:56px; height:56px; border-radius:14px; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:800; font-size:20px; color:#fff; box-shadow:0 4px 14px rgba(99,102,241,0.3); }
  .company-info {}
  .company-job-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; color:#111827; margin-bottom:4px; }
  .company-name { font-size:13px; color:#6b7280; display:flex; align-items:center; gap:6px; }
  .company-verified { color:#10b981; }
  .edit-btn { display:flex; align-items:center; gap:6px; padding:8px 16px; background:#fff; border:1.5px solid #e5e7eb; border-radius:10px; color:#6366f1; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer; white-space:nowrap; }
  .edit-btn:hover { border-color:#6366f1; background:#f5f3ff; }

  /* Job body */
  .job-body { padding:28px; }

  /* Section */
  .section { margin-bottom:28px; }
  .section:last-child { margin-bottom:0; }
  .section-title { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; color:#111827; margin-bottom:10px; display:flex; align-items:center; gap:8px; }
  .section-title::before { content:''; display:block; width:3px; height:16px; background:#6366f1; border-radius:2px; }
  .section-desc { font-size:14px; color:#6b7280; line-height:1.75; }

  /* Bullet list */
  .bullet-list { list-style:none; display:flex; flex-direction:column; gap:8px; }
  .bullet-item { display:flex; align-items:flex-start; gap:10px; font-size:14px; color:#6b7280; line-height:1.6; }
  .bullet-icon { width:18px; height:18px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; margin-top:2px; }
  .bullet-icon.check { background:#d1fae5; }
  .bullet-icon.diamond { background:#ede9fe; }

  /* Perks grid */
  .perks-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .perk-card { background:#f9fafb; border:1px solid #ebebf0; border-radius:14px; padding:18px 16px; }
  .perk-icon { font-size:28px; margin-bottom:10px; }
  .perk-name { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#111827; margin-bottom:6px; }
  .perk-desc { font-size:12px; color:#9ca3af; line-height:1.6; }

  /* ── Sidebar ── */
  .sidebar { display:flex; flex-direction:column; gap:16px; }

  .side-card { background:#fff; border:1px solid #ebebf0; border-radius:16px; padding:20px; }

  /* About role */
  .about-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#111827; margin-bottom:14px; }
  .about-row { display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f3f4f6; }
  .about-row:last-child { border-bottom:none; padding-bottom:0; }
  .about-label { font-size:12px; color:#9ca3af; font-weight:500; }
  .about-value { font-size:13px; color:#111827; font-weight:600; text-align:right; }
  .about-progress { display:flex; align-items:center; gap:8px; }
  .progress-bar { width:80px; height:5px; background:#f3f4f6; border-radius:99px; overflow:hidden; }
  .progress-fill { height:100%; background:#6366f1; border-radius:99px; }
  .salary-range { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#6366f1; }

  /* Categories / Skills tags */
  .tags-wrap { display:flex; flex-wrap:wrap; gap:8px; margin-top:4px; }
  .tag-pill { padding:5px 12px; border-radius:99px; font-size:12px; font-weight:600; }
  .tag-cat { background:#fff3e0; color:#f59e0b; }
  .tag-skill { background:#f3f4f6; color:#374151; border:1px solid #e5e7eb; }
  .tag-skill:hover { border-color:#6366f1; color:#6366f1; background:#f5f3ff; cursor:pointer; }

  /* Apply CTA */
  .apply-card { background:linear-gradient(135deg,#6366f1,#8b5cf6); border-radius:16px; padding:22px 20px; color:#fff; text-align:center; }
  .apply-title { font-family:'Syne',sans-serif; font-size:16px; font-weight:800; margin-bottom:6px; }
  .apply-sub { font-size:12px; opacity:0.8; line-height:1.5; margin-bottom:16px; }
  .apply-btn { width:100%; padding:11px; background:#fff; border:none; border-radius:10px; color:#6366f1; font-size:14px; font-weight:700; font-family:'Syne',sans-serif; cursor:pointer; }
  .apply-btn:hover { background:#f5f3ff; }
  .save-btn-outline { width:100%; padding:10px; background:transparent; border:1.5px solid rgba(255,255,255,0.4); border-radius:10px; color:#fff; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer; margin-top:8px; }
  .save-btn-outline:hover { background:rgba(255,255,255,0.1); }

  /* Capacity badge */
  .capacity-wrap { display:flex; align-items:center; gap:8px; margin-top:2px; }
  .capacity-bar { flex:1; height:5px; background:#f3f4f6; border-radius:99px; overflow:hidden; }
  .capacity-text { font-size:11px; color:#9ca3af; white-space:nowrap; }

  /* Deadline badge */
  .deadline-badge { display:inline-flex; align-items:center; gap:5px; background:#fef3c7; color:#d97706; border-radius:6px; padding:3px 8px; font-size:11px; font-weight:600; }

  /* Divider */
  .section-divider { height:1px; background:#f3f4f6; margin:4px 0 16px; }
`;

const RESPONSIBILITIES = [
    "Community engagement to ensure that it is supported and actively represented online",
    "Focus on social media content development and publication",
    "Marketing and strategy support",
    "Stay on top of trends on social media platforms, and suggest content ideas to the team",
    "Engage with online communities",
];

const WHO_YOU_ARE = [
    "You get energy from people and building the ideal work environment",
    "You have a sense for beautiful spaces and office experiences",
    "You are confident of multitasking and take priority for added responsibilities",
    "You're detail-oriented and creative",
    "You're a growth marketer and know how to run campaigns",
];

const NICE_TO_HAVE = [
    "Fluent in English",
    "Project management skills",
    "Copy editing skills",
];

const PERKS = [
    { icon: "🏥", name: "Full Healthcare", desc: "We believe in thriving communities and that starts with our team being happy and healthy." },
    { icon: "🏖️", name: "Unlimited Vacation", desc: "We believe you should have a flexible schedule that makes space for family, wellness, and fun." },
    { icon: "🎬", name: "Skill Development", desc: "We believe in always learning and leveling up our skills." },
    { icon: "🏔️", name: "Team Summits", desc: "Every month we have a full team retreat where we have fun, reflect, and plan for the upcoming quarter." },
    { icon: "🏠", name: "Remote Working", desc: "We know how to perform your best. Work from home, coffee shop or anywhere when you feel like it." },
    { icon: "🚌", name: "Commuter Benefits", desc: "We're grateful for all the time and energy each team member puts into getting to work every day." },
    { icon: "🌍", name: "We give back.", desc: "We know industry has an impact. Our employees make up $3.9M into 50 so they can support the organizations they care about most — timex-two." },
];

const SKILLS = ["Project Management", "Copywriting", "English", "Social Media Marketing", "Copy Editing"];
const CATEGORIES = ["Marketing", "Design"];

export default function JobDetails() {
    const [activeTab, setActiveTab] = useState("Job Details");
    const [saved, setSaved] = useState(false);

    return (
        <>
            <style>{styles}</style>
            <div className="page">

                {/* Topbar */}
                <div className="topbar">
                    <div className="brand">
                        <div className="brand-logo">N</div>
                        <div className="brand-info">
                            <div className="brand-company">Company</div>
                            <div className="brand-name">Nomad <span style={{ fontSize: 10, color: "#9ca3af" }}>▾</span></div>
                        </div>
                    </div>
                    <div className="topbar-right">
                        <button className="notif-btn">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1a5 5 0 00-5 5v3l-1.5 2h13L13 9V6a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.3" /><path d="M6.5 13.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" /></svg>
                            <div className="notif-dot" />
                        </button>
                        <button className="post-job-btn">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                            Post a job
                        </button>
                    </div>
                </div>

                <div className="content">
                    {/* Job page header */}
                    <div className="job-header">
                        <div>
                            <button className="job-back">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                Back
                            </button>
                            <div className="job-title">Social Media Assistant</div>
                            <div className="job-meta">
                                <span>Design</span>
                                <span className="job-meta-dot">•</span>
                                <span>Full-Time</span>
                                <span className="job-meta-dot">•</span>
                                <span>4 / <span className="hired-badge">11 Hired</span></span>
                            </div>
                        </div>
                        <button className="more-action-btn">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 5l-2 2-2-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            More Action
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="tabs">
                        {["Applicants", "Job Details"].map(t => (
                            <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
                        ))}
                    </div>

                    <div className="two-col">
                        {/* ── Main content ── */}
                        <div className="main-card">
                            {/* Company banner */}
                            <div className="company-banner">
                                <div className="company-logo-wrap">
                                    <div className="company-logo">S</div>
                                    <div className="company-info">
                                        <div className="company-job-title">Social Media Assistant</div>
                                        <div className="company-name">
                                            Stripe
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="company-verified">
                                                <circle cx="7" cy="7" r="6" fill="#10b981" />
                                                <path d="M4.5 7l2 2 3-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Verified
                                        </div>
                                    </div>
                                </div>
                                <button className="edit-btn">
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9.5 1.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    Edit Job Details
                                </button>
                            </div>

                            <div className="job-body">
                                {/* Description */}
                                <div className="section">
                                    <div className="section-title">Description</div>
                                    <p className="section-desc">
                                        Stripe is looking for Social Media Marketing expert to help manage our online networks. You will be responsible for monitoring our social media channels, creating content, finding effective ways to engage the community, and incentivize others to engage on our channels.
                                    </p>
                                </div>

                                {/* Responsibilities */}
                                <div className="section">
                                    <div className="section-title">Responsibilities</div>
                                    <ul className="bullet-list">
                                        {RESPONSIBILITIES.map((r, i) => (
                                            <li key={i} className="bullet-item">
                                                <div className="bullet-icon check">
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                </div>
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Who You Are */}
                                <div className="section">
                                    <div className="section-title">Who You Are</div>
                                    <ul className="bullet-list">
                                        {WHO_YOU_ARE.map((w, i) => (
                                            <li key={i} className="bullet-item">
                                                <div className="bullet-icon check">
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                </div>
                                                {w}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Nice-To-Haves */}
                                <div className="section">
                                    <div className="section-title">Nice-To-Haves</div>
                                    <ul className="bullet-list">
                                        {NICE_TO_HAVE.map((n, i) => (
                                            <li key={i} className="bullet-item">
                                                <div className="bullet-icon diamond">
                                                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><rect x="2" y="0.5" width="4" height="4" transform="rotate(45 4 2.5)" fill="#8b5cf6" /></svg>
                                                </div>
                                                {n}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Perks & Benefits */}
                                <div className="section">
                                    <div className="section-title">Perks &amp; Benefits</div>
                                    <p className="section-desc" style={{ marginBottom: 16 }}>This job comes with several perks and benefits</p>
                                    <div className="perks-grid">
                                        {PERKS.map(p => (
                                            <div key={p.name} className="perk-card">
                                                <div className="perk-icon">{p.icon}</div>
                                                <div className="perk-name">{p.name}</div>
                                                <div className="perk-desc">{p.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Sidebar ── */}
                        <div className="sidebar">

                            {/* Apply CTA */}
                            <div className="apply-card">
                                <div className="apply-title">Ready to Apply?</div>
                                <div className="apply-sub">Join 132+ applicants who already applied to this position this week.</div>
                                <button className="apply-btn">Apply Now</button>
                                <button className="save-btn-outline" onClick={() => setSaved(s => !s)}>
                                    {saved ? "✓ Saved" : "♡ Save for Later"}
                                </button>
                            </div>

                            {/* About this role */}
                            <div className="side-card">
                                <div className="about-title">About this role</div>

                                <div className="about-row">
                                    <div className="about-label">5 applied</div>
                                    <div className="about-progress">
                                        <div className="progress-bar"><div className="progress-fill" style={{ width: "45%" }} /></div>
                                        <span style={{ fontSize: 11, color: "#9ca3af" }}>of 10 capacity</span>
                                    </div>
                                </div>

                                <div className="about-row">
                                    <div className="about-label">Apply Before</div>
                                    <div className="about-value">July 31, 2021</div>
                                </div>
                                <div className="about-row">
                                    <div className="about-label">Job Posted On</div>
                                    <div className="about-value">July 1, 2021</div>
                                </div>
                                <div className="about-row">
                                    <div className="about-label">Job Type</div>
                                    <div className="about-value">Full-Time</div>
                                </div>
                                <div className="about-row">
                                    <div className="about-label">Salary</div>
                                    <div className="salary-range">$75k – $85k USD</div>
                                </div>

                                {/* Deadline warning */}
                                <div style={{ marginTop: 12 }}>
                                    <span className="deadline-badge">
                                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.3" /><path d="M5.5 3v2.5l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                                        Closes in 12 days
                                    </span>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="side-card">
                                <div className="about-title">Categories</div>
                                <div className="tags-wrap">
                                    {CATEGORIES.map(c => (
                                        <span key={c} className="tag-pill tag-cat">{c}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Required Skills */}
                            <div className="side-card">
                                <div className="about-title">Required Skills</div>
                                <div className="tags-wrap">
                                    {SKILLS.map(s => (
                                        <span key={s} className="tag-pill tag-skill">{s}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Quick stats */}
                            <div className="side-card">
                                <div className="about-title">Job Performance</div>
                                {[
                                    { label: "Total Views", value: "23,564", change: "+6.4%", up: true },
                                    { label: "Total Applied", value: "132", change: "-0.4%", up: false },
                                    { label: "Shortlisted", value: "44", change: "+12%", up: true },
                                ].map(s => (
                                    <div key={s.label} className="about-row">
                                        <div className="about-label">{s.label}</div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{s.value}</span>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: s.up ? "#10b981" : "#ef4444" }}>{s.change}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}