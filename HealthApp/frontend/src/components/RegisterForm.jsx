// src/components/RegisterForm.jsx
// Collects first_name, last_name, password, confirm_password.
// Validates password locally and calls onSubmit with {first_name,last_name,password}.

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { validatePassword } from "../utils/passwordValidation";
import { PasswordRequirements } from "./PasswordRequirements";

export function RegisterForm({ onSubmit, loading = false, error }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [validation, setValidation] = useState(validatePassword(""));
  const [submitted, setSubmitted] = useState(false);
  const passwordsMatch = password === confirm;

  useEffect(() => {
    setValidation(validatePassword(password));
  }, [password]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    if (!validation.valid || !passwordsMatch) return;
    await onSubmit({ first_name: firstName, last_name: lastName, password });
  }

  const disabled = loading || !validation.valid || !passwordsMatch;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="reg-first">First Name</label>
        <input
          id="reg-first"
          type="text"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="reg-last">Last Name</label>
        <input
          id="reg-last"
          type="text"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="reg-pass">Password</label>
        <input
          id="reg-pass"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          autoComplete="new-password"
        />
        <PasswordRequirements results={validation.results} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="reg-confirm">Confirm Password</label>
        <input
          id="reg-confirm"
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          autoComplete="new-password"
        />
        {submitted && !passwordsMatch && (
          <p className="text-red-600 text-sm mt-1">Passwords do not match.</p>
        )}
      </div>
      {error && (
        <p className="text-red-600 text-sm" role="alert">{error}</p>
      )}
      <button
        type="submit"
        disabled={disabled}
        className={`w-full px-4 py-2 rounded text-white ${disabled ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}

RegisterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};