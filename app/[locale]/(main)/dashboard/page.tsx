"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Breadcrumbs from "@/app/[locale]/components/Breadcrumbs/Breadcrumbs";
import axios from "@/lib/axios";
import type { Business } from "@/types/business";
import {
    Plus,
    Building2,
    LayoutList,
    Eye,
    FileEdit,
    Search,
    Loader2,
    AlertCircle,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

const TYPE_CONFIG: Record<string, string> = {
    restaurant: "UtensilsCrossed",
    hotel: "Hotel",
    touristic_agency: "Globe",
    real_estate_agency: "Store",
};

function StatCard({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-(--border) bg-(--background) shadow-sm transition-shadow hover:shadow-md">
            <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}15` }}
            >
                <Icon size={22} style={{ color }} />
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-(--light-fg)">
                    {label}
                </span>
                <span className="text-xl font-bold">{value}</span>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const t = useTranslations("dashboard");
    const params = useParams();
    const router = useRouter();
    const locale = params?.locale as string;
    const profileId = params?.id as string;

    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    useEffect(() => {
        if (!authLoading && user?.profile?.role === "client") {
            router.replace(`/${locale}/profile/${profileId}`);
        }
    }, [authLoading, user, profileId, router, locale]);

    const fetchBusinesses = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const { data } = await axios.get<Business[]>("/api/v1/my-businesses");
            setBusinesses(data);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && user?.profile?.role === "business_owner") {
            fetchBusinesses();
        }
    }, [authLoading, user, fetchBusinesses]);

    const filtered = useMemo(() => {
        return businesses.filter((b) => {
            if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
            if (typeFilter && b.type !== typeFilter) return false;
            return true;
        });
    }, [businesses, search, typeFilter]);

    const types = useMemo(() => {
        return [...new Set(businesses.map((b) => b.type))];
    }, [businesses]);

    if (authLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={32} className="animate-spin text-(--light-fg)" />
            </div>
        );
    }

    const totalListings = businesses.reduce((acc, b) => acc + (b.listings_count ?? 0), 0);
    const published = businesses.filter((b) => b.is_active && b.is_verified).length;
    const draft = businesses.filter((b) => !b.is_active).length;

    const stats = [
        { icon: Building2, label: t("total_businesses"), value: businesses.length, color: "#0077ed" },
        { icon: LayoutList, label: t("total_listings"), value: totalListings, color: "#059669" },
        { icon: Eye, label: t("published"), value: published, color: "#8b5cf6" },
        { icon: FileEdit, label: t("draft"), value: draft, color: "#f59e0b" },
    ];

    return (
        <div
            style={{ padding: "clamp(56px, 6vh, 72px) 2rem 2rem 2rem" }}
            className="w-full flex flex-col gap-8"
        >
            <Breadcrumbs />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-[1.8rem] font-bold mt-3">{t("title")}</h1>
                    <p className="text-md text-(--light-fg)">
                        {t("welcome", { name: user?.name ?? "" })}
                    </p>
                </div>
                <Link
                    href={`/${locale}/dashboard/businesses/new`}
                    className="flex items-center gap-2 bg-(--primary-clr) text-white hover:brightness-110 px-5 py-2.5 rounded-lg transition-all cursor-pointer text-sm font-medium"
                >
                    <Plus size={18} />
                    {t("create_business")}
                </Link>
            </div>

            {error ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20 rounded-xl border border-(--border)">
                    <AlertCircle size={40} className="text-red-400" />
                    <p className="text-(--light-fg)">{t("error")}</p>
                    <button
                        onClick={fetchBusinesses}
                        className="px-4 py-2 rounded-lg bg-(--primary-clr) text-white text-sm cursor-pointer hover:brightness-110 transition-all"
                    >
                        {t("retry")}
                    </button>
                </div>
            ) : loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="animate-pulse rounded-xl border border-(--border) p-5 space-y-3">
                            <div className="h-5 bg-(--border) rounded w-2/3" />
                            <div className="h-4 bg-(--border) rounded w-1/3" />
                            <div className="h-4 bg-(--border) rounded w-1/4" />
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((s) => (
                            <StatCard key={s.label} {...s} />
                        ))}
                    </div>

                    <section>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-semibold">{t("my_businesses")}</h2>
                            <span className="text-sm text-(--light-fg)">
                                {filtered.length} / {businesses.length} businesses
                            </span>
                        </div>

                        {/* Search & Filters */}
                        <div className="flex flex-wrap items-center gap-3 mb-5">
                            <div className="relative flex-1 min-w-[200px] max-w-sm">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--light-fg)" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name..."
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-(--border) bg-(--background) text-sm outline-none focus:border-(--primary-clr) transition-colors"
                                />
                            </div>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-(--border) bg-(--background) text-sm outline-none focus:border-(--primary-clr) transition-colors"
                            >
                                <option value="">All types</option>
                                {types.map((t) => (
                                    <option key={t} value={t}>
                                        {t.charAt(0).toUpperCase() + t.slice(1).replace("_", " ")}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-4 py-20 rounded-xl border-2 border-dashed border-(--border)">
                                <Building2 size={48} className="text-(--light-fg)" />
                                <p className="text-lg font-medium">{t("no_businesses")}</p>
                                <Link
                                    href={`/${locale}/dashboard/businesses/new`}
                                    className="flex items-center gap-2 bg-(--primary-clr) text-white hover:brightness-110 px-5 py-2.5 rounded-lg transition-all cursor-pointer text-sm font-medium mt-2"
                                >
                                    <Plus size={18} />
                                    {t("create_business")}
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-(--border)">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-(--dim-bg) border-b border-(--border)">
                                            <th className="text-left px-5 py-3.5 font-semibold text-(--light-fg)">Name</th>
                                            <th className="text-left px-5 py-3.5 font-semibold text-(--light-fg)">Type</th>
                                            <th className="text-left px-5 py-3.5 font-semibold text-(--light-fg)">Status</th>
                                            <th className="text-left px-5 py-3.5 font-semibold text-(--light-fg)">Listings</th>
                                            <th className="text-left px-5 py-3.5 font-semibold text-(--light-fg)">Verified</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((b) => (
                                            <tr key={b.id} className="border-b border-(--border) hover:bg-(--dim-bg)/50 transition-colors">
                                                <td className="px-5 py-4">
                                                    <Link
                                                        href={`/${locale}/dashboard/businesses/${b.id}`}
                                                        className="font-medium text-(--primary-clr) hover:underline"
                                                    >
                                                        {b.name}
                                                    </Link>
                                                </td>
                                                <td className="px-5 py-4 text-(--light-fg) capitalize">
                                                    {t(`type_${b.type}`)}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                            b.is_active
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-gray-100 text-gray-500"
                                                        }`}
                                                    >
                                                        {b.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-(--light-fg)">
                                                    {b.listings_count ?? 0}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {b.is_verified ? (
                                                        <CheckCircle2 size={18} className="text-green-500" />
                                                    ) : (
                                                        <XCircle size={18} className="text-gray-300" />
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
