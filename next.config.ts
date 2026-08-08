import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const nextConfig: NextConfig = {
    turbopack: {
        root: path.join(__dirname, "."), // Points to parent directory (Memoire 2026)
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "placehold.net",
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
        ],
    },
    async rewrites() {
        // Proxy backend traffic to the Laravel API on Render. The browser only
        // talks to this Vercel domain, so the Sanctum session/XSRF cookies stay
        // same-origin. Set BACKEND_URL in the Vercel dashboard (server-side).
        const backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) {
            return [];
        }
        return [
            {
                source: "/sanctum/:path*",
                destination: `${backendUrl}/sanctum/:path*`,
            },
            {
                source: "/api/:path*",
                destination: `${backendUrl}/api/:path*`,
            },
            {
                source: "/admin/:path*",
                destination: `${backendUrl}/admin/:path*`,
            },
        ];
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
