import { useState, useRef } from "react";

const AVATAR_COLORS = [
  ["#6366f1","#818cf8"],["#10b981","#34d399"],["#f59e0b","#fbbf24"],
  ["#ef4444","#f87171"],["#8b5cf6","#a78bfa"],["#06b6d4","#22d3ee"],
  ["#ec4899","#f472b6"],["#84cc16","#a3e635"],
];

const ROLES = ["CEO & Co-Founder","Co-Founder","Managing Director","CTO","Product Manager","Designer","Engineer","Marketing","HR","Finance","Operations"];

const INITIAL_MEMBERS = [
  { id:1, name:"Célestin Gardinier",  role:"CEO & Co-Founder",    instagram:"celestin_g",  linkedin:"celestin-gardinier",  avatar:null, color:0 },
  { id:2, name:"Reynaud Colbert",     role:"Co-Founder",           instagram:"reynaud_c",   linkedin:"reynaud-colbert",     avatar:null, color:1 },
  { id:3, name:"Arienne Lyon",        role:"Managing Director",    instagram:"arienne_l",   linkedin:"arienne-lyon",        avatar:null, color:2 },
  { id:4, name:"Bernard Alexander",   role:"Managing Director",    instagram:"bernard_a",   linkedin:"bernard-alexander",   avatar:null, color:3 },
  { id:5, name:"Christine Jhonson",   role:"Managing Director",    instagram:"christine_j", linkedin:"christine-jhonson",   avatar:null, color:4 },
  { id:6, name:"Aaron Morgan",        role:"Managing Director",    instagram:"aaron_m",     linkedin:"aaron-morgan",        avatar:null, color:5 },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { font-family: 'DM Sans', sans-serif; background: #f8f9fc; min-height: 100vh; }

  .wrapper {
    min-height: 100vh; background: #f8f9fc;
    display: flex; justify-content: center;
    padding: 56px 24px 100px;
  }
  .container { width: 100%; max-width: 920px; }

  .page-title {
    font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 800;
    color: #111827; margin-bottom: 8px; letter-spacing: -0.4px;
  }

  /* Tabs */
  .tabs { display: flex; border-bottom: 1.5px solid #e5e7eb; margin-bottom: 44px; gap: 4px; }
  .tab {
    padding: 12px 24px; font-size: 14px; font-weight: 600; color: #9ca3af;
    background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
    position: relative; letter-spacing: 0.1px;
  }
  .tab:hover { color: #374151; }
  .tab.active { color: #111827; }
  .tab.active::after {
    content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
    height: 2px; background: #111827; border-radius: 2px 2px 0 0;
  }

  /* Main layout */
  .main-layout { display: grid; grid-template-columns: 200px 1fr; gap: 32px; align-items: flex-start; }
  .sidebar-label { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 6px; }
  .sidebar-desc { font-size: 12px; color: #b0b7c3; line-height: 1.7; }

  /* Team panel */
  .team-panel {
    background: #fff; border: 1px solid #ebebf0; border-radius: 20px; overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }

  /* Panel header */
  .panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 28px; border-bottom: 1px solid #f3f4f6;
  }
  .member-count {
    font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #111827;
    letter-spacing: -0.3px;
  }
  .member-count span { color: #111827; }
  .header-right { display: flex; align-items: center; gap: 12px; }

  .add-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px; background: #111827; border: none;
    border-radius: 10px; color: #fff; font-size: 13px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer; white-space: nowrap;
    letter-spacing: 0.1px;
  }
  .add-btn:hover { background: #1f2937; }

  .view-toggle { display: flex; gap: 4px; }
  .view-btn {
    width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e5e7eb;
    background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
    color: #d1d5db;
  }
  .view-btn:hover { color: #6b7280; border-color: #d1d5db; }
  .view-btn.active { border-color: #111827; background: #111827; color: #fff; }

  /* Search + filter bar */
  .filter-bar {
    display: flex; gap: 12px; padding: 16px 28px; border-bottom: 1px solid #f3f4f6;
    background: #fafafa;
  }
  .search-wrap {
    flex: 1; position: relative; display: flex; align-items: center;
  }
  .search-icon {
    position: absolute; left: 12px; color: #c4c9d4; pointer-events: none;
  }
  .search-input {
    width: 100%; padding: 10px 14px 10px 36px;
    border: 1px solid #e5e7eb; border-radius: 10px; outline: none;
    font-size: 13px; color: #374151; font-family: 'DM Sans', sans-serif;
    background: #fff;
  }
  .search-input:focus { border-color: #111827; box-shadow: 0 0 0 3px rgba(17,24,39,0.06); }
  .search-input::placeholder { color: #d1d5db; }

  .filter-select {
    padding: 10px 34px 10px 14px; border: 1px solid #e5e7eb;
    border-radius: 10px; outline: none; font-size: 13px;
    color: #374151; font-family: 'DM Sans', sans-serif;
    background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14' fill='none'%3E%3Cpath d='M3 5l4 4 4-4' stroke='%23C4C9D4' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 10px center;
    appearance: none; cursor: pointer;
  }
  .filter-select:focus { border-color: #111827; }

  /* Grid view */
  .members-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 0; 
  }
  .member-card {
    background: #fff; padding: 36px 24px 28px;
    display: flex; flex-direction: column; align-items: center;
    position: relative; cursor: default;
    border-right: 1px solid #f3f4f6; border-bottom: 1px solid #f3f4f6;
  }
  .member-card:nth-child(3n) { border-right: none; }
  .member-card:hover { background: #fafbff; }
  .member-card:hover .card-actions { opacity: 1; }

  /* List view */
  .members-list { display: flex; flex-direction: column; }
  .member-row {
    display: flex; align-items: center; gap: 18px;
    padding: 20px 28px; border-bottom: 1px solid #f3f4f6;
    position: relative;
  }
  .member-row:last-child { border-bottom: none; }
  .member-row:hover { background: #fafbff; }
  .member-row:hover .row-actions { opacity: 1; }
  .row-info { flex: 1; }
  .row-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #111827; }
  .row-role { font-size: 12px; color: #b0b7c3; margin-top: 3px; }
  .row-socials { display: flex; gap: 8px; }
  .row-actions { display: flex; gap: 6px; opacity: 0; }

  /* Avatar */
  .avatar {
    width: 76px; height: 76px; border-radius: 50%; display: flex;
    align-items: center; justify-content: center; font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800; color: #fff; flex-shrink: 0;
    margin-bottom: 18px; position: relative; overflow: hidden;
    border: 4px solid #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  }
  .avatar.sm {
    width: 46px; height: 46px; font-size: 14px; margin-bottom: 0;
    border: 3px solid #fff; box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  }
  .avatar img { width: 100%; height: 100%; object-fit: cover; }
  .avatar-upload-overlay {
    position: absolute; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; border-radius: 50%; cursor: pointer; color: #fff; font-size: 10px;
    font-weight: 700; text-align: center; line-height: 1.4;
  }
  .avatar:hover .avatar-upload-overlay { opacity: 1; }

  /* Card content */
  .card-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #111827; text-align: center; margin-bottom: 5px; }
  .card-role { font-size: 12px; color: #b0b7c3; text-align: center; margin-bottom: 18px; letter-spacing: 0.1px; }
  .card-socials { display: flex; gap: 8px; }
  .social-link {
    width: 32px; height: 32px; border-radius: 8px; border: 1px solid #ebebf0;
    display: flex; align-items: center; justify-content: center;
    color: #c4c9d4; text-decoration: none; cursor: pointer;
    background: #fff;
  }
  .social-link:hover { border-color: #374151; color: #374151; }

  /* Card top actions (edit/delete) */
  .card-actions {
    position: absolute; top: 14px; right: 14px;
    display: flex; gap: 5px; opacity: 0;
  }
  .action-btn {
    width: 30px; height: 30px; border-radius: 8px; border: 1px solid #ebebf0;
    background: #fff; cursor: pointer; display: flex; align-items: center;
    justify-content: center; color: #c4c9d4;
  }
  .action-btn:hover { border-color: #374151; color: #374151; }
  .action-btn.del:hover { border-color: #fca5a5; color: #ef4444; background: #fef2f2; }

  /* Empty slot */
  .add-slot {
    background: #fafafa; padding: 36px 24px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    cursor: pointer; border-right: 1px solid #f3f4f6; border-bottom: 1px solid #f3f4f6;
    min-height: 200px;
  }
  .add-slot:hover { background: #f5f7ff; }
  .add-slot-icon {
    width: 48px; height: 48px; border-radius: 50%; background: #f3f4f6;
    display: flex; align-items: center; justify-content: center;
    color: #c4c9d4; font-size: 22px; margin-bottom: 10px;
  }
  .add-slot:hover .add-slot-icon { background: #e8eaff; color: #6366f1; }
  .add-slot-label { font-size: 12px; font-weight: 600; color: #c4c9d4; letter-spacing: 0.2px; }
  .add-slot:hover .add-slot-label { color: #6366f1; }

  /* Modal */
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.2);
    z-index: 300; display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .modal {
    background: #fff; border-radius: 22px; width: 100%; max-width: 500px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.12); overflow: hidden;
  }
  .modal-head {
    padding: 28px 30px 22px; border-bottom: 1px solid #f3f4f6;
    display: flex; align-items: center; justify-content: space-between;
  }
  .modal-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 800; color: #111827; letter-spacing: -0.2px; }
  .modal-close {
    width: 32px; height: 32px; border-radius: 8px; border: 1px solid #ebebf0;
    background: #fff; cursor: pointer; display: flex; align-items: center;
    justify-content: center; color: #9ca3af; font-size: 16px;
  }
  .modal-close:hover { background: #f9fafb; color: #374151; }
  .modal-body { padding: 26px 30px; display: flex; flex-direction: column; gap: 18px; }

  .modal-avatar-row {
    display: flex; align-items: center; gap: 20px; margin-bottom: 4px;
  }
  .modal-avatar-wrap { position: relative; cursor: pointer; }
  .modal-avatar-wrap .avatar { margin-bottom: 0; }

  .field-label { font-size: 11px; font-weight: 600; color: #9ca3af; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.6px; }
  .modal-input {
    width: 100%; padding: 11px 14px; border: 1px solid #ebebf0;
    border-radius: 10px; outline: none; font-size: 14px;
    color: #374151; font-family: 'DM Sans', sans-serif;
  }
  .modal-input:focus { border-color: #111827; box-shadow: 0 0 0 3px rgba(17,24,39,0.06); }
  .modal-input::placeholder { color: #d1d5db; }
  .modal-select {
    width: 100%; padding: 11px 34px 11px 14px; border: 1px solid #ebebf0;
    border-radius: 10px; outline: none; font-size: 14px;
    color: #374151; font-family: 'DM Sans', sans-serif;
    background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14' fill='none'%3E%3Cpath d='M3 5l4 4 4-4' stroke='%23C4C9D4' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 10px center;
    appearance: none; cursor: pointer;
  }
  .modal-select:focus { border-color: #111827; }

  .dual-field { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .modal-foot {
    padding: 18px 30px; border-top: 1px solid #f3f4f6;
    display: flex; gap: 10px; justify-content: flex-end;
  }
  .cancel-btn {
    padding: 11px 22px; background: #fff; border: 1px solid #ebebf0;
    border-radius: 10px; color: #6b7280; font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .cancel-btn:hover { border-color: #d1d5db; color: #374151; }
  .confirm-btn {
    padding: 11px 24px; background: #111827; border: none;
    border-radius: 10px; color: #fff; font-size: 14px; font-weight: 700;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .confirm-btn:hover { background: #1f2937; }

  /* Save bar */
  .save-bar {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; margin-top: 24px;
  }
  .save-btn {
    padding: 14px 32px; background: #111827; border: none;
    border-radius: 12px; color: #fff; font-size: 14px; font-weight: 700;
    font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.1px;
  }
  .save-btn:hover { background: #1f2937; }

  /* No results */
  .no-results {
    padding: 64px 48px; text-align: center;
  }
  .no-results-icon { font-size: 40px; margin-bottom: 12px; }
  .no-results-text { font-size: 14px; color: #b0b7c3; }

  /* Color picker */
  .color-picker-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .color-dot {
    width: 26px; height: 26px; border-radius: 50%; cursor: pointer;
    border: 3px solid transparent;
  }
  .color-dot.active { border-color: #111827; }

  .file-input { display: none; }

  /* Stats row */
  .stats-row {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 28px;
  }
  .stat-card {
    background: #fff; border: 1px solid #ebebf0; border-radius: 16px;
    padding: 22px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }
  .stat-num {
    font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #111827; letter-spacing: -0.5px;
  }
  .stat-num span { color: #111827; }
  .stat-label { font-size: 12px; color: #b0b7c3; margin-top: 4px; letter-spacing: 0.1px; }
`;

function Avatar({ member, size = "md", onClick }) {
  const colors = AVATAR_COLORS[member.color % AVATAR_COLORS.length];
  const initials = member.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const cls = `avatar${size === "sm" ? " sm" : ""}`;
  return (
    <div
      className={cls}
      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      {member.avatar ? <img src={member.avatar} alt={member.name} /> : initials}
      {onClick && <div className="avatar-upload-overlay">Change<br/>Photo</div>}
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
    </svg>
  );
}
function GridIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor"/></svg>;
}
function ListIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="2" rx="1" fill="currentColor"/><rect x="1" y="7" width="14" height="2" rx="1" fill="currentColor"/><rect x="1" y="11" width="14" height="2" rx="1" fill="currentColor"/></svg>;
}

const TABS = ["Overview","Social Links","Team"];

let nextId = 100;

export default function SettingsTeam() {
  const [activeTab, setActiveTab] = useState("Team");
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [modal, setModal] = useState(null); // null | { mode: "add"|"edit", data }
  const [deleteId, setDeleteId] = useState(null);
  const fileRef = useRef(null);
  const editingAvatarIdRef = useRef(null);

  const DRAFT_DEFAULT = { name:"", role:"Managing Director", instagram:"", linkedin:"", color:0, avatar:null };
  const [draft, setDraft] = useState(DRAFT_DEFAULT);
  const setD = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const openAdd = () => { setDraft(DRAFT_DEFAULT); setModal({ mode:"add" }); };
  const openEdit = (m) => { setDraft({ ...m }); setModal({ mode:"edit" }); };
  const closeModal = () => setModal(null);

  const save = () => {
    if (!draft.name.trim()) return;
    if (modal.mode === "add") {
      setMembers(prev => [...prev, { ...draft, id: nextId++ }]);
    } else {
      setMembers(prev => prev.map(m => m.id === draft.id ? { ...draft } : m));
    }
    closeModal();
  };

  const remove = (id) => setMembers(prev => prev.filter(m => m.id !== id));

  const handleAvatarFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    if (editingAvatarIdRef.current === "draft") {
      setD("avatar", url);
    } else {
      setMembers(prev => prev.map(m => m.id === editingAvatarIdRef.current ? { ...m, avatar: url } : m));
    }
  };

  const triggerAvatar = (id) => {
    editingAvatarIdRef.current = id;
    fileRef.current?.click();
  };

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const uniqueRoles = ["All", ...Array.from(new Set(members.map(m => m.role)))];
  const roleCount = {};
  members.forEach(m => { roleCount[m.role] = (roleCount[m.role] || 0) + 1; });

  return (
    <>
      <style>{styles}</style>
      <input ref={fileRef} type="file" className="file-input" accept="image/*"
        onChange={e => handleAvatarFile(e.target.files[0])} />

      <div className="wrapper">
        <div className="container">

          <h1 className="page-title">Settings</h1>

          <div className="tabs">
            {TABS.map(t => (
              <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
            ))}
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-num"><span>{members.length}</span></div>
              <div className="stat-label">Total Members</div>
            </div>
            <div className="stat-card">
              <div className="stat-num"><span>{Object.keys(roleCount).length}</span></div>
              <div className="stat-label">Unique Roles</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">
                <span>{members.filter(m => m.instagram || m.linkedin).length}</span>
                <span style={{ fontSize:14, color:"#9ca3af", fontWeight:600 }}>/{members.length}</span>
              </div>
              <div className="stat-label">Have Social Links</div>
            </div>
          </div>

          <div className="main-layout">
            {/* Sidebar */}
            <div>
              <div className="sidebar-label">Basic Information</div>
              <div className="sidebar-desc">Add team members of your company</div>
            </div>

            {/* Team panel */}
            <div className="team-panel">
              {/* Header */}
              <div className="panel-header">
                <div className="member-count"><span>{members.length}</span> Members</div>
                <div className="header-right">
                  <button className="add-btn" onClick={openAdd}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Add Member
                  </button>
                  <div className="view-toggle">
                    <button className={`view-btn ${viewMode==="grid"?"active":""}`} onClick={() => setViewMode("grid")} title="Grid view"><GridIcon/></button>
                    <button className={`view-btn ${viewMode==="list"?"active":""}`} onClick={() => setViewMode("list")} title="List view"><ListIcon/></button>
                  </div>
                </div>
              </div>

              {/* Filter bar */}
              <div className="filter-bar">
                <div className="search-wrap">
                  <span className="search-icon">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="6" cy="6" r="4.5" stroke="#9CA3AF" strokeWidth="1.5"/>
                      <path d="M10 10l2.5 2.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <input className="search-input" placeholder="Search members…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                  {uniqueRoles.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              {/* Content */}
              {filtered.length === 0 ? (
                <div className="no-results">
                  <div className="no-results-icon">🔍</div>
                  <div className="no-results-text">No members match your search</div>
                </div>
              ) : viewMode === "grid" ? (
                <div className="members-grid">
                  {filtered.map(m => (
                    <div key={m.id} className="member-card">
                      <div className="card-actions">
                        <button className="action-btn" title="Edit" onClick={() => openEdit(m)}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button className="action-btn del" title="Remove" onClick={() => remove(m.id)}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                      <Avatar member={m} onClick={() => triggerAvatar(m.id)} />
                      <div className="card-name">{m.name}</div>
                      <div className="card-role">{m.role}</div>
                      <div className="card-socials">
                        {m.instagram && (
                          <a className="social-link" href={`https://instagram.com/${m.instagram}`} target="_blank" rel="noopener noreferrer" title="Instagram">
                            <InstagramIcon/>
                          </a>
                        )}
                        {m.linkedin && (
                          <a className="social-link" href={`https://linkedin.com/in/${m.linkedin}`} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                            <LinkedInIcon/>
                          </a>
                        )}
                        {!m.instagram && !m.linkedin && (
                          <span style={{ fontSize:11, color:"#d1d5db" }}>No links</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Add slot */}
                  <div className="add-slot" onClick={openAdd}>
                    <div className="add-slot-icon">+</div>
                    <div className="add-slot-label">Add Member</div>
                  </div>
                </div>
              ) : (
                <div className="members-list">
                  {filtered.map(m => (
                    <div key={m.id} className="member-row">
                      <Avatar member={m} size="sm" onClick={() => triggerAvatar(m.id)} />
                      <div className="row-info">
                        <div className="row-name">{m.name}</div>
                        <div className="row-role">{m.role}</div>
                      </div>
                      <div className="row-socials">
                        {m.instagram && (
                          <a className="social-link" href={`https://instagram.com/${m.instagram}`} target="_blank" rel="noopener noreferrer">
                            <InstagramIcon/>
                          </a>
                        )}
                        {m.linkedin && (
                          <a className="social-link" href={`https://linkedin.com/in/${m.linkedin}`} target="_blank" rel="noopener noreferrer">
                            <LinkedInIcon/>
                          </a>
                        )}
                      </div>
                      <div className="row-actions" style={{ opacity: undefined }}>
                        <button className="action-btn" onClick={() => openEdit(m)}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button className="action-btn del" onClick={() => remove(m.id)}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save bar */}
          <div className="save-bar">
            <button className="save-btn">Save Changes</button>
          </div>

        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">{modal.mode === "add" ? "Add Team Member" : "Edit Member"}</div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {/* Avatar + color picker */}
              <div className="modal-avatar-row">
                <div className="modal-avatar-wrap" onClick={() => triggerAvatar("draft")}>
                  <Avatar member={draft} />
                </div>
                <div>
                  <div className="field-label" style={{ marginBottom:8 }}>Avatar Color</div>
                  <div className="color-picker-row">
                    {AVATAR_COLORS.map((c, i) => (
                      <div
                        key={i}
                        className={`color-dot ${draft.color === i ? "active" : ""}`}
                        style={{ background: `linear-gradient(135deg, ${c[0]}, ${c[1]})` }}
                        onClick={() => { setD("color", i); setD("avatar", null); }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize:11, color:"#9ca3af", marginTop:6 }}>Or click avatar to upload photo</div>
                </div>
              </div>

              <div>
                <div className="field-label">Full Name</div>
                <input className="modal-input" placeholder="e.g. Jane Smith" value={draft.name}
                  onChange={e => setD("name", e.target.value)} />
              </div>

              <div>
                <div className="field-label">Role</div>
                <select className="modal-select" value={draft.role} onChange={e => setD("role", e.target.value)}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div className="dual-field">
                <div>
                  <div className="field-label">Instagram Handle</div>
                  <input className="modal-input" placeholder="username" value={draft.instagram}
                    onChange={e => setD("instagram", e.target.value.replace("@",""))} />
                </div>
                <div>
                  <div className="field-label">LinkedIn Slug</div>
                  <input className="modal-input" placeholder="profile-slug" value={draft.linkedin}
                    onChange={e => setD("linkedin", e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button className="confirm-btn" onClick={save} disabled={!draft.name.trim()}>
                {modal.mode === "add" ? "Add Member" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}