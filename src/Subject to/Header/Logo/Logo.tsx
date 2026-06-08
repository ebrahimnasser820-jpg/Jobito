import { Link } from "react-router-dom";
import LogoIMG from "../../../assets/412ec68f361b4f49b52fb8d584c317ccf197a403.png";
import styles from "./Logo.module.css";

export const Logo = () => {
  return (
    <>
      <Link to="/" className={styles.logo}>
        <img src={LogoIMG} alt="Jobito" className={styles.img} />
      </Link>
    </>
  );
};
