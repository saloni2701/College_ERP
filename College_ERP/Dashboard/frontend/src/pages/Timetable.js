import React from "react";

import PageHeader from "../components/common/PageHeader";
import Panel from "../components/common/Panel";
import {
  COURSES,
  TIMETABLE,
  TIMETABLE_DAYS,
  TIMETABLE_PERIODS,
} from "../data/sampleData";

export default function Timetable() {
  // getDay(): Sunday = 0, so Monday = 1 maps to index 0.
  const todayIndex = new Date().getDay() - 1;

  const courseName = (cell) => {
    const course = COURSES.find((c) => cell.startsWith(c.code));
    return course ? course.name : "";
  };

  return (
    <>
      <PageHeader
        title="Timetable"
        description="Your weekly class schedule. Today's column is highlighted."
      />

      <Panel title="Weekly schedule" className="panel-flush">
        <div className="table-wrap">
          <table className="data-table timetable">
            <thead>
              <tr>
                <th>Time</th>
                {TIMETABLE_DAYS.map((day, i) => (
                  <th key={day} className={i === todayIndex ? "today" : ""}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMETABLE.map((row, periodIndex) => (
                <tr key={TIMETABLE_PERIODS[periodIndex]}>
                  <th scope="row" className="nowrap">
                    {TIMETABLE_PERIODS[periodIndex]}
                  </th>
                  {row.map((cell, dayIndex) => (
                    <td
                      key={dayIndex}
                      className={dayIndex === todayIndex ? "today" : ""}
                      title={cell ? courseName(cell) : "Free period"}
                    >
                      {cell || <span className="muted-text">Free</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="note-text">Sample schedule shown. Hover a class to see the course name.</p>
    </>
  );
}
