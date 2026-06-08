import styles from "./BannerSection.module.css";
import image2 from "../.../../../../assets/Img/Gemini_Generated_Image_lk4biqlk4biqlk4b.png";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../../../context/translation-context";

// ✅ Hook الـ Typewriter
function useTypewriter(text: string, speed = 28, startDelay = 0) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    setDisplayed("");
    let i = 0;
    const delay = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(delay);
  }, [started, text, speed, startDelay]);

  return { displayed, start: () => setStarted(true) };
}

// ✅ Typewriter Component
function TypewriterText({
  text,
  speed = 28,
  startDelay = 0,
  className,
  tag: Tag = "p",
}: {
  text: string;
  speed?: number;
  startDelay?: number;
  className?: string;
  tag?: "p" | "h2" | "span" | "strong";
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const { displayed, start } = useTypewriter(text, speed, startDelay);

  useEffect(() => {
    if (inView) start();
  }, [inView, start]);


  return (
    <Tag ref={ref} className={className}>
      {displayed}
      {displayed.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          style={{ display: "inline-block", width: 2, height: "1em", background: "currentColor", marginLeft: 2, verticalAlign: "middle" }}
        />
      )}
    </Tag>
  );
}

export const BannerSection = () => {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });
  const { t } = useTranslation();

  return (
    <section className={styles.helpoutercontainer} ref={sectionRef}>
      <motion.div
        className={styles.helpbluebanner}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className={styles.helpcontentwrapper}>

          <div className={styles.helptextside}>

            <TypewriterText
              tag="h2"
              text={t("نحن نؤمن بالابتكار الرقمي")}
              speed={60}
              startDelay={300}
            />

            <TypewriterText
              text={t("مهمتنا هي تمكين كل فرد من الوصول إلى الفرصة التي يستحقها، من خلال تقنيات حديثة وتواصل فعال يكسر الحواجز.")}
              speed={18}
              startDelay={1400}
              className={styles.description}
            />

            <motion.div
              className={styles.authorinfo}
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 2.2, ease: "easeOut" }}
            >
              <strong>Farah Mody</strong> - {t("مديرة العمليات")}
            </motion.div>

          </div>

          <motion.div
            className={styles.helpimageside}
            initial={{ opacity: 0, rotate: -8, scale: 0.9 }}
            animate={inView ? { opacity: 1, rotate: -4, scale: 1 } : {}}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
            whileHover={{
              rotate: 0,     
              scale: 1.04,
              transition: { duration: 0.35, ease: "easeOut" },
            }}
            whileTap={{ rotate: 4, scale: 0.97 }}
          >
            <div className={styles.blobshape}>
              <img src={image2} alt="Director" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};