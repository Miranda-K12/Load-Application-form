import { useState } from "react";
import "./App.css";
import Header from "../src/components/header/Header";
import LoanApplicationForm from "./components/form/Form";
function App() {
  return (
    <>
      <div>
        <Header />
        <LoanApplicationForm />
      </div>
    </>
  );
}

export default App;
