import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #f5f6fa;
    min-height: 100vh;
  }

  .wrapper {
    min-height: 100vh;
    width: 100%;
    background: #f5f6fa;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 40px 20px 80px;
  }

  .container { width: 100%; max-width: 780px; }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b7280;
    font-size: 14px;
    font-weight: 500;
    background: none;
    border: none;
    cursor: pointer;
    margin-bottom: 32px;
    padding: 0;
  }
  .back-btn:hover { color: #111827; }

  .page-title {
    font-family: 'Syne', sans-serif;
    font-size: 32px;
    font-weight: 800;
    color: #111827;
    letter-spacing: -0.5px;
    margin-bottom: 36px;
  }

  /* Stepper */
  .stepper {
    display: flex;
    align-items: center;
    margin-bottom: 48px;
  }
  .step-item { display: flex; align-items: center; flex: 1; position: relative; }
  .step-item:last-child { flex: 0; }
  .step-connector { flex: 1; height: 2px; background: #e5e7eb; margin: 0 8px; }
  .step-connector.done { background: #6366f1; }
  .step-circle {
    width: 44px; height: 44px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700;
    font-family: 'Syne', sans-serif; flex-shrink: 0; position: relative; z-index: 1;
  }
  .step-circle.active { background: #6366f1; color: #fff; }
  .step-circle.completed { background: #6366f1; color: #fff; }
  .step-circle.inactive { background: #fff; color: #9ca3af; border: 2px solid #e5e7eb; }
  .step-label {
    position: absolute; top: 52px; left: 50%; transform: translateX(-50%);
    font-size: 11px; font-weight: 600; white-space: nowrap; color: #9ca3af;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .step-label.active { color: #6366f1; }
  .step-label.completed { color: #6366f1; }

  /* Section header */
  .section-header { margin-bottom: 28px; }
  .section-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 4px; }
  .section-sub { font-size: 13px; color: #6b7280; }

  /* Two-col layout */
  .content-row {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 0;
    align-items: flex-start;
  }
  .label-col { padding-right: 28px; padding-top: 4px; }
  .label-col-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 6px; }
  .label-col-desc { font-size: 12px; color: #9ca3af; line-height: 1.6; }

  /* Right side panel */
  .right-panel {}

  /* Add benefit button */
  .add-btn-row { margin-bottom: 20px; }
  .add-benefit-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    color: #374151;
    font-size: 13px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
  }
  .add-benefit-btn:hover { border-color: #6366f1; color: #6366f1; background: #f5f3ff; }

  /* Benefits grid */
  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  /* Benefit card */
  .benefit-card {
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 16px;
    padding: 20px;
    position: relative;
    cursor: default;
  }
  .benefit-card:hover { border-color: #c7d2fe; }
  .benefit-card.editing { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .card-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: #f5f3ff;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
  }
  .card-actions { display: flex; gap: 6px; }
  .card-action-btn {
    width: 28px; height: 28px;
    border-radius: 7px;
    background: none;
    border: 1.5px solid #e5e7eb;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #9ca3af;
    font-size: 13px;
  }
  .card-action-btn:hover { border-color: #6366f1; color: #6366f1; background: #f5f3ff; }
  .card-action-btn.delete:hover { border-color: #fca5a5; color: #ef4444; background: #fef2f2; }

  .card-title-input, .card-desc-input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    color: #111827;
    resize: none;
    padding: 0;
  }
  .card-title-input {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 8px;
    display: block;
  }
  .card-title-input::placeholder { color: #d1d5db; }
  .card-desc-input {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.6;
    min-height: 60px;
    display: block;
  }
  .card-desc-input::placeholder { color: #d1d5db; }

  /* Empty state */
  .empty-state {
    grid-column: 1 / -1;
    background: #fff;
    border: 2px dashed #e5e7eb;
    border-radius: 16px;
    padding: 40px;
    text-align: center;
  }
  .empty-icon { font-size: 36px; margin-bottom: 12px; }
  .empty-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #374151; margin-bottom: 4px; }
  .empty-sub { font-size: 13px; color: #9ca3af; }

  /* Preset picker modal */
  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.3);
    z-index: 200;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .modal {
    background: #fff;
    border-radius: 20px;
    width: 100%;
    max-width: 520px;
    padding: 28px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.15);
  }
  .modal-title {
    font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800;
    color: #111827; margin-bottom: 4px;
  }
  .modal-sub { font-size: 13px; color: #6b7280; margin-bottom: 20px; }
  .preset-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
  .preset-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px;
    background: #f9fafb;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    cursor: pointer;
  }
  .preset-item:hover { border-color: #6366f1; background: #f5f3ff; }
  .preset-item.selected { border-color: #6366f1; background: #ede9fe; }
  .preset-emoji { font-size: 22px; }
  .preset-name { font-size: 13px; font-weight: 600; color: #374151; }
  .modal-footer { display: flex; gap: 10px; justify-content: flex-end; }
  .modal-cancel {
    padding: 10px 20px; background: #fff; border: 1.5px solid #e5e7eb;
    border-radius: 10px; color: #374151; font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .modal-cancel:hover { border-color: #9ca3af; }
  .modal-add {
    padding: 10px 20px; background: #6366f1; border: none;
    border-radius: 10px; color: #fff; font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .modal-add:hover { background: #4f46e5; }
  .modal-add:disabled { background: #c7d2fe; cursor: not-allowed; }

  /* Icon picker inside card */
  .icon-picker-row {
    display: flex; gap: 6px; flex-wrap: wrap;
    margin-bottom: 10px;
  }
  .icon-opt {
    width: 32px; height: 32px; border-radius: 8px; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; background: #f9fafb; border: 1.5px solid #e5e7eb;
  }
  .icon-opt:hover { border-color: #6366f1; background: #ede9fe; }
  .icon-opt.active { border-color: #6366f1; background: #ede9fe; }

  /* Summary bar */
  .summary-bar {
    display: flex; align-items: center; justify-content: space-between;
    background: #fff; border: 1px solid #e5e7eb; border-radius: 14px;
    padding: 14px 20px; margin-bottom: 20px;
  }
  .summary-count {
    font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #6366f1;
  }
  .summary-label { font-size: 13px; color: #6b7280; font-weight: 500; }
  .summary-dots { display: flex; gap: 6px; }
  .summary-dot {
    width: 10px; height: 10px; border-radius: 50%; background: #e5e7eb;
  }
  .summary-dot.filled { background: #6366f1; }

  /* Footer */
  .form-footer {
    display: flex; align-items: center; justify-content: space-between; margin-top: 32px;
  }
  .prev-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 13px 24px; background: #fff; border: 1.5px solid #e5e7eb;
    border-radius: 14px; color: #374151; font-size: 15px; font-weight: 700;
    font-family: 'Syne', sans-serif; cursor: pointer;
  }
  .prev-btn:hover { border-color: #6366f1; color: #6366f1; }
  .review-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 13px 28px; background: #6366f1; border: none;
    border-radius: 14px; color: #fff; font-size: 15px; font-weight: 700;
    font-family: 'Syne', sans-serif; cursor: pointer;
  }
  .review-btn:hover { background: #4f46e5; }
  .progress-text {
    font-size: 12px; font-weight: 600; color: #9ca3af;
    text-transform: uppercase; letter-spacing: 1px;
  }
`;

const PRESET_BENEFITS = [
    { emoji: "🏥", name: "Full Healthcare", desc: "We believe in thriving communities and that starts with our team being happy and healthy." },
    { emoji: "🏖️", name: "Unlimited Vacation", desc: "We believe you should have a flexible schedule that makes space for family, wellness, and fun." },
    { emoji: "🎬", name: "Skill Development", desc: "We believe in always learning and leveling up our skills. Whether it's a conference or online course." },
    { emoji: "💰", name: "Team Summits", desc: "We bring the whole team together twice a year for planning, bonding, and a good time." },
    { emoji: "🏠", name: "Remote Friendly", desc: "Work from anywhere. We're async-first and trust you to do great work wherever you are." },
    { emoji: "📈", name: "Stock Options", desc: "Share in the company's success. All full-time employees receive meaningful equity." },
    { emoji: "🧠", name: "Mental Wellness", desc: "Access to therapy, meditation apps, and a culture that normalizes taking care of your mind." },
    { emoji: "🍽️", name: "Free Meals", desc: "Stocked kitchen, daily catered lunches, and snacks to keep you energized." },
];

const ICON_OPTIONS = ["🏥", "🏖️", "🎬", "💰", "🏠", "📈", "🧠", "🍽️", "🎁", "🚀", "💡", "🌍", "🎯", "🔧", "🎓", "👶"];

export default function PostJobStep3() {
    const [step] = useState(3);
    const steps = ["Job Information", "Job Description", "Perks & Benefits"];

    const [benefits, setBenefits] = useState([
        { id: 1, emoji: "🏥", name: "Full Healthcare", desc: "We believe in thriving communities and that starts with our team being happy and healthy." },
        { id: 2, emoji: "🏖️", name: "Unlimited Vacation", desc: "We believe you should have a flexible schedule that makes space for family, wellness, and fun." },
        { id: 3, emoji: "🎬", name: "Skill Development", desc: "We believe in always learning and leveling up our skills. Whether it's a conference or online course." },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [selectedPresets, setSelectedPresets] = useState([]);
    const [editingIcon, setEditingIcon] = useState(null); 
    const nextId = useRef(100);

    function useRef(init) {
        const [r] = useState({ current: init });
        return r;
    }

    const togglePreset = (name) => {
        setSelectedPresets(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name]);
    };

    const addPresets = () => {
        const newBenefits = PRESET_BENEFITS
            .filter(p => selectedPresets.includes(p.name) && !benefits.find(b => b.name === p.name))
            .map(p => ({ id: nextId.current++, emoji: p.emoji, name: p.name, desc: p.desc }));
        setBenefits(prev => [...prev, ...newBenefits]);
        setSelectedPresets([]);
        setShowModal(false);
    };

    const addBlank = () => {
        setBenefits(prev => [...prev, { id: nextId.current++, emoji: "🎁", name: "", desc: "" }]);
    };

    const removeBenefit = (id) => setBenefits(prev => prev.filter(b => b.id !== id));

    const updateBenefit = (id, field, val) => {
        setBenefits(prev => prev.map(b => b.id === id ? { ...b, [field]: val } : b));
    };

    return (
        <>
            <style>{styles}</style>
            <div className="wrapper">
                <div className="container">


                    <div className="section-header">
                        <div className="section-title">Basic Information</div>
                        <div className="section-sub">List out your top perks and benefits.</div>
                    </div>

                    {/* Summary bar */}
                    <div className="summary-bar">
                        <div>
                            <div className="summary-count">{benefits.length}</div>
                            <div className="summary-label">Perks & benefits added</div>
                        </div>
                        <div className="summary-dots">
                            {[...Array(Math.max(6, benefits.length))].map((_, i) => (
                                <div key={i} className={`summary-dot ${i < benefits.length ? "filled" : ""}`} />
                            ))}
                        </div>
                    </div>

                    {/* Two column content */}
                    <div className="content-row">
                        <div className="label-col">
                            <div className="label-col-title">Perks and Benefits</div>
                            <div className="label-col-desc">Encourage more people to apply by sharing the attractive rewards and benefits you offer your employees</div>
                        </div>

                        <div className="right-panel">
                            {/* Add button row */}
                            <div className="add-btn-row" style={{ display: "flex", gap: 10 }}>
                                <button className="add-benefit-btn" onClick={() => setShowModal(true)}>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Add Benefit
                                </button>
                                <button className="add-benefit-btn" onClick={addBlank}>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
                                    </svg>
                                    Custom
                                </button>
                            </div>

                            {/* Benefits grid */}
                            <div className="benefits-grid">
                                {benefits.length === 0 && (
                                    <div className="empty-state">
                                        <div className="empty-icon">🎁</div>
                                        <div className="empty-title">No perks added yet</div>
                                        <div className="empty-sub">Click "Add Benefit" to pick from presets or create your own</div>
                                    </div>
                                )}

                                {benefits.map(b => (
                                    <div key={b.id} className={`benefit-card ${(editingIcon === b.id) ? "editing" : ""}`}>
                                        <div className="card-top">
                                            <div
                                                className="card-icon"
                                                style={{ cursor: "pointer", userSelect: "none" }}
                                                title="Click to change icon"
                                                onClick={() => setEditingIcon(editingIcon === b.id ? null : b.id)}
                                            >
                                                {b.emoji}
                                            </div>
                                            <div className="card-actions">
                                                <button className="card-action-btn delete" title="Remove" onClick={() => removeBenefit(b.id)}>
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                        <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Icon picker */}
                                        {editingIcon === b.id && (
                                            <div className="icon-picker-row">
                                                {ICON_OPTIONS.map(ico => (
                                                    <div
                                                        key={ico}
                                                        className={`icon-opt ${b.emoji === ico ? "active" : ""}`}
                                                        onClick={() => { updateBenefit(b.id, "emoji", ico); setEditingIcon(null); }}
                                                    >
                                                        {ico}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <input
                                            className="card-title-input"
                                            value={b.name}
                                            placeholder="Benefit name"
                                            onChange={e => updateBenefit(b.id, "name", e.target.value)}
                                        />
                                        <textarea
                                            className="card-desc-input"
                                            value={b.desc}
                                            placeholder="Describe this benefit..."
                                            rows={3}
                                            onChange={e => updateBenefit(b.id, "desc", e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-title">Choose Benefits</div>
                        <div className="modal-sub">Select from our popular perks or add a custom one</div>

                        <div className="preset-grid">
                            {PRESET_BENEFITS.filter(p => !benefits.find(b => b.name === p.name)).map(p => (
                                <div
                                    key={p.name}
                                    className={`preset-item ${selectedPresets.includes(p.name) ? "selected" : ""}`}
                                    onClick={() => togglePreset(p.name)}
                                >
                                    <span className="preset-emoji">{p.emoji}</span>
                                    <span className="preset-name">{p.name}</span>
                                </div>
                            ))}
                            {PRESET_BENEFITS.filter(p => !benefits.find(b => b.name === p.name)).length === 0 && (
                                <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "20px 0" }}>
                                    All preset benefits have been added!
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="modal-cancel" onClick={() => { setShowModal(false); setSelectedPresets([]); }}>Cancel</button>
                            <button className="modal-add" disabled={selectedPresets.length === 0} onClick={addPresets}>
                                Add {selectedPresets.length > 0 ? `(${selectedPresets.length})` : ""}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}