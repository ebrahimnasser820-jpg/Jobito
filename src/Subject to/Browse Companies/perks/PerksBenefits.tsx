import React from "react";
import styles from "./PerksBenefits.module.css";
import { motion } from "framer-motion";

interface Perk {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const perks: Perk[] = [
  {
    icon: "🏥",
    title: "Full Healthcare",
    description:
      "Believe in the human right to quality healthcare. Stripe is for you.",
  },
  {
    icon: "📈",
    title: "Unlimited Vacation",
    description:
      "Believe in a healthy work-life balance. Take time off when you need it.",
  },
  {
    icon: "🏠",
    title: "Skill Development",
    description:
      "We believe in and invest in our people's growth and skill set.",
  },
  {
    icon: "🤝",
    title: "Team Summits",
    description: "Two times a year we get the whole company together to work.",
  },
  {
    icon: "📅",
    title: "Remote Working",
    description:
      "Believe in the human right to quality healthcare. Nomad is for you.",
  },
  {
    icon: "🏃",
    title: "Commuter Benefits",
    description:
      "We believe in and invest in our people's growth and skill set.",
  },
  {
    icon: "🎁",
    title: "We Give Back",
    description:
      "We believe in and invest in our people's growth and skill set.",
  },
  {
    icon: "☕",
    title: "Free Food",
    description:
      "Believe in the human right to quality healthcare. Stripe is for you.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const PerksBenefits: React.FC = () => {
  return (
    <div className={styles.perksContainer}>
      <div className={styles.titleArea}>
        <h2>Perks & Benefits</h2>
        <p>
          This job comes with several perks and benefits to help you stay
          productive and healthy.
        </p>
      </div>

      <motion.div
        className={styles.perksGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {perks.map((perk, index) => (
          <motion.div
            key={index}
            className={styles.perkCard}
            variants={itemVariants}
          >
            <div className={styles.perkIcon}>{perk.icon}</div>
            <h3 className={styles.perkTitle}>{perk.title}</h3>
            <p className={styles.perkDescription}>{perk.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PerksBenefits;
