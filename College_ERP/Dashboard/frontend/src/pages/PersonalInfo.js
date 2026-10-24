import React from "react";

import PageHeader from "../components/common/PageHeader";
import Panel from "../components/common/Panel";
import StatusBadge from "../components/common/StatusBadge";

function DetailList({ items }) {
  return (
    <dl className="detail-list">
      {items.map(({ label, value }) => (
        <div className="detail-row" key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function PersonalInfo({ user }) {
  const name = user?.name || "Student";

  const studentDetails = [
    { label: "Full name", value: name },
    { label: "Email address", value: user?.email || "—" },
    { label: "Student ID", value: user?.id || "SRMxxxx" },
  ];

  const academicDetails = [
    { label: "Department", value: "Computer Science & Engineering" },
    { label: "Year", value: "3rd Year" },
    { label: "Section", value: "A" },
  ];

  return (
    <>
      <PageHeader
        title="Personal Information"
        description="Your student profile and academic details."
      />

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="panel profile-card">
            <div className="avatar avatar-lg" aria-hidden="true">
              {name.charAt(0).toUpperCase()}
            </div>
            <h2 className="profile-name">{name}</h2>
            <div className="profile-id">{user?.id || "SRMxxxx"}</div>
            <StatusBadge tone="success">Active student</StatusBadge>
          </div>
        </div>

        <div className="col-lg-8">
          <Panel title="Student details" className="mb-4">
            <DetailList items={studentDetails} />
          </Panel>

          <Panel title="Academic details">
            <DetailList items={academicDetails} />
          </Panel>
        </div>
      </div>
    </>
  );
}
