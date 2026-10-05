"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import {
    ArrowRight,
    BadgeCheck,
    Bookmark,
    Check,
    ExternalLink,
    Mail,
    MapPin,
    Phone,
    Share2,
    Sparkles,
    Star,
    X,
} from "lucide-react";
import axios from "@/lib/axios";
import type {
    Business,
    BusinessMedia,
    BusinessReview,
    Listing,
    PriceUnit,
} from "@/types/business";

const IMAGE_PLACEHOLDER = "https://placehold.net/1200x800.png";
const EMPTY = "\u2014";

const TYPE_LABELS: Record<string, string> = {
    hotel: "Hotel",
    restaurant: "Restaurant",
    touristic_agency: "Touristic Agency",
    real_estate_agency: "Real Estate Agency",
};

const CURRENCY_LABELS: Record<string, string> = {
    DZD: "DA",
    EUR: "\u20ac",
    USD: "$",
    GBP: "\u00a3",
};

const PRICE_UNIT_LABELS: Record<PriceUnit, string> = {
    night: "/ night",
    person: "/ person",
    item: "/ item",
    stay: "/ stay",
    day: "/ day",
    m2: "/ m\u00b2",
    total: "",
};

type TypeContent = {
    listingsStat: string;
    listingsEyebrow: string;
    listingsTitle: string;
    listingsEmpty: string;
    amenitiesTitle: string;
    amenitiesEmpty: string;
    priceUnit: string;
    capacityNoun: string | null;
};

const TYPE_CONTENT: Record<string, TypeContent> = {
    hotel: {
        listingsStat: "Rooms",
        listingsEyebrow: "Accommodation",
        listingsTitle: "Rooms & suites",
        listingsEmpty: "No rooms have been published yet.",
        amenitiesTitle: "Facilities & amenities",
        amenitiesEmpty: "No facilities have been listed yet.",
        priceUnit: "/ night",
        capacityNoun: "guests",
    },
    restaurant: {
        listingsStat: "Menu items",
        listingsEyebrow: "Menu",
        listingsTitle: "Menu & specialties",
        listingsEmpty: "No menu items have been published yet.",
        amenitiesTitle: "Features & services",
        amenitiesEmpty: "No features have been listed yet.",
        priceUnit: "/ item",
        capacityNoun: "guests",
    },
    touristic_agency: {
        listingsStat: "Tours",
        listingsEyebrow: "Services",
        listingsTitle: "Tours & trips",
        listingsEmpty: "No tours have been published yet.",
        amenitiesTitle: "What's included",
        amenitiesEmpty: "No services have been listed yet.",
        priceUnit: "/ person",
        capacityNoun: "travellers",
    },
    real_estate_agency: {
        listingsStat: "Properties",
        listingsEyebrow: "Portfolio",
        listingsTitle: "Properties for sale & rent",
        listingsEmpty: "No properties have been published yet.",
        amenitiesTitle: "Property features",
        amenitiesEmpty: "No property features have been listed yet.",
        priceUnit: "",
        capacityNoun: null,
    },
};

