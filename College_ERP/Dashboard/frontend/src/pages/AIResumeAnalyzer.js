import React from "react";

import PageHeader from "../components/common/PageHeader";
import Panel from "../components/common/Panel";
import Icon from "../components/common/Icon";
import { EXTERNAL_URLS } from "../config/navigation";

const FEATURES = [
  "Analyzes resume content quality",
  "Checks ATS friendliness",
  "Identifies missing skills",
  "Provides improvement suggestions",
];

const STEPS = [
  "Click the “Open Resume Analyzer” button",
  "Upload your PDF / DOC resume",
  "Wait for the AI analysis",
  "Review the feedback and improve your resume",
];

export default function AIResumeAnalyzer() {
  return (
    <>
      <PageHeader
        title="AI Resume Analyzer"
        description="Upload your resume and get an evaluation of its strength, skills and job readiness."
      />

      <div className="row g-4">
        <div className="col-lg-7">
          <Panel title="What this tool does" className="mb-4">
            <ul className="check-list">
              {FEATURES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a
              className="btn-erp"
              href={EXTERNAL_URLS.resumeAnalyzer}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Resume Analyzer <Icon name="external" size={16} />
            </a>
          </Panel>
        </div>

        <div className="col-lg-5">
          <Panel title="How to use it">
            <ol className="step-list">
              {STEPS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <p className="note-text">
              This feature helps students prepare industry-ready resumes.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}
