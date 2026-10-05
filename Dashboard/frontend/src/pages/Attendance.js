export default function Attendance() {
  return (
    <div className="container mt-4">

      {/* Header Section */}
      <div className="p-4 mb-4 rounded shadow-sm" style={{ background: "#e8f0fe" }}>
        <h2 className="fw-bold">Face Recognition Attendance 📸</h2>
        <p className="m-0">
          Mark your attendance using secure AI-powered face scanning.
        </p>
      </div>

      {/* Attendance Panel */}
      <div className="p-4 shadow-sm rounded mb-4" style={{ background: "#fff" }}>
        <h4>🎯 Attendance System</h4>
        <p>
          Click the button below to open the live attendance portal.
          Make sure your face is clearly visible in front of the camera.
        </p>

        <a
          className="btn btn-primary btn-lg"
          href="http://127.0.0.1:5000/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Face Attendance
        </a>
      </div>

      {/* Extra Info */}
      <div className="p-4 shadow-sm rounded" style={{ background: "#fff" }}>
        <h4>ℹ️ Attendance Guidelines</h4>
        <ul>
          <li>Ensure proper lighting while scanning</li>
          <li>Keep your face straight and clearly visible</li>
          <li>Internet connection must be active</li>
          <li>If camera fails, refresh and retry</li>
        </ul>

        <p className="text-muted">
          Note: This system is developed for academic project demonstration purposes.
        </p>
      </div>

    </div>
  );
}
