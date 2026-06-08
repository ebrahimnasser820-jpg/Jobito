import { useState, useEffect, useRef } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────
const VIEW_DATA = {
  "7d":  [120, 280, 190, 420, 310, 550, 243],
  "30d": [80, 150, 200, 130, 400, 320, 290, 410, 380, 500, 460, 390, 420, 480, 510, 430, 350, 460, 520, 480, 410, 560, 490, 440, 380, 520, 600, 540, 480, 243],
  "90d": Array.from({length:90},(_,i)=>Math.floor(100+Math.random()*500)),
};
const DATE_LABELS = {
  "7d":  ["19 يوليو","20 يوليو","21 يوليو","22 يوليو","23 يوليو","24 يوليو","25 يوليو"],
  "30d": Array.from({length:30},(_,i)=>`${i+1} يوليو`),
  "90d": Array.from({length:90},(_,i)=>`${i+1}`),
};

const TRAFFIC = [
  { label:"مباشر",  pct:48, color:"#f59e0b" },
  { label:"محركات بحث", pct:24, color:"#6366f1" },
  { label:"سوشيال",  pct:23, color:"#06b6d4" },
  { label:"أخرى",   pct:5,  color:"#10b981" },
];

const COUNTRIES = [
  { name:"الولايات المتحدة",         flag:"🇺🇸", visitors:3240, bar:100 },
  { name:"فرنسا",      flag:"🇫🇷", visitors:3188, bar:98 },
  { name:"إيطاليا",       flag:"🇮🇹", visitors:2938, bar:91 },
  { name:"ألمانيا",     flag:"🇩🇪", visitors:2624, bar:81 },
  { name:"اليابان",       flag:"🇯🇵", visitors:2414, bar:74 },
  { name:"هولندا", flag:"🇳🇱", visitors:1226, bar:38 },
  { name:"بريطانيا",          flag:"🇬🇧", visitors:1108, bar:34 },
  { name:"كندا",      flag:"🇨🇦", visitors:987,  bar:30 },
];

