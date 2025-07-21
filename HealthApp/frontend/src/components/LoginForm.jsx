// src/components/LoginForm.jsx
// Collects username + password and calls onSubmit.

import React, { useState } from "react";
import PropTypes from "prop-types";

export function LoginForm({ onSubmit, loading = false, error, initialUsername = "" }) {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit({ username, password });
  }

  const disabled = loading || !username || !password;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="login-user">Username</label>
        <input
          id="login-user"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          autoComplete="username"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="login-pass">Password</label>
        <input
          id="login-pass"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          autoComplete="current-password"
        />
      </div>
      {error && (
        <p className="text-red-600 text-sm" role="alert">{error}</p>
      )}
      <button
        type="submit"
        disabled={disabled}
        className={`w-full px-4 py-2 rounded text-white ${disabled ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  initialUsername: PropTypes.string,
};