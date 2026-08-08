import Axios from 'axios';

// ---------------------------------------------------------------
//  Auth mode
// ---------------------------------------------------------------
//  true  → Sanctum SPA session cookies (requires same parent domain)
// ---------------------------------------------------------------
const USE_COOKIES = true;

const axios = Axios.create({
    // Same-origin in production: next.config.ts rewrites proxy /api, /admin and
    // /sanctum to the Laravel backend, so the Sanctum session/XSRF cookies stay
    // first-party. NEXT_PUBLIC_BACKEND_URL is only used by local dev.
    baseURL:
        process.env.NODE_ENV === 'production'
            ? ''
            : process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    withCredentials: USE_COOKIES,
    withXSRFToken: USE_COOKIES,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

// ── Session-expiry handling ─────────────────────────────────

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

/** Register a callback invoked when the session expires (HTTP 401). */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
    unauthorizedHandler = handler;
}

// ── Interceptors ────────────────────────────────────────────

/**
 * Bootstrap the Sanctum session: fetch the CSRF cookie so subsequent
 * stateful POST/PUT/DELETE requests carry a valid XSRF token.
 */
export async function initCsrf(): Promise<void> {
    if (USE_COOKIES) {
        await axios.get('/sanctum/csrf-cookie');
    }
}

/** Handle 419 CSRF expiry and 401 session expiry. */
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Re-fetch the CSRF cookie once, then retry the original request.
        if (USE_COOKIES && error.response?.status === 419 && !error.config._retry) {
            error.config._retry = true;
            await axios.get('/sanctum/csrf-cookie');
            return axios(error.config);
        }

        // Session expired → let the auth context sign the user out. Auth
        // entrypoints also return 401 for bad credentials, so those are excluded.
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            const url = String(error.config?.url ?? '');
            const isAuthEndpoint = url.includes('/login') || url.includes('/register');
            if (!isAuthEndpoint) {
                unauthorizedHandler?.();
            }
        }

        return Promise.reject(error);
    },
);

export default axios;
