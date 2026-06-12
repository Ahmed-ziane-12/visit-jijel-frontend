"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Breadcrumbs from "@/app/[locale]/components/Breadcrumbs/Breadcrumbs";
import BusinessCard from "@/app/[locale]/components/BusinessCard/BusinessCard";
import axios from "@/lib/axios";
import type { Business } from "@/types/business";
import {
    Plus,
    Building2,
    LayoutList,
    Eye,
    FileEdit,
    Store,
    UtensilsCrossed,
    Hotel,
    Globe,
    Loader2,
    AlertCircle,
    X,
} from "lucide-react";
import { useTranslations } from "next-intl";

const TYPE_CONFIG: Record<string, { icon: React.ElementType }> = {
    restaurant: { icon: UtensilsCrossed },
    hotel: { icon: Hotel },
    touristic_agency: { icon: Globe },
    real_estate_agency: { icon: Store },
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

function BusinessCardSkeleton() {
    return (
        <div className="animate-pulse rounded-xl border border-(--border) p-5 space-y-3">
            <div className="h-5 bg-(--border) rounded w-2/3" />
            <div className="h-4 bg-(--border) rounded w-1/3" />
            <div className="h-4 bg-(--border) rounded w-1/4" />
            <div className="flex gap-2 pt-2">
                <div className="h-8 bg-(--border) rounded w-20" />
                <div className="h-8 bg-(--border) rounded w-16" />
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
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!authLoading && user?.profile?.role === "client") {
            router.replace(`/${locale}/profile/${profileId}`);
        }
    }, [authLoading, user, profileId, router, locale]);

    const fetchBusinesses = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const { data } = await axios.get<Business[]>(
                "/api/v1/my-businesses",
            );
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

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await axios.delete(`/api/v1/businesses/${deleteId}`);
            setBusinesses((prev) => prev.filter((b) => b.id !== deleteId));
        } catch {
            // silently fail — user can retry
        } finally {
            setDeleting(false);
            setDeleteId(null);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={32} className="animate-spin text-(--light-fg)" />
            </div>
        );
    }

    const totalListings = businesses.reduce(
        (acc, b) => acc + (b.listings_count ?? 0),
        0,
    );

    const stats = [
        {
            icon: Building2,
            label: t("total_businesses"),
            value: businesses.length,
            color: "#0077ed",
        },
        {
            icon: LayoutList,
            label: t("total_listings"),
            value: totalListings,
            color: "#059669",
        },
        { icon: Eye, label: t("published"), value: 10, color: "#8b5cf6" },
        { icon: FileEdit, label: t("draft"), value: 20, color: "#f59e0b" },
    ];

    return (
        <div
            style={{ padding: "clamp(56px, 6vh, 72px) 2rem 2rem 2rem" }}
            className="w-full flex flex-col gap-8"
        >
            <Breadcrumbs />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-[1.8rem] font-bold mt-3">
                        {t("title")}
                    </h1>
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
                        <div
                            key={i}
                            className="animate-pulse rounded-xl border border-(--border) p-5 space-y-3"
                        >
                            <div className="h-5 bg-(--border) rounded w-2/3" />
                            <div className="h-4 bg-(--border) rounded w-1/3" />
                            <div className="h-4 bg-(--border) rounded w-1/4" />
                            <div className="flex gap-2 pt-2">
                                <div className="h-8 bg-(--border) rounded w-20" />
                                <div className="h-8 bg-(--border) rounded w-16" />
                            </div>
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
                            <h2 className="text-xl font-semibold">
                                {t("my_businesses")}
                            </h2>
                            <span className="text-sm text-(--light-fg)">
                                {businesses.length}{" "}
                                {businesses.length === 1
                                    ? "business"
                                    : "businesses"}
                            </span>
                        </div>

                        {businesses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-4 py-20 rounded-xl border-2 border-dashed border-(--border)">
                                <Building2
                                    size={48}
                                    className="text-(--light-fg)"
                                />
                                <p className="text-lg font-medium">
                                    {t("no_businesses")}
                                </p>
                                <p className="text-sm text-(--light-fg)">
                                    {t("start_creating")}
                                </p>
                                <Link
                                    href={`/${locale}/dashboard/businesses/new`}
                                    className="flex items-center gap-2 bg-(--primary-clr) text-white hover:brightness-110 px-5 py-2.5 rounded-lg transition-all cursor-pointer text-sm font-medium mt-2"
                                >
                                    <Plus size={18} />
                                    {t("create_business")}
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {businesses.map((business) => {
                                    const coverUrl =
                                        business.media?.find((m) => m.is_cover)
                                            ?.secure_url ??
                                        business.media?.[0]?.secure_url;

                                    return (
                                        <BusinessCard
                                            key={business.id}
                                            business={business}
                                            typeLabel={t(
                                                `type_${business.type}`,
                                            )}
                                            typeIcon={
                                                TYPE_CONFIG[business.type]?.icon
                                            }
                                            coverUrl={coverUrl}
                                            locale={locale}
                                            onManageHref={`/${locale}/dashboard/businesses/${business.id}`}
                                            onEditHref={`/${locale}/dashboard/businesses/${business.id}/edit`}
                                            onDelete={(id) => setDeleteId(id)}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </>
            )}

            {deleteId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                                {t("confirm_delete_title")}
                            </h3>
                            <button
                                onClick={() => setDeleteId(null)}
                                className="cursor-pointer text-(--light-fg) hover:text-[--fg] transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-(--light-fg) mb-6">
                            {t("confirm_delete", {
                                name:
                                    businesses.find((b) => b.id === deleteId)
                                        ?.name ?? "",
                            })}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 rounded-lg text-sm font-medium border border-(--border) hover:bg-(--border)/50 transition-colors cursor-pointer"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                                {deleting && (
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                )}
                                {deleting ? t("deleting") : t("delete")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
