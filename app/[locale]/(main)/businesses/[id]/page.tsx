"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import axios from "@/lib/axios";
import type {
    Business,
    BusinessMedia,
    BusinessReview,
    Listing,
} from "@/types/business";

const IMAGE_PLACEHOLDER = "https://placehold.net/1200x800.png";
const EMPTY = "—";

const TYPE_LABELS: Record<string, string> = {
    hotel: "Hotel",
    restaurant: "Restaurant",
    touristic_agency: "Touristic Agency",
    real_estate_agency: "Real Estate Agency",
};

const CURRENCY_LABELS: Record<string, string> = {
    DZD: "DA",
    EUR: "€",
    USD: "$",
    GBP: "£",
};

function imagesOnly(media: BusinessMedia[] | undefined): BusinessMedia[] {
    return (media ?? []).filter(
        (item) => (item.resource_type ?? "image") === "image" && item.secure_url,
    );
}

function pickCover(media: BusinessMedia[] | undefined): string | null {
    const images = imagesOnly(media);
    return (images.find((item) => item.is_cover) ?? images[0])?.secure_url ?? null;
}

function galleryUrls(media: BusinessMedia[] | undefined): string[] {
    return imagesOnly(media)
        .slice()
        .sort(
            (a, b) =>
                Number(b.is_cover) - Number(a.is_cover) ||
                (a.sort_order ?? 0) - (b.sort_order ?? 0),
        )
        .map((item) => item.secure_url);
}

function numericPrice(price: string | number | null | undefined): number | null {
    if (price === null || price === undefined || price === "") {
        return null;
    }

    const parsed = Number(price);
    return Number.isFinite(parsed) ? parsed : null;
}

function formatAmount(value: number): string {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
        value,
    );
}

function starCount(listings: Listing[]): number | null {
    for (const listing of listings) {
        const raw = listing.metadata?.stars ?? listing.metadata?.star_rating;
        const value = typeof raw === "number" ? raw : Number(raw);

        if (Number.isInteger(value) && value >= 1 && value <= 5) {
            return value;
        }
    }

    return null;
}

function ratingWord(rating: number | null): string {
    if (rating === null) return "Not rated yet";
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4) return "Very good";
    if (rating >= 3) return "Average";
    return "Poor";
}

function formatMonthYear(value: string | null | undefined): string {
    if (!value) return EMPTY;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return EMPTY;

    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
    }).format(date);
}

function hasCoordinates(business: Business | null): boolean {
    return (
        business?.latitude !== null &&
        business?.latitude !== undefined &&
        business?.longitude !== null &&
        business?.longitude !== undefined
    );
}

