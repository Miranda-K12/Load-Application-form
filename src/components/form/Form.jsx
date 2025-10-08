import React, { useState } from "react";
import InputField from "./InputField";
import styles from "./Form.module.css";
import Button from "../button/Button.jsx";
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
    documents: null,
    creditOfficerID: "",
    interestRate: "",
  });

  const handleCheckboxChange = (e, value) => {
    const { checked } = e.target;

    setFormData((prev) => {
      let updatedLoanTypes = [...prev.loanType];

      if (checked) {
        updatedLoanTypes.push(value);
      } else {
        updatedLoanTypes = updatedLoanTypes.filter((item) => item !== value);
      }

      return { ...prev, loanType: updatedLoanTypes };
    });
  };
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);
  };

  return (
    <div className={styles.applicationPage}>
      <form className={styles.loanForm} onSubmit={handleSubmit}>
        <div>
          <label>განაცხადის ID:</label>
        </div>

        <h2>პირადი ინფორმაცია</h2>
        <div className={styles.personalInfo}>
          <InputField
            label="სახელი"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
          />
          <InputField
            label="გვარი"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
          />
          <InputField
            label="პირადი ნომერი"
            name="personalID"
            value={formData.personalID}
            onChange={handleChange}
            error={errors.personalID}
          />
          <InputField
            label="დაბადების თარიღი"
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            error={errors.dob}
          />
          <InputField
            label="ელ-ფოსტა"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <InputField
            label="ტელეფონი"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
          />
        </div>
        <h2>დამატებითი საკონტაქტო პირი</h2>
        <div className={styles.additionalInfo}>
          <InputField
            label="სახელი და გვარი"
            name="contactPersonName"
            value={formData.contactPersonName}
            onChange={handleChange}
            error={errors.contactPersonName}
          />
          <InputField
            label="პირადი ნომერი"
            name="contactPersonID"
            value={formData.contactPersonID}
            onChange={handleChange}
            error={errors.contactPersonID}
          />
          <InputField
            label="დამატებითი 
საკონტაქტო ნომერი "
            name="additionalPhone"
            value={formData.additionalPhone}
            onChange={handleChange}
            error={errors.additionalPhone}
          />
        </div>

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
                      onChange={(e) => handleCheckboxChange(e, type)}
                    />
                    {type}
                  </label>
                )
              )}
            </div>
          </div>
          <InputField
            label="სასურველი ვალუტა"
            name="currency"
            type="select"
            value={formData.currency}
            onChange={handleChange}
            options={["GEL", "USD", "EUR"]}
          />
          <InputField
            label="სესხის ოდენობა"
            type="number"
            name="loanAmount"
            value={formData.loanAmount}
            onChange={handleChange}
            error={errors.loanAmount}
          />
          <InputField
            label="სესხის ვადა"
            name="loanTerm"
            value={formData.loanTerm}
            onChange={handleChange}
          />
          <InputField
            label="საპროცენტო განაკვეთი"
            name="interestRate"
            value={formData.interestRate}
            onChange={handleChange}
          />
          <InputField
            label="პირველი გადახდის თარიღი"
            type="date"
            name="firstPaymentDate"
            value={formData.firstPaymentDate}
            onChange={handleChange}
          />
        </div>
        <h2>ფინანსური ინფორმაცია</h2>
        <div className={styles.financialInfo}>
          <InputField
            label="თვიური შემოსავალი"
            type="number"
            name="monthlyIncome"
            value={formData.monthlyIncome}
            onChange={handleChange}
          />
          <InputField
            label="შემოსავლის წყარო"
            name="incomeSource"
            value={formData.incomeSource}
            onChange={handleChange}
          />
        </div>
        <h2>სესხის დოკუმენტაცია</h2>
        <div className={styles.additionalInfo}>
          <InputField
            label="კლიენტის პირადობა ან პასპორტი"
            type="file"
            name="documents"
            onChange={handleChange}
          />
          <InputField
            label="დამატებითი დოკუმენტაცია"
            type="file"
            name="documents"
            onChange={handleChange}
          />
        </div>
        <h2>კრედიტ ოფიცერი</h2>
        <div className={styles.loanOfficer}>
          <InputField
            label="კრედიტ ოფიცრის ID"
            name="creditOfficerID"
            value={formData.creditOfficerID}
            onChange={handleChange}
          />
        </div>

        <div className={styles.buttonContainer}>
          <Button type="submit" variant="orange">
            გაგზავნა
          </Button>
          <Button type="button" variant="green">
            ექსპორტი Excel-ში
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoanApplicationForm;
