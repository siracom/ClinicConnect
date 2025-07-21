// src/api/protected.js
// Example of a protected endpoint call using an access token.
// Replace /profile/ with any endpoint that requires authorization.

import { jsonRequest } from "./client";

export async function fetchProfile(accessToken, username) {
  return jsonRequest(`/user/${username}`, { method: "GET" }, accessToken);
}