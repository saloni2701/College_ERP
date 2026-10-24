import React, { useState } from "react";

import { isBackendEnabled, registerUser } from "../api";

export default function Register({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (isBackendEnabled) {
        await registerUser(name, email, password);
      }

      setName("");
      setEmail("");
      setPassword("");
      onRegister();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="form-notice form-notice-error" role="alert">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="register-name" className="form-label">
          Full name
        </label>
        <input
          id="register-name"
          className="form-control"
          type="text"
          placeholder="Enter your full name"
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="register-email" className="form-label">
          Email address
        </label>
        <input
          id="register-email"
          className="form-control"
          type="email"
          placeholder="name@example.com"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="register-password" className="form-label">
          Password
        </label>
        <input
          id="register-password"
          className="form-control"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-erp btn-erp-block" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
