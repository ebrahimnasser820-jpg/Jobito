import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";
import { useTranslation } from "../../context/translation-context";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "var(--color-bg)",
        padding: "20px",
        fontFamily: '"Inter", "Roboto", -apple-system, sans-serif',
        textAlign: "center",
      }}
    >
      {/* 404 Visual CSS */}
      <div className="notfound-visual-container" style={{ marginBottom: '40px' }}>
        <div className="notfound-visual">
          <span className="notfound-digit digit-1">4</span>
          <span className="notfound-digit digit-2">0</span>
          <span className="notfound-digit digit-3">4</span>
        </div>
        <div className="notfound-glitch-line"></div>
      </div>

      {/* Main Header */}
      <h1
        style={{
          fontSize: "4.5rem",
          fontWeight: "800",
          margin: "0 0 10px 0",
          color: "var(--color-text)",
          letterSpacing: "-1px",
        }}
      >
        {t("Ooops!")}
      </h1>

      {/* Subheader */}
      <h2
        style={{
          fontSize: "1.8rem",
          fontWeight: "700",
          margin: "0 0 15px 0",
          color: "var(--color-text-secondary)",
        }}
      >
        {t("Looks like you're in the wrong place.")}
      </h2>

      {/* Secondary Text */}
      <p
        style={{
          fontSize: "1rem",
          color: "var(--color-text-muted)",
          marginBottom: "40px",
          fontWeight: "500",
        }}
      >
        {t("We can't find the page you're looking for...")}
      </p>

      {/* Action Button */}
      <button
        onClick={() => navigate("/")}
        style={{
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          fontSize: "1rem",
          fontWeight: "700",
          color: "#fff",
          backgroundColor: "var(--color-primary)",
          border: "none",
          padding: "14px 32px",
          borderRadius: "50px",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
          e.currentTarget.style.backgroundColor = "var(--color-primary-hover)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
          e.currentTarget.style.backgroundColor = "var(--color-primary)";
        }}
      >
        <span>{t("Take me home")}</span>
      </button>
    </div>
  );
};

export default NotFound;
