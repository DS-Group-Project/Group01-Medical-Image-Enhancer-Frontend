import axios from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Base Axios instance for API communication.
 *
 * SECURITY NOTE (auth model):
 * This app uses cookie-based sessions, not a token stored in JS-accessible
 * storage. The backend is expected to:
 *   1. Set the session/JWT as an HttpOnly, Secure, SameSite=Lax|Strict cookie
 *      on login/register (e.g. `Set-Cookie: session=...; HttpOnly; Secure; SameSite=Lax`).
 *      Because it's HttpOnly, client-side JS (and therefore any XSS payload)
 *      cannot read or exfiltrate it.
 *   2. Set a second, readable, non-HttpOnly `XSRF-TOKEN` cookie containing a
 *      random CSRF token, and require that value to be echoed back in an
 *      `X-XSRF-TOKEN` header on every state-changing request (POST/PUT/PATCH/DELETE).
 *      This is the standard "double-submit cookie" CSRF defense that pairs with
 *      cookie-based auth. Axios does this automatically for same-site requests
 *      via the xsrfCookieName/xsrfHeaderName config below.
 *   3. Set CORS headers with `Access-Control-Allow-Credentials: true` and an
 *      explicit (non-wildcard) `Access-Control-Allow-Origin` matching this app's
 *      origin, since `withCredentials: true` requires it.
 *
 * We deliberately do NOT store any token in localStorage/sessionStorage:
 * anything in those is readable by any script running on the page, so a single
 * XSS bug would otherwise mean full session theft. This is especially important
 * here since the app handles medical images.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000,
  withCredentials: true, // send/receive the HttpOnly session cookie
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json',
  },
});

// SECURITY: Warn loudly if a production build is configured to talk to a plain
// HTTP backend. The session cookie has Secure flag, so it won't even be sent
// over HTTP — meaning auth silently breaks. Catch this during development.
if (import.meta.env.PROD && api.defaults.baseURL?.startsWith('http://')) {
  console.error(
    '[SECURITY] API base URL uses plain HTTP in a production build. ' +
    'The HttpOnly/Secure session cookie will NOT be sent over insecure ' +
    'connections. Set VITE_API_BASE_URL to an https:// URL.'
  );
}

/**
 * Response Interceptor
 * Handles global API errors and 401 (session expired/invalid) redirects.
 * No request interceptor is needed for auth: the browser attaches the
 * HttpOnly cookie automatically, and axios attaches the CSRF header itself.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    // Don't reflect raw backend error text into the UI unfiltered; keep a safe
    // generic fallback and only show server-provided messages we control.
    const message = error.response?.data?.message || 'An unexpected error occurred';

    if (status === 401) {
      // Session invalid/expired. There's no client-side token to clear (it's
      // an HttpOnly cookie the server owns) — just reflect the logged-out
      // state and redirect. AuthContext's isAuthenticated flag is the source
      // of truth and gets reset via the caller / next getCurrentUser() check.
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error('You do not have permission to do that.');
    } else if (status === 429) {
      toast.error('Too many requests. Please wait a moment and try again.');
    } else if (status >= 500) {
      toast.error('Something went wrong on our end. Please try again shortly.');
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
