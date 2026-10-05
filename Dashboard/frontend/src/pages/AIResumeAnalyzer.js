export default function AIResumeAnalyzer() {
  return (
    <div className="container mt-4">

      {/* Header */}
      <div className="p-4 mb-4 rounded shadow-sm" style={{ background: "#e8f5e9" }}>
        <h2 className="fw-bold">AI Resume Analyzer 🤖</h2>
        <p className="m-0">
          Upload your resume and let AI evaluate your strength, skills & job readiness.
        </p>
      </div>

      {/* Main Card */}
      <div className="p-4 shadow-sm rounded mb-4" style={{ background: "#fff" }}>
        <h4>🚀 What This Tool Does?</h4>
        <ul>
          <li>Analyzes resume content quality</li>
          <li>Checks ATS friendliness</li>
          <li>Identifies missing skills</li>
          <li>Provides improvement suggestions</li>
        </ul>

        <a
          className="btn btn-success btn-lg"
          href="http://localhost:8501"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Resume Analyzer
        </a>
      </div>

      {/* Instructions */}
      <div className="p-4 shadow-sm rounded" style={{ background: "#fff" }}>
        <h4>ℹ️ Usage Instructions</h4>
        <ol>
          <li>Click the “Open Resume Analyzer” button</li>
          <li>Upload your PDF / DOC resume</li>
          <li>Wait for AI analysis</li>
          <li>Review feedback & improve resume</li>
        </ol>

        <p className="text-muted">
          This feature helps students prepare industry-ready resumes.
        </p>
      </div>

    </div>
  );
}
