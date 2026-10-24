import React from "react";
import { Link } from "react-router-dom";

import PageHeader from "../components/common/PageHeader";
import Panel from "../components/common/Panel";
import { COURSES, NOTICES } from "../data/sampleData";

export default function Home({ user }) {
  const attended = COURSES.reduce((sum, c) => sum + c.attended, 0);
  const total = COURSES.reduce((sum, c) => sum + c.total, 0);
  const percentage = Math.round((attended / total) * 100);

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name || "Student"}`}
        description="Track your attendance, view your academic details and access the AI Resume Analyzer from one place."
      />

      {/* Summary */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-label">Attendance</div>
            <div className="stat-value">{percentage}%</div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${percentage}%` }} />
            </div>
            <div className="stat-note">Overall attendance this semester</div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-label">Classes attended</div>
            <div className="stat-value">
              {attended}
              <span className="stat-value-total"> / {total}</span>
            </div>
            <div className="stat-note">Across {COURSES.length} courses</div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-label">Face login</div>
            <div className="stat-value stat-value-status">Enabled</div>
            <div className="stat-note">Face recognition is active for your account</div>
          </div>
        </div>
      </div>

      {/* Notices */}
      <Panel title="Latest notices">
        <ul className="notice-list">
          {NOTICES.slice(0, 3).map((notice) => (
            <li key={notice.id}>{notice.title}</li>
          ))}
        </ul>
        <Link to="/notices" className="text-link">View all notices</Link>
      </Panel>
    </>
  );
}
