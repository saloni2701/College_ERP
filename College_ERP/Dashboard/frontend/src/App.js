import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./components/AuthPage";
import { setToken } from "./api";
import AppLayout from "./components/layout/AppLayout";
import useTheme from "./hooks/useTheme";

import Home from "./pages/Home";
import Courses from "./pages/Courses";
import Timetable from "./pages/Timetable";
import Attendance from "./pages/Attendance";
import Exams from "./pages/Exams";
import Fees from "./pages/Fees";
import Notices from "./pages/Notices";
import AIResumeAnalyzer from "./pages/AIResumeAnalyzer";
import PersonalInfo from "./pages/PersonalInfo";

import "./style.css";

function App() {
  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  if (!user) {
    return <AuthPage onLogin={setUser} theme={theme} onToggleTheme={toggleTheme} />;
  }

  return (
    <AppLayout
      user={user}
      onLogout={handleLogout}
      theme={theme}
      onToggleTheme={toggleTheme}
    >
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/face" element={<Attendance user={user} />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/fees" element={<Fees />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/resume" element={<AIResumeAnalyzer />} />
        <Route path="/personal" element={<PersonalInfo user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
