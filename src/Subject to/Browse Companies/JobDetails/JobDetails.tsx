import React from "react";
import styles from "./JobDetails.module.css";

const JobDetails: React.FC = () => {
  return (
    <div className={styles.jobContainer}>
      <section className={styles.section}>
        <h2>About this role</h2>

        <div className={styles.progressBox}>
          <p>
            <strong>5 applied</strong> of 10 capacity
          </p>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
        </div>

        <div className={styles.jobInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Apply Before</span>
            <span className={styles.infoValue}>July 31, 2021</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Job Posted On</span>
            <span className={styles.infoValue}>July 1, 2021</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Job Type</span>
            <span className={styles.infoValue}>Full-Time</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Salary</span>
            <span className={styles.infoValue}>$75k-$85k USD</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <h2>Categories</h2>
        <div className={styles.tags}>
          <div className={`${styles.tag} ${styles.tagMarketing}`}>
            Marketing
          </div>
          <div className={`${styles.tag} ${styles.tagDesign}`}>Design</div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Required Skills</h2>
        <div className={styles.skillsList}>
          <span className={styles.skillItem}>Project Management</span>
          <span className={styles.skillItem}>Copywriting</span>
          <span className={styles.skillItem}>Social Media Marketing</span>
          <span className={styles.skillItem}>English</span>
          <span className={styles.skillItem}>Copy Editing</span>
        </div>
      </section>
    </div>
  );
};

export default JobDetails;
