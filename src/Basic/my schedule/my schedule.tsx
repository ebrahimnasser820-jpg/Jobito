import { useState, useRef, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_LABEL = (h) => h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;

const CATEGORIES = [
    { id: "interview", label: "Interview Schedule", color: "#6366f1" },
    { id: "internal", label: "Internal Meeting", color: "#10b981" },
    { id: "team", label: "Team Schedule", color: "#f59e0b" },
    { id: "task", label: "My Task", color: "#8b5cf6" },
    { id: "reminder", label: "Reminders", color: "#ef4444" },
];

const EVENT_COLORS = {
    interview: { bg: "#ede9fe", border: "#6366f1", text: "#4338ca" },
    internal: { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
    team: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
    task: { bg: "#f3e8ff", border: "#8b5cf6", text: "#5b21b6" },
    reminder: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
};

const TODAY = new Date(2021, 10, 24); // Nov 24 2021 (matches screenshot)

const INITIAL_EVENTS = [
    { id: 1, title: "Interview session with Kathryn Murphy", category: "interview", date: new Date(2021, 10, 22), startH: 2, startM: 0, endH: 5, endM: 0, attendees: ["KM", "JD"] },
    { id: 2, title: "Interview sess...", category: "interview", date: new Date(2021, 10, 22), startH: 8, startM: 0, endH: 9, endM: 0, attendees: ["KM"] },
    { id: 3, title: "Meeting with s...", category: "internal", date: new Date(2021, 10, 23), startH: 9, startM: 0, endH: 10, endM: 30, attendees: ["AB"] },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }

  body { font-family:'DM Sans',sans-serif; background:#f0f2f8; min-height:100vh; }

  .app { display:flex; flex-direction:column; height:100vh; background:#f0f2f8; overflow:hidden; }

  /* ── Topbar ── */
  .topbar {
    display:flex; align-items:center; justify-content:space-between;
    background:#fff; border-bottom:1px solid #e8eaf0;
    padding:0 24px; height:56px; flex-shrink:0;
  }
  .brand { display:flex; align-items:center; gap:10px; }
  .brand-logo {
    width:32px; height:32px; border-radius:8px;
    background:linear-gradient(135deg,#10b981,#3b82f6);
    display:flex; align-items:center; justify-content:center;
    font-family:'Syne',sans-serif; font-weight:800; font-size:14px; color:#fff;
  }
  .brand-info { line-height:1.2; }
  .brand-company { font-size:10px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; }
  .brand-name {
    font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#111827;
    display:flex; align-items:center; gap:4px; cursor:pointer;
  }
  .topbar-right { display:flex; align-items:center; gap:12px; }
  .notif-btn {
    width:36px; height:36px; border-radius:10px; border:none; background:#f5f6fa;
    display:flex; align-items:center; justify-content:center; cursor:pointer; color:#6b7280; position:relative;
  }
  .notif-dot { position:absolute; top:7px; right:7px; width:7px; height:7px; background:#ef4444; border-radius:50%; border:2px solid #f5f6fa; }
  .post-job-btn {
    display:flex; align-items:center; gap:7px;
    padding:9px 18px; background:#6366f1; border:none; border-radius:10px;
    color:#fff; font-size:13px; font-weight:700; font-family:'DM Sans',sans-serif; cursor:pointer;
  }
  .post-job-btn:hover { background:#4f46e5; }

  /* ── Main layout ── */
  .main { display:flex; flex:1; overflow:hidden; }

  /* ── Sidebar ── */
  .sidebar {
    width:220px; background:#fff; border-right:1px solid #e8eaf0;
    display:flex; flex-direction:column; padding:16px; gap:16px; flex-shrink:0; overflow-y:auto;
  }
  .create-btn {
    display:flex; align-items:center; justify-content:center; gap:8px;
    width:100%; padding:10px; background:#fff; border:1.5px solid #e5e7eb;
    border-radius:10px; color:#374151; font-size:13px; font-weight:600;
    font-family:'DM Sans',sans-serif; cursor:pointer;
  }
  .create-btn:hover { border-color:#6366f1; color:#6366f1; background:#f5f3ff; }

  /* Mini calendar */
  .mini-cal {}
  .mini-cal-header {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:10px;
  }
  .mini-cal-title { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; color:#111827; text-transform:uppercase; letter-spacing:0.4px; }
  .mini-nav { display:flex; gap:2px; }
  .mini-nav-btn {
    width:22px; height:22px; border:none; background:none; cursor:pointer;
    border-radius:5px; color:#9ca3af; display:flex; align-items:center; justify-content:center; font-size:12px;
  }
  .mini-nav-btn:hover { background:#f3f4f6; color:#374151; }
  .mini-cal-days {
    display:grid; grid-template-columns:repeat(7,1fr); gap:1px;
    text-align:center;
  }
  .mini-day-label { font-size:10px; color:#9ca3af; font-weight:600; padding:3px 0; }
  .mini-day {
    font-size:11px; color:#374151; padding:4px 2px; border-radius:5px;
    cursor:pointer; text-align:center; font-weight:500;
  }
  .mini-day:hover { background:#f3f4f6; }
  .mini-day.today { background:#6366f1; color:#fff; border-radius:50%; font-weight:700; }
  .mini-day.selected { background:#ede9fe; color:#6366f1; font-weight:700; }
  .mini-day.other-month { color:#d1d5db; }
  .mini-day.has-event { position:relative; }
  .mini-day.has-event::after { content:''; position:absolute; bottom:1px; left:50%; transform:translateX(-50%); width:4px; height:4px; border-radius:50%; background:#6366f1; }
  .mini-day.today.has-event::after { background:#fff; }

  /* Categories */
  .cats-header {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:8px;
  }
  .cats-title { font-size:12px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.4px; }
  .add-cat-btn { font-size:11px; color:#6366f1; background:none; border:none; cursor:pointer; font-weight:600; }
  .cat-item { display:flex; align-items:center; gap:9px; padding:5px 0; cursor:pointer; }
  .cat-check {
    width:16px; height:16px; border-radius:4px; border:2px solid #e5e7eb;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .cat-check.checked { border-color:transparent; }
  .cat-label { font-size:12px; color:#374151; font-weight:500; }

  /* ── Calendar area ── */
  .cal-area { flex:1; display:flex; flex-direction:column; overflow:hidden; }

  /* Cal header */
  .cal-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 20px; background:#fff; border-bottom:1px solid #e8eaf0; flex-shrink:0;
  }
  .cal-title-row { display:flex; align-items:center; gap:12px; }
  .cal-title { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; color:#111827; }
  .today-btn {
    padding:6px 14px; background:#f0f2f8; border:none; border-radius:8px;
    font-size:12px; font-weight:700; color:#374151; cursor:pointer; font-family:'DM Sans',sans-serif;
  }
  .today-btn:hover { background:#e5e7eb; }

  .cal-nav { display:flex; align-items:center; gap:12px; }
  .nav-btn {
    width:30px; height:30px; border:1.5px solid #e5e7eb; border-radius:8px;
    background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#6b7280;
  }
  .nav-btn:hover { border-color:#6366f1; color:#6366f1; }
  .cal-period { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#111827; min-width:140px; text-align:center; text-transform:uppercase; letter-spacing:0.3px; }

  .view-tabs { display:flex; border:1.5px solid #e5e7eb; border-radius:9px; overflow:hidden; }
  .view-tab {
    padding:7px 14px; font-size:12px; font-weight:600; color:#6b7280;
    background:#fff; border:none; cursor:pointer; font-family:'DM Sans',sans-serif;
  }
  .view-tab:hover { background:#f3f4f6; }
  .view-tab.active { background:#6366f1; color:#fff; }

  /* Week grid */
  .week-grid-wrap { flex:1; display:flex; flex-direction:column; overflow:hidden; }

  /* Day headers */
  .week-days-header {
    display:grid; background:#fff; border-bottom:1px solid #e8eaf0; flex-shrink:0;
    padding-left:60px;
  }
  .week-day-col {
    text-align:center; padding:10px 6px;
    border-left:1px solid #e8eaf0;
  }
  .week-day-label { font-size:11px; color:#9ca3af; font-weight:600; text-transform:uppercase; letter-spacing:0.3px; }
  .week-day-num {
    font-family:'Syne',sans-serif; font-size:20px; font-weight:800; color:#374151;
    width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:4px auto 0;
  }
  .week-day-num.today { background:#6366f1; color:#fff; }
  .week-day-num.holiday { background:#fee2e2; color:#ef4444; }
  .holiday-badge { font-size:9px; font-weight:700; color:#ef4444; text-transform:uppercase; letter-spacing:0.3px; margin-top:2px; }

  /* Scrollable time grid */
  .time-grid-scroll { flex:1; overflow-y:auto; position:relative; }
  .time-grid {
    display:grid; position:relative; min-height:1200px;
    padding-left:60px;
  }
  .time-col-header {
    position:absolute; left:0; top:0; width:60px; height:100%;
  }
  .time-label {
    position:absolute; left:0; width:56px; text-align:right;
    font-size:10px; color:#9ca3af; font-weight:600;
    transform:translateY(-50%); padding-right:8px;
  }
  .time-line {
    position:absolute; left:60px; right:0; height:1px; background:#f3f4f6;
  }
  .day-col {
    border-left:1px solid #e8eaf0;
    position:relative;
  }
  .day-col.today-col { background:#fafbff; }
  .day-col.holiday-col { background:#fff5f5; }

  /* Current time line */
  .now-line {
    position:absolute; left:0; right:0; height:2px; background:#6366f1; z-index:10;
  }
  .now-dot {
    position:absolute; left:-4px; top:-4px; width:10px; height:10px;
    border-radius:50%; background:#6366f1;
  }

  /* Events */
  .event-block {
    position:absolute; left:4px; right:4px; border-radius:8px;
    padding:6px 8px; cursor:pointer; overflow:hidden;
    border-left:3px solid; z-index:5;
  }
  .event-block:hover { filter:brightness(0.96); }
  .event-title { font-size:11px; font-weight:700; line-height:1.3; }
  .event-time { font-size:10px; opacity:0.7; margin-top:2px; }
  .event-avatars { display:flex; margin-top:4px; }
  .event-avatar {
    width:18px; height:18px; border-radius:50%; border:2px solid #fff;
    background:#6366f1; color:#fff; font-size:8px; font-weight:700;
    display:flex; align-items:center; justify-content:center; margin-left:-4px;
  }
  .event-avatar:first-child { margin-left:0; }

  /* GMT label */
  .gmt-label {
    position:absolute; left:0; width:60px; top:0; font-size:9px; color:#9ca3af;
    font-weight:600; padding:8px 4px; text-align:center; letter-spacing:0.3px;
  }

  /* ── Day view ── */
  .day-header { display:grid; grid-template-columns: 60px 1fr; background:#fff; border-bottom:1px solid #e8eaf0; padding:10px 0; }
  .day-col-single { border-left:1px solid #e8eaf0; text-align:center; padding:0 12px; }

  /* ── Month view ── */
  .month-grid { flex:1; display:grid; grid-template-columns:repeat(7,1fr); grid-auto-rows:1fr; border-top:1px solid #e8eaf0; overflow-y:auto; }
  .month-day-header { text-align:center; padding:8px; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.3px; border-bottom:1px solid #e8eaf0; background:#fff; }
  .month-cell {
    border-right:1px solid #e8eaf0; border-bottom:1px solid #e8eaf0;
    padding:8px; min-height:100px; cursor:pointer; background:#fff;
  }
  .month-cell:hover { background:#fafbff; }
  .month-cell.today-cell { background:#f5f3ff; }
  .month-cell.other-month-cell { background:#fafafa; }
  .month-num {
    font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#374151;
    width:26px; height:26px; display:flex; align-items:center; justify-content:center;
    border-radius:50%; margin-bottom:4px;
  }
  .month-num.today-num { background:#6366f1; color:#fff; }
  .month-event-pill {
    font-size:10px; font-weight:600; border-radius:4px; padding:2px 6px;
    margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    cursor:pointer;
  }
  .month-more { font-size:10px; color:#9ca3af; font-weight:600; padding:2px 4px; }

  /* ── Modal ── */
  .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.25); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
  .modal { background:#fff; border-radius:18px; width:100%; max-width:420px; box-shadow:0 20px 60px rgba(0,0,0,0.15); overflow:hidden; }
  .modal-head { padding:20px 22px 16px; border-bottom:1px solid #f3f4f6; display:flex; align-items:center; justify-content:space-between; }
  .modal-title { font-family:'Syne',sans-serif; font-size:16px; font-weight:800; color:#111827; }
  .modal-close { width:28px; height:28px; border:1px solid #e5e7eb; border-radius:7px; background:#fff; cursor:pointer; font-size:15px; color:#9ca3af; display:flex; align-items:center; justify-content:center; }
  .modal-close:hover { color:#374151; }
  .modal-body { padding:18px 22px; display:flex; flex-direction:column; gap:13px; }
  .m-label { font-size:11px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:5px; }
  .m-input { width:100%; padding:10px 12px; border:1.5px solid #e5e7eb; border-radius:9px; outline:none; font-size:13px; font-family:'DM Sans',sans-serif; color:#374151; }
  .m-input:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); }
  .m-input::placeholder { color:#d1d5db; }
  .m-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .cat-picker { display:flex; gap:6px; flex-wrap:wrap; }
  .cat-pill {
    padding:5px 12px; border-radius:99px; font-size:11px; font-weight:700;
    cursor:pointer; border:2px solid transparent; opacity:0.6;
  }
  .cat-pill.selected { opacity:1; border-color:currentColor; }
  .modal-foot { padding:14px 22px; border-top:1px solid #f3f4f6; display:flex; gap:8px; justify-content:flex-end; }
  .m-cancel { padding:9px 18px; background:#fff; border:1.5px solid #e5e7eb; border-radius:9px; color:#374151; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer; }
  .m-save { padding:9px 20px; background:#6366f1; border:none; border-radius:9px; color:#fff; font-size:13px; font-weight:700; font-family:'DM Sans',sans-serif; cursor:pointer; }
  .m-save:hover { background:#4f46e5; }
  .m-delete { padding:9px 18px; background:#fff; border:1.5px solid #fca5a5; border-radius:9px; color:#ef4444; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer; }
  .m-delete:hover { background:#fef2f2; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const startOfWeek = (d) => { const r = new Date(d); r.setDate(d.getDate() - d.getDay()); r.setHours(0, 0, 0, 0); return r; };
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const HOUR_H = 50; // px per hour
const timeToY = (h, m) => (h + m / 60) * HOUR_H;

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ current, selected, onSelect, events }) {
    const [viewing, setViewing] = useState(new Date(current.getFullYear(), current.getMonth(), 1));
    const year = viewing.getFullYear(), month = viewing.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push({ d: new Date(year, month, -firstDay + 1 + i), other: true });
    for (let i = 1; i <= daysInMonth; i++) cells.push({ d: new Date(year, month, i), other: false });
    while (cells.length < 42) cells.push({ d: new Date(year, month + 1, cells.length - firstDay - daysInMonth + 1), other: true });

    const hasEvent = (d) => events.some(e => sameDay(e.date, d));

    return (
        <div className="mini-cal">
            <div className="mini-cal-header">
                <div className="mini-cal-title">{MONTH_SHORT[month]} {year}</div>
                <div className="mini-nav">
                    <button className="mini-nav-btn" onClick={() => setViewing(new Date(year, month - 1, 1))}>‹</button>
                    <button className="mini-nav-btn" onClick={() => setViewing(new Date(year, month + 1, 1))}>›</button>
                </div>
            </div>
            <div className="mini-cal-days">
                {DAYS.map(d => <div key={d} className="mini-day-label">{d[0]}</div>)}
                {cells.map(({ d, other }, i) => (
                    <div
                        key={i}
                        className={`mini-day ${other ? "other-month" : ""} ${sameDay(d, TODAY) ? "today" : ""} ${selected && sameDay(d, selected) && !sameDay(d, TODAY) ? "selected" : ""} ${hasEvent(d) ? "has-event" : ""}`}
                        onClick={() => onSelect(d)}
                    >
                        {d.getDate()}
                    </div>
                ))}
            </div>
        </div>
    );
}

function EventBlock({ event, colW, onClick }) {
    const c = EVENT_COLORS[event.category] || EVENT_COLORS.interview;
    const top = timeToY(event.startH, event.startM);
    const height = Math.max(timeToY(event.endH, event.endM) - top, 24);
    return (
        <div
            className="event-block"
            style={{ top, height, background: c.bg, borderLeftColor: c.border, color: c.text }}
            onClick={(e) => { e.stopPropagation(); onClick(event); }}
        >
            <div className="event-title">{event.title}</div>
            {height > 40 && <div className="event-time">{String(event.startH).padStart(2, "0")}:{String(event.startM).padStart(2, "0")} – {String(event.endH).padStart(2, "0")}:{String(event.endM).padStart(2, "0")}</div>}
            {height > 60 && event.attendees?.length > 0 && (
                <div className="event-avatars">
                    {event.attendees.slice(0, 3).map((a, i) => (
                        <div key={i} className="event-avatar">{a[0]}</div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MySchedule() {
    const [view, setView] = useState("week");
    const [currentDate, setCurrentDate] = useState(TODAY);
    const [selectedDate, setSelectedDate] = useState(TODAY);
    const [events, setEvents] = useState(INITIAL_EVENTS);
    const [activeCats, setActiveCats] = useState(new Set(CATEGORIES.map(c => c.id)));
    const [modal, setModal] = useState(null); // null | { mode:'create'|'edit', data }
    const [draft, setDraft] = useState({});
    const timeGridRef = useRef(null);
    let nextId = useRef(10);

    // Scroll to 1am on mount
    useEffect(() => {
        if (timeGridRef.current) timeGridRef.current.scrollTop = HOUR_H;
    }, []);

    const setD = (k, v) => setDraft(d => ({ ...d, [k]: v }));

    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const navigate = (dir) => {
        if (view === "week") setCurrentDate(d => addDays(d, dir * 7));
        else if (view === "day") setCurrentDate(d => addDays(d, dir));
        else {
            setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + dir, 1));
        }
    };

    const periodLabel = () => {
        if (view === "week") return `${MONTH_SHORT[weekStart.getMonth()].toUpperCase()} ${weekStart.getFullYear()}`;
        if (view === "day") return `${MONTHS[currentDate.getMonth()].toUpperCase()} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
        return `${MONTHS[currentDate.getMonth()].toUpperCase()} ${currentDate.getFullYear()}`;
    };

    const filteredEvents = events.filter(e => activeCats.has(e.category));

    const openCreate = (date, startH = 9) => {
        setDraft({ title: "", category: "interview", date: date || selectedDate, startH, startM: 0, endH: startH + 1, endM: 0 });
        setModal({ mode: "create" });
    };
    const openEdit = (ev) => { setDraft({ ...ev }); setModal({ mode: "edit" }); };
    const closeModal = () => setModal(null);

    const saveEvent = () => {
        if (!draft.title?.trim()) return;
        if (modal.mode === "create") {
            setEvents(prev => [...prev, { ...draft, id: nextId.current++ }]);
        } else {
            setEvents(prev => prev.map(e => e.id === draft.id ? { ...draft } : e));
        }
        closeModal();
    };
    const deleteEvent = () => {
        setEvents(prev => prev.filter(e => e.id !== draft.id));
        closeModal();
    };

    const HOLIDAYS = [new Date(2021, 10, 27)]; // Nov 27 holiday
    const isHoliday = (d) => HOLIDAYS.some(h => sameDay(h, d));

    // ── Time grid render ──
    const renderTimeGrid = (days) => {
        const colCount = days.length;
        return (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Day headers */}
                <div style={{ display: "grid", gridTemplateColumns: `60px repeat(${colCount},1fr)`, background: "#fff", borderBottom: "1px solid #e8eaf0", flexShrink: 0 }}>
                    <div style={{ borderRight: "1px solid #e8eaf0" }} />
                    {days.map((d, i) => (
                        <div key={i} className="week-day-col" onClick={() => { setSelectedDate(d); setView("day"); }}>
                            <div className="week-day-label">{DAYS[d.getDay()]}</div>
                            <div className={`week-day-num ${sameDay(d, TODAY) ? "today" : ""} ${isHoliday(d) ? "holiday" : ""}`}>{d.getDate()}</div>
                            {isHoliday(d) && <div className="holiday-badge">Holiday</div>}
                        </div>
                    ))}
                </div>

                {/* Scrollable grid */}
                <div ref={timeGridRef} className="time-grid-scroll">
                    <div className="gmt-label">GMT +07</div>
                    <div style={{ display: "grid", gridTemplateColumns: `60px repeat(${colCount},1fr)`, position: "relative", height: HOUR_H * 24 + "px" }}>
                        {/* Time labels + lines */}
                        {HOURS.map(h => (
                            <>
                                <div key={`lbl-${h}`} className="time-label" style={{ top: h * HOUR_H + "px" }}>{HOUR_LABEL(h)}</div>
                                <div key={`ln-${h}`} className="time-line" style={{ top: h * HOUR_H + "px", left: "60px" }} />
                            </>
                        ))}

                        {/* Day columns */}
                        {days.map((d, i) => {
                            const dayEvts = filteredEvents.filter(e => sameDay(e.date, d));
                            return (
                                <div
                                    key={i}
                                    className={`day-col ${sameDay(d, TODAY) ? "today-col" : ""} ${isHoliday(d) ? "holiday-col" : ""}`}
                                    style={{ gridColumn: i + 2, gridRow: "1", position: "relative", height: "100%" }}
                                    onClick={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const relY = e.clientY - rect.top + timeGridRef.current.scrollTop;
                                        const h = Math.floor(relY / HOUR_H);
                                        openCreate(d, Math.max(0, Math.min(23, h)));
                                    }}
                                >
                                    {/* Now line */}
                                    {sameDay(d, TODAY) && (
                                        <div className="now-line" style={{ top: timeToY(new Date().getHours(), new Date().getMinutes()) }}>
                                            <div className="now-dot" />
                                        </div>
                                    )}
                                    {dayEvts.map(ev => <EventBlock key={ev.id} event={ev} onClick={openEdit} />)}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // ── Month view ──
    const renderMonth = () => {
        const year = currentDate.getFullYear(), month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push({ d: new Date(year, month, -firstDay + 1 + i), other: true });
        for (let i = 1; i <= daysInMonth; i++) cells.push({ d: new Date(year, month, i), other: false });
        while (cells.length % 7 !== 0) cells.push({ d: new Date(year, month + 1, cells.length - firstDay - daysInMonth + 1), other: true });

        return (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", background: "#fff", borderBottom: "1px solid #e8eaf0" }}>
                    {DAYS.map(d => <div key={d} className="month-day-header">{d}</div>)}
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gridAutoRows: "minmax(90px,1fr)", overflowY: "auto" }}>
                    {cells.map(({ d, other }, i) => {
                        const dayEvts = filteredEvents.filter(e => sameDay(e.date, d));
                        return (
                            <div key={i} className={`month-cell ${other ? "other-month-cell" : ""} ${sameDay(d, TODAY) ? "today-cell" : ""}`} onClick={() => { setSelectedDate(d); setView("day"); }}>
                                <div className={`month-num ${sameDay(d, TODAY) ? "today-num" : ""}`}>{d.getDate()}</div>
                                {dayEvts.slice(0, 3).map(ev => {
                                    const c = EVENT_COLORS[ev.category];
                                    return <div key={ev.id} className="month-event-pill" style={{ background: c.bg, color: c.text }} onClick={e => { e.stopPropagation(); openEdit(ev); }}>{ev.title}</div>;
                                })}
                                {dayEvts.length > 3 && <div className="month-more">+{dayEvts.length - 3} more</div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <>
            <style>{styles}</style>
            <div className="app">

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

                <div className="main">
                    {/* Sidebar */}
                    <div className="sidebar">
                        <button className="create-btn" onClick={() => openCreate(selectedDate)}>
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                            Create Event
                        </button>

                        <MiniCalendar current={TODAY} selected={selectedDate} onSelect={(d) => { setSelectedDate(d); setCurrentDate(d); }} events={events} />

                        <div>
                            <div className="cats-header">
                                <div className="cats-title">Categories</div>
                                <button className="add-cat-btn">+ Add Category</button>
                            </div>
                            {CATEGORIES.map(cat => (
                                <div key={cat.id} className="cat-item" onClick={() => {
                                    setActiveCats(prev => {
                                        const n = new Set(prev);
                                        n.has(cat.id) ? n.delete(cat.id) : n.add(cat.id);
                                        return n;
                                    });
                                }}>
                                    <div className="cat-check" style={{ background: activeCats.has(cat.id) ? cat.color : "transparent", borderColor: activeCats.has(cat.id) ? cat.color : "#e5e7eb" }}>
                                        {activeCats.has(cat.id) && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                    </div>
                                    <div className="cat-label">{cat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Calendar area */}
                    <div className="cal-area">
                        {/* Header */}
                        <div className="cal-header">
                            <div className="cal-title-row">
                                <div className="cal-title">My Schedule</div>
                                <button className="today-btn" onClick={() => { setCurrentDate(TODAY); setSelectedDate(TODAY); }}>Today</button>
                            </div>
                            <div className="cal-nav">
                                <button className="nav-btn" onClick={() => navigate(-1)}>‹</button>
                                <div className="cal-period">{periodLabel()}</div>
                                <button className="nav-btn" onClick={() => navigate(1)}>›</button>
                            </div>
                            <div className="view-tabs">
                                {["day", "week", "month"].map(v => (
                                    <button key={v} className={`view-tab ${view === v ? "active" : ""}`} onClick={() => setView(v)}>
                                        {v.charAt(0).toUpperCase() + v.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {view === "week" && renderTimeGrid(weekDays)}
                        {view === "day" && renderTimeGrid([selectedDate])}
                        {view === "month" && renderMonth()}
                    </div>
                </div>
            </div>

            {/* Event modal */}
            {modal && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="modal-title">{modal.mode === "create" ? "New Event" : "Edit Event"}</div>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div>
                                <div className="m-label">Event Title</div>
                                <input className="m-input" placeholder="e.g. Interview with John Doe" value={draft.title || ""} onChange={e => setD("title", e.target.value)} />
                            </div>
                            <div>
                                <div className="m-label">Category</div>
                                <div className="cat-picker">
                                    {CATEGORIES.map(c => {
                                        const col = EVENT_COLORS[c.id];
                                        return (
                                            <div key={c.id} className={`cat-pill ${draft.category === c.id ? "selected" : ""}`}
                                                style={{ background: col.bg, color: col.text }}
                                                onClick={() => setD("category", c.id)}
                                            >
                                                {c.label.split(" ")[0]}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="m-row">
                                <div>
                                    <div className="m-label">Start Time</div>
                                    <input className="m-input" type="number" min="0" max="23" value={draft.startH || 0} onChange={e => setD("startH", +e.target.value)} />
                                </div>
                                <div>
                                    <div className="m-label">End Time</div>
                                    <input className="m-input" type="number" min="0" max="23" value={draft.endH || 1} onChange={e => setD("endH", +e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <div className="m-label">Date</div>
                                <input className="m-input" type="date"
                                    value={draft.date ? `${draft.date.getFullYear()}-${String(draft.date.getMonth() + 1).padStart(2, "0")}-${String(draft.date.getDate()).padStart(2, "0")}` : ""}
                                    onChange={e => { const [y, m, d] = e.target.value.split("-"); setD("date", new Date(+y, +m - 1, +d)); }}
                                />
                            </div>
                        </div>
                        <div className="modal-foot">
                            {modal.mode === "edit" && <button className="m-delete" onClick={deleteEvent}>Delete</button>}
                            <button className="m-cancel" onClick={closeModal}>Cancel</button>
                            <button className="m-save" onClick={saveEvent}>{modal.mode === "create" ? "Create" : "Save"}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}