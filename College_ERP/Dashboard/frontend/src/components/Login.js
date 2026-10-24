import React, { useState } from "react";

import { isBackendEnabled, loginUser, setToken } from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      let loggedUser;

      if (isBackendEnabled) {
        const data = await loginUser(email, password);
        const account = data.user || data; // accepts { user: {...} } or a flat object
        loggedUser = {
          name: account.name || "Student",
          email: account.email || email,
          id: account.id ?? account._id ?? "",
        };
        setToken(data.token);
      } else {
        // Demo mode: any credentials are accepted.
        loggedUser = { name: "Student", email, id: "SRM123" };
        setToken(null);
      }

      localStorage.setItem("user", JSON.stringify(loggedUser));
      onLogin(loggedUser);
    } catch (err) {
      setError(err.message);
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
        <label htmlFor="login-email" className="form-label">
          Email address
        </label>
        <input
          id="login-email"
          className="form-control"
          type="email"
          placeholder="name@example.com"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="login-password" className="form-label">
          Password
        </label>
        <input
          id="login-password"
          className="form-control"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-erp btn-erp-block" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>

      {!isBackendEnabled && (
        <p className="note-text">
          Demo mode: no backend is connected, so any email and password will sign you in.
        </p>
      )}
    </form>
  );
}
