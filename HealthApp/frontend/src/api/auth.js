// src/api/auth.js
// Auth-specific API calls: register + login + refresh (stub).

import { jsonRequest } from "./client";

/**
 * Register a new user.
 * Payload per user spec: { first_name, last_name, password }
 * Response expected: { username, user_id, first_name, last_name }
 */
export async function registerUser({ first_name, last_name, password }) {
  return jsonRequest("/register/", {
    method: "POST",
    body: JSON.stringify({ first_name, last_name, password }),
  });
}

/**
 * Login a user.
 * Payload: { username, password }
 * Response expected: { access, refresh }
 */
export async function loginUser({ username, password }) {
  return jsonRequest("/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

/**
 * Example refresh call (adjust path & payload to match your backend).
 * Response expected: { access, refresh? }
 */
export async function refreshToken({ refresh }) {
  // Update the path if your backend uses something like /token/refresh/
  return jsonRequest("/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
}