const APPLIED_DATA = {
  "7d":  [12, 28, 19, 42, 18, 13, 0],
  "30d": [8, 15, 20, 13, 40, 32, 29, 41, 8, 50, 46, 39, 42, 48, 51, 43, 35, 46, 52, 48, 41, 56, 49, 44, 38, 52, 60, 54, 48, 0],
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'DM Sans',sans-serif; background:#f5f6fa; min-height:100vh; }

  .page { min-height:100vh; background:#f5f6fa; display:flex; flex-direction:column; }

  /* Topbar */
  .topbar {
    display:flex; align-items:center; justify-content:space-between;
    background:#fff; border-bottom:1px solid #e8eaf0;
    padding:0 28px; height:56px; flex-shrink:0;
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
  .brand-name { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#111827; display:flex; align-items:center; gap:4px; cursor:pointer; }
  .topbar-right { display:flex; align-items:center; gap:12px; }
  .notif-btn { width:36px; height:36px; border-radius:10px; border:none; background:#f5f6fa; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#6b7280; position:relative; }
  .notif-dot { position:absolute; top:7px; right:7px; width:7px; height:7px; background:#ef4444; border-radius:50%; border:2px solid #f5f6fa; }
  .post-job-btn { display:flex; align-items:center; gap:7px; padding:9px 18px; background:#6366f1; border:none; border-radius:10px; color:#fff; font-size:13px; font-weight:700; font-family:'DM Sans',sans-serif; cursor:pointer; }
  .post-job-btn:hover { background:#4f46e5; }

  /* Content */
  .content { max-width:1100px; margin:0 auto; padding:28px 24px 60px; width:100%; }

  /* Job header */
  .job-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; }
  .job-back { display:flex; align-items:center; gap:8px; color:#6b7280; font-size:13px; cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; margin-bottom:8px; padding:0; }
  .job-back:hover { color:#111827; }
  .job-title { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; color:#111827; margin-bottom:5px; }
  .job-meta { display:flex; align-items:center; gap:6px; font-size:13px; color:#6b7280; }
  .job-meta-dot { color:#d1d5db; }
  .hired-badge { color:#6366f1; font-weight:700; }
  .more-action-btn {
    display:flex; align-items:center; gap:6px;
    padding:9px 16px; background:#fff; border:1.5px solid #e5e7eb; border-radius:10px;
    color:#374151; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer;
  }
  .more-action-btn:hover { border-color:#6366f1; color:#6366f1; }

  /* Tabs */
  .tabs { display:flex; border-bottom:2px solid #e5e7eb; margin-bottom:24px; }
  .tab { padding:10px 20px; font-size:13px; font-weight:600; color:#9ca3af; background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; position:relative; }
  .tab:hover { color:#374151; }
  .tab.active { color:#6366f1; }
  .tab.active::after { content:''; position:absolute; bottom:-2px; left:0; right:0; height:2px; background:#6366f1; border-radius:2px 2px 0 0; }

  /* Dashboard grid */
  .dashboard { display:grid; grid-template-columns:1fr 1fr 340px; grid-template-rows:auto auto 1fr; gap:16px; }

  /* Cards */
  .card { background:#fff; border:1px solid #ebebf0; border-radius:16px; padding:20px 24px; }
  .card-sm { padding:18px 20px; }

  /* Stat cards */
  .stat-card { position:relative; }
  .stat-icon { position:absolute; top:18px; right:18px; width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; }
  .stat-label { font-size:12px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.4px; margin-bottom:10px; }
  .stat-value { font-family:'Syne',sans-serif; font-size:32px; font-weight:800; color:#111827; letter-spacing:-1px; display:flex; align-items:baseline; gap:8px; }
  .stat-change { font-size:13px; font-weight:700; display:flex; align-items:center; gap:3px; }
  .stat-change.up { color:#10b981; }
  .stat-change.down { color:#ef4444; }
  .stat-vs { font-size:12px; color:#9ca3af; margin-top:4px; }

  /* Line chart */
  .chart-card { grid-column:1/3; }
  .chart-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .chart-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#111827; }
  .range-select {
    display:flex; align-items:center; gap:6px;
    padding:7px 12px; background:#f9fafb; border:1.5px solid #e5e7eb; border-radius:9px;
    font-size:12px; font-weight:600; color:#374151; cursor:pointer;
    font-family:'DM Sans',sans-serif; position:relative;
  }
  .range-options { position:absolute; top:calc(100%+6px); right:0; background:#fff; border:1px solid #e5e7eb; border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,0.1); z-index:50; overflow:hidden; min-width:120px; }
  .range-option { padding:9px 14px; font-size:13px; color:#374151; cursor:pointer; }
  .range-option:hover { background:#f5f3ff; color:#6366f1; }
  .range-option.active { color:#6366f1; font-weight:700; }

  svg.line-chart { width:100%; overflow:visible; }
  .chart-tooltip {
    position:absolute; background:#1f2937; color:#fff;
    border-radius:10px; padding:8px 12px; font-size:12px; pointer-events:none;
    white-space:nowrap; box-shadow:0 4px 16px rgba(0,0,0,0.2);
  }
  .tooltip-label { font-size:10px; color:#9ca3af; margin-bottom:2px; }
  .tooltip-value { font-family:'Syne',sans-serif; font-size:16px; font-weight:800; color:#fff; }
  .chart-wrap { position:relative; }

  /* Donut */
  .donut-card { grid-column:3; grid-row:1/3; }
  .donut-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#111827; margin-bottom:16px; }
  .donut-wrap { position:relative; display:flex; align-items:center; justify-content:center; margin-bottom:20px; }
  .donut-center { position:absolute; text-align:center; }
  .donut-center-val { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; color:#111827; }
  .donut-center-label { font-size:10px; color:#9ca3af; font-weight:600; text-transform:uppercase; letter-spacing:0.3px; }
  .traffic-legend { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .legend-item { display:flex; align-items:center; gap:7px; font-size:12px; color:#374151; }
  .legend-dot { width:10px; height:10px; border-radius:3px; flex-shrink:0; }
  .legend-pct { font-weight:700; color:#111827; }

  /* Country list */
  .country-card { grid-column:3; }ظ
  .country-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#111827; margin-bottom:14px; }
  .country-row { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
  .country-row:last-child { margin-bottom:0; }
  .country-flag { font-size:18px; width:24px; text-align:center; flex-shrink:0; }
  .country-name { font-size:13px; color:#374151; font-weight:500; flex:1; }
  .country-bar-wrap { width:60px; height:4px; background:#f3f4f6; border-radius:99px; flex-shrink:0; }
  .country-bar { height:100%; background:#6366f1; border-radius:99px; }
  .country-val { font-size:12px; font-weight:700; color:#374151; min-width:38px; text-align:right; }

  /* Applicant timeline */
  .timeline-card { grid-column:1/3; }
  .timeline-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .timeline-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#111827; }
  .applicant-stages { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-top:4px; }
  .stage-item { background:#f9fafb; border-radius:12px; padding:14px 16px; }
  .stage-label { font-size:11px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.3px; margin-bottom:6px; }
  .stage-count { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; color:#111827; }
  .stage-bar { height:3px; border-radius:99px; margin-top:8px; }
`;

// ── Line Chart ─────────────────────────────────────────────────────────────────
function LineChart({ data, labels, color="#10b981", height=200 }) {
  const [tooltip, setTooltip] = useState(null);
  const [hovIdx, setHovIdx] = useState(null);
  const wrapRef = useRef(null);

  const max = Math.max(...data, 1);
  const padL=40, padR=20, padT=20, padB=30;
  const W=600, H=height;
  const chartW = W-padL-padR, chartH = H-padT-padB;

  const pts = data.map((v,i) => ({
    x: padL + (i/(data.length-1))*chartW,
    y: padT + chartH - (v/max)*chartH,
    v, label: labels[i],
  }));

  const pathD = pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(" ");
  const areaD = pathD + ` L${pts[pts.length-1].x},${padT+chartH} L${pts[0].x},${padT+chartH} Z`;

  const yTicks = [0, max*0.25, max*0.5, max*0.75, max].reverse().map(v=>Math.round(v));

  const handleMouse = (e) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = (e.clientX - rect.left) / rect.width * W;
    let best=0, bestDist=Infinity;
    pts.forEach((p,i)=>{ const d=Math.abs(p.x-relX); if(d<bestDist){bestDist=d;best=i;}});
    setHovIdx(best);
    setTooltip({ x: pts[best].x / W * 100, y: pts[best].y / H * 100, v: pts[best].v, label: pts[best].label });
  };

  return (
    <div className="chart-wrap" ref={wrapRef} onMouseMove={handleMouse} onMouseLeave={()=>{setTooltip(null);setHovIdx(null);}}>
      <svg className="line-chart" viewBox={`0 0 ${W} ${H}`} style={{height}}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* Y grid */}
        {yTicks.map((t,i) => {
          const y = padT + chartH - (t/max)*chartH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W-padR} y2={y} stroke="#f3f4f6" strokeWidth="1"/>
              <text x={padL-6} y={y+4} textAnchor="end" fontSize="10" fill="#c4c9d4" fontFamily="DM Sans">{t}</text>
            </g>
          );
        })}
        {/* X labels — show subset */}
        {pts.filter((_,i) => data.length<=7 || i%(Math.ceil(data.length/7))===0).map((p,i)=>(
          <text key={i} x={p.x} y={H-4} textAnchor="middle" fontSize="10" fill="#c4c9d4" fontFamily="DM Sans">{p.label}</text>
        ))}
        {/* Area fill */}
        <path d={areaD} fill="url(#chartGrad)"/>
        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Hover point */}
        {hovIdx !== null && (
          <>
            <line x1={pts[hovIdx].x} y1={padT} x2={pts[hovIdx].x} y2={padT+chartH} stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="4"/>
            <circle cx={pts[hovIdx].x} cy={pts[hovIdx].y} r="6" fill="#fff" stroke={color} strokeWidth="2.5"/>
            <circle cx={pts[hovIdx].x} cy={pts[hovIdx].y} r="3" fill={color}/>
          </>
        )}
      </svg>
      {tooltip && (
        <div className="chart-tooltip" style={{ position:"absolute", left:`${Math.min(tooltip.x, 82)}%`, top:`${Math.max(0,tooltip.y-18)}%`, transform:"translate(-50%,-100%)" }}>
          <div className="tooltip-label">{tooltip.label} · مشاهدة</div>
          <div className="tooltip-value">{tooltip.v.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}

// ── Donut Chart ────────────────────────────────────────────────────────────────
function DonutChart({ segments, total }) {
  const [hov, setHov] = useState(null);
  const size=160, stroke=26, r=(size-stroke)/2, cx=size/2, cy=size/2;
  const circ = 2*Math.PI*r;
  let offset = 0;
  const arcs = segments.map(s => {
    const dash = (s.pct/100)*circ;
    const arc = { ...s, dash, offset, gap: circ-dash };
    offset += dash;
    return arc;
  });

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        {arcs.map((a,i) => (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none"
            stroke={hov===i ? a.color : a.color}
            strokeWidth={hov===i ? stroke+3 : stroke}
            strokeDasharray={`${a.dash} ${a.gap}`}
            strokeDashoffset={-a.offset}
            style={{cursor:"pointer", opacity: hov!==null&&hov!==i?0.4:1}}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
          />
        ))}
      </svg>
      <div className="donut-center">
        {hov!==null ? (
          <>
            <div className="donut-center-val" style={{color:segments[hov].color}}>{segments[hov].pct}%</div>
            <div className="donut-center-label">{segments[hov].label}</div>
          </>
        ) : (
          <>
            <div className="donut-center-val">{total}</div>
            <div className="donut-center-label">الإجمالي</div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
const RANGES = [
  { key:"7d", label:"Last 7 days" },
  { key:"30d", label:"Last 30 days" },
  { key:"90d", label:"Last 90 days" },
];
const STAGES = [
  { label:"Applied", count:132, color:"#6366f1" },
  { label:"Screening", count:89, color:"#06b6d4" },
  { label:"Interview", count:44, color:"#f59e0b" },
  { label:"Offer", count:18, color:"#10b981" },
  { label:"Hired", count:11, color:"#8b5cf6" },
];

export default function JobAnalytics() {
  const [activeTab, setActiveTab] = useState("Analytics");
  const [range, setRange] = useState("7d");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [animViews, setAnimViews] = useState(0);
  const [animApplied, setAnimApplied] = useState(0);

  // Animate counters on mount
  useEffect(() => {
    let start=0, target=23564, step=Math.ceil(target/60);
    const t=setInterval(()=>{ start=Math.min(start+step,target); setAnimViews(start); if(start>=target)clearInterval(t);},16);
    return ()=>clearInterval(t);
  },[]);
  useEffect(() => {
    let start=0, target=132, step=3;
    const t=setInterval(()=>{ start=Math.min(start+step,target); setAnimApplied(start); if(start>=target)clearInterval(t);},16);
    return ()=>clearInterval(t);
  },[]);

  const chartData = VIEW_DATA[range] || VIEW_DATA["7d"];
  const chartLabels = DATE_LABELS[range] || DATE_LABELS["7d"];
  const rangeLabel = RANGES.find(r=>r.key===range)?.label;

  return (
    <>
      <style>{styles}</style>
      <div className="page" onClick={()=>rangeOpen&&setRangeOpen(false)}>

        {/* Topbar */}
        <div className="topbar">
          <div className="brand">
            <div className="brand-logo">N</div>
            <div className="brand-info">
              <div className="brand-company">الشركة</div>
              <div className="brand-name">Nomad <span style={{fontSize:10,color:"#9ca3af"}}>▾</span></div>
            </div>
          </div>
          <div className="topbar-right">
            <button className="notif-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1a5 5 0 00-5 5v3l-1.5 2h13L13 9V6a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.3"/><path d="M6.5 13.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3"/></svg>
              <div className="notif-dot"/>
            </button>
            <button className="post-job-btn">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              انشر وظيفة
            </button>
          </div>
        </div>

        <div className="content">
          {/* Job header */}
          <div className="job-header">
            <div>
              <button className="job-back">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                العودة للقائمة
              </button>
              <div className="job-title">مساعد تواصل اجتماعي</div>
              <div className="job-meta">
                <span>تصميم</span><span className="job-meta-dot">•</span>
                <span>دوام كامل</span><span className="job-meta-dot">•</span>
                <span>4 / <span className="hired-badge">11 تم التعيين</span></span>
              </div>
            </div>
            <button className="more-action-btn">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 5l-2 2-2-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              خيارات إضافية
            </button>
          </div>

          {/* Tabs */}
          <div className="tabs">
            {["المتقدمين","تفاصيل الوظيفة","الإحصائيات"].map(t=>(
              <button key={t} className={`tab ${activeTab===t?"active":""}`} onClick={()=>setActiveTab(t)}>{t}</button>
            ))}
          </div>

          {/* Dashboard */}
          <div className="dashboard">

            {/* Total Views */}
            <div className="card stat-card">
              <div className="stat-icon" style={{background:"#ede9fe"}}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="3" stroke="#6366f1" strokeWidth="1.8"/><path d="M1.5 9C3 5 5.7 3 9 3s6 2 7.5 6c-1.5 4-4.2 6-7.5 6s-6-2-7.5-6z" stroke="#6366f1" strokeWidth="1.8"/></svg>
              </div>
              <div className="stat-label">إجمالي المشاهدات</div>
              <div className="stat-value">
                {animViews.toLocaleString()}
                <span className="stat-change up">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9V3M3 6l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  6.4%
                </span>
              </div>
              <div className="stat-vs">مقارنة بالأمس</div>
            </div>

            {/* Total Applied */}
            <div className="card stat-card">
              <div className="stat-icon" style={{background:"#d1fae5"}}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="2" width="12" height="14" rx="2" stroke="#10b981" strokeWidth="1.8"/><path d="M6 6h6M6 9h6M6 12h4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div className="stat-label">إجمالي التقديمات</div>
              <div className="stat-value">
                {animApplied}
                <span className="stat-change down">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 3v6M3 6l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  0.4%
                </span>
              </div>
              <div className="stat-vs">مقارنة بالأمس</div>
            </div>

            {/* Traffic Donut */}
            <div className="card donut-card">
              <div className="donut-title">قنوات الزيارات</div>
              <DonutChart segments={TRAFFIC} total={243}/>
              <div className="traffic-legend">
                {TRAFFIC.map(t=>(
                  <div key={t.label} className="legend-item">
                    <div className="legend-dot" style={{background:t.color}}/>
                    {t.label} : <span className="legend-pct">{t.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Line Chart */}
            <div className="card chart-card">
              <div className="chart-header">
                <div className="chart-title">إحصائيات مشاهدات الوظيفة</div>
                <div style={{position:"relative"}}>
                  <button className="range-select" onClick={e=>{e.stopPropagation();setRangeOpen(o=>!o);}}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 4l-3 3-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {rangeLabel}
                  </button>
                  {rangeOpen && (
                    <div className="range-options">
                      {RANGES.map(r=>(
                        <div key={r.key} className={`range-option ${range===r.key?"active":""}`} onClick={()=>{setRange(r.key);setRangeOpen(false);}}>
                          {r.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <LineChart data={chartData} labels={chartLabels} color="#10b981" height={200}/>
            </div>

            {/* Country list */}
            <div className="card country-card">
              <div className="country-title">الزوار حسب البلد</div>
              {COUNTRIES.map(c=>(
                <div key={c.name} className="country-row">
                  <div className="country-flag">{c.flag}</div>
                  <div className="country-name">{c.name}</div>
                  <div className="country-bar-wrap"><div className="country-bar" style={{width:`${c.bar}%`}}/></div>
                  <div className="country-val">{c.visitors.toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* Applicant funnel */}
            <div className="card timeline-card">
              <div className="timeline-header">
                <div className="timeline-title">مراحل المتقدمين</div>
                <div style={{fontSize:12,color:"#9ca3af"}}>{t("نظرة عامة على المراحل")}</div>
              </div>
              <div className="applicant-stages">
                {STAGES.map((s,i)=>(
                  <div key={s.label} className="stage-item">
                    <div className="stage-label">{s.label}</div>
                    <div className="stage-count" style={{color:s.color}}>{s.count}</div>
                    <div className="stage-bar" style={{background:s.color+"30", position:"relative"}}>
                      <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${(s.count/132)*100}%`,background:s.color,borderRadius:99}}/>
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