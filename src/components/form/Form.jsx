import React, { useState, useEffect } from "react";
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

  // ავტომატური განაცხადის ID
  useEffect(() => {
    const generatedID = Math.floor(1000000000 + Math.random() * 9000000000);
    setFormData((prev) => ({ ...prev, applicationID: generatedID }));
  }, []);

  // ვალიდაცია ველების მიხედვით
  const validateField = (name, value) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (name) {
      case "firstName":
      case "lastName":
        if (!value || !/^[ა-ჰ]{2,50}$/.test(value)) {
          return "გამოიყენეთ მხოლოდ ქართული ასოები, 2–50 სიმბოლო";
        }
        break;
      case "email":
        // value-ს state-ში თავისუფლად ინახავ
        newValue = value;

        // ვალიდაცია მესიჯისთვის
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const emailError =
          value && !emailPattern.test(value)
            ? "გთხოვთ, მიუთითოთ სწორი ელ-ფოსტა"
            : null;

        setErrors((prev) => ({ ...prev, email: emailError }));
        break;

      case "contactPersonName":
        if (!/^[ა-ჰ]+\s[ა-ჰ]+$/.test(value)) {
          return "გთხოვთ მიუთითოთ სახელი და გვარი";
        }
        break;

      case "personalID":
      case "contactPersonID":
      case "creditOfficerID":
        if (!/^\d{11}$/.test(value)) {
          return "გთხოვთ, შეიყვანეთ პირადი ნომერი (11 ციფრი)";
        }
        break;

      case "phone":
      case "additionalPhone":
        if (!/^\d{9}$/.test(value)) {
          return "ტელეფონის ნომერი უნდა იყოს 9 ციფრი";
        }
        break;

      case "loanType":
        if (!value || value.length === 0) {
          return "აირჩიეთ სესხის ტიპი";
        }
        break;
      case "loanTerm":
        if (
          !newValue ||
          isNaN(newValue) ||
          Number(newValue) < 1 ||
          Number(newValue) > 60
        )
          return "გთხოვთ, მიუთითოთ სესხის ვადა (მაქსიმუმ 60 თვე)";
        break;
      case "currency":
        if (!value) return "გთხოვთ, აირჩიოთ სესხის ვალუტა";
        break;

      case "loanAmount":
        if (!value || isNaN(value) || Number(value) < 500)
          return "სესხის რაოდენობა უნდა იყოს მინიმუმ 500 ლარი (რიცხვითი ფორმატი) ";
        break;

      case "interestRate":
        if (!/^\d{1,2}(\.\d{1,2})?$/.test(value))
          return "ფორმატი უნდა იყოს XX.XX";
        break;

      case "firstPaymentDate":
        if (!value || new Date(value) <= today)
          return "უნდა იყოს მომავალი თარიღი";
        break;

      case "monthlyIncome":
        if (!value) return "გთხოვთ, შეიყვანეთ შემოსავლის რაოდენობა რიცხვებში";
        break;

      case "incomeSource":
        if (!value || (Array.isArray(value) && value.length === 0))
          return " გთხოვთ, მიუთითოთ შემოსავლის წყარო/წყაროები";
        break;

      case "primaryDocument":
        if (!value) return "ატვირთეთ PDF, JPG ან PNG";
        break;

      case "additionalDocument":
        if (
          value &&
          !["application/pdf", "image/jpeg", "image/png"].includes(value.type)
        ) {
          return "დამატებითი დოკუმენტი უნდა იყოს PDF, JPG ან PNG";
        }
        break;
      case "loanType":
        if (!value || value.length === 0)
          return "გთხოვთ მონიშნეთ შესაბამისი ველი/ველები";
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

    switch (name) {
      case "firstName":
      case "lastName":
        newValue = value.replace(/[^ა-ჰ]/g, "").slice(0, 50);
        break;

      case "contactPersonName":
        newValue = value.replace(/[^ა-ჰ\s]/g, "").slice(0, 50);
        break;
      case "dob":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!value || new Date(value) >= today) {
          return "აირჩიეთ დაბადების თარიღი";
        }
        break;
      case "personalID":
      case "contactPersonID":
      case "creditOfficerID":
        newValue = value.replace(/\D/g, "").slice(0, 11);
        break;
      case "loanAmount":
        newValue = value.replace(/\D/g, "");
        break;
      case "phone":
      case "additionalPhone":
        newValue = value.replace(/\D/g, "").slice(0, 9);
        break;

      case "monthlyIncome":
        newValue = value.replace(/\D/g, "");
        break;
      case "firstPaymentDate":
        if (!value || new Date(value) <= new Date())
          return "აირჩიეთ გადახდის თარიღი";
        break;
      case "interestRate":
        // Value–ში მხოლოდ ციფრები და წერტილი
        newValue = value.replace(/[^0-9.]/g, "");

        // ზღუდვა: მაქსიმუმ 2 ციფრი წერტილამდე და მაქსიმუმ 2 ციფრი წერტილის შემდეგ
        if (/^\d{0,2}(\.\d{0,2})?$/.test(newValue)) {
          // value სწორია, დატოვე
        } else {
          // value არასწორია, წაიშალოს ბოლო აკრეფილი სიმბოლო
          newValue = formData.interestRate;
        }
        break;
      case "loanTerm":
        // Value-ს გავუშვათ მხოლოდ ციფრები
        newValue = value.replace(/\D/g, "");

        // მაქსიმუმი 60 თვე
        if (Number(newValue) > 60) {
          newValue = "60";
        }
        break;
      case "primaryDocument":
      case "additionalDocument":
        newValue = files[0] || null;
        break;
      case "email":
        // value-ს მხოლოდ ლათინური ასოები, ციფრები და დაშვებული სიმბოლოები
        newValue = value.replace(/[^a-zA-Z0-9@._-]/g, "");

        // ვალიდაცია მესიჯისთვის
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const emailError =
          newValue && !emailPattern.test(newValue)
            ? "შეიყვანეთ სწორი ელ-ფოსტა (ლათინური ასოებით და ციფრებით)"
            : null;

        setErrors((prev) => ({ ...prev, email: emailError }));
        break;

      case "loanType":
        // checkbox–ის შემთხვევაში, checked და value უნდა მოვიყვანოთ
        if (checked) {
          newValue = [...formData.loanType, value];
        } else {
          newValue = formData.loanType.filter((item) => item !== value);
        }
        break;
      case "currency":
        if (!value) return "გთხოვთ აირჩიოთ ვალუტა";
        break;
      default:
        break;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    const err = validateField(name, newValue);
    setErrors((prev) => ({ ...prev, [name]: err }));
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
    e.preventDefault(); // არ დატვირთოს გვერდი

    const isValid = validateForm(); // შეამოწმებს ყველა ველს
    if (!isValid) {
      console.log("Validation failed:", errors);
      return; // ფორმა არ უნდა დაისაბმითდეს, თუ არის შეცდომები
    }

    // ფორმა სწორია — აქ შეგიძლია API სთხოვო ან კონსოლში გამოიტანო
    console.log("Submitting form:", formData);

    // მაგალითად, შეგიძლია ექსპორტი Excel ან სხვა ლოგიკა
    // handleExportExcel();
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
              <p className={styles.error}>{errors.loanType}</p>
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
            required
          />
          <InputField
            label="დამატებითი დოკუმენტაცია"
            type="file"
            name="additionalDocument"
            onChange={handleChange}
            error={errors.additionalDocument}
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
