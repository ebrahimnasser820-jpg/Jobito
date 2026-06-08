import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "../../../context/translation-context";
import { useToast } from "../../../context/ToastContext";
import { useJobitoAuth } from "../../../context/LinkContxt";
import styles from "./CVViewer.module.css";
import * as pdfjsLib from "pdfjs-dist";

// Initialize pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function CVViewer() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { apiFetch } = useJobitoAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const fileUrlParam = searchParams.get("fileUrl") || "";
  const applicantName = searchParams.get("name") || "Applicant";
  const customTitle = searchParams.get("title") || "";

  const [pdfText, setPdfText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"pdf" | "image" | null>(null);

  // Reconstruct complete URL
  const fileUrl = fileUrlParam.startsWith("http")
    ? fileUrlParam
    : `${API_BASE_URL}${fileUrlParam.startsWith("/") ? "" : "/"}${fileUrlParam}`;

  useEffect(() => {
    if (!fileUrlParam) {
      setError(t("لا يوجد ملف لعرضه"));
      setLoading(false);
      return;
    }

    const detectAndProcess = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error(t("فشل تحميل الملف"));
        
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("pdf")) {
          setFileType("pdf");
          const arrayBuffer = await response.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            fullText += `--- Page ${i} ---\n${pageText}\n\n`;
          }
          setPdfText(fullText.trim() ? fullText : t("الملف فارغ أو عبارة عن صور ممسوحة ضوئياً لا يمكن قراءة نصوصها."));
        } else if (contentType.startsWith("image/")) {
          setFileType("image");
        } else {
          throw new Error(t("نوع ملف غير مدعوم"));
        }
      } catch (err: any) {
        console.error("Error processing file:", err);
        setError(err.message || t("حدث خطأ أثناء عرض الملف"));
      } finally {
        setLoading(false);
      }
    };

    detectAndProcess();
  }, [fileUrl, fileUrlParam, t]);

  const handleDownloadTxt = () => {
    try {
      const blob = new Blob([pdfText], { type: "text/plain;charset=utf-8" });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${applicantName.replace(/\s+/g, "_")}_CV_Content.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      showToast(t("تم تحميل النص بنجاح"), "success");
    } catch (err) {
      showToast(t("فشل تحميل النص"), "error");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← {t("Back")}
        </button>
        <h2>{customTitle ? `${customTitle} ${applicantName}` : `${t("محتوى السيرة الذاتية لـ")} ${applicantName}`}</h2>
        {!loading && !error && fileType === "pdf" && (
          <button className={styles.downloadBtn} onClick={handleDownloadTxt}>
            📥 {t("تحميل النص")}
          </button>
        )}
      </div>

      <div className={styles.viewerBody}>
        {loading && (
          <div className={styles.statusBox}>
            <div className={styles.spinner}></div>
            <p>{t("جاري معالجة الملف...")}</p>
          </div>
        )}

        {error && (
          <div className={`${styles.statusBox} ${styles.errorBox}`}>
            <p>⚠️ {error}</p>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={styles.openDirectBtn}>
              {t("فتح الملف الأصلي مباشرة")}
            </a>
          </div>
        )}

        {!loading && !error && (
          <div className={styles.textContentArea}>
            {fileType === "pdf" ? (
              <pre className={styles.preContent}>{pdfText}</pre>
            ) : fileType === "image" ? (
              <img src={fileUrl} alt="Applicant CV" className={styles.imageContent} style={{ maxWidth: '100%' }} />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