const DEFAULT_CONTENT: TypeContent = {
    listingsStat: "Listings",
    listingsEyebrow: "Offerings",
    listingsTitle: "Listings",
    listingsEmpty: "No listings have been published yet.",
    amenitiesTitle: "Features & amenities",
amenitiesEmpty: "No features have been listed yet.",
    priceUnit: "",
    capacityNoun: null,
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

function Stars({
    value,
    className = "h-4 w-4",
}: {
    value: number;
    className?: string;
}) {
    return (
        <span className="inline-flex items-center gap-0.5 text-amber-500">
            {Array.from({ length: value }, (_, index) => (
                <Star
                    key={index}
                    className={`${className} fill-current`}
                    aria-hidden="true"
                />
            ))}
        </span>
    );
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

        const detailPrice = numericPrice(business?.detail?.average_price);
        const priceFrom = prices.length
            ? Math.min(...prices)
            : detailPrice;

const amenities = Array.from(
            new Set(
                [
                    ...(business?.detail?.amenities ?? []),
                    ...listings.flatMap((listing) => listing.amenities ?? []),
                ].filter((item): item is string => typeof item === "string"),
            ),
        );

        const services = (
            business?.detail?.services ?? []
        ).filter((item): item is string => typeof item === "string");

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

        const content =
            TYPE_CONTENT[business?.type ?? ""] ?? DEFAULT_CONTENT;

const detail = business?.detail ?? null;

const facts = [
                detail?.number_of_rooms !== null &&
                detail?.number_of_rooms !== undefined
                    ? {
                          label: "Rooms",
                          value: String(detail.number_of_rooms),
                      }
                    : null,
                detail?.cuisine_type
                    ? { label: "Cuisine", value: detail.cuisine_type }
                    : null,
                detail?.seating_capacity !== null &&
                detail?.seating_capacity !== undefined
                    ? {
                          label: "Seats",
                          value: String(detail.seating_capacity),
                      }
                    : null,
            ].filter((fact): fact is { label: string; value: string } =>
                Boolean(fact),
            );

            return {
                name: business?.name ?? "",
                category: TYPE_LABELS[business?.type ?? ""] ?? "Business",
                content,
                facts,
            isHotel: business?.type === "hotel",
            isRestaurant: business?.type === "restaurant",
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
                listings: listings.length,
                stars:
                    business?.type === "hotel"
                        ? (detail?.star_rating ?? starCount(listings))
                        : null,
                priceFrom,
            },
            currency: CURRENCY_LABELS[listings[0]?.currency ?? "DZD"] ?? "DA",
            priceUnit: detail?.price_unit
                ? PRICE_UNIT_LABELS[detail.price_unit]
                : content.priceUnit,
            amenities,
            services,
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
            <main className="flex min-h-screen items-center justify-center bg-(--background) text-(--foreground)">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-(--border) border-t-(--primary-clr)" />
                    <p className="mt-4 text-sm text-(--light-fg)">
                        Loading business details{"\u2026"}
                    </p>
                </div>
            </main>
        );
    }

    if (failed || !business) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-(--background) px-6 text-(--foreground)">
                <div className="max-w-md text-center">
                    <h1 className="text-2xl font-bold">
                        Business unavailable
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-(--light-fg)">
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
                            className="rounded-lg bg-(--primary-clr) px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-(--primary-clr)"
                        >
                            Try again
                        </button>

                        <Link
                            href={`/${locale}/explore`}
                            className="rounded-lg border border-(--border) px-5 py-2.5 text-sm font-semibold text-(--foreground) transition hover:bg-(--dim-bg)"
                        >
                            Back to explore
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
<main
            className="min-h-screen bg-(--background) text-(--foreground)"
            style={{ paddingTop: "clamp(56px, 6vh, 72px)" }}
        >
            {/* Breadcrumb */}
            <div className="mx-auto max-w-7xl px-6 pt-6 lg:px-8">
                <nav className="flex items-center gap-2 text-sm text-(--light-fg)">
                    <Link href={`/${locale}`} className="hover:text-(--foreground)">
                        Home
                    </Link>
                    <span>/</span>
                    <Link
                        href={`/${locale}/explore`}
                        className="hover:text-(--foreground)"
                    >
                        Businesses
                    </Link>
                    <span>/</span>
                    <span className="text-(--foreground)">{view.name}</span>
                </nav>
            </div>

            {/* Header */}
            <section className="mx-auto max-w-7xl px-6 pb-7 pt-7 lg:px-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="rounded-full bg-(--dim-bg) px-3 py-1 text-xs font-semibold text-(--light-fg)">
                                {view.category}
                            </span>

                            {view.verified && (
<span className="flex items-center gap-1 rounded-full bg-(--primary-clr)/10 px-3 py-1 text-xs font-semibold text-(--primary-clr)">
                                    <BadgeCheck className="h-3.5 w-3.5" />
                                    Verified
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            {view.name}
                        </h1>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-(--light-fg)">
<span className="flex items-center gap-1.5">
                                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                <strong className="text-(--foreground)">
                                    {view.ratingLabel}
                                </strong>
                                <span>
                                    ({view.reviewCount} reviews)
                                </span>
                            </span>

<span
                                aria-hidden="true"
                                className="hidden h-1 w-1 rounded-full bg-(--border) sm:block"
                            />

<span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                {view.location}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
<button className="flex items-center gap-2 rounded-lg border border-(--border) px-4 py-2.5 text-sm font-medium transition hover:bg-(--dim-bg)">
                            <Bookmark className="h-4 w-4" />
                            Save
                        </button>

                        <button className="flex items-center gap-2 rounded-lg border border-(--border) px-4 py-2.5 text-sm font-medium transition hover:bg-(--dim-bg)">
                            <Share2 className="h-4 w-4" />
                            Share
                        </button>
                    </div>
                </div>
            </section>

            {/* Gallery */}
            <section className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid h-105 grid-cols-1 gap-2 overflow-hidden rounded-2xl md:grid-cols-2">
                    <div className="relative overflow-hidden bg-(--dim-bg)">
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
                                className="group relative overflow-hidden bg-(--dim-bg)"
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
                                    ? "ring-2 ring-(--primary-clr)"
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
                                className={`mt-4 max-w-3xl leading-7 text-(--light-fg) ${
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
                                    className="mt-3 text-sm font-semibold text-(--primary-clr) hover:text-(--primary-clr)"
                                >
                                    {expandedDescription ? "Read less" : "Read more"}
                                </button>
                            )}

                            {view.facts.length > 0 && (
                                <div className="mt-6 flex flex-wrap gap-3">
                                    {view.facts.map((fact) => (
                                        <span
                                            key={fact.label}
                                            className="rounded-lg bg-(--dim-bg) px-3.5 py-2 text-sm text-(--light-fg)"
                                        >
                                            <span className="text-(--light-fg)">
                                                {fact.label}:{" "}
                                            </span>
                                            <span className="font-medium text-(--foreground)">
                                                {fact.value}
                                            </span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Business stats */}
                        <section className="mt-10 border-y border-(--border) py-7">
                            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                                <div>
                                    <p className="text-2xl font-bold">
                                        {view.details.listings}
                                    </p>
                                    <p className="mt-1 text-sm text-(--light-fg)">
                                        {view.content.listingsStat}
                                    </p>
                                </div>

                                {view.isHotel && (
                                    <div>
<p className="text-2xl font-bold">
                                            {view.details.stars !== null ? (
                                                <Stars
                                                    value={view.details.stars}
                                                    className="h-6 w-6"
                                                />
                                            ) : (
                                                EMPTY
                                            )}
                                        </p>
                                        <p className="mt-1 text-sm text-(--light-fg)">
                                            Hotel rating
                                        </p>
                                    </div>
                                )}

<div>
                                    <p className="text-2xl font-bold">
                                        {view.details.priceFrom !== null
                                            ? formatAmount(view.details.priceFrom)
                                            : EMPTY}
                                    </p>
                                    <p className="mt-1 text-sm text-(--light-fg)">
                                        {view.currency}
                                        {view.priceUnit
                                            ? ` ${view.priceUnit} from`
                                            : " from"}
                                    </p>
                                </div>

<div>
                                    <p className="text-2xl font-bold">
                                        {view.ratingLabel}
                                    </p>
                                    <p className="mt-1 text-sm text-(--light-fg)">
                                        Guest rating
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Amenities */}
                        <section className="mt-10">
                            <h2 className="text-2xl font-bold">
                                {view.content.amenitiesTitle}
                            </h2>

                            {view.amenities.length > 0 ? (
                                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {view.amenities.map((amenity) => (
                                        <div
                                            key={amenity}
                                            className="flex items-center gap-3 text-sm text-(--foreground)"
                                        >
<span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--primary-clr)/10 text-(--primary-clr)">
                                                <Check className="h-4 w-4" />
                                            </span>
                                            {amenity}
                                        </div>
                                    ))}
                                </div>
                            ) : (
<p className="mt-6 text-sm text-(--light-fg)">
                                    {view.content.amenitiesEmpty}
                                </p>
                            )}
                        </section>

                        {/* Services */}
                        {view.services.length > 0 && (
                            <section className="mt-10">
                                <h2 className="text-2xl font-bold">Services</h2>

                                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {view.services.map((service) => (
                                        <div
                                            key={service}
                                            className="flex items-center gap-3 text-sm text-(--foreground)"
                                        >
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--dim-bg) text-(--light-fg)">
                                                <Sparkles className="h-4 w-4" />
                                            </span>
                                            {service}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Type-specific section */}
                        <section className="mt-14">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wider text-(--primary-clr)">
                                        {view.content.listingsEyebrow}
                                    </p>

                                    <h2 className="mt-1 text-2xl font-bold">
                                        {view.content.listingsTitle}
                                    </h2>
                                </div>
                            </div>

                            {view.rooms.length > 0 ? (
                                <div className="mt-6 grid gap-5 md:grid-cols-2">
                                    {view.rooms.map((room) => (
                                        <div
                                            key={room.id}
                                            className="overflow-hidden rounded-xl border border-(--border) bg-(--background) transition hover:shadow-md"
                                        >
                                            <div className="relative aspect-video bg-(--dim-bg)">
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

                                                <p className="mt-2 text-sm leading-6 text-(--light-fg)">
                                                    {room.description ??
                                                        "No description for this room yet."}
                                                </p>

                                                {room.features.length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {room.features.map(
                                                            (feature) => (
                                                                <span
                                                                    key={feature}
                                                                    className="rounded-md bg-(--dim-bg) px-2.5 py-1 text-xs text-(--light-fg)"
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
                                                        <span className="ml-1 text-xs text-(--light-fg)">
                                                            {view.content.priceUnit}
                                                        </span>
                                                    </div>

                                                    {room.capacity !== null &&
                                                        view.content
                                                            .capacityNoun && (
                                                            <span className="text-xs text-(--light-fg)">
                                                                Up to{" "}
                                                                {room.capacity}{" "}
                                                                {
                                                                    view.content
                                                                        .capacityNoun
                                                                }
                                                            </span>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-6 text-sm text-(--light-fg)">
                                    {view.content.listingsEmpty}
                                </p>
                            )}
                        </section>

                        {/* Reviews */}
                        <section className="mt-14 border-t border-(--border) pt-12">
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
                                            {view.rating !== null ? (
                                                <Stars
                                                    value={Math.round(
                                                        view.rating,
                                                    )}
                                                />
                                            ) : (
                                                EMPTY
                                            )}
                                        </span>
                                        <span className="text-sm text-(--light-fg)">
                                            {view.reviewCount} reviews
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {visibleReviews.length > 0 ? (
                                <div className="mt-8 divide-y divide-(--border)">
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
                                                    <p className="mt-1 text-xs text-(--light-fg)">
                                                        {review.date}
                                                    </p>
                                                </div>

<Stars value={review.rating} className="h-3.5 w-3.5" />
                                            </div>

                                            <p className="mt-3 text-sm leading-6 text-(--light-fg)">
                                                {review.text ??
                                                    "No comment was left with this rating."}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-8 text-sm text-(--light-fg)">
                                    No reviews yet. Be the first to share your
                                    experience.
                                </p>
                            )}

                            {hasMoreReviews && (
                                <button
                                    onClick={() =>
                                        setShowAllReviews((prev) => !prev)
                                    }
                                    className="mt-4 w-full rounded-lg border border-(--border) py-3 text-sm font-semibold hover:bg-(--dim-bg)"
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
                        <div
                            style={{
                                top: "calc(clamp(56px, 6vh, 72px) + 1.5rem)",
                            }}
                            className="sticky rounded-2xl border border-(--border) bg-(--background) p-6 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-(--light-fg)">
                                        Starting from
                                    </p>
                                    <p className="mt-1 text-2xl font-bold">
                                        {view.details.priceFrom !== null
                                            ? formatAmount(
                                                  view.details.priceFrom,
                                              )
                                            : EMPTY}
                                        {view.details.priceFrom !== null && (
                                            <span className="text-sm font-medium text-(--light-fg)">
                                                {" "}
                                                {view.currency}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-(--primary-clr)/10 px-3 py-2 text-center">
                                    <p className="text-sm font-bold text-(--primary-clr)">
                                        {view.ratingLabel}
                                    </p>
                                    <p className="text-[10px] text-(--primary-clr)">
                                        {view.ratingWord}
                                    </p>
                                </div>
                            </div>

                            <button className="mt-6 w-full rounded-lg bg-(--primary-clr) px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-(--primary-clr)">
                                Contact business
                            </button>

                            {directionsUrl ? (
                                <a
                                    href={directionsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 block w-full rounded-lg border border-(--border) px-5 py-3.5 text-center text-sm font-semibold text-(--foreground) transition hover:bg-(--dim-bg)"
                                >
                                    Get directions
                                </a>
                            ) : (
                                <span className="mt-2 block w-full cursor-not-allowed rounded-lg border border-(--border) px-5 py-3.5 text-center text-sm font-semibold text-(--light-fg)">
                                    Get directions
                                </span>
                            )}

                            <div className="my-6 h-px bg-(--border)" />

                            <div className="space-y-4 text-sm">
<div className="flex gap-3">
                                    <MapPin className="h-5 w-5 shrink-0 text-(--light-fg)" />
                                    <span className="leading-5 text-(--light-fg)">
                                        {view.address ?? EMPTY}
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <Phone className="h-5 w-5 shrink-0 text-(--light-fg)" />
                                    {view.phone ? (
                                        <a
                                            href={`tel:${view.phone}`}
                                            className="text-(--light-fg) hover:text-(--primary-clr)"
                                        >
                                            {view.phone}
                                        </a>
                                    ) : (
                                        <span className="text-(--light-fg)">
                                            {EMPTY}
                                        </span>
                                    )}
                                </div>

<div className="flex gap-3">
                                    <Mail className="h-5 w-5 shrink-0 text-(--light-fg)" />
                                    {view.email ? (
                                        <a
                                            href={`mailto:${view.email}`}
                                            className="break-all text-(--light-fg) hover:text-(--primary-clr)"
                                        >
                                            {view.email}
                                        </a>
                                    ) : (
                                        <span className="text-(--light-fg)">
                                            {EMPTY}
                                        </span>
                                    )}
                                </div>

<div className="flex gap-3">
                                    <ExternalLink className="h-5 w-5 shrink-0 text-(--light-fg)" />
                                    {view.website ? (
                                        <a
                                            href={
                                                view.website.startsWith("http")
                                                    ? view.website
                                                    : `https://${view.website}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="break-all text-(--light-fg) hover:text-(--primary-clr)"
                                        >
                                            {view.website}
                                        </a>
                                    ) : (
                                        <span className="text-(--light-fg)">
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
            <section className="border-t border-(--border) bg-(--dim-bg)">
                <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
                    <h2 className="text-2xl font-bold">Location</h2>

                    <div className="mt-6 grid overflow-hidden rounded-2xl border border-(--border) bg-(--background) lg:grid-cols-[1fr_350px]">
                        {/* Map placeholder */}
                        <div className="relative min-h-87.5 bg-(--border)">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--primary-clr) text-white shadow-lg">
                                        <MapPin className="h-6 w-6" />
                                    </div>

                                    <p className="mt-3 text-sm font-semibold text-(--foreground)">
                                        {view.name}
                                    </p>

                                    <p className="mt-1 text-xs text-(--light-fg)">
                                        {view.coords}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-7">
                            <p className="text-sm font-semibold text-(--light-fg)">
                                Address
                            </p>

                            <p className="mt-2 leading-6 text-(--foreground)">
                                {view.address ?? EMPTY}
                            </p>

                            {directionsUrl ? (
                                <a
                                    href={directionsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-(--primary-clr) hover:text-(--primary-clr)"
                                >
                                    Get directions
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                            ) : (
                                <span className="mt-5 inline-flex cursor-not-allowed items-center gap-1.5 text-sm font-semibold text-(--light-fg)">
                                    Get directions
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            )}

                            <div className="my-7 h-px bg-(--border)" />

                            <p className="text-sm font-semibold text-(--light-fg)">
                                Nearby
                            </p>

                            <div className="mt-4 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-(--light-fg)">
                                        City centre
                                    </span>
                                    <span className="font-medium">{EMPTY}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-(--light-fg)">
                                        Beach
                                    </span>
                                    <span className="font-medium">{EMPTY}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-(--light-fg)">
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
                        <p className="text-sm font-semibold uppercase tracking-wider text-(--primary-clr)">
                            You may also like
                        </p>

                        <h2 className="mt-1 text-2xl font-bold">
                            Nearby businesses
                        </h2>
                    </div>

<Link
                        href={`/${locale}/explore`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--primary-clr)"
                    >
                        View all
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {view.related.length > 0 ? (
                    <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {view.related.map((item) => (
                            <Link
                                key={item.id}
                                href={`/${locale}/businesses/${item.id}`}
                                className="rounded-xl border border-(--border) p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="rounded-md bg-(--dim-bg) px-2.5 py-1 text-xs font-medium text-(--light-fg)">
                                        {TYPE_LABELS[item.type] ?? "Business"}
                                    </span>

                                    {item.is_verified && (
                                        <span className="text-xs font-medium text-blue-600">
                                            Verified
                                        </span>
                                    )}
                                </div>

                                <h3 className="mt-4 font-bold">{item.name}</h3>

                                <p className="mt-1 text-sm text-(--light-fg)">
                                    {[item.commune, item.wilaya]
                                        .filter(Boolean)
                                        .join(", ") || EMPTY}
                                </p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="mt-7 text-sm text-(--light-fg)">
                        No other businesses to show here yet.
                    </p>
                )}
            </section>

            {/* Image modal */}
            {showAllImages && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
<button
                        onClick={() => setShowAllImages(false)}
                        aria-label="Close gallery"
                        className="absolute right-6 top-6 rounded-full p-2 text-white transition hover:bg-white/10"
                    >
                        <X className="h-6 w-6" />
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