import React from "react";
import "../style/loader.css";

const Loader = ({ message = "Loading..." }) => {
  return (
    <div
      className="loader-container"
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <img
        src="https://www.d-internconnect.com/assets/logo_blue-C1d-YjJ_.png"
        alt="Logo"
        className="loader-logo"
      />
      <p
        style={{
          fontSize: "1.1rem",
          fontWeight: "500",
          color: "var(--text-primary)",
          marginTop: "0.5rem",
        }}
      >
        {message}
      </p>
    </div>
  );
};

export default Loader;
