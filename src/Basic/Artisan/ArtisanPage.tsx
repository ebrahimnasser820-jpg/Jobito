import { useState } from "react";

const C = {
  navy: "#0B1020",
  cobalt: "#4A6ED1",
  cobaltDark: "#2e4fa3",
  cobaltLight: "#7a9bec",
  cobaltPale: "#eef2fc",
  cobaltMid: "#d4defc",
  tangerine: "#FF7A2A",
  tangerineDark: "#d95f10",
  tangerineLight: "#ffb380",
  tangerinePale: "#fff3eb",
  tangerineMid: "#ffe0c8",
  taupe: "#B59A90",
  taupeDark: "#8a6e64",
  taupePale: "#f7f2f0",
  white: "#ffffff",
  gray50: "#f9fafb",
  gray100: "#f2f4f8",
  gray200: "#e4e8f0",
  gray400: "#9aa5c0",
  gray600: "#5a6480",
  gray800: "#2a3050",
};

const CATEGORIES = [
  { icon: "🔧", label: "Plumber", color: C.cobaltPale, accent: C.cobalt },
  {
    icon: "⚡",
    label: "Electrician",
    color: C.tangerinePale,
    accent: C.tangerine,
  },
  { icon: "🔩", label: "Mechanic", color: C.taupePale, accent: C.taupeDark },
  {
    icon: "🪚",
    label: "Carpenter",
    color: C.tangerinePale,
    accent: C.tangerineDark,
  },
  {
    icon: "🔐",
    label: "Blacksmith",
    color: C.cobaltPale,
    accent: C.cobaltDark,
  },
  {
    icon: "🧱",
    label: "Plasterer / Mason",
    color: C.taupePale,
    accent: C.taupe,
  },
  {
    icon: "🪟",
    label: "Alumetal Installer",
    color: C.cobaltPale,
    accent: C.cobalt,
  },
  {
    icon: "🏺",
    label: "Tile / Ceramics",
    color: C.tangerinePale,
    accent: C.tangerine,
  },
  {
    icon: "🖌️",
    label: "Painter / Printer",
    color: C.cobaltPale,
    accent: C.cobaltDark,
  },
  {
    icon: "🏗️",
    label: "General Constructor",
    color: C.taupePale,
    accent: C.taupeDark,
  },
];

const ARTISANS = [
  {
    name: "Ahmed Khaled",
    location: "Cairo, Nasr City",
    rating: 4.8,
    reviews: 120,
    badge: "Top Rated",
    specialty: "Plumber",
    jobs: 214,
  },
  {
    name: "Aamof Arelyn",
    location: "Cairo, Maadi",
    rating: 4.7,
    reviews: 98,
    badge: "Verified",
    specialty: "Electrician",
    jobs: 183,
  },
  {
    name: "Ahmad Khaled",
    location: "Cairo, Zamalek",
    rating: 4.9,
    reviews: 214,
    badge: "Top Rated",
    specialty: "Carpenter",
    jobs: 301,
  },
  {
    name: "Walber Rubes",
    location: "Cairo, Heliopolis",
    rating: 4.6,
    reviews: 75,
    badge: "Verified",
    specialty: "Mechanic",
    jobs: 140,
  },
  {
    name: "Anael Anael",
    location: "Cairo, New Cairo",
    rating: 4.8,
    reviews: 161,
    badge: "Top Rated",
    specialty: "Ceramics",
    jobs: 198,
  },
  {
    name: "Ahmad Samir",
    location: "Cairo, Dokki",
    rating: 4.7,
    reviews: 88,
    badge: "Verified",
    specialty: "Painter",
    jobs: 167,
  },
  {
    name: "Anael Khan",
    location: "Cairo, 6th October",
    rating: 4.5,
    reviews: 53,
    badge: null,
    specialty: "Plasterer",
    jobs: 89,
  },
  {
    name: "General Khaled",
    location: "Cairo, Shubra",
    rating: 4.9,
    reviews: 305,
    badge: "Top Rated",
    specialty: "Constructor",
    jobs: 412,
  },
];

const AV_COLORS = [
  { bg: C.cobaltPale, text: C.cobaltDark, border: C.cobaltMid },
  { bg: C.tangerinePale, text: C.tangerineDark, border: C.tangerineMid },
  { bg: C.taupePale, text: C.taupeDark, border: "#e8d8d2" },
  { bg: "#f0f4ff", text: C.cobalt, border: C.cobaltMid },
];

function Initials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Stars({ rating }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 12 12">
          <polygon
            points="6,1 7.5,4.5 11,4.8 8.5,7 9.3,10.5 6,8.8 2.7,10.5 3.5,7 1,4.8 4.5,4.5"
            fill={
              i <= Math.floor(rating)
                ? C.tangerine
                : i - 0.5 <= rating
                  ? C.tangerineLight
                  : C.gray200
            }
          />
        </svg>
      ))}
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: C.tangerineDark,
          marginLeft: 3,
        }}
      >
        {rating}
      </span>
    </span>
  );
}

