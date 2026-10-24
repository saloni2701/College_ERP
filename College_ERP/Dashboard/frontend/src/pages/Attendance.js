import React from "react";

import PageHeader from "../components/common/PageHeader";
import Panel from "../components/common/Panel";
import Icon from "../components/common/Icon";
import AttendanceHistory from "../components/AttendanceHistory";
import { EXTERNAL_URLS } from "../config/navigation";

const GUIDELINES = [
  "Ensure proper lighting while scanning",
  "Keep your face straight and clearly visible",
  "Internet connection must be active",
  "If the camera fails, refresh and retry",
];

export default function Attendance({ user }) {
  return (
    <>
      <PageHeader
        title="Face Recognition Attendance"
        description="Mark your attendance using secure, AI-powered face scanning."
      />

      <div className="row g-4">
        <div className="col-lg-7">
          <Panel title="Mark attendance">
            <p className="body-text">
              Open the live attendance portal to begin. Make sure your face is
              clearly visible in front of the camera.
            </p>
            <a
              className="btn-erp"
              href={EXTERNAL_URLS.attendance}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open attendance portal <Icon name="external" size={16} />
            </a>
            <p className="note-text">
              The portal opens in a new tab. This system is developed for
              academic project demonstration purposes.
            </p>
          </Panel>
        </div>

        <div className="col-lg-5">
          <Panel title="Guidelines">
            <ul className="check-list">
              {GUIDELINES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="mt-4">
        <AttendanceHistory user={user} />
      </div>
    </>
  );
}
