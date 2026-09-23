"use client";

import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { notFound } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "@/lib/axios";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Destination, Media, Review } from "@/types/map";
import { Business } from "@/types/business";
import Reviews from "@/app/[locale]/components/Reviews/Reviews";
import ConfirmDialog from "@/app/[locale]/components/ConfirmDialog/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import {
    Loader2,
    Building2,
    MapPin,
    Phone,
    Mail,
    Globe,
    Star,
    BadgeCheck,
    Quote,
    X,
    Landmark,
} from "lucide-react";

const Map = dynamic(() => import("@/app/[locale]/components/Map/Map"), {
    ssr: false,
});

const BLUR =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg==";

interface MediaTileItem {
    id: number | string;
    secure_url: string;
    is_cover: boolean;
    collection: string;
    resource_type?: string;
}

function localizeBusiness(business: Business): Business {
    const body =
        typeof business.description === "string" ? business.description : "";
    return { ...business, description: body };
}

const ALL_MEDIA_COLLECTIONS = ["nursery", "gallery", "cover"];

function businessMediaToTiles(business: Business): MediaTileItem[] {
    const raw = business.media ?? [];
    const base: MediaTileItem[] = raw.map((m) => ({
        id: m.id,
        secure_url: m.secure_url,
        is_cover: m.is_cover,
        collection: m.collection ?? "",
    }));
    return base;
}

function businessToDestination(business: Business): Destination {
    return {
        id: business.id,
        name: business.name,
        description:
            typeof business.description === "string"
                ? business.description
                : "",
        category: business.type?.toLowerCase() || "touristic_agency",
        address: business.address ?? "",
        latitude: business.latitude ?? undefined,
        longitude: business.longitude ?? undefined,
        media: businessMediaToTiles(business).map((m) => ({
            id: Number(m.id),
            secure_url: m.secure_url,
            is_cover: m.is_cover,
            collection: m.collection ?? "",
        })),
        tags: business.type ? [business.type] : [],
        reviews: [],
    };
}

interface ReviewState {
    count: number;
    avg: number;
}

function reviewSummary(business: Business): ReviewState {
    const reviews = (business as any)?.reviews;
    if (!Array.isArray(reviews) || reviews.length === 0) {
        return { count: 0, avg: 0 };
    }
    const sum = reviews.reduce(
        (acc: number, r: any) => acc + (r.rating ?? 0),
        0,
    );
    return { count: reviews.length, avg: sum / reviews.length };
}

