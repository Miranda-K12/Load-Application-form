import React, { useState, useEffect, useRef } from "react";
import InputField from "./InputField";
import styles from "./Form.module.css";
import Button from "../button/Button.jsx";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const LoanApplicationForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    personalID: "",
    dob: "",
    email: "",
    phone: "",
    additionalPhone: "",
    contactPersonName: "",
    contactPersonID: "",
    loanType: [],
    currency: "",
    loanAmount: "",
    loanTerm: "",
    monthlyIncome: "",
    incomeSource: "",
    firstPaymentDate: "",
    primaryDocument: null,
    additionalDocument: null,
    creditOfficerID: "",
    interestRate: "",
    applicationID: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const successTimerRef = useRef(null);

  // ავტომატური განაცხადის ID
  useEffect(() => {
    const generatedID = Math.floor(1000000000 + Math.random() * 9000000000);
    setFormData((prev) => ({ ...prev, applicationID: generatedID }));
  }, []);
  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);
  // ვალიდაცია ველების მიხედვით
  const validateField = (name, value) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (name) {
      case "firstName":
      case "lastName":
        if (!value || !/^[ა-ჰ]{2,50}$/.test(value))
          return "გამოიყენეთ მხოლოდ ქართული ასოები, 2–50 სიმბოლო";
        break;
      case "contactPersonName":
        if (!value || !/^[ა-ჰ]+\s[ა-ჰ]+$/.test(value))
          return "გთხოვთ მიუთითოთ სახელი და გვარი";
        break;
      case "personalID":
      case "contactPersonID":
      case "creditOfficerID":
        if (!value || !/^\d{11}$/.test(value))
          return "გთხოვთ, შეიყვანეთ პირადი ნომერი (11 ციფრი)";
        break;
      case "dob":
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!value) {
          return "გთხოვთ, აირჩიეთ დაბადების თარიღი";
        }
        break;
      case "email":
        if (!value) return "გთხოვთ,მიუთითეთ ელ-ფოსტა";
        if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value))
          return "შეიყვანეთ სწორი ელ-ფოსტა (ლათინური ასოები და ციფრები)";
        break;
      case "phone":
      case "additionalPhone":
        if (!value) return "გთხოვთ, მიუთითეთ ტელეფონის ნომერი";
        if (!/^\d{9}$/.test(value)) return "ტელეფონის ნომერი უნდა იყოს 9 ციფრი";
        break;
      case "loanType":
        if (!value || value.length === 0) {
          return "გთხოვთ მონიშნეთ შესაბამისი ველი/ველები";
        }
        break;
      case "currency":
        if (!value) return "გთხოვთ, აირჩიოთ ვალუტა";
        break;
      case "loanAmount":
        if (!value || isNaN(value) || Number(value) < 500)
          return "სესხის რაოდენობა უნდა იყოს მინიმუმ 500 ლარი";
        break;
      case "loanTerm":
        if (!value || isNaN(value) || Number(value) <= 0)
          return "გთხოვთ მიუთითოთ სესხის ვადა (მინიმუმ 1 თვე)";
        break;
      case "interestRate":
        if (!/^\d{2}\.\d{2}$/.test(value)) {
          return "პროცენტის ფორმატი უნდა იყოს XX.XX (მაგალითად 05.25 ან 12.00)";
        }
        break;
      case "firstPaymentDate": {
        const minDate = new Date();
        minDate.setHours(0, 0, 0, 0);
        if (!value || new Date(value) <= minDate)
          return "გთხოვთ, აირჩიოთ მომავალი თარიღი";
        break;
      }
      case "monthlyIncome":
        if (!value || isNaN(value))
          return "გთხოვთ, შეიყვანეთ თვიური შემოსავალი რიცხვებში";
        break;
      case "incomeSource":
        if (!value) return "გთხოვთ, მიუთითოთ შემოსავლის წყარო";
        break;
      case "primaryDocument":
        if (!value) return "გთხოვთ ატვირთოთ პირადი დოკუმენტი (PDF, JPG ან PNG)";
        break;
      default:
        return null;
    }
    return null;
  };

  // რეალთაიმ ფილტრაცია და ვალიდაცია
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    let newValue = value;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (name) {
      case "firstName":
      case "lastName":
        newValue = value.replace(/[^ა-ჰ]/g, "").slice(0, 50);
        break;

      case "contactPersonName":
        newValue = value.replace(/[^ა-ჰ\s]/g, "").slice(0, 50);
        break;

      case "personalID":
      case "contactPersonID":
      case "creditOfficerID":
        newValue = value.replace(/\D/g, "").slice(0, 11);
        break;

      case "phone":
      case "additionalPhone":
        newValue = value.replace(/\D/g, "").slice(0, 9);
        break;

      case "loanAmount":
        newValue = value.replace(/\D/g, "");
        break;

      case "monthlyIncome":
        newValue = value.replace(/\D/g, "");
        break;
      case "interestRate": {
        let newValue = value.replace(/[^0-9.]/g, "");

        // ერთი წერტილი მაქსიმუმ
        const parts = newValue.split(".");
        if (parts.length > 2) newValue = parts[0] + "." + parts[1];
        if (parts[1] && parts[1].length > 2)
          newValue = parts[0] + "." + parts[1].slice(0, 2);

        // State-ში შენახვა
        setFormData((prev) => ({ ...prev, [name]: newValue }));

        // Live ვალიდაცია
        let error = null;

        if (newValue.includes(".")) {
          // თუ წერტილი არის, ვამოწმებთ regex
          if (!/^\d{1,2}\.\d{2}$/.test(newValue)) {
            error =
              "პროცენტის ფორმატი უნდა იყოს X.XX ან XX.XX (მაგალითად 5.67 ან 12.34)";
          }
        } else {
          // ჯერ არ დაწერილა წერტილი, ერორი არ ვაჩვენოთ
          error = null;
        }

        setErrors((prev) => ({ ...prev, [name]: error }));
        break;
      }

      case "loanTerm": {
        // მხოლოდ ციფრები, უარყოფითი და ნულს არ უშვებს
        let newValue = value.replace(/\D/g, "");

        // თუ აკრიფა 0–ით იწყება, ამოშალე
        while (newValue.startsWith("0")) {
          newValue = newValue.slice(1);
        }

        const months = Number(newValue);

        // Validation: უნდა იყოს > 0
        const error =
          !newValue || months <= 0
            ? "გთხოვთ მიუთითოთ სესხის ვადა (მინიმუმ 1 თვე)"
            : null;

        setFormData((prev) => ({ ...prev, [name]: newValue }));
        setErrors((prev) => ({ ...prev, [name]: error }));
        break;
      }

      case "firstPaymentDate": {
        const minDate = new Date();
        minDate.setHours(0, 0, 0, 0);
        if (!value || new Date(value) <= minDate)
          return "გთხოვთ, აირჩიოთ  თარიღი";
        break;
      }

      case "email":
        newValue = value.replace(/[^a-zA-Z0-9@._-]/g, "");
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        setErrors((prev) => ({
          ...prev,
          email:
            newValue && !emailPattern.test(newValue)
              ? "შეიყვანეთ სწორი ელ-ფოსტა (ლათინური ასოები და ციფრები)"
              : null,
        }));
        break;
      //სესხის ტიპი
      case "loanType":
        if (checked) {
          newValue = [...formData.loanType, value];
        } else {
          newValue = formData.loanType.filter((item) => item !== value);
        }
        break;
      case "loanTerm": {
        // Keep only digits
        let newValue = value.replace(/\D/g, "");

        // Convert to number
        const months = Number(newValue);

        // Validation: must be > 0
        let error = null;
        if (!newValue || months <= 0) {
          error = "გთხოვთ მიუთითოთ სესხის ვადა (მინიმუმ 1 თვე)";
        }

        // Convert to text format
        let termText = "";
        if (months > 0) {
          if (months < 12) {
            termText = `${months} თვე`;
          } else {
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;
            termText =
              remainingMonths === 0
                ? `${years} წელი`
                : `${years} წელი ${remainingMonths} თვე`;
          }
        }

        // Update state
        setFormData((prev) => ({
          ...prev,
          [name]: newValue,
          loanTermText: termText,
        }));
        setErrors((prev) => ({ ...prev, [name]: error }));
        break;
      }
      case "currency":
        if (!value) {
          setErrors((prev) => ({
            ...prev,
            currency: "გთხოვთ აირჩიოთ ვალუტა",
          }));
        } else {
          setErrors((prev) => ({ ...prev, currency: null }));
        }
        break;
      case "dob":
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!value) {
          return "გთხოვთ, აირჩიეთ დაბადების თარიღი";
        }

        if (new Date(value) > today) {
          return "დაბადების თარიღი არ შეიძლება იყოს მომავლის თარიღი";
        }
        break;
      case "primaryDocument": {
        const file = e.target.files[0] || null;

        // ვანახავთ state-ში
        setFormData((prev) => ({ ...prev, primaryDocument: file }));

        // ერორის განახლება მხოლოდ მაშინ, თუ არაფერი ატვირთულია
        setErrors((prev) => ({
          ...prev,
          primaryDocument: !file
            ? "გთხოვთ ატვირთოთ პირადი დოკუმენტი (PDF, JPG ან PNG)"
            : null,
        }));

        break;
      }

      default:
        break;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Field validation
    const fieldError = validateField(name, newValue);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  // სრული ვალიდაცია submit–ისთვის
  const validateForm = () => {
    const fieldNames = [
      "firstName",
      "lastName",
      "personalID",
      "dob",
      "email",
      "phone",
      "additionalPhone",
      "contactPersonName",
      "contactPersonID",
      "loanType",
      "currency",
      "loanAmount",
      "loanTerm",
      "interestRate",
      "firstPaymentDate",
      "monthlyIncome",
      "incomeSource",
      "primaryDocument",
      "additionalDocument",
      "creditOfficerID",
    ];

    const newErrors = {};
    fieldNames.forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Excel ექსპორტისთვის
  const prepareExcelData = () => {
    const data = { ...formData };
    data.loanType = Array.isArray(data.loanType)
      ? data.loanType.join(", ")
      : "";
    data.primaryDocument = data.primaryDocument
      ? data.primaryDocument.name
      : "";
    data.additionalDocument = data.additionalDocument
      ? data.additionalDocument.name
      : "";
    return [data];
  };

  const handleExportExcel = () => {
    const data = prepareExcelData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LoanApplication");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, "LoanApplication.xlsx");
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      setSuccessMessage(""); // თუ ფორმა არასწორია, მესიჯი წაშალე
      return;
    }

    // ფორმა სწორია
    console.log("Submitting form:", formData);

    setSuccessMessage("ფორმა წარმატებით გაიგზავნა!"); // მესიჯი
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }
    successTimerRef.current = setTimeout(() => {
      setSuccessMessage("");
      successTimerRef.current = null;
    }, 5000);
    // შეგიძლიათ აქ ფაილები/სხვა state–ებიც დაასუფთავოთ
    setFormData({
      firstName: "",
      lastName: "",
      personalID: "",
      dob: "",
      email: "",
      phone: "",
      additionalPhone: "",
      contactPersonName: "",
      contactPersonID: "",
      loanType: [],
      currency: "",
      loanAmount: "",
      loanTerm: "",
      monthlyIncome: "",
      incomeSource: "",
      firstPaymentDate: "",
      primaryDocument: null,
      additionalDocument: null,
      creditOfficerID: "",
      interestRate: "",
      applicationID: formData.applicationID, // ან ახალი ID
    });

    setErrors({});
  };
  return (
    <div className={styles.applicationPage}>
      <form className={styles.loanForm} onSubmit={handleSubmit}>
        <label>განაცხადის ID: {formData.applicationID}</label>

        {/* პირადი ინფორმაცია */}
        <h2>პირადი ინფორმაცია</h2>
        <div className={styles.personalInfo}>
          <InputField
            label="სახელი"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
          />
          <InputField
            label="გვარი"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
          />
          <InputField
            label="პირადი ნომერი"
            name="personalID"
            value={formData.personalID}
            onChange={handleChange}
            error={errors.personalID}
            required
          />
          <InputField
            label="დაბადების თარიღი"
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            error={errors.dob}
            required
            max={new Date().toISOString().split("T")[0]}
          />
          <InputField
            label="ელ-ფოსტა"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <InputField
            label="ტელეფონი"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            required
          />
        </div>

        {/* დამატებითი საკონტაქტო */}
        <h2>დამატებითი საკონტაქტო პირი</h2>
        <div className={styles.additionalInfo}>
          <InputField
            label="სახელი და გვარი"
            name="contactPersonName"
            value={formData.contactPersonName}
            onChange={handleChange}
            error={errors.contactPersonName}
            required
          />
          <InputField
            label="პირადი ნომერი"
            name="contactPersonID"
            value={formData.contactPersonID}
            onChange={handleChange}
            error={errors.contactPersonID}
            required
          />
          <InputField
            label="დამატებითი საკონტაქტო ნომერი"
            name="additionalPhone"
            value={formData.additionalPhone}
            onChange={handleChange}
            error={errors.additionalPhone}
          />
        </div>

        {/* სესხის დეტალები */}
        <h2>სესხის დეტალები</h2>
        <div className={styles.loanInfo}>
          <div className={styles.checkboxGroup}>
            <label className={styles.label}>სესხის ტიპი</label>
            <div className={styles.checkboxList}>
              {["სამომხმარებლო", "იპოთეკური", "ავტოსესხი", "სტუდენტური"].map(
                (type) => (
                  <label key={type} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      name="loanType"
                      value={type}
                      checked={formData.loanType.includes(type)}
                      onChange={handleChange}
                    />
                    {type}
                  </label>
                )
              )}
            </div>
            {errors.loanType && (
              <p
                className={styles.error}
                style={{ color: "red", fontSize: "10px" }}
              >
                {errors.loanType}
              </p>
            )}
          </div>
          <InputField
            label="სასურველი ვალუტა"
            name="currency"
            type="select"
            value={formData.currency}
            onChange={handleChange}
            options={["GEL", "USD", "EUR"]}
            error={errors.currency}
            required
          />
          <InputField
            label="სესხის ოდენობა"
            type="number"
            name="loanAmount"
            value={formData.loanAmount}
            onChange={handleChange}
            error={errors.loanAmount}
            required
          />
          <InputField
            label="სესხის ვადა"
            name="loanTerm"
            value={formData.loanTerm}
            onChange={handleChange}
            error={errors.loanTerm}
            required
            min="1"
          />
          <InputField
            label="საპროცენტო განაკვეთი"
            name="interestRate"
            value={formData.interestRate}
            onChange={handleChange}
            error={errors.interestRate}
            required
          />
          <InputField
            label="პირველი გადახდის თარიღი"
            type="date"
            name="firstPaymentDate"
            value={formData.firstPaymentDate}
            onChange={handleChange}
            error={errors.firstPaymentDate}
            required
            min={
              new Date(Date.now() + 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            }
          />
        </div>

        {/* ფინანსური ინფორმაცია */}
        <h2>ფინანსური ინფორმაცია</h2>
        <div className={styles.financialInfo}>
          <InputField
            label="თვიური შემოსავალი"
            type="number"
            name="monthlyIncome"
            value={formData.monthlyIncome}
            onChange={handleChange}
            error={errors.monthlyIncome}
            required
          />
          <InputField
            label="შემოსავლის წყარო"
            name="incomeSource"
            value={formData.incomeSource}
            onChange={handleChange}
            error={errors.incomeSource}
            required
          />
        </div>

        {/* დოკუმენტაცია */}
        <h2>სესხის დოკუმენტაცია</h2>
        <div className={styles.additionalInfo}>
          <InputField
            label="კლიენტის პირადობა ან პასპორტი"
            type="file"
            name="primaryDocument"
            onChange={handleChange}
            error={errors.primaryDocument}
            accept=".pdf, .jpg, .jpeg, .png"
            required
          />
          <InputField
            label="დამატებითი დოკუმენტაცია"
            type="file"
            name="additionalDocument"
            onChange={handleChange}
            error={errors.additionalDocument}
            accept=".pdf, .jpg, .jpeg, .png"
          />
        </div>

        {/* კრედიტ ოფიცერი */}
        <h2>კრედიტ ოფიცერი</h2>
        <div className={styles.loanOfficer}>
          <InputField
            label="კრედიტ ოფიცრის ID"
            name="creditOfficerID"
            value={formData.creditOfficerID}
            onChange={handleChange}
            error={errors.creditOfficerID}
            required
          />
        </div>
        {successMessage && <h3 className={styles.success}>{successMessage}</h3>}
        {/* ღილაკები */}
        <div className={styles.buttonContainer}>
          <Button type="submit" variant="orange">
            გაგზავნა
          </Button>
          <Button type="button" variant="green" onClick={handleExportExcel}>
            ექსპორტი Excel-ში
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoanApplicationForm;
