import Axios from 'axios';

// ---------------------------------------------------------------
//  Auth mode
// ---------------------------------------------------------------
//  true  → Sanctum SPA session cookies (requires same parent domain)
// ---------------------------------------------------------------
const USE_COOKIES = true;

const axios = Axios.create({
    // Empty in production → same-origin requests go through the Vercel rewrites.
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || '',
    withCredentials: USE_COOKIES,
    withXSRFToken: USE_COOKIES,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

// In-memory token (source of truth while the page is open)
let authToken: string | null = null;

/** Set or clear the Bearer token attached to every request. */
export function setupToken(token: string | null): void {
    authToken = token;
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

/** Attach the Bearer token to every outgoing request. */
axios.interceptors.request.use((config) => {
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
});

/** Handle 419 CSRF expiry — only relevant in cookie mode. */
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (USE_COOKIES && error.response?.status === 419 && !error.config._retry) {
            error.config._retry = true;
            await axios.get('/sanctum/csrf-cookie');
            return axios(error.config);
        }
        return Promise.reject(error);
    },
);

export default axios;