export default function BusinessPage() {
    const params = useParams();
    const id = (params?.id as string) ?? "";
    const t = useTranslations("business");
    const locale = useLocale();
    const { isAuthenticated, user } = useAuth();
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [showcaseOpen, setShowcaseOpen] = useState(false);
    const [showcaseIndex, setShowcaseIndex] = useState(0);
    const [feedbackOpen, setFeedbackOpen] = useState(false);

    useEffect(() => {
        if (!id) return;
        axios
            .get(`/api/v1/businesses/${id}`)
            .then((res) => setBusiness(res.data?.data ?? res.data ?? null))
            .catch(() => setBusiness(null))
            .finally(() => setLoading(false));
    }, [id]);

    const media = useMemo(
        () => (business?.media ?? []).filter((m) => !!m.secure_url),
        [business],
    );

    const coverIndex = useMemo(() => {
        const idx = media.findIndex((m) => m.is_cover);
        return idx === -1 ? 0 : idx;
    }, [media]);

    const restSlots = useMemo(
        () =>
            media
                .map((m, i) => ({ m, i }))
                .filter(({ i }) => i !== coverIndex)
                .slice(0, 4),
        [media, coverIndex],
    );

    const showcaseItems = useMemo(
        () =>
            media.map((m) => ({
                src: m.secure_url,
                type:
                    (m as { resource_type?: string }).resource_type === "video"
                        ? ("video" as const)
                        : ("image" as const),
            })),
        [media],
    );

    const localized = business ? localizeBusiness(business) : null;
    const summary = useMemo(
        () => reviewSummary(business as Business),
        [business],
    );

    const openShowcaseAt = useCallback((index: number) => {
        setShowcaseIndex(index);
        setShowcaseOpen(true);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 size={28} className="animate-spin" />
            </div>
        );
    }

    if (!business || !localized) {
        notFound();
        return null;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <ConfirmDialog
                open={feedbackOpen}
                theme="info"
                title={t("feedback_title")}
                message={t("feedback_message")}
                onConfirm={() => setFeedbackOpen(false)}
                onCancel={() => setFeedbackOpen(false)}
            />

            {/* Showcase */}
            <div className="mb-6">
                {media.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div
                            className="relative col-span-2 row-span-2 overflow-hidden rounded-xl cursor-pointer"
                            onClick={() => openShowcaseAt(0)}
                        >
                            <Image
                                src={media[0].secure_url ?? BLUR}
                                alt={business.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        {media.slice(1, 5).map((m) => (
                            <div
                                key={m.id}
                                className="relative overflow-hidden rounded-xl cursor-pointer"
                                onClick={() =>
                                    openShowcaseAt(media.indexOf(m))
                                }
                            >
                                <Image
                                    src={m.secure_url}
                                    alt={business.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                        {business.name}
                    </h1>
                    <p className="text-sm text-(--light-fg) mt-2">
                        {business.type?.replace("_", " ")}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                        {business.is_verified && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1 bg-green-600/10 text-green-700">
                                <BadgeCheck size={14} />
                                verified
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* About */}
            {business.description && (
                <div className="mt-6">
                    <h2 className="text-lg font-bold mb-2">About</h2>
                    <p className="tracking-wide text-justify">
                        {business.description}
                    </p>
                </div>
            )}

            {/* Details + Map side rail */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="md:col-span-1 space-y-4">
                    {business.address && (
                        <InfoRow icon={<MapPin size={18} />} label="Address">
                            {business.address}
                        </InfoRow>
                    )}
                    {business.phone && (
                        <InfoRow icon={<Phone size={18} />} label="Phone">
                            <a href={`tel:${business.phone}`}>
                                {business.phone}
                            </a>
                        </InfoRow>
                    )}
                    {business.email && (
                        <InfoRow icon={<Mail size={18} />} label="Email">
                            <a href={`mailto:${business.email}`}>
                                {business.email}
                            </a>
                        </InfoRow>
                    )}
                    {business.website && (
                        <InfoRow icon={<Globe size={18} />} label="Website">
                            <a
                                href={business.website}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {business.website}
                            </a>
                        </InfoRow>
                    )}
                    {(business.wilaya || business.commune) && (
                        <InfoRow icon={<Landmark size={18} />} label="Location">
                            {[business.wilaya, business.commune]
                                .filter(Boolean)
                                .join(", ")}
                        </InfoRow>
                    )}
                </div>

                <div className="relative z-0 md:col-span-2">
                    <Map
                        destinations={
                            business ? [businessToDestination(business)] : []
                        }
                        zoom={13}
                        center={[
                            business.latitude ?? 36.8233,
                            business.longitude ?? 5.7667,
                        ]}
                    />
                </div>
            </div>

            {/* Reviews */}
            <div className="mt-10">
                <Reviews
                    reviews={(business as any)?.reviews ?? []}
                    isAuthenticated={isAuthenticated}
                    onSubmit={async (rating, body) => {
                        await axios.post("/api/v1/reviews", {
                            business_id: business.id,
                            rating,
                            body,
                        });
                    }}
                />
            </div>
        </div>
    );
}

function InfoRow({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">{icon}</div>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                    {label}
                </p>
                <p className="text-sm font-medium text-gray-800">{children}</p>
            </div>
        </div>
    );
}
