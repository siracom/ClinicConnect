// src/api/client.js
// Generic API client helper built on fetch.
// Automatically prefixes the base URL and allows auth header injection.

const BASE_URL = process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, "") || ""; // safe no trailing slash

/**
 * Internal helper to build full URL.
 */
function buildUrl(path) {
  if (!path.startsWith("/")) path = "/" + path;
  return `${BASE_URL}${path}`;
}

/**
 * Perform a JSON request.
 * @param {string} path - e.g. "/login/" (leading slash optional)
 * @param {Object} options - fetch options
 * @param {string} [accessToken] - optional Bearer token; if provided will be attached
 * @returns {Promise<Object>} parsed JSON
 * @throws if !response.ok
 */
export async function jsonRequest(path, options = {}, accessToken, content_type='application/json') {
  const url = buildUrl(path);
  const headers = new Headers(options.headers || {});
  if(content_type)
    headers.set("Content-Type", content_type);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  const resp = await fetch(url, fetchOptions);
  const text = await resp.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    throw new Error(`Failed to parse JSON from ${url}: ${err.message}`);
  }
  if (!resp.ok) {
    const errMsg = data?.detail || resp.statusText || "Request failed";
    const error = new Error(errMsg);
    error.status = resp.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function deleteRequest(path, token) {
    const url = buildUrl(path);
    const resp = await fetch(
        url,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
    );
    if (!resp.ok) {
        const errMsg = resp.statusText || "Request failed";
        const error = new Error(errMsg);
        error.status = resp.status;
        throw error;
    }
}

export async function postRequest(path, token, payload){
    const url = buildUrl(path);
    const resp = await fetch(
        url,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        }
    );
    const text = await resp.text();
    let data;
    try {
        data = text ? JSON.parse(text) : null;
    } catch (err) {
        throw new Error(`Failed to parse JSON from ${url}: ${err.message}`);
    }
    if (!resp.ok) {
        const errMsg = data?.detail || resp.statusText || "Request failed";
        const error = new Error(errMsg);
        error.status = resp.status;
        error.data = data;
        throw error;
    }
    return data;
}