import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "../../context/translation-context";
import styles from "./ChatBotWidget.module.css";

const s = styles as Record<string, string>;

const ChatBotWidget: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on AI chat page itself
  if (location.pathname.toLowerCase() === "/ai-chat") return null;

  return (
    <motion.button
      className={s.fab}
      onClick={() => navigate("/ai-chat")}
      whileTap={{ scale: 0.9 }}
      aria-label={t("Open AI Assistant", "افتح المساعد الذكي")}
    >
      <svg width="28" height="26" viewBox="0 0 28 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.8 25L9 20.2H5.8C4.52696 20.2 3.30606 19.6943 2.40589 18.7941C1.50571 17.8939 1 16.673 1 15.4V5.8C1 4.52696 1.50571 3.30606 2.40589 2.40589C3.30606 1.50571 4.52696 1 5.8 1H21.8C23.073 1 24.2939 1.50571 25.1941 2.40589C26.0943 3.30606 26.6 4.52696 26.6 5.8V15.4C26.6 16.673 26.0943 17.8939 25.1941 18.7941C24.2939 19.6943 23.073 20.2 21.8 20.2H18.6L13.8 25Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </motion.button>
  );
};

export default ChatBotWidget;
