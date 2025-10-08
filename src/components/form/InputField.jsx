import React from "react";
import styles from "./Form.module.css";

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  options = [],
}) => {
  return (
    <div className={styles.formGroup}>
      <label>{label}</label>

      {type === "select" ? (
        <select name={name} value={value} onChange={onChange}>
          <option value="">აირჩიე ვალუტა</option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} />
      )}

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default InputField;
