import { useState, useRef, useEffect } from "react";
import { useJobitoAuth } from "../../context/LinkContxt";
import { useToast } from "../../context/ToastContext";
import "./settingoverview.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const TOOLBAR = [
  { id: "bold", label: "B" },
  { id: "italic", label: "I" },
  { id: "underline", label: "U" },
  { id: "sep" },
  { id: "insertUnorderedList", label: "•" },
  { id: "insertOrderedList", label: "1." },
  { id: "sep" },
  { id: "link", label: "🔗" },
];

function RichEditor({ placeholder, maxChars = 500, onChange }) {
  const ref = useRef(null);
  const [charCount, setCharCount] = useState(0);
  const [active, setActive] = useState({});

  const exec = (cmd) => {
    if (cmd === "link") {
      const u = prompt("URL:");
      if (u) document.execCommand("createLink", false, u);
    } else document.execCommand(cmd, false, null);
    ref.current?.focus();
    updateActive();
  };
  const updateActive = () =>
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  const handleInput = () => {
    const txt = ref.current?.innerText || "";
    setCharCount(txt.length);
    if (onChange) onChange(ref.current?.innerHTML || "");
    updateActive();
  };
  const cc =
    charCount > maxChars
      ? "over"
      : charCount > maxChars * 0.85
        ? "warn"
        : charCount > 10
          ? "good"
          : "";

  return (
    <div className="editor-wrap">
      <div className="editor-toolbar">
        {TOOLBAR.map((t, i) =>
          t.id === "sep" ? (
            <div key={i} className="toolbar-sep" />
          ) : (
            <button
              key={t.id}
              className={`toolbar-btn ${active[t.id] ? "active" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                exec(t.id);
              }}
            >
              {t.label}
            </button>
          ),
        )}
      </div>
      <div
        ref={ref}
        className="editor-area"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        onKeyUp={updateActive}
        onMouseUp={updateActive}
      />
      <div className="editor-footer">
        <span className="editor-hint">Maximum {maxChars} characters</span>
        <span className={`char-counter ${cc}`}>
          {charCount} / {maxChars}
        </span>
      </div>
    </div>
  );
}

function TagInput({ tags, onAdd, onRemove, placeholder }) {
  const [input, setInput] = useState("");
  const handleKey = (e) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      onAdd(input.trim());
      setInput("");
    }
    if (e.key === "Backspace" && !input && tags.length)
      onRemove(tags[tags.length - 1]);
  };
  return (
    <div
      className="tag-input-wrap"
      onClick={(e) => e.currentTarget.querySelector("input")?.focus()}
    >
      {tags.map((t) => (
        <span key={t} className="tag">
          {t}
          <button className="tag-remove" onClick={() => onRemove(t)}>
            ×
          </button>
        </span>
      ))}
      <input
        className="tag-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder={tags.length ? "" : placeholder}
      />
    </div>
  );
}

const TABS = ["Overview", "Social Links", "Benefits"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Marketing",
  "Retail",
  "Media",
  "Legal",
  "Manufacturing",
  "Other",
];
const EMP_RANGES = [
  "1 - 10",
  "11 - 50",
  "51 - 200",
  "201 - 500",
  "501 - 1000",
  "1000+",
];

const GOVERNORATES = [
  "Cairo", "Alexandria", "Giza", "Qalyubia", "Port Said", "Suez", "Gharbia",
  "Dakahlia", "Ismailia", "Asyut", "Fayoum", "Minya", "Qena", "Sohag",
  "Beni Suef", "Aswan", "Red Sea", "New Valley", "Matrouh", "North Sinai",
  "South Sinai", "Kafr El Sheikh", "Beheira", "Damietta", "Sharqia", "Monufia", "Luxor"
];

function LocationTagInput({ tags, onAdd, onRemove }) {
  const handleChange = (e: any) => {
    const val = e.target.value;
    if (val && !tags.includes(val)) {
      onAdd(val);
    }
    e.target.value = "";
  };
  return (
    <div className="tag-input-wrap">
      {tags.map((t: string) => (
        <span key={t} className="tag">
          {t}
          <button type="button" className="tag-remove" onClick={() => onRemove(t)}>
            ×
          </button>
        </span>
      ))}
      <select 
        className="tag-input" 
        style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: '150px' }} 
        onChange={handleChange}
        defaultValue=""
      >
        <option value="" disabled>Select a governorate...</option>
        {GOVERNORATES.map(gov => (
          <option key={gov} value={gov}>{gov}</option>
        ))}
      </select>
    </div>
  );
}

export default function CompanySettings() {
  const { user, apiFetch } = useJobitoAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("Overview");
  const [hasChanges, setHasChanges] = useState(true);
  const [saved, setSaved] = useState(false);
  const [dragover, setDragover] = useState(false);
  const [dragover1, setDragover1] = useState(false);
  const [dragover2, setDragover2] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [office1Url, setOffice1Url] = useState(null);
  const [office2Url, setOffice2Url] = useState(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fileRef1 = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<number | null>(null);

  const [form, setForm] = useState({
    companyName: "Nomad",
    website: "https://www.nomad.com",
    phone: "",
    locations: ["England", "Japan", "Australia"],
    employees: "1 - 50",
    industry: "Technology",
    foundedDay: "31",
    foundedMonth: "July",
    foundedYear: "2021",
    description: "",
    socialLinks: {
      LinkedIn: "",
      "Twitter / X": "",
      Instagram: "",
      GitHub: "",
      Facebook: "",
    },
    benefits: [] as { title: string; desc: string }[],
  });

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setHasChanges(true);
    setSaved(false);
  };

  const setSocialLink = (network, val) => {
    setForm((f) => ({
      ...f,
      socialLinks: { ...f.socialLinks, [network]: val },
    }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleLogoFile = (file: File, type: string) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === "logo") setLogoUrl(base64String);
      if (type === "office1") setOffice1Url(base64String);
      if (type === "office2") setOffice2Url(base64String);
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: any, type: string) => {
    e.preventDefault();
    if (type === "logo") setDragover(false);
    if (type === "office1") setDragover1(false);
    if (type === "office2") setDragover2(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleLogoFile(file, type);
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const email = user?.email;
        if (!email) {
          setLoading(false);
          return;
        }

        const res = await apiFetch(`${API_BASE_URL}/companies`);
        if (res.ok) {
          const result = await res.json();
          // Safely extract the array in case the API wraps it in { data: [...] }
          const companies = Array.isArray(result) ? result : result.data || [];

          const myCompany = companies.find(
            (c: any) => c.contact_email?.toLowerCase() === email.toLowerCase(),
          );

          if (myCompany) {
            setCompanyId(myCompany.company_id);
            const detailRes = await apiFetch(
              `${API_BASE_URL}/companies/${myCompany.company_id}`,
            );
            if (detailRes.ok) {
              const data = await detailRes.json();
              if (data.logo_url) setLogoUrl(data.logo_url);
              if (data.office_photo1_url) setOffice1Url(data.office_photo1_url);
              if (data.office_photo2_url) setOffice2Url(data.office_photo2_url);
              setForm((f) => ({
                ...f,
                companyName: data.name || f.companyName,
                description: data.description || f.description,
                phone: data.phone || f.phone,
                website: data.website || f.website,
                employees: data.employees || f.employees,
                industry: data.industry || f.industry,
                foundedDay: data.foundedDay || f.foundedDay,
                foundedMonth: data.foundedMonth || f.foundedMonth,
                foundedYear: data.foundedYear || f.foundedYear,
                benefits: Array.isArray(data.benefits) ? data.benefits : [],
                socialLinks: data.socialLinks || f.socialLinks,
                locations: data.address
                  ? data.address.split(",").map((s: string) => s.trim())
                  : f.locations,
              }));
              setHasChanges(false);
            } else {
              console.error("Failed to fetch detailed company data.");
            }
          } else {
            console.log(
              "No company found for email:",
              email,
              "Ready to create a new one upon saving.",
            );
          }
        } else {
          console.error("Failed to fetch companies list.");
        }
      } catch (err: unknown) {
        console.error("Failed to fetch company", err);
        showToast(`Error loading your company settings: ${err instanceof Error ? err.message : "Known error"}`, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, [user, apiFetch]);

  const handleSave = async () => {
    try {
      const email = user?.email;
      if (!email) return;

      const payload: any = {
        name: form.companyName,
        description: form.description,
        phone: form.phone,
        website: form.website,
        employees: form.employees,
        industry: form.industry,
        foundedDay: form.foundedDay,
        foundedMonth: form.foundedMonth,
        foundedYear: form.foundedYear,
        benefits: form.benefits,
        socialLinks: form.socialLinks,
        address: form.locations.join(", "),
        logo_url: logoUrl,
        office_photo1_url: office1Url,
        office_photo2_url: office2Url,
      };

      console.log("Saving payload:", payload);

      let res;
      if (companyId) {
        // Update existing company
        res = await apiFetch(`${API_BASE_URL}/companies/${companyId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new company
        payload.contact_email = email; // Often required by backend to link to user
        payload.verification_status = "pending"; // Standard default status

        res = await apiFetch(`${API_BASE_URL}/companies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setSaved(true);
        setHasChanges(false);
        try {
          const data = await res.json();
          if (!companyId && data && data.company_id) {
            setCompanyId(data.company_id);
          }
        } catch (e) {
          /* ignore parse error on PUT */
        }
        showToast("Changes saved successfully!", "success");
      } else {
        const errText = await res.text();
        console.error("Failed to save company:", res.status, errText);
        showToast(
          `Failed to save! Server responded with ${res.status}: ${errText}`,
          "error"
        );
      }
    } catch (e: unknown) {
      console.error(e);
      showToast(`An error occurred while saving: ${e instanceof Error ? e.message : "Error"}`, "error");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px", color: "#7c8493" }}>
        Loading settings...
      </div>
    );
  }

  // Calculate completion %
  const isDescriptionFilled =
    form.description.replace(/<[^>]*>?/gm, "").trim().length > 0;
  const hasSocialLinks = Object.values(form.socialLinks).some(
    (link) => link.trim().length > 0,
  );

  const fieldsStatus = [
    !!form.companyName?.trim(),
    !!form.website?.trim(),
    form.locations.length > 0,
    !!form.employees?.trim(),
    !!form.industry?.trim(),
    !!(form.foundedDay && form.foundedMonth && form.foundedYear),
    isDescriptionFilled,
    logoUrl !== null,
    hasSocialLinks,
  ];
  const filled = fieldsStatus.filter(Boolean).length;
  const pct = Math.round((filled / fieldsStatus.length) * 100);

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const years = Array.from({ length: 50 }, (_, i) => String(2024 - i));

  return (
    <>
      <div className="wrapper">
        <div className="container">
          <h1 className="page-title">Settings</h1>

          {/* Tabs */}
          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t}
                className={`tab ${activeTab === t ? "active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {activeTab === "Overview" && (
            <>
              {/* Profile completeness */}
              <div className="profile-progress">
                <span className="progress-label">Profile completeness</span>
                <div className="progress-bar-wrap">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="progress-pct">{pct}%</span>
                <span className="progress-tip">
                  {pct < 100
                    ? "Fill all fields to attract more applicants"
                    : "Profile complete!"}
                </span>
              </div>

              {/* Basic Information */}
              <div className="section-block">
                <div
                  className="section-header-bar"
                  style={{ padding: "20px 28px 20px" }}
                >
                  <div className="section-label">Basic Information</div>
                  <div className="section-desc">
                    This is company information that you can update anytime.
                  </div>
                </div>

                {/* Company Logo */}
                <div
                  className="two-col-row"
                  style={{ borderTop: "1px solid #f3f4f6" }}
                >
                  <div className="row-label-col">
                    <div className="row-label">Company Logo</div>
                    <div className="row-hint">
                      This image will be shown publicly as company logo.
                    </div>
                  </div>
                  <div className="logo-section">
                    <div className="logo-preview">
                      {logoUrl ? <img src={logoUrl} alt="logo" /> : "N"}
                      <div
                        className="logo-preview-overlay"
                        onClick={() => fileRef.current?.click()}
                      >
                        Change
                      </div>
                    </div>
                    <div
                      className={`logo-dropzone ${dragover ? "dragover" : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragover(true);
                      }}
                      onDragLeave={() => setDragover(false)}
                      onDrop={(e) => handleDrop(e, "logo")}
                      onClick={() => fileRef.current?.click()}
                    >
                      <div className="dropzone-icon">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 28 28"
                          fill="none"
                        >
                          <rect
                            x="2"
                            y="2"
                            width="24"
                            height="24"
                            rx="8"
                            stroke="#d1d5db"
                            strokeWidth="1.5"
                            strokeDasharray="4 2"
                          />
                          <path
                            d="M14 10v8M10 14h8"
                            stroke="#9ca3af"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <div className="dropzone-text">
                        <strong>Click to replace</strong> or drag and drop
                      </div>
                      <div className="dropzone-hint">
                        SVG, PNG, JPG or GIF (max. 400 × 400px)
                      </div>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      className="file-input"
                      accept="image/*"
                      onChange={(e) =>
                        handleLogoFile(e.target.files?.[0], "logo")
                      }
                    />
                  </div>
                </div>

                {/* Company Photos */}
                <div className="two-col-row">
                  <div className="row-label-col">
                    <div className="row-label">Company Photos</div>
                    <div className="row-hint">
                      Upload up to 2 photos showing what it's like to work at
                      your company.
                    </div>
                  </div>
                  <div
                    className="logo-section"
                    style={{ flexDirection: "column" }}
                  >
                    {/* Photo 1 */}
                    <div
                      style={{ display: "flex", gap: "20px", width: "100%" }}
                    >
                      <div
                        className="logo-preview"
                        style={{ width: "120px", height: "80px" }}
                      >
                        {office1Url ? (
                          <img src={office1Url} alt="Office 1" />
                        ) : (
                          "P1"
                        )}
                        <div
                          className="logo-preview-overlay"
                          onClick={() => fileRef1.current?.click()}
                        >
                          Change
                        </div>
                      </div>
                      <div
                        className={`logo-dropzone ${dragover1 ? "dragover" : ""}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragover1(true);
                        }}
                        onDragLeave={() => setDragover1(false)}
                        onDrop={(e) => handleDrop(e, "office1")}
                        onClick={() => fileRef1.current?.click()}
                      >
                        <div className="dropzone-text">
                          <strong>Click to replace Photo 1</strong> or drag and
                          drop
                        </div>
                      </div>
                      <input
                        ref={fileRef1}
                        type="file"
                        className="file-input"
                        accept="image/*"
                        onChange={(e) =>
                          handleLogoFile(e.target.files?.[0], "office1")
                        }
                      />
                    </div>

                    {/* Photo 2 */}
                    <div
                      style={{ display: "flex", gap: "20px", width: "100%" }}
                    >
                      <div
                        className="logo-preview"
                        style={{ width: "120px", height: "80px" }}
                      >
                        {office2Url ? (
                          <img src={office2Url} alt="Office 2" />
                        ) : (
                          "P2"
                        )}
                        <div
                          className="logo-preview-overlay"
                          onClick={() => fileRef2.current?.click()}
                        >
                          Change
                        </div>
                      </div>
                      <div
                        className={`logo-dropzone ${dragover2 ? "dragover" : ""}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragover2(true);
                        }}
                        onDragLeave={() => setDragover2(false)}
                        onDrop={(e) => handleDrop(e, "office2")}
                        onClick={() => fileRef2.current?.click()}
                      >
                        <div className="dropzone-text">
                          <strong>Click to replace Photo 2</strong> or drag and
                          drop
                        </div>
                      </div>
                      <input
                        ref={fileRef2}
                        type="file"
                        className="file-input"
                        accept="image/*"
                        onChange={(e) =>
                          handleLogoFile(e.target.files?.[0], "office2")
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Company Details */}
                <div className="two-col-row">
                  <div className="row-label-col">
                    <div className="row-label">Company Details</div>
                    <div className="row-hint">
                      Introduce your company core info quickly to users by fill
                      up company details.
                    </div>
                  </div>
                  <div>
                    <div className="input-group">
                      <label className="input-group-label">Company Name</label>
                      <input
                        className="input-field"
                        value={form.companyName}
                        onChange={(e) => set("companyName", e.target.value)}
                        placeholder="e.g. Acme Inc."
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-group-label">Contact Phone</label>
                      <input
                        className="input-field"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="e.g. +1 234 567 890"
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-group-label">Location</label>
                      <LocationTagInput
                        tags={form.locations}
                        onAdd={(v: string) => set("locations", [...form.locations, v])}
                        onRemove={(v: string) =>
                          set(
                            "locations",
                            form.locations.filter((x) => x !== v),
                          )
                        }
                      />
                    </div>
                    <div className="input-group">
                      <div className="dual-select">
                        <div>
                          <label className="input-group-label">Employee</label>
                          <select
                            className="select-field"
                            value={form.employees}
                            onChange={(e) => set("employees", e.target.value)}
                          >
                            {EMP_RANGES.map((r) => (
                              <option key={r}>{r}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="input-group-label">Industry</label>
                          <select
                            className="select-field"
                            value={form.industry}
                            onChange={(e) => set("industry", e.target.value)}
                          >
                            {INDUSTRIES.map((i) => (
                              <option key={i}>{i}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-group-label">Date Founded</label>
                      <div className="date-row">
                        <select
                          className="select-field"
                          value={form.foundedDay}
                          onChange={(e) => set("foundedDay", e.target.value)}
                        >
                          {days.map((d) => (
                            <option key={d}>{d}</option>
                          ))}
                        </select>
                        <select
                          className="select-field"
                          value={form.foundedMonth}
                          onChange={(e) => set("foundedMonth", e.target.value)}
                        >
                          {MONTHS.map((m) => (
                            <option key={m}>{m}</option>
                          ))}
                        </select>
                        <select
                          className="select-field"
                          value={form.foundedYear}
                          onChange={(e) => set("foundedYear", e.target.value)}
                        >
                          {years.map((y) => (
                            <option key={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Company */}
                <div className="two-col-row">
                  <div className="row-label-col">
                    <div className="row-label">About Company</div>
                    <div className="row-hint">
                      Brief description for your company. URLs are hyperlinked.
                    </div>
                  </div>
                  <RichEditor
                    placeholder="Describe your company — mission, culture, what makes it great..."
                    maxChars={500}
                    onChange={(v) => set("description", v)}
                  />
                </div>
              </div>

              {/* Save bar */}
              <div className="save-bar">
                <div className="save-status">
                  <div
                    className={`save-dot ${saved ? "saved" : hasChanges ? "changed" : ""}`}
                  />
                  <span>
                    {saved
                      ? "All changes saved"
                      : hasChanges
                        ? "You have unsaved changes"
                        : "No changes"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {hasChanges && (
                    <button
                      className="discard-btn"
                      onClick={() => {
                        setHasChanges(false);
                        setSaved(false);
                      }}
                    >
                      Discard
                    </button>
                  )}
                  <button
                    className="save-btn"
                    disabled={!hasChanges}
                    onClick={handleSave}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "Social Links" && (
            <div className="section-block">
              <div
                className="section-header-bar"
                style={{ padding: "20px 28px 20px" }}
              >
                <div className="section-label">Social Links</div>
                <div className="section-desc">
                  Add your company's social media profiles.
                </div>
              </div>
              <div
                className="two-col-row"
                style={{ borderTop: "1px solid #f3f4f6" }}
              >
                <div className="row-label-col">
                  <div className="row-label">Website</div>
                </div>
                <input
                  className="input-field"
                  placeholder="https://yourcompany.com"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                />
              </div>
              {[
                ["LinkedIn", "https://linkedin.com/company/"],
                ["Twitter / X", "https://x.com/"],
                ["Instagram", "https://instagram.com/"],
                ["Facebook", "https://facebook.com/"],
                ["GitHub", "https://github.com/"],
              ].map(([name, ph]) => (
                <div
                  key={name}
                  className="two-col-row"
                  style={{ borderTop: "1px solid #f3f4f6" }}
                >
                  <div className="row-label-col">
                    <div className="row-label">{name}</div>
                  </div>
                  <input
                    className="input-field"
                    placeholder={ph}
                    value={
                      form.socialLinks[name as keyof typeof form.socialLinks]
                    }
                    onChange={(e) => setSocialLink(name, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === "Benefits" && (
            <div className="section-block">
              <div
                className="section-header-bar"
                style={{ padding: "20px 28px 20px" }}
              >
                <div className="section-label">Perks & Benefits</div>
                <div className="section-desc">
                  Highlight what makes your company a great place to work.
                </div>
              </div>
              <div style={{ padding: "20px 28px" }}>
                {form.benefits.length === 0 ? (
                  <div
                    style={{
                      padding: "20px 0",
                      color: "#6b7280",
                      fontStyle: "italic",
                    }}
                  >
                    No benefits added yet.
                  </div>
                ) : (
                  form.benefits.map((b, i) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: "20px",
                        padding: "16px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#374151",
                              marginBottom: "6px",
                            }}
                          >
                            Benefit Title
                          </label>
                          <input
                            className="input-field"
                            style={{
                              width: "100%",
                              padding: "10px",
                              fontSize: "14px",
                            }}
                            value={b.title}
                            onChange={(e) => {
                              const newBenefits = [...form.benefits];
                              newBenefits[i].title = e.target.value;
                              set("benefits", newBenefits);
                            }}
                            placeholder="e.g. Full Healthcare"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newBenefits = form.benefits.filter(
                              (_, idx) => idx !== i,
                            );
                            set("benefits", newBenefits);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontWeight: "bold",
                            padding: "10px",
                            marginTop: "24px",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#374151",
                            marginBottom: "6px",
                          }}
                        >
                          Description
                        </label>
                        <textarea
                          className="input-field"
                          style={{
                            width: "100%",
                            padding: "10px",
                            fontSize: "14px",
                            minHeight: "80px",
                            resize: "vertical",
                          }}
                          value={b.desc}
                          onChange={(e) => {
                            const newBenefits = [...form.benefits];
                            newBenefits[i].desc = e.target.value;
                            set("benefits", newBenefits);
                          }}
                          placeholder="Briefly explain this benefit..."
                        />
                      </div>
                    </div>
                  ))
                )}
                <button
                  onClick={() =>
                    set("benefits", [...form.benefits, { title: "", desc: "" }])
                  }
                  style={{
                    padding: "10px 16px",
                    background: "#f3f4f6",
                    border: "1.5px dashed #d1d5db",
                    borderRadius: "8px",
                    color: "#4b5563",
                    fontWeight: 600,
                    cursor: "pointer",
                    width: "100%",
                    marginTop: "10px",
                  }}
                >
                  + Add New Benefit
                </button>
              </div>
            </div>
          )}

          {/* Save Bar */}
          <div className="save-bar">
            <div className="save-status">
              <div
                className={`save-dot ${
                  hasChanges ? "changed" : saved ? "saved" : ""
                }`}
              />
              {hasChanges
                ? "Unsaved changes"
                : saved
                  ? "All changes saved"
                  : "No changes"}
            </div>
            <div>
              {hasChanges && (
                <button
                  className="discard-btn"
                  onClick={() => window.location.reload()}
                >
                  Discard
                </button>
              )}
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={!hasChanges && !saved}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
