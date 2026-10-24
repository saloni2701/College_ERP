import React, { useState } from "react";

import Login from "./Login";
import Register from "./Register";
import ThemeToggle from "./common/ThemeToggle";
import srmLogo from "../assets/srm_logo.png";

export default function AuthPage({ onLogin, theme, onToggleTheme }) {
  const [mode, setMode] = useState("login");
  const [notice, setNotice] = useState("");

  const switchMode = (next) => {
    setMode(next);
    setNotice("");
  };

  const handleRegistered = () => {
    setMode("login");
    setNotice("Registration successful. Please sign in to continue.");
  };

  return (
    <div className="auth-page">
      {/* Left: institutional identity */}
      <section className="auth-brand">
        <img src={srmLogo} alt="SRM University logo" className="auth-logo" />
        <h1 className="auth-brand-title">SRM University</h1>
        <p className="auth-brand-subtitle">
          Face Recognition Attendance Portal
        </p>
        <p className="auth-brand-text">
          A single place for students to track attendance, view academic
          details and prepare for placements.
        </p>
      </section>

      {/* Right: sign in / register */}
      <section className="auth-form-side">
        <div className="auth-theme-toggle">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        <div className="auth-card">
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => switchMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => switchMode("register")}
            >
              Register
            </button>
          </div>

          <h2 className="auth-card-title">
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </h2>

          {notice && (
            <div className="form-notice form-notice-success" role="status">
              {notice}
            </div>
          )}

          {mode === "login" ? (
            <Login onLogin={onLogin} />
          ) : (
            <Register onRegister={handleRegistered} />
          )}
        </div>
      </section>
    </div>
  );
}
