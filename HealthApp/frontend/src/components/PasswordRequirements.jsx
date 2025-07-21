// src/components/PasswordRequirements.jsx
// Displays live validation state for password rules.

import React from "react";
import PropTypes from "prop-types";

export function PasswordRequirements({ results }) {
  if (!results) return null;
  return (
    <ul className="mt-2 text-sm space-y-1" aria-live="polite" aria-atomic="true">
      {results.map((r) => (
        <li
          key={r.name}
          className={r.passed ? "text-green-600" : "text-gray-500"}
        >
          {r.passed ? "✔" : "•"} {r.label}
        </li>
      ))}
    </ul>
  );
}

PasswordRequirements.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      passed: PropTypes.bool.isRequired,
    })
  ),
};