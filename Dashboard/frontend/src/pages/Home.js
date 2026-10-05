export default function Home() {
  return (
    <div className="container mt-4">

      <div className="p-4 mb-4 rounded shadow-sm" style={{ background: "#e3f2fd" }}>
        <h2 className="fw-bold">Welcome to SRM Attendance Dashboard 🎓</h2>
        <p className="m-0">
          Manage your attendance, view personal details, receive notifications
          and access AI Resume Analyzer — all in one place.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="row text-center">

        <div className="col-md-4 mb-3">
          <div className="p-4 shadow-sm rounded" style={{ background: "#fff" }}>
            <h4>Attendance Status</h4>
            <p className="text-success fw-bold">92% Present</p>
            <small className="text-muted">Keep maintaining consistency</small>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="p-4 shadow-sm rounded" style={{ background: "#fff" }}>
            <h4>Classes Attended</h4>
            <p className="fw-bold">56 / 60</p>
            <small className="text-muted">Great progress so far</small>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="p-4 shadow-sm rounded" style={{ background: "#fff" }}>
            <h4>Face Login</h4>
            <p className="fw-bold text-primary">Enabled</p>
            <small className="text-muted">Secure & Fast</small>
          </div>
        </div>
      </div>

      {/* Notice Board */}
      <div className="mt-4 p-4 shadow-sm rounded" style={{ background: "#fff" }}>
        <h4>📢 Latest Notifications</h4>
        <ul>
          <li>Attendance submission deadline: 31st March 2025</li>
          <li>Mid-Sem exams scheduled next month</li>
          <li>AI Resume Analyzer now available</li>
        </ul>
      </div>

    </div>
  );
}
