import React from "react";
import styles from "./JobsSection.module.css";

const latestJobs = [
  { title: "Social Media Assistant", company: "Nomad · Paris, France" },
  { title: "Social Media Assistant", company: "Netlify · Paris, France" },
  { title: "Brand Designer", company: "Dropbox · San Francisco, USA" },
  { title: "Brand Designer", company: "Maze · San Francisco, USA" },
  { title: "Interactive Developer", company: "Terraform · Hamburg, Germany" },
  { title: "Interactive Developer", company: "Udacity · Hamburg, Germany" },
  { title: "HR Manager", company: "Packer · Lucern, Switzerland" },
  { title: "HR Manager", company: "Webflow · Lucern, Switzerland" },
];

const EJobsSection: React.FC = () => {
  return (
    <div className={styles.jobsContainer}>
      <div className={styles.sectionHeader}>
        <h2>
          Similar <span>Jobs</span>
        </h2>
        <a href="#" className={styles.showAll}>
          Show all jobs →
        </a>
      </div>
      <div className={styles.latestGrid}>
        {latestJobs.map((job, index) => (
          <div key={index} className={styles.latestCard}>

            <div style={{ flex: 1 }}>
              <h4>{job.title}</h4>
              <p>{job.company}</p>
              <div className={styles.tags}>
                <span className={`${styles.tag} ${styles.tagFulltime}`}>
                  Full Time
                </span>
                <span className={`${styles.tag} ${styles.tagMarketing}`}>
                  Marketing
                </span>
                <span className={`${styles.tag} ${styles.tagDesign}`}>
                  Design
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EJobsSection;
