import React from "react";
import styles from "./Header.module.css";
import Logo from "../../assets/logo.png";
import Officer from "../../assets/user.svg";
const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <img src={Logo} alt="logo" className={styles.companyLogo} />
      </div>
      <div className={styles.headerCenter}>
        <h2 className={styles.title}>Loan Application Form</h2>
      </div>

      <div className={styles.headerRight}>
        <img src={Officer} alt="user" className={styles.userIcon} />

        <span className={styles.userRole}>Loan Officer</span>
      </div>
    </header>
  );
};

export default Header;
