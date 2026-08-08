import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// next.config.ts rewrites proxy /api, /admin and /sanctum to the Laravel
// backend. Browsers send no Origin header on same-origin GETs and Vercel's
// external rewrite strips the Referer, so Sanctum never classifies these as
// stateful and the session cookie is ignored on hard reloads. Inject the
// app's own Origin so the session is restored.
export function proxy(request: NextRequest) {
    const requestHeaders = new Headers(request.headers);
    if (!requestHeaders.has('origin')) {
        requestHeaders.set('origin', request.nextUrl.origin);
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
    matcher: ['/api/:path*', '/sanctum/:path*', '/admin/:path*'],
};