function CategoryCard({ icon, label, color, accent }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? color : C.white,
        border: `1.5px solid ${hov ? accent + "66" : C.gray200}`,
        borderRadius: 16,
        padding: "18px 8px 14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        transition: "all 0.22s ease",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov
          ? `0 10px 28px ${accent}20`
          : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: hov ? C.white : color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          transition: "all 0.22s",
          boxShadow: hov ? `0 4px 12px ${accent}28` : "none",
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: 9.5,
          fontWeight: 800,
          textAlign: "center",
          lineHeight: 1.35,
          color: hov ? accent : C.gray600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function ArtisanCard({ artisan, index }) {
  const [hov, setHov] = useState(false);
  const av = AV_COLORS[index % AV_COLORS.length];
  const isTop = artisan.badge === "Top Rated";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.white,
        border: `1.5px solid ${hov ? (isTop ? C.tangerine + "55" : C.cobalt + "55") : C.gray200}`,
        borderRadius: 18,
        padding: "18px 18px 16px",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        cursor: "pointer",
        transition: "all 0.22s ease",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov
          ? `0 12px 32px ${isTop ? C.tangerine + "18" : C.cobalt + "16"}`
          : "0 2px 8px rgba(0,0,0,0.04)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {hov && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: isTop
              ? `linear-gradient(90deg, ${C.tangerine}, ${C.cobalt})`
              : `linear-gradient(90deg, ${C.cobalt}, ${C.tangerine})`,
            borderRadius: "18px 18px 0 0",
          }}
        />
      )}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: av.bg,
            color: av.text,
            border: `2px solid ${av.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 900,
            fontFamily: "Georgia, serif",
          }}
        >
          {Initials(artisan.name)}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            width: 13,
            height: 13,
            borderRadius: "50%",
            background: "#22c55e",
            border: `2px solid ${C.white}`,
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 3,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 900,
              color: C.navy,
              fontFamily: "Georgia, serif",
            }}
          >
            {artisan.name}
          </span>
          {artisan.badge && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: 20,
                background: isTop ? C.tangerinePale : C.cobaltPale,
                color: isTop ? C.tangerineDark : C.cobaltDark,
                border: `1px solid ${isTop ? C.tangerineMid : C.cobaltMid}`,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {isTop ? "★ Top Rated" : "✓ Verified"}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 11,
            color: C.gray400,
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span style={{ color: C.tangerine, fontSize: 9 }}>●</span>
          {artisan.specialty} · {artisan.location}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          <Stars rating={artisan.rating} />
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ fontSize: 10, color: C.gray400 }}>
              <span style={{ color: C.gray600, fontWeight: 700 }}>
                {artisan.reviews}
              </span>{" "}
              reviews
            </span>
            <span style={{ fontSize: 10, color: C.gray400 }}>
              <span style={{ color: C.gray600, fontWeight: 700 }}>
                {artisan.jobs}
              </span>{" "}
              jobs
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: 18,
          color: hov ? C.cobalt : C.gray200,
          transition: "all 0.2s",
          transform: hov ? "translateX(2px)" : "translateX(0)",
          alignSelf: "center",
          lineHeight: 1,
        }}
      >
        ›
      </div>
    </div>
  );
}

export default function ArtisanPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const displayed = ARTISANS.filter((a) => {
    const s = search.toLowerCase();
    const ok =
      a.name.toLowerCase().includes(s) || a.specialty.toLowerCase().includes(s);
    const f = filter === "All" || a.badge === filter;
    return ok && f;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.gray50,
        fontFamily: "'Trebuchet MS', Georgia, sans-serif",
      }}
    >
      <div
        style={{
          height: 4,
          background: `linear-gradient(90deg, ${C.cobalt}, ${C.tangerine}, ${C.cobaltLight})`,
        }}
      />

      <div
        style={{
          position: "fixed",
          top: -60,
          right: -60,
          width: 320,
          height: 320,
          background: `radial-gradient(circle, ${C.tangerinePale} 0%, transparent 70%)`,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 40,
          left: -80,
          width: 260,
          height: 260,
          background: `radial-gradient(circle, ${C.cobaltPale} 0%, transparent 70%)`,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "40px 20px 60px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: C.cobaltPale,
              border: `1px solid ${C.cobaltMid}`,
              borderRadius: 30,
              padding: "5px 16px",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: C.tangerine,
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: C.cobalt,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 800,
              }}
            >
              Trusted Professionals Network
            </span>
          </div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 900,
              fontFamily: "Georgia, serif",
              margin: "0 0 12px",
              letterSpacing: "-0.03em",
              color: C.navy,
            }}
          >
            Service{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${C.cobalt}, ${C.tangerine})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Categories
            </span>
          </h1>
          <p
            style={{
              fontSize: 14,
              color: C.gray600,
              maxWidth: 380,
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            Browse our curated list of skilled artisans. Illustration and
            mastermatch vector icons.
          </p>
        </div>

        {/* Categories card */}
        <div
          style={{
            background: C.white,
            borderRadius: 22,
            padding: 24,
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            marginBottom: 28,
            border: `1px solid ${C.gray200}`,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 10,
            }}
          >
            {CATEGORIES.map((c, i) => (
              <CategoryCard key={i} {...c} />
            ))}
          </div>
        </div>

        {/* Find Artisan card */}
        <div
          style={{
            background: C.white,
            borderRadius: 22,
            padding: 28,
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            border: `1px solid ${C.gray200}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 21,
                  fontWeight: 900,
                  fontFamily: "Georgia, serif",
                  color: C.navy,
                  margin: "0 0 4px",
                  letterSpacing: "-0.02em",
                }}
              >
                Find a Qualified Artisan
              </h2>
              <p style={{ fontSize: 12, color: C.gray400, margin: 0 }}>
                Filter by location, specialty and ratings.
              </p>
            </div>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 13,
                  color: C.gray400,
                  pointerEvents: "none",
                }}
              >
                🔍
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or skill..."
                style={{
                  background: C.gray100,
                  border: `1.5px solid ${C.gray200}`,
                  borderRadius: 10,
                  padding: "9px 14px 9px 33px",
                  fontSize: 13,
                  color: C.gray800,
                  outline: "none",
                  width: 190,
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = C.cobalt)}
                onBlur={(e) => (e.target.style.borderColor = C.gray200)}
              />
            </div>
          </div>

          {/* Filter pills */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 18,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {["All", "Top Rated", "Verified"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  border: "none",
                  background:
                    filter === f
                      ? f === "Top Rated"
                        ? C.tangerine
                        : f === "Verified"
                          ? C.cobalt
                          : C.navy
                      : C.gray100,
                  color: filter === f ? C.white : C.gray600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  boxShadow:
                    filter === f
                      ? `0 4px 12px ${f === "Top Rated" ? C.tangerine : f === "Verified" ? C.cobalt : C.navy}44`
                      : "none",
                }}
              >
                {f === "Top Rated"
                  ? "★ Top Rated"
                  : f === "Verified"
                    ? "✓ Verified"
                    : "All"}
              </button>
            ))}
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                color: C.gray400,
                fontWeight: 600,
              }}
            >
              {displayed.length} artisan{displayed.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* AI note */}
          <div
            style={{
              background: `linear-gradient(135deg, ${C.cobaltPale}, ${C.tangerinePale})`,
              border: `1px solid ${C.cobaltMid}`,
              borderRadius: 12,
              padding: "10px 16px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12,
              color: C.gray600,
            }}
          >
            <span style={{ fontSize: 15 }}>✨</span>
            Displaying artisans based on{" "}
            <strong style={{ color: C.cobalt }}>+IMAGE</strong> (or
            description). Verified network — sorted by work, location, and
            customer ratings.
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {[
              {
                label: "Registered Artisans",
                value: "2,400+",
                color: C.cobalt,
                bg: C.cobaltPale,
              },
              {
                label: "Completed Jobs",
                value: "18,500+",
                color: C.tangerineDark,
                bg: C.tangerinePale,
              },
              {
                label: "5-Star Reviews",
                value: "9,800+",
                color: C.taupeDark,
                bg: C.taupePale,
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: s.bg,
                  borderRadius: 12,
                  padding: "12px 14px",
                  border: `1px solid ${s.color}22`,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: s.color,
                    fontFamily: "Georgia, serif",
                    marginBottom: 2,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    color: C.gray600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 700,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Artisan grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            {displayed.map((a, i) => (
              <ArtisanCard key={i} artisan={a} index={i} />
            ))}
          </div>

          {displayed.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: C.gray400,
                fontSize: 14,
              }}
            >
              No artisans match your search.
            </div>
          )}

          {/* CTA */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 28,
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <button
              style={{
                background: `linear-gradient(135deg, ${C.cobalt}, ${C.cobaltDark})`,
                color: C.white,
                border: "none",
                borderRadius: 12,
                padding: "12px 28px",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                letterSpacing: "0.04em",
                boxShadow: `0 6px 20px ${C.cobalt}40`,
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 10px 28px ${C.cobalt}55`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 6px 20px ${C.cobalt}40`;
              }}
            >
              View All Profiles →
            </button>
            <button
              style={{
                background: C.white,
                color: C.gray600,
                border: `1.5px solid ${C.gray200}`,
                borderRadius: 12,
                padding: "12px 24px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.04em",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.tangerine;
                e.currentTarget.style.color = C.tangerineDark;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.gray200;
                e.currentTarget.style.color = C.gray600;
              }}
            >
              Browse Categories
            </button>
          </div>
        </div>
      </div>

      <style>{`* { box-sizing: border-box; } input::placeholder { color: #9aa5c0; }`}</style>
    </div>
  );
}
