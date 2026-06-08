import React from "react";
import styles from "./StripeSection.module.css";
import image from "../../../assets/Img/StripeSection/image.png";
import pathtoyourlargeimage from "../../../assets/Img/StripeSection/image.png";
import pathtosmallimage1 from "../../../assets/Img/StripeSection/image1.png";
import pathtosmallimage2 from "../../../assets/Img/StripeSection/image2.png";

const StripeSection: React.FC = () => {
  return (
    <div className={styles.stripeContainer}>
      <div className={styles.contentSide}>
        <div className={styles.contentWrapper}>
          <div className={styles.logoWrapper}>
            <img src={image} alt="Stripe Logo" className={styles.stripeLogo} />
          </div>
          <div className={styles.headerLink}>
            <h2>Stripe</h2>
            <a href="#" className={styles.readMore}>
              Read more about Stripe <span>→</span>
            </a>
          </div>
        </div>
        <p className={styles.description}>
          Stripe is a technology company that builds economic infrastructure for
          the internet. Businesses of every size—from new startups to public
          companies—use our software to accept payments and manage their
          businesses online.
        </p>
      </div>

      <div className={styles.imageSide}>
        <div className={styles.mainImage}>
          <img src={pathtoyourlargeimage} alt="Team meeting" />
        </div>
        <div className={styles.sideImages}>
          <img src={pathtosmallimage1} alt="Discussion" />
          <img src={pathtosmallimage2} alt="Working on dashboard" />
        </div>
      </div>
    </div>
  );
};

export default StripeSection;
