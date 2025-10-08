import React from "react";
import styles from "./Button.module.css";

const Button = ({
  children,
  type = "button",
  variant = "default",
  onClick,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${styles.button} ${styles[variant]}`}
    >
      {children}
    </button>
  );
};

export default Button;