export default function BusinessPage() {
    const { id } = useParams<{ id: string }>();
    const locale = useLocale();

    const [business, setBusiness] = useState<Business | null>(null);
    const [reviews, setReviews] = useState<BusinessReview[]>([]);
    const [reviewTotal, setReviewTotal] = useState(0);
    const [related, setRelated] = useState<Business[]>([]);

    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    const [activeImage, setActiveImage] = useState(0);
    const [showAllImages, setShowAllImages] = useState(false);
    const [expandedDescription, setExpandedDescription] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);

    const load = useCallback(async () => {
        try {
            const { data } = await axios.get<Business>(
                `/api/v1/businesses/${id}`,
            );

            setBusiness(data);
            setReviews([]);
            setReviewTotal(0);
            setRelated([]);
            setActiveImage(0);
            setExpandedDescription(false);
            setShowAllReviews(false);
            setLoading(false);

            const listings = data.listings ?? [];

            void (async () => {
                const settled = await Promise.allSettled(
                    listings.map((listing) =>
                        axios.get<{ data: BusinessReview[]; total: number }>(
                            "/api/v1/reviews",
                            { params: { listing_id: listing.id } },
                        ),
                    ),
                );

                const collected: BusinessReview[] = [];
                let total = 0;

                settled.forEach((result) => {
                    if (result.status !== "fulfilled") return;

                    collected.push(...(result.value.data.data ?? []));
                    total += result.value.data.total ?? 0;
                });

                collected.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

                setReviews(collected);
                setReviewTotal(total);
            })();

            axios
                .get<{ data?: Business[] }>("/api/v1/businesses", {
                    params: { wilaya: data.wilaya ?? undefined },
                })
                .then(({ data: page }) => {
                    const items = page?.data ?? [];

                    setRelated(
                        items
                            .filter((item) => item.id !== data.id)
                            .slice(0, 3),
                    );
                })
                .catch(() => setRelated([]));
        } catch (error) {
            const status = (error as { response?: { status?: number } })
                ?.response?.status;

            if (status === 404) {
                notFound();
            }

            setBusiness(null);
            setFailed(true);
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const fetchBusiness = async () => {
            await load();
        };

        void fetchBusiness();
    }, [load]);

    const view = useMemo(() => {
        const listings = business?.listings ?? [];

        const urls = galleryUrls(business?.media);
        const images = urls.length > 0 ? urls : [IMAGE_PLACEHOLDER];

        const prices = listings
            .map((listing) => numericPrice(listing.price))
            .filter((value): value is number => value !== null);

        const amenities = Array.from(
            new Set(
                listings
                    .flatMap((listing) => listing.amenities ?? [])
                    .filter((item): item is string => typeof item === "string"),
            ),
        );

        const ratings = reviews
            .map((review) => review.rating)
            .filter((value) => Number.isFinite(value));

        const rating = ratings.length
            ? Math.round(
                  (ratings.reduce((sum, value) => sum + value, 0) / ratings.length) *
                      10,
              ) / 10
            : null;

        const address = business?.address ?? null;
        const coords = hasCoordinates(business)
            ? `${business?.latitude}, ${business?.longitude}`
            : EMPTY;

        return {
            name: business?.name ?? "",
            category: TYPE_LABELS[business?.type ?? ""] ?? "Business",
            verified: Boolean(business?.is_verified),
            rating,
            ratingLabel: rating === null ? EMPTY : rating.toFixed(1),
            ratingWord: ratingWord(rating),
            reviewCount: reviewTotal,
            location:
                [business?.commune, business?.wilaya]
                    .filter(Boolean)
                    .join(", ") || EMPTY,
            address,
            coords,
            phone: business?.phone ?? null,
            email: business?.email ?? null,
            website: business?.website ?? null,
            description: business?.description ?? null,
            details: {
                rooms: listings.length,
                stars: starCount(listings),
                priceFrom: prices.length ? Math.min(...prices) : null,
            },
            currency: CURRENCY_LABELS[listings[0]?.currency ?? "DZD"] ?? "DA",
            amenities,
            images,
            rooms: listings.map((listing) => ({
                id: listing.id,
                name: listing.title,
                description: listing.description,
                price: numericPrice(listing.price),
                capacity: listing.capacity,
                image: pickCover(listing.media) ?? IMAGE_PLACEHOLDER,
                features: (listing.amenities ?? []).filter(
                    (item): item is string => typeof item === "string",
                ),
            })),
            reviews: reviews.map((review) => ({
                id: review.id,
                name: review.user?.name ?? "Guest",
                date: formatMonthYear(review.created_at),
                rating: Math.max(0, Math.min(5, review.rating ?? 0)),
                text: review.body,
            })),
            related,
        };
    }, [business, reviews, reviewTotal, related]);

    const activeIndex = Math.min(activeImage, view.images.length - 1);
    const thumbnailImages = view.images.slice(1, 5);
    const visibleReviews = showAllReviews ? view.reviews : view.reviews.slice(0, 5);
    const hasMoreReviews = view.reviews.length > 5;

    const directionsUrl =
        business && hasCoordinates(business)
            ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`
            : null;

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white text-slate-900">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-slate-200 border-t-emerald-600" />
                    <p className="mt-4 text-sm text-slate-500">
                        Loading business details…
                    </p>
                </div>
            </main>
        );
    }

    if (failed || !business) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white px-6 text-slate-900">
                <div className="max-w-md text-center">
                    <h1 className="text-2xl font-bold">
                        Business unavailable
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                        We could not load this business right now. It may have
                        been removed or the details are not published yet.
                    </p>

                    <div className="mt-6 flex justify-center gap-3">
                        <button
                            onClick={() => {
                                setFailed(false);
                                setLoading(true);
                                void load();
                            }}
                            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Try again
                        </button>

                        <Link
                            href={`/${locale}/explore`}
                            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Back to explore
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white text-slate-900">
            {/* Breadcrumb */}
            <div className="mx-auto max-w-7xl px-6 pt-6 lg:px-8">
                <nav className="flex items-center gap-2 text-sm text-slate-500">
                    <Link href={`/${locale}`} className="hover:text-slate-900">
                        Home
                    </Link>
                    <span>/</span>
                    <Link
                        href={`/${locale}/explore`}
                        className="hover:text-slate-900"
                    >
                        Businesses
                    </Link>
                    <span>/</span>
                    <span className="text-slate-900">{view.name}</span>
                </nav>
            </div>

            {/* Header */}
            <section className="mx-auto max-w-7xl px-6 pb-7 pt-7 lg:px-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                {view.category}
                            </span>

                            {view.verified && (
                                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    <svg
                                        className="h-3.5 w-3.5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2.999-3z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Verified
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            {view.name}
                        </h1>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                            <span className="flex items-center gap-1.5">
                                <span className="text-amber-500">★</span>
                                <strong className="text-slate-900">
                                    {view.ratingLabel}
                                </strong>
                                <span>
                                    ({view.reviewCount} reviews)
                                </span>
                            </span>

                            <span className="hidden text-slate-300 sm:block">
                                •
                            </span>

                            <span className="flex items-center gap-1.5">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.8}
                                        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.8}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                {view.location}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50">
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.8}
                                    d="M5 5a3 3 0 013-3h8a3 3 0 013 3v14l-7-3-7 3V5z"
                                />
                            </svg>
                            Save
                        </button>

                        <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50">
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.8}
                                    d="M8.684 13.342C8.886 12.938 9 12.484 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 11-5.368-2.684 3 3 0 015.368 2.684zm10 5.316a3 3 0 11-5.368-2.684 3 3 0 015.368 2.684zm0-10a3 3 0 11-5.368-2.684 3 3 0 015.368 2.684z"
                                />
                            </svg>
                            Share
                        </button>
                    </div>
                </div>
            </section>

            {/* Gallery */}
            <section className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid h-105 grid-cols-1 gap-2 overflow-hidden rounded-2xl md:grid-cols-2">
                    <div className="relative overflow-hidden bg-slate-100">
                        <Image
                            src={view.images[activeIndex]}
                            alt={view.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                        />
                    </div>

                    <div className="hidden grid-cols-2 gap-2 md:grid">
                        {thumbnailImages.map((image, index) => (
                            <button
                                key={image}
                                onClick={() => setActiveImage(index + 1)}
                                className="group relative overflow-hidden bg-slate-100"
                            >
                                <img
                                    src={image}
                                    alt=""
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />

                                {index === thumbnailImages.length - 1 &&
                                    view.images.length > 5 && (
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowAllImages(true);
                                            }}
                                            className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white"
                                        >
                                            View all photos
                                        </div>
                                    )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mobile thumbnails */}
                <div className="mt-2 flex gap-2 overflow-x-auto md:hidden">
                    {view.images.map((image, index) => (
                        <button
                            key={image}
                            onClick={() => setActiveImage(index)}
                            className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg ${
                                activeIndex === index
                                    ? "ring-2 ring-emerald-600"
                                    : ""
                            }`}
                        >
                            <img
                                src={image}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            </section>

            {/* Main content */}
            <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[1fr_350px]">
                    {/* Left */}
                    <div>
                        {/* Overview */}
                        <section>
                            <h2 className="text-2xl font-bold">
                                About {view.name}
                            </h2>

                            <p
                                className={`mt-4 max-w-3xl leading-7 text-slate-600 ${
                                    expandedDescription ? "" : "line-clamp-3"
                                }`}
                            >
                                {view.description ??
                                    "No description has been provided for this business yet."}
                            </p>

                            {view.description && (
                                <button
                                    onClick={() =>
                                        setExpandedDescription((prev) => !prev)
                                    }
                                    className="mt-3 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                                >
                                    {expandedDescription ? "Read less" : "Read more"}
                                </button>
                            )}
                        </section>

                        {/* Business stats */}
                        <section className="mt-10 border-y border-slate-200 py-7">
                            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                                <div>
                                    <p className="text-2xl font-bold">
                                        {view.details.rooms}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Rooms
                                    </p>
                                </div>

                                <div>
                                    <p className="text-2xl font-bold">
                                        {view.details.stars !== null
                                            ? "★".repeat(view.details.stars)
                                            : EMPTY}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Hotel rating
                                    </p>
                                </div>

                                <div>
                                    <p className="text-2xl font-bold">
                                        {view.details.priceFrom !== null
                                            ? formatAmount(view.details.priceFrom)
                                            : EMPTY}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {view.currency} / night from
                                    </p>
                                </div>

                                <div>
                                    <p className="text-2xl font-bold">
                                        {view.ratingLabel}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Guest rating
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Amenities */}
                        <section className="mt-10">
                            <h2 className="text-2xl font-bold">
                                Facilities & amenities
                            </h2>

                            {view.amenities.length > 0 ? (
                                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {view.amenities.map((amenity) => (
                                        <div
                                            key={amenity}
                                            className="flex items-center gap-3 text-sm text-slate-700"
                                        >
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                                                ✓
                                            </span>
                                            {amenity}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-6 text-sm text-slate-500">
                                    No amenities have been listed yet.
                                </p>
                            )}
                        </section>

                        {/* Type-specific section */}
                        <section className="mt-14">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
                                        Accommodation
                                    </p>

                                    <h2 className="mt-1 text-2xl font-bold">
                                        Rooms & suites
                                    </h2>
                                </div>
                            </div>

                            {view.rooms.length > 0 ? (
                                <div className="mt-6 grid gap-5 md:grid-cols-2">
                                    {view.rooms.map((room) => (
                                        <div
                                            key={room.id}
                                            className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-md"
                                        >
                                            <div className="relative aspect-video bg-slate-100">
                                                <img
                                                    src={room.image}
                                                    alt={room.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            <div className="p-5">
                                                <h3 className="font-bold">
                                                    {room.name}
                                                </h3>

                                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                                    {room.description ??
                                                        "No description for this room yet."}
                                                </p>

                                                {room.features.length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {room.features.map(
                                                            (feature) => (
                                                                <span
                                                                    key={feature}
                                                                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                                                                >
                                                                    {feature}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                )}

                                                <div className="mt-5 flex items-end justify-between">
                                                    <div>
                                                        <span className="text-lg font-bold">
                                                            {room.price !==
                                                            null
                                                                ? formatAmount(
                                                                      room.price,
                                                                  )
                                                                : EMPTY}
                                                        </span>
                                                        <span className="ml-1 text-xs text-slate-500">
                                                            / night
                                                        </span>
                                                    </div>

                                                    {room.capacity !== null && (
                                                        <span className="text-xs text-slate-500">
                                                            Up to{" "}
                                                            {room.capacity} guests
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-6 text-sm text-slate-500">
                                    No rooms have been published yet.
                                </p>
                            )}
                        </section>

                        {/* Reviews */}
                        <section className="mt-14 border-t border-slate-200 pt-12">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        Reviews
                                    </h2>

                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-xl font-bold">
                                            {view.ratingLabel}
                                        </span>
                                        <span className="text-amber-500">
                                            {view.rating !== null
                                                ? "★".repeat(
                                                      Math.round(view.rating),
                                                  )
                                                : EMPTY}
                                        </span>
                                        <span className="text-sm text-slate-500">
                                            {view.reviewCount} reviews
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {visibleReviews.length > 0 ? (
                                <div className="mt-8 divide-y divide-slate-200">
                                    {visibleReviews.map((review) => (
                                        <article
                                            key={review.id}
                                            className="py-6 first:pt-0"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold">
                                                        {review.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {review.date}
                                                    </p>
                                                </div>

                                                <span className="text-sm text-amber-500">
                                                    {"★".repeat(review.rating)}
                                                </span>
                                            </div>

                                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                                {review.text ??
                                                    "No comment was left with this rating."}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-8 text-sm text-slate-500">
                                    No reviews yet. Be the first to share your
                                    experience.
                                </p>
                            )}

                            {hasMoreReviews && (
                                <button
                                    onClick={() =>
                                        setShowAllReviews((prev) => !prev)
                                    }
                                    className="mt-4 w-full rounded-lg border border-slate-200 py-3 text-sm font-semibold hover:bg-slate-50"
                                >
                                    {showAllReviews
                                        ? "Show fewer reviews"
                                        : "Show all reviews"}
                                </button>
                            )}
                        </section>
                    </div>

                    {/* Right sidebar */}
                    <aside>
                        <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Starting from
                                    </p>
                                    <p className="mt-1 text-2xl font-bold">
                                        {view.details.priceFrom !== null
                                            ? formatAmount(
                                                  view.details.priceFrom,
                                              )
                                            : EMPTY}
                                        {view.details.priceFrom !== null && (
                                            <span className="text-sm font-medium text-slate-500">
                                                {" "}
                                                {view.currency}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center">
                                    <p className="text-sm font-bold text-emerald-700">
                                        {view.ratingLabel}
                                    </p>
                                    <p className="text-[10px] text-emerald-600">
                                        {view.ratingWord}
                                    </p>
                                </div>
                            </div>

                            <button className="mt-6 w-full rounded-lg bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                                Contact business
                            </button>

                            {directionsUrl ? (
                                <a
                                    href={directionsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 block w-full rounded-lg border border-slate-200 px-5 py-3.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Get directions
                                </a>
                            ) : (
                                <span className="mt-2 block w-full cursor-not-allowed rounded-lg border border-slate-200 px-5 py-3.5 text-center text-sm font-semibold text-slate-300">
                                    Get directions
                                </span>
                            )}

                            <div className="my-6 h-px bg-slate-200" />

                            <div className="space-y-4 text-sm">
                                <div className="flex gap-3">
                                    <span className="text-slate-400">📍</span>
                                    <span className="leading-5 text-slate-600">
                                        {view.address ?? EMPTY}
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <span className="text-slate-400">☎</span>
                                    {view.phone ? (
                                        <a
                                            href={`tel:${view.phone}`}
                                            className="text-slate-600 hover:text-emerald-700"
                                        >
                                            {view.phone}
                                        </a>
                                    ) : (
                                        <span className="text-slate-400">
                                            {EMPTY}
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <span className="text-slate-400">✉</span>
                                    {view.email ? (
                                        <a
                                            href={`mailto:${view.email}`}
                                            className="break-all text-slate-600 hover:text-emerald-700"
                                        >
                                            {view.email}
                                        </a>
                                    ) : (
                                        <span className="text-slate-400">
                                            {EMPTY}
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <span className="text-slate-400">↗</span>
                                    {view.website ? (
                                        <a
                                            href={
                                                view.website.startsWith("http")
                                                    ? view.website
                                                    : `https://${view.website}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="break-all text-slate-600 hover:text-emerald-700"
                                        >
                                            {view.website}
                                        </a>
                                    ) : (
                                        <span className="text-slate-400">
                                            {EMPTY}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            {/* Location */}
            <section className="border-t border-slate-200 bg-slate-50">
                <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
                    <h2 className="text-2xl font-bold">Location</h2>

                    <div className="mt-6 grid overflow-hidden rounded-2xl border border-slate-200 bg-white lg:grid-cols-[1fr_350px]">
                        {/* Map placeholder */}
                        <div className="relative min-h-87.5 bg-slate-200">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg">
                                        📍
                                    </div>

                                    <p className="mt-3 text-sm font-semibold text-slate-700">
                                        {view.name}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {view.coords}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-7">
                            <p className="text-sm font-semibold text-slate-500">
                                Address
                            </p>

                            <p className="mt-2 leading-6 text-slate-700">
                                {view.address ?? EMPTY}
                            </p>

                            {directionsUrl ? (
                                <a
                                    href={directionsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-5 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                                >
                                    Get directions →
                                </a>
                            ) : (
                                <span className="mt-5 inline-block cursor-not-allowed text-sm font-semibold text-slate-300">
                                    Get directions →
                                </span>
                            )}

                            <div className="my-7 h-px bg-slate-200" />

                            <p className="text-sm font-semibold text-slate-500">
                                Nearby
                            </p>

                            <div className="mt-4 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">
                                        City centre
                                    </span>
                                    <span className="font-medium">{EMPTY}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">
                                        Beach
                                    </span>
                                    <span className="font-medium">{EMPTY}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">
                                        Restaurants
                                    </span>
                                    <span className="font-medium">{EMPTY}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related businesses */}
            <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
                            You may also like
                        </p>

                        <h2 className="mt-1 text-2xl font-bold">
                            Nearby businesses
                        </h2>
                    </div>

                    <Link
                        href={`/${locale}/explore`}
                        className="text-sm font-semibold text-emerald-700"
                    >
                        View all →
                    </Link>
                </div>

                {view.related.length > 0 ? (
                    <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {view.related.map((item) => (
                            <Link
                                key={item.id}
                                href={`/${locale}/businesses/${item.id}`}
                                className="rounded-xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                        {TYPE_LABELS[item.type] ?? "Business"}
                                    </span>

                                    {item.is_verified && (
                                        <span className="text-xs font-medium text-blue-600">
                                            Verified
                                        </span>
                                    )}
                                </div>

                                <h3 className="mt-4 font-bold">{item.name}</h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    {[item.commune, item.wilaya]
                                        .filter(Boolean)
                                        .join(", ") || EMPTY}
                                </p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="mt-7 text-sm text-slate-500">
                        No other businesses to show here yet.
                    </p>
                )}
            </section>

            {/* Image modal */}
            {showAllImages && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
                    <button
                        onClick={() => setShowAllImages(false)}
                        className="absolute right-6 top-6 text-2xl text-white"
                    >
                        ×
                    </button>

                    <div className="grid max-h-[90vh] max-w-5xl grid-cols-2 gap-3 overflow-auto">
                        {view.images.map((image) => (
                            <img
                                key={image}
                                src={image}
                                alt=""
                                className="w-full rounded-lg object-cover"
                            />
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}