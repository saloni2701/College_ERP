export default function PersonalInfo({ user }) {
  return (
    <div className="container mt-4">

      <div className="p-4 shadow-sm rounded" style={{ background: "#fff" }}>
        <h3 className="fw-bold mb-3">👤 Personal Information</h3>

        <div className="row">

          <div className="col-md-4 text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="profile"
              height="130"
              className="mb-3"
            />
            <span className="badge bg-success p-2">Active Student</span>
          </div>

          <div className="col-md-8">
            <p><b>Name:</b> {user?.name || "Student"}</p>
            <p><b>Email:</b> {user?.email}</p>
            <p><b>Student ID:</b> {user?.id || "SRMxxxx"}</p>

            <hr />

            <h5 className="fw-bold">Academic Details</h5>
            <p><b>Department:</b> Computer Science & Engineering</p>
            <p><b>Year:</b> 3rd Year</p>
            <p><b>Section:</b> A</p>
          </div>

        </div>
      </div>

    </div>
  );
}
