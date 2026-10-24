import React from "react";

import PageHeader from "../components/common/PageHeader";
import Panel from "../components/common/Panel";
import StatusBadge from "../components/common/StatusBadge";
import { FEES } from "../data/sampleData";

const rupees = (n) => `₹${n.toLocaleString("en-IN")}`;

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function Fees() {
  const total = FEES.reduce((sum, f) => sum + f.amount, 0);
  const paid = FEES.filter((f) => f.status === "Paid").reduce((sum, f) => sum + f.amount, 0);
  const due = total - paid;

  return (
    <>
      <PageHeader
        title="Fees"
        description="Fee structure for the current academic year and your payment status."
      />

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-label">Total fees</div>
            <div className="stat-value">{rupees(total)}</div>
            <div className="stat-note">Academic year 2026–27</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-label">Paid</div>
            <div className="stat-value stat-value-status">{rupees(paid)}</div>
            <div className="stat-note">Received</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-label">Balance due</div>
            <div className="stat-value">{rupees(due)}</div>
            <div className="stat-note">Pending items below</div>
          </div>
        </div>
      </div>

      <Panel title="Fee details" className="panel-flush">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Due date</th>
                <th className="num">Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {FEES.map((f) => (
                <tr key={f.item}>
                  <td>{f.item}</td>
                  <td className="nowrap">{formatDate(f.due)}</td>
                  <td className="num">{rupees(f.amount)}</td>
                  <td>
                    <StatusBadge tone={f.status === "Paid" ? "success" : "warning"}>
                      {f.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="note-text">Sample data shown. Online payment is not connected yet.</p>
    </>
  );
}
