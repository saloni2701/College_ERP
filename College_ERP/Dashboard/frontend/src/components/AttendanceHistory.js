import React, { useCallback, useEffect, useRef, useState } from "react";

import Panel from "./common/Panel";
import StatusBadge from "./common/StatusBadge";
import { getAttendance, isBackendEnabled } from "../api";

const STATUS_TONE = { present: "success", late: "warning", absent: "danger" };

const prettify = (value) =>
  String(value).replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase());

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { day: String(value), time: "" };
  return {
    day: date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function AttendanceHistory({ user }) {
  const userId = user?.id;
  const [state, setState] = useState({ status: "idle", records: [], error: "" });
  const latestRequest = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setState((prev) => ({ ...prev, status: "loading", error: "" }));

    try {
      const data = await getAttendance(userId);
      if (requestId !== latestRequest.current) return; // a newer request replaced this one
      setState({ status: "ready", records: data?.attendance || [], error: "" });
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      setState({
        status: "error",
        records: [],
        error:
          err.status === 401
            ? "Your session has expired. Please sign out and sign in again."
            : err.message,
      });
    }
  }, [userId]);

  useEffect(() => {
    if (isBackendEnabled && userId) load();
    return () => {
      latestRequest.current += 1; // ignore responses that arrive after unmount
    };
  }, [load, userId]);

  const { status, records, error } = state;
  let body;

  if (!isBackendEnabled) {
    body = (
      <p className="body-text mb-0">
        Connect the backend (see <code>.env.example</code>) to see your recorded
        attendance here.
      </p>
    );
  } else if (!userId) {
    body = (
      <p className="body-text mb-0">
        Your account has no ID, so attendance history cannot be loaded.
      </p>
    );
  } else if (status === "error") {
    body = (
      <div className="form-notice form-notice-error mb-0" role="alert">
        {error}
      </div>
    );
  } else if (status === "ready" && records.length === 0) {
    body = <p className="body-text mb-0">No attendance has been recorded yet.</p>;
  } else if (status === "ready") {
    body = (
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => {
              const { day, time } = formatDateTime(record.recorded_at);
              return (
                <tr key={record.id ?? index}>
                  <td className="nowrap">{day}</td>
                  <td className="nowrap">{time}</td>
                  <td>
                    <StatusBadge tone={STATUS_TONE[String(record.status).toLowerCase()] || "neutral"}>
                      {prettify(record.status)}
                    </StatusBadge>
                  </td>
                  <td>{prettify(record.source)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  } else {
    body = (
      <p className="body-text mb-0" role="status">
        Loading attendance records…
      </p>
    );
  }

  const canRefresh = isBackendEnabled && Boolean(userId);

  return (
    <Panel title="Attendance history">
      {canRefresh && (
        <div className="panel-toolbar">
          <span className="muted-text">
            {status === "ready" ? `Latest ${records.length} record${records.length === 1 ? "" : "s"}` : "\u00A0"}
          </span>
          <button
            type="button"
            className="btn-erp btn-erp-secondary"
            onClick={load}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      )}
      {body}
    </Panel>
  );
}
