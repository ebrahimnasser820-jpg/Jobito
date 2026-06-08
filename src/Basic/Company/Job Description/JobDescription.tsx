import { useState, useRef } from "react";

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

  .container {
    width: 100%;
    max-width: 780px;
  }

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
  .step-item {
    display: flex;
    align-items: center;
    flex: 1;
    position: relative;
  }
  .step-item:last-child { flex: 0; }
  .step-connector {
    flex: 1;
    height: 2px;
    background: #e5e7eb;
    margin: 0 8px;
  }
  .step-connector.done { background: #6366f1; }

  .step-circle {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
  .step-circle.active { background: #6366f1; color: #fff; }
  .step-circle.completed { background: #6366f1; color: #fff; }
  .step-circle.inactive { background: #fff; color: #9ca3af; border: 2px solid #e5e7eb; }

  .step-label {
    position: absolute;
    top: 52px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .step-label.active { color: #6366f1; }
  .step-label.completed { color: #6366f1; }

  /* Section header */
  .section-header {
    margin-bottom: 28px;
  }
  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 4px;
  }
  .section-sub {
    font-size: 13px;
    color: #6b7280;
  }

  /* Two-column layout */
  .fields-grid {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .field-row {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 0;
    border-top: 1px solid #f3f4f6;
    padding: 28px 0;
    align-items: flex-start;
  }
  .field-row:first-child { border-top: none; }

  .field-label-col {
    padding-right: 28px;
    padding-top: 2px;
  }
  .field-label {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 6px;
  }
  .field-desc {
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.5;
  }

  /* Rich text editor */
  .editor-wrap {
    border: 1.5px solid #e5e7eb;
    border-radius: 14px;
    background: #fff;
    overflow: hidden;
  }
  .editor-wrap:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }

  .editor-toolbar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 10px 12px;
    border-bottom: 1px solid #f3f4f6;
    background: #fafafa;
  }
  .toolbar-btn {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    border-radius: 6px;
    cursor: pointer;
    color: #6b7280;
    font-size: 13px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
  }
  .toolbar-btn:hover { background: #f3f4f6; color: #111827; }
  .toolbar-btn.active { background: #ede9fe; color: #6366f1; }
  .toolbar-sep {
    width: 1px;
    height: 18px;
    background: #e5e7eb;
    margin: 0 4px;
  }

  .editor-area {
    min-height: 120px;
    padding: 14px 16px;
    font-size: 14px;
    color: #374151;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    line-height: 1.7;
    resize: none;
  }
  .editor-area[data-small="true"] {
    min-height: 90px;
  }
  .editor-area:empty::before {
    content: attr(data-placeholder);
    color: #d1d5db;
    pointer-events: none;
  }

  .editor-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    border-top: 1px solid #f3f4f6;
    background: #fafafa;
  }
  .editor-hint {
    font-size: 11px;
    color: #9ca3af;
  }
  .char-counter {
    font-size: 11px;
    font-weight: 600;
    color: #d1d5db;
  }
  .char-counter.warn { color: #f59e0b; }
  .char-counter.over { color: #ef4444; }
  .char-counter.good { color: #6366f1; }

  /* Formatting hint pills */
  .format-hints {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 8px;
  }
  .format-hint {
    font-size: 11px;
    color: #9ca3af;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 2px 8px;
    cursor: pointer;
    font-weight: 500;
  }
  .format-hint:hover { background: #ede9fe; color: #6366f1; border-color: #c7d2fe; }

  /* AI Assist button */
  .ai-assist-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: #f5f3ff;
    border: 1.5px solid #c7d2fe;
    border-radius: 8px;
    color: #6366f1;
    font-size: 12px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    white-space: nowrap;
  }
  .ai-assist-btn:hover { background: #ede9fe; }

  /* Card wrapper for form */
  .form-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 32px 36px;
  }

  /* Footer */
  .form-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 28px;
  }
  .prev-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 13px 24px;
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 14px;
    color: #374151;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
  }
  .prev-btn:hover { border-color: #6366f1; color: #6366f1; }

  .next-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 28px;
    background: #6366f1;
    border: none;
    border-radius: 14px;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
  }
  .next-btn:hover { background: #4f46e5; }

  .progress-text {
    font-size: 12px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* Completion indicator dots */
  .completion-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 28px;
  }
  .completion-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #e5e7eb;
  }
  .completion-dot.filled { background: #6366f1; }
  .completion-label {
    font-size: 12px;
    color: #9ca3af;
    font-weight: 500;
  }
  .completion-label strong { color: #6366f1; font-weight: 700; }
`;



const TOOLBAR_ACTIONS = [
    { id: "bold", label: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>, title: "Bold" },
    { id: "italic", label: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>, title: "Italic" },
    { id: "underline", label: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>, title: "Underline" },
    { id: "sep" },
    { id: "insertUnorderedList", label: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>, title: "Bullet list" },
    { id: "insertOrderedList", label: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><polyline points="3 6 4 5 4 11"/><path d="M3 18h3"/><path d="M3 12c.1-1.1.7-2 2-2 1.4 0 2 1.1 2 2 0 .9-.6 1.5-2 2h-2"/></svg>, title: "Numbered list" },
    { id: "sep" },
    { id: "link", label: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>, title: "Insert link" },
];

interface RichEditorProps {
    placeholder: string;
    maxChars: number;
    small?: boolean;
    onChange?: (val: string) => void;
    id: string;
}

function RichEditor({ placeholder, maxChars, small, onChange, id }: RichEditorProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [charCount, setCharCount] = useState(0);
    const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

    const execCmd = (cmd: string) => {
        if (cmd === "link") {
            const url = prompt("Enter URL:");
            if (url) document.execCommand("createLink", false, url);
        } else {
            document.execCommand(cmd, false, "");
        }
        ref.current?.focus();
        updateFormats();
    };

    const updateFormats = () => {
        setActiveFormats({
            bold: document.queryCommandState("bold"),
            italic: document.queryCommandState("italic"),
            underline: document.queryCommandState("underline"),
            insertUnorderedList: document.queryCommandState("insertUnorderedList"),
            insertOrderedList: document.queryCommandState("insertOrderedList"),
        });
    };

    const handleInput = () => {
        const text = ref.current?.innerText || "";
        setCharCount(text.length);
        if (onChange) onChange(ref.current?.innerHTML || "");
        updateFormats();
    };

    const counterClass = charCount > maxChars
        ? "over"
        : charCount > maxChars * 0.85
            ? "warn"
            : charCount > 10
                ? "good"
                : "";

    const WRITING_TIPS: Record<string, string[]> = {
        description: ["Mention team size", "Include tech stack", "Note impact"],
        responsibilities: ["Use action verbs", "Be specific", "List 4-6 items"],
        whoYouAre: ["List must-haves only", "Be realistic", "Avoid jargon"],
        niceToHave: ["Keep it short", "Be encouraging", "Avoid gatekeeping"],
    };

    return (
        <div>
            <div className="editor-wrap">
                <div className="editor-toolbar">
                    {TOOLBAR_ACTIONS.map((a, i) =>
                        a.id === "sep"
                            ? <div key={i} className="toolbar-sep" />
                            : <button
                                key={a.id}
                                className={`toolbar-btn ${activeFormats[a.id] ? "active" : ""}`}
                                title={a.title}
                                onMouseDown={e => { e.preventDefault(); execCmd(a.id); }}
                            >
                                {a.label}
                            </button>
                    )}
                    <div style={{ flex: 1 }} />
                    <button className="ai-assist-btn" onMouseDown={e => e.preventDefault()}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M6 1l1.2 3.6L11 6 7.2 7.4 6 11 4.8 7.4 1 6l3.8-1.4L6 1z" fill="#6366f1" />
                        </svg>
                        AI Assist
                    </button>
                </div>

                <div
                    ref={ref}
                    id={id}
                    className="editor-area"
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder={placeholder}
                    data-small={small ? "true" : "false"}
                    onInput={handleInput}
                    onKeyUp={updateFormats}
                    onMouseUp={updateFormats}
                />

                <div className="editor-footer">
                    <span className="editor-hint">Maximum {maxChars} characters</span>
                    <span className={`char-counter ${counterClass}`}>{charCount} / {maxChars}</span>
                </div>
            </div>

            {WRITING_TIPS[id] && (
                <div className="format-hints">
                    <span style={{ fontSize: 11, color: "#d1d5db", marginRight: 2 }}>Tips:</span>
                    {WRITING_TIPS[id].map((tip: string) => (
                        <span key={tip} className="format-hint">{tip}</span>
                    ))}
                </div>
            )}
        </div>
    );
}

const FIELDS = [
    {
        id: "description",
        label: "Job Descriptions",
        desc: "Job titles must be describe one position",
        placeholder: "Enter job description",
        maxChars: 500,
    },
    {
        id: "responsibilities",
        label: "Responsibilities",
        desc: "Outline the core responsibilities of the position",
        placeholder: "Enter job responsibilities",
        maxChars: 500,
    },
    {
        id: "whoYouAre",
        label: "Who You Are",
        desc: "Add your preferred candidates qualifications",
        placeholder: "Enter qualifications",
        maxChars: 500,
    },
    {
        id: "niceToHave",
        label: "Nice-To-Haves",
        desc: "Add nice-to-have skills and qualifications for the role to encourage a more diverse set of candidates to apply",
        placeholder: "Enter nice-to-haves",
        maxChars: 350,
        small: true,
    },
];

export default function PostJobStep2() {
    const [step] = useState(2);
    const [values, setValues] = useState<Record<string, string>>({});
    const steps = ["Job Information", "Job Description", "Perks & Benefits"];

    const filledCount = FIELDS.filter(f => (values[f.id] || "").replace(/<[^>]*>/g, "").trim().length > 0).length;

    return (
        <>
            <style>{styles}</style>
            <div className="wrapper">
                <div className="container">

                    {/* Back */}
                    <button className="back-btn">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back
                    </button>

                    <h1 className="page-title">Post a Job</h1>

                    {/* Stepper */}
                    <div className="stepper">
                        {steps.map((label, i) => {
                            const s = i + 1;
                            const status = s < step ? "completed" : s === step ? "active" : "inactive";
                            return (
                                <>
                                    <div key={s} className="step-item" style={{ position: "relative" }}>
                                        <div className={`step-circle ${status}`}>
                                            {status === "completed"
                                                ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                : s}
                                        </div>
                                        <span className={`step-label ${status}`}>{label}</span>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className={`step-connector ${step > s ? "done" : ""}`} />
                                    )}
                                </>
                            );
                        })}
                    </div>

                    {/* Completion progress */}
                    <div className="completion-row">
                        {FIELDS.map((f) => (
                            <div
                                key={f.id}
                                className={`completion-dot ${(values[f.id] || "").replace(/<[^>]*>/g, "").trim().length > 0 ? "filled" : ""}`}
                            />
                        ))}
                        <span className="completion-label">
                            <strong>{filledCount}</strong> of {FIELDS.length} sections filled
                        </span>
                    </div>

                    {/* Section header */}
                    <div className="section-header">
                        <div className="section-title">Details</div>
                        <div className="section-sub">Add the description of the job, responsibilities, who you are, and nice-to-haves.</div>
                    </div>

                    {/* Form card */}
                    <div className="form-card">
                        <div className="fields-grid">
                            {FIELDS.map((field) => (
                                <div key={field.id} className="field-row">
                                    <div className="field-label-col">
                                        <div className="field-label">{field.label}</div>
                                        <div className="field-desc">{field.desc}</div>
                                    </div>
                                    <RichEditor
                                        id={field.id}
                                        placeholder={field.placeholder}
                                        maxChars={field.maxChars}
                                        small={field.small}
                                        onChange={val => setValues(p => ({ ...p, [field.id]: val }))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-footer">
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <button className="prev-btn">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Previous
                            </button>
                            <span className="progress-text">Step 2 of 3</span>
                        </div>
                        <button className="next-btn">
                            Next Step
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}