import React from "react";

import PageHeader from "../components/common/PageHeader";
import Panel from "../components/common/Panel";
import StatusBadge from "../components/common/StatusBadge";
import { COURSES, MIN_ATTENDANCE } from "../data/sampleData";

export default function Courses() {
  const totalCredits = COURSES.reduce((sum, c) => sum + c.credits, 0);

  return (
    <>
      <PageHeader
        title="Courses"
        description={`Your enrolled courses this semester (${COURSES.length} courses, ${totalCredits} credits) with subject-wise attendance.`}
      />

      <Panel title="Enrolled courses" className="panel-flush">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Course</th>
                <th>Faculty</th>
                <th className="num">Credits</th>
                <th>Attendance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {COURSES.map((c) => {
                const pct = Math.round((c.attended / c.total) * 100);
                const ok = pct >= MIN_ATTENDANCE;
                return (
                  <tr key={c.code}>
                    <td className="nowrap">{c.code}</td>
                    <td>{c.name}</td>
                    <td>{c.faculty}</td>
                    <td className="num">{c.credits}</td>
                    <td className="attendance-cell">
                      <div className="progress-track" aria-hidden="true">
                        <div
                          className={`progress-fill ${ok ? "" : "progress-fill-danger"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="nowrap">
                        {pct}% ({c.attended}/{c.total})
                      </span>
                    </td>
                    <td>
                      <StatusBadge tone={ok ? "success" : "danger"}>
                        {ok ? "Eligible" : "Shortage"}
                      </StatusBadge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="note-text">
        Minimum required attendance: {MIN_ATTENDANCE}%. Sample data shown.
      </p>
    </>
  );
}
