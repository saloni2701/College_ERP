import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";

import Home from "./pages/Home";
import PersonalInfo from "./pages/PersonalInfo";
import Attendance from "./pages/Attendance";
import AIResumeAnalyzer from "./pages/AIResumeAnalyzer";

import style from "./style.css"
import srmLogo from "./assets/srm_logo.png";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // ---------------- NOT LOGGED IN ----------------
  if (!user) {
    return (
      <div className="container mt-3">

        {/* Header */}
        <div className="text-center">
          <img src={srmLogo} alt="SRM Logo" height="100" />

          <h2 className="mt-3">
            <b>SRM University — Face Recognition Attendance Portal</b>
          </h2>
        </div>

        {/* Register + Login */}
        <div className="row justify-content-center mt-5">
          <div className="col-md-4">
            <div className="card shadow p-4">
              <h4 className="text-center">Register</h4>
              <Register onRegister={setUser} />
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow p-4">
              <h4 className="text-center">Login</h4>
              <Login onLogin={setUser} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- LOGGED IN DASHBOARD ----------------
  return (
    <div>

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">

          {/* Logo + Title */}
          <span className="navbar-brand d-flex align-items-center">
            <img
              src={srmLogo}
              alt="logo"
              style={{ height: "45px", marginRight: "10px" }}
            />

            SRM Attendance Dashboard
          </span>

          {/* Menu */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/personal">Personal Info</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/face">Attendance</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/resume">AI Resume Analyzer</Link>
            </li>
          </ul>

          {/* Right Side */}
          <span className="text-white me-3">
            Welcome, {user.name}
          </span>

          <button
            className="btn btn-danger"
            onClick={() => {
              localStorage.removeItem("user");
              setUser(null);
            }}
          >
            Logout
          </button>

        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/personal" element={<PersonalInfo user={user} />} />
          <Route path="/face" element={<Attendance />} />
          <Route path="/resume" element={<AIResumeAnalyzer />} />
        </Routes>

      </div>

      {/* FOOTER */}
      <footer className="bg-dark text-white text-center py-3 mt-5">
        © {new Date().getFullYear()} SRM University | Project Portal
      </footer>

    </div>
  );
}

export default App;
