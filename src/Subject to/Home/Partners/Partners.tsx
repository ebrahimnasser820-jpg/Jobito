import { useState } from "react";
import Marquee from "react-fast-marquee";
import { useTranslation } from "../../../context/translation-context";
import styles from "./Partners.module.css";
import Vodefone from "../../../assets/Vodefone.png";
import Ahly from "../../../assets/Ahly.png";
import National from "../../../assets/National-Bank-of-Egypt-01.png";
import pngclipartegyptpost from "../../../assets/png-clipart-egypt-post-cairo-mail-alexandria-organization-egypt-logo-text-service-thumbnail.png";
import AR from "../../../assets/images.png";
import شعار from "../../../assets/20231126101655!شعار_حديد_عز.png";
import Edita from "../../../assets/إيديتا.png";
import bab54d145284119 from "../../../assets/bab54d145284119.629b80c91d413-1.png";
import Asset from "../../../assets/Asset-1obourland-1.png";
import unnamed from "../../../assets/unnamed.png";
import egyptair from "../../../assets/egyptair-logo-02-freelogovectors.net_.png";

type Partner = {
  id: number;
  name: string;
  logo?: string;
};

const EGYPTIAN_PARTNERS: Partner[] = [
  { id: -2, name: "اتصالات", logo: Vodefone },
  { id: -2, name: "اتصالات", logo: Ahly },
  { id: -3, name: "البنك الأهلي المصري", logo: pngclipartegyptpost },
  { id: -4, name: "أورانج", logo: National },
  { id: -4, name: "أورانج", logo: AR },
  { id: -4, name: "أورانج", logo: شعار },
  { id: -5, name: "طلبات", logo: Edita },
  { id: -6, name: "سويفل", logo: egyptair },
  { id: -7, name: "فوري", logo: bab54d145284119 },
  { id: -8, name: "WE", logo: Asset },
  { id: -8, name: "WE", logo: unnamed },
];

export default function Partners() {
  const { t } = useTranslation();
  const [partners] = useState<Partner[]>(EGYPTIAN_PARTNERS);

  // Company names are proper nouns — do NOT translate them
  // This prevents animation clash when the translation service updates
  const ReviewCard = ({ logo, name }: { logo?: string; name: string }) => (
    <figure
      className={`${styles.reviewCard} ${!logo ? styles.nameOnly : ""}`}
      title={name}
    >
      {logo ? (
        <img src={logo} alt={name} className={styles.partnerLogo} />
      ) : (
        <span className={styles.partnerName}>{name}</span>
      )}
    </figure>
  );

  return (
    <div className={styles.testimonial}>
      <h2>{t("نثق بهم ويثقون بنا")}</h2>

      <div className={styles.marqueeContainer}>
        {/* Row 1: scrolls left */}
        <Marquee
          pauseOnHover={true}
          speed={40}
          gradient={false}
          direction="left"
          className={styles.marqueeBand}
        >
          {partners.map((partner, idx) => (
            <ReviewCard
              key={`row1-${partner.id}-${idx}`}
              logo={partner.logo}
              name={partner.name}
            />
          ))}
        </Marquee>

        {/* Row 2: scrolls right (reverse) */}
        <Marquee
          pauseOnHover={true}
          speed={40}
          gradient={false}
          direction="right"
          className={styles.marqueeBand}
        >
          {/* Reversing the array slightly varies the second row if preferred, 
              but using the same mapping is absolutely fine. */}
          {partners.map((partner, idx) => (
            <ReviewCard
              key={`row2-${partner.id}-${idx}`}
              logo={partner.logo}
              name={partner.name}
            />
          ))}
        </Marquee>
      </div>
    </div>
  );
}
