import React from "react";

import PageHeader from "../components/common/PageHeader";
import Panel from "../components/common/Panel";
import { EXAMS, RESULTS } from "../data/sampleData";

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function Exams() {
  const averageSgpa = (
    RESULTS.reduce((sum, r) => sum + r.sgpa, 0) / RESULTS.length
  ).toFixed(2);

  return (
    <>
      <PageHeader
        title="Exams & Results"
        description="Upcoming examination schedule and your semester-wise results."
      />

      <Panel title="Upcoming exams" className="panel-flush mb-4">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Course</th>
                <th>Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Venue</th>
              </tr>
            </thead>
            <tbody>
              {EXAMS.map((e) => (
                <tr key={e.code}>
                  <td className="nowrap">{e.code}</td>
                  <td>{e.course}</td>
                  <td>{e.type}</td>
                  <td className="nowrap">{formatDate(e.date)}</td>
                  <td className="nowrap">{e.time}</td>
                  <td>{e.venue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="stat-card">
            <div className="stat-label">Average SGPA</div>
            <div className="stat-value">{averageSgpa}</div>
            <div className="stat-note">Across {RESULTS.length} completed semesters</div>
          </div>
        </div>

        <div className="col-lg-8">
          <Panel title="Semester results" className="panel-flush">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th className="num">Credits</th>
                    <th className="num">SGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {RESULTS.map((r) => (
                    <tr key={r.semester}>
                      <td>{r.semester}</td>
                      <td className="num">{r.credits}</td>
                      <td className="num">{r.sgpa.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>

      <p className="note-text">Sample data shown.</p>
    </>
  );
}
