import React from "react";
import Navbar from "../components/navbar";
import { useTheme } from "../context/ThemeContext";
import "../style/home.css";

export default function Home() {
  const { darkMode } = useTheme();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        padding: "20px",
      }}
    >
      <Navbar />
      <main
        style={{
          marginTop: "80px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            marginBottom: "20px",
          }}
        >
          Welcome to Intern Connect
        </h1>
        <p
          style={{
            fontSize: "1.5rem",
            color: "var(--text-secondary)",
          }}
        >
          Your path to meaningful internships starts here
        </p>
      </main>
    </div>
  );
}
