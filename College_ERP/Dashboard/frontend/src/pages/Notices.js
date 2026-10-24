import React, { useState } from "react";

import PageHeader from "../components/common/PageHeader";
import Panel from "../components/common/Panel";
import StatusBadge from "../components/common/StatusBadge";
import { NOTICES } from "../data/sampleData";

const CATEGORIES = ["All", ...new Set(NOTICES.map((n) => n.category))];

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function Notices() {
  const [filter, setFilter] = useState("All");

  const visible = NOTICES.filter((n) => filter === "All" || n.category === filter);

  return (
    <>
      <PageHeader
        title="Notices"
        description="Announcements from the university, department and placement cell."
      />

      <div className="filter-bar" role="group" aria-label="Filter notices by category">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            className={`filter-chip ${filter === category ? "active" : ""}`}
            aria-pressed={filter === category}
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <Panel>
        <ul className="notice-feed">
          {visible.map((n) => (
            <li key={n.id}>
              <div className="notice-meta">
                <StatusBadge>{n.category}</StatusBadge>
                <span className="muted-text">{formatDate(n.date)}</span>
              </div>
              <h3 className="notice-title">{n.title}</h3>
              <p className="notice-body">{n.body}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
