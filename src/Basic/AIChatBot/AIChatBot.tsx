import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Paperclip,
  Mic,
  Bot,
  Volume2,
  VolumeX,
  Send,
  FileText,
  Pencil,
  Briefcase,
  ArrowLeft,
  Languages,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../context/translation-context";
import { useJobitoAuth } from "../../context/LinkContxt";
import { useTheme } from "../../context/ThemeContext";
import styles from "./AIChatBot.module.css";

const s = styles as Record<string, string>;

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  type?: "text" | "image" | "file";
  imageUrl?: string;
}

const renderMessageText = (text: string) => {
  if (!text) return "";
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i}>{part}</strong>;
    }
    return part;
  });
};

const AIChatBot: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { user, apiFetch } = useJobitoAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsTyping(false);
    }
  };

  const isAutoScrollEnabled = useRef(true);

  const handleScroll = () => {
    const chat = chatEndRef.current?.parentElement;
    if (chat) {
      const isAtBottom =
        chat.scrollHeight - chat.scrollTop <= chat.clientHeight + 100;
      isAutoScrollEnabled.current = isAtBottom;
    }
  };

  useEffect(() => {
    if (isAutoScrollEnabled.current) {
      chatEndRef.current?.scrollIntoView({
        behavior: isTyping ? "auto" : "smooth",
      });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user?.id) {
        try {
          const res = await apiFetch(`${API}/ai-chatbot/history/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data)) {
              const formatted = data.map((m: any, index: number) => ({
                id: `h_${index}`,
                role: m.role === "assistant" ? "bot" : "user",
                text: m.content,
              }));
              setMessages(formatted);
            }
          }
        } catch (e) {
          console.error("Failed to fetch history", e);
        }
      }
    };
    fetchHistory();
  }, [user?.id, apiFetch]);

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Strip punctuation so TTS reads words only
    const cleanText = text
      .replace(/[.*?!,:;()[\]{}\-_#@&"'`~|/\\<>+=%^$•—–…।॥؟،؛]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const isArabic = language === "ar" || /[\u0600-\u06FF]/.test(text);
    if (isArabic) {
      utterance.lang = "ar-SA";
      const arVoice = voices.find((v) => v.lang.startsWith("ar"));
      if (arVoice) utterance.voice = arVoice;
    } else {
      utterance.lang = "en-US";
      const enVoice = voices.find((v) => v.lang.startsWith("en"));
      if (enVoice) utterance.voice = enVoice;
    }
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (
    text?: string,
    imageData?: string,
    fileType: string = "image",
  ) => {
    const content = text || input;
    if (!content && !imageData) return;

    if (isTyping) {
      stopGeneration();
      return;
    }

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      text: content,
      type: imageData ? "image" : "text",
      imageUrl: imageData,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!text) setInput("");
    setIsTyping(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API}/ai-chatbot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          userId: user?.id,
          image: imageData,
          fileType,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("API Error");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let botText = "";
      const botId = `b_${Date.now()}`;

      setMessages((prev) => [...prev, { id: botId, role: "bot", text: "" }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                botText += parsed.text;
                // Clean leaked tokens from the entire buffer
                const cleanDisplay = botText
                  .replace(/<\|.*?\|>/g, "")
                  .replace(/(?:\[)?theme:\s*\w+[\?\!\.\s]*(?:\])?/gi, "");

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botId ? { ...m, text: cleanDisplay } : m,
                  ),
                );
              }
            } catch (e) {}
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        const errMsg: ChatMessage = {
          id: `e_${Date.now()}`,
          role: "bot",
          text: t(
            "Sorry, I'm unable to connect right now.",
            "عذراً، لا أستطيع الاتصال الآن.",
          ),
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = event.target?.result as string;
        let fileType = file.type.startsWith("image") ? "image" : "file";
        sendMessage("", fileData, fileType);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = language === "ar" ? "ar-SA" : "en-US";
    recognition.onresult = (event: any) =>
      setInput(event.results[0][0].transcript);
    recognition.start();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const jobSuggestions = [
    {
      title: t("Career Advice", "نصائح مهنية"),
      icon: <FileText size={20} />,
      items: [
        t("How to improve my CV?", "كيف أحسن سيرتي الذاتية؟"),
        t("Tips for a successful interview", "نصائح لمقابلة عمل ناجحة"),
      ],
    },
    {
      title: t("Professional Writing", "كتابة مهنية"),
      icon: <Pencil size={20} />,
      items: [
        t(
          "Write a professional Cover Letter",
          "اكتب خطاب تغطية (Cover Letter) احترافي",
        ),
        t("Edit my LinkedIn summary", "عدل نبذتي الشخصية لـ LinkedIn"),
      ],
    },
    {
      title: t("Job Search & Salaries", "البحث عن عمل والرواتب"),
      icon: <Briefcase size={20} />,
      items: [
        t("Most demanded skills in 2024", "أكثر المهارات المطلوبة في 2024"),
        t("How to negotiate my salary?", "كيف أتفاوض على راتبي بشكل صحيح؟"),
      ],
    },
  ];
  // Hide body scrollbar when chatbot is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  return (
    <div className={s.container}>
      {/* ─── Sleek Sticky Header ─── */}
      <header className={s.headerBar}>
        <div className={s.headerLeft}>
          <button 
            className={s.headerBtn} 
            onClick={() => navigate(-1)} 
            title={t("Back", "رجوع")}
          >
            <ArrowLeft size={18} />
          </button>
        </div>
        
        <div className={s.headerCenter}>
          <div className={s.headerAvatar}>
            <Bot size={18} />
          </div>
          <span className={s.headerTitle}>{t("Jobito AI Assistant", "مساعد Jobito الذكي")}</span>
        </div>
        
        <div className={s.headerRight}>
          <button 
            className={s.headerBtn} 
            onClick={toggleTheme} 
            title={isDark ? t("Light Mode", "الوضع الفاتح") : t("Dark Mode", "الوضع المظلم")}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button 
            className={s.headerBtn} 
            onClick={toggleLanguage} 
            title={t("Switch Language", "تغيير اللغة")}
          >
            <Languages size={18} />
          </button>
        </div>
      </header>

      {/* ─── Chat Area ─── */}
      <div className={s.chatArea} onScroll={handleScroll}>
        {!messages.length ? (
          <div className={s.welcomeSection}>
            <div className={s.botAvatarBig}>
              <Bot size={40} color="var(--color-primary)" />
            </div>
            <h1 className={s.welcomeTitle}>
              {t("Jobito AI Assistant", "مساعد Jobito الذكي")}
            </h1>
            <p className={s.welcomeSubtitle}>
              {t(
                "Ask anything about your career, CV, or interviews",
                "اسأل عن أي شيء يخص مسارك المهني، سيرتك الذاتية، أو المقابلات",
              )}
            </p>

            <div className={s.suggestionsGrid}>
              {jobSuggestions.map((cat, i) => (
                <div key={i} className={s.suggestionCat}>
                  <div className={s.catHeader}>
                    {cat.icon}
                    <span>{cat.title}</span>
                  </div>
                  <div className={s.catItems}>
                    {cat.items.map((item, j) => (
                      <button
                        key={j}
                        className={s.sugBtn}
                        onClick={() => sendMessage(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${s.msgRow} ${msg.role === "user" ? s.msgRowUser : s.msgRowBot}`}
              >
                {msg.role === "bot" && (
                  <div className={s.botAvatarSmall}>
                    <Bot size={16} />
                  </div>
                )}
                <div
                  className={`${s.bubble} ${msg.role === "user" ? s.bubbleUser : `${s.bubbleBot} ${s.glassy}`}`}
                  dir="auto"
                >
                  {msg.type === "image" ? (
                    <img
                      src={msg.imageUrl}
                      alt="uploaded"
                      style={{ maxWidth: "200px", borderRadius: "10px" }}
                    />
                  ) : (
                    renderMessageText(msg.text)
                  )}
                  {msg.role === "bot" && msg.text && (
                    <div className={s.bubbleActionsInside}>
                      <button
                        className={s.miniActionBtn}
                        onClick={() =>
                          isSpeaking ? stopSpeaking() : speak(msg.text)
                        }
                      >
                        {isSpeaking ? (
                          <VolumeX size={12} />
                        ) : (
                          <Volume2 size={12} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ─── Floating Input Area at BOTTOM ─── */}
      <div className={s.inputSection}>
        <div className={s.inputWrapper}>
          <input
            ref={inputRef}
            className={s.inputField}
            placeholder={t("Write your message...", "اكتب رسالتك...")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            dir="auto"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <div className={s.actions}>
            <button
              className={`${s.sendBtn} ${isTyping ? s.stopBtn : ""}`}
              onClick={() => (isTyping ? stopGeneration() : sendMessage())}
              disabled={!input.trim() && !isTyping}
            >
              {isTyping ? <div className={s.stopIcon} /> : <Send size={18} />}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={onFileSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatBot;
