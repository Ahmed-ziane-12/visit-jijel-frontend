import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const backendPaths = ['/api', '/sanctum', '/admin'];

// next.config.ts rewrites /api, /admin and /sanctum to the Laravel backend.
// Browsers send no Origin header on same-origin GETs and Vercel's external
// rewrite strips the Referer, so Sanctum never classifies these as stateful
// and the session cookie is ignored on hard reloads. Inject the app's own
// Origin so the session is restored. Every other route keeps the next-intl
// locale middleware.
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (backendPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
        const requestHeaders = new Headers(request.headers);
        if (!requestHeaders.has('origin')) {
            requestHeaders.set('origin', request.nextUrl.origin);
        }
        return NextResponse.next({ request: { headers: requestHeaders } });
    }

    return intlMiddleware(request);
}

export const config = {
    matcher: [
        '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
        '/api/:path*',
        '/sanctum/:path*',
        '/admin/:path*',
    ],
};
