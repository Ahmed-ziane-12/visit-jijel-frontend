"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, LayoutDashboard } from "lucide-react";
import { useTranslations } from "next-intl";

const Breadcrumbs = () => {
    const t = useTranslations("breadcrumbs");
    const pathname = usePathname();
    const labelMap: Record<string, string> = {
        dashboard: t("dashboard"),
    };
    const segments = pathname.split("/").filter(Boolean);

    const dashIdx = segments.indexOf("dashboard");
    if (dashIdx === -1) return null;

    // Build crumbs from segments after "dashboard", skipping numeric [id] in labels
    const crumbs: { label: string; href: string; isLast: boolean }[] = [];

    for (let i = dashIdx; i < segments.length; i++) {
        const seg = segments[i];
        if (/^\d+$/.test(seg)) continue;

        // Include any trailing numeric segments (like route params) in the href
        let end = i;
        while (end + 1 < segments.length && /^\d+$/.test(segments[end + 1])) {
            end++;
        }
        const fullPath = "/" + segments.slice(0, end + 1).join("/");
        const label =
            labelMap[seg] || decodeURIComponent(seg.replace(/-/g, " "));
        const isLast = !segments.slice(i + 1).some((s) => !/^\d+$/.test(s));
        crumbs.push({ label, href: fullPath, isLast });
    }

    return (
        <nav
            aria-label={t("aria_label")}
            className="flex items-center gap-1.5 text-xs text-(--light-fg) mt-2"
        >
            <LayoutDashboard size={14} />
            {crumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1.5">
                    {crumb.isLast ? (
                        <span className="font-medium text-[var(--foreground)]">
                            {crumb.label}
                        </span>
                    ) : (
                        <Link
                            href={crumb.href}
                            className="transition-colors hover:text-(--primary-clr)"
                        >
                            {crumb.label}
                        </Link>
                    )}
                    <ChevronRight size={12} />
                </span>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
