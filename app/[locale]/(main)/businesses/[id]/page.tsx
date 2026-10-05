"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const business = {
    name: "Hotel de la Côte",
    type: "hotel",
    category: "Hotel",
    rating: 4.6,
    reviewCount: 128,
    verified: true,
    location: "Jijel, Algeria",
    address: "12 Boulevard Emir Abdelkader, Jijel",
    phone: "+213 34 47 12 34",
    email: "contact@hoteldecote.dz",
    website: "www.hoteldecote.dz",
    description:
        "A comfortable seaside hotel in Jijel offering modern rooms, convenient facilities and easy access to the city's main attractions and beaches.",
    details: {
        rooms: 42,
        stars: 3,
        priceFrom: 8500,
        priceUnit: "DA / night",
    },
    amenities: [
        "Free Wi-Fi",
        "Parking",
        "Air conditioning",
        "Restaurant",
        "24/7 reception",
        "Sea view",
    ],
    images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=85",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=85",
        "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1000&q=85",
    ],
};

const rooms = [
    {
        name: "Standard Double Room",
        description: "Comfortable room for two guests with a double bed.",
        price: "8,500 DA",
        unit: "/ night",
        capacity: 2,
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
        features: ["Double bed", "Private bathroom", "Air conditioning"],
    },
    {
        name: "Family Room",
        description: "Spacious room suitable for families or small groups.",
        price: "12,000 DA",
        unit: "/ night",
        capacity: 4,
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
        features: ["2 beds", "Private bathroom", "Sea view"],
    },
    {
        name: "Executive Suite",
        description: "A larger suite with a separate living area and sea view.",
        price: "16,500 DA",
        unit: "/ night",
        capacity: 3,
        image: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=800&q=80",
        features: ["King bed", "Living room", "Sea view"],
    },
];

const reviews = [
    {
        name: "Yacine B.",
        date: "September 2026",
        rating: 5,
        text: "Very clean hotel and excellent location. The staff were friendly and helpful.",
    },
    {
        name: "Sarah K.",
        date: "August 2026",
        rating: 4,
        text: "The room was comfortable and the view was beautiful. Good value for the price.",
    },
    {
        name: "Amine M.",
        date: "August 2026",
        rating: 5,
        text: "Great place to stay when visiting Jijel. Everything was convenient.",
    },
];

export default function BusinessPage() {
    const [activeImage, setActiveImage] = useState(0);
    const [showAllImages, setShowAllImages] = useState(false);

    return (
        <main className="min-h-screen bg-white text-slate-900">
            {/* Breadcrumb */}
            <div className="mx-auto max-w-7xl px-6 pt-6 lg:px-8">
                <nav className="flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/" className="hover:text-slate-900">
                        Home
                    </Link>
                    <span>/</span>
                    <Link href="/businesses" className="hover:text-slate-900">
                        Businesses
                    </Link>
                    <span>/</span>
                    <span className="text-slate-900">{business.name}</span>
                </nav>
            </div>

            {/* Header */}
            <section className="mx-auto max-w-7xl px-6 pb-7 pt-7 lg:px-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                {business.category}
                            </span>

                            {business.verified && (
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
                            {business.name}
                        </h1>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                            <span className="flex items-center gap-1.5">
                                <span className="text-amber-500">★</span>
                                <strong className="text-slate-900">
                                    {business.rating}
                                </strong>
                                <span>({business.reviewCount} reviews)</span>
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
                                {business.location}
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
                    <div className="relative overflow-hidden">
                        <Image
                            src={business.images[activeImage]}
                            alt={business.name}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="hidden grid-cols-2 gap-2 md:grid">
                        {business.images.slice(1, 5).map((image, index) => (
                            <button
                                key={image}
                                onClick={() => setActiveImage(index + 1)}
                                className="group relative overflow-hidden"
                            >
                                <img
                                    src={image}
                                    alt=""
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />

                                {index === 3 && (
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
                    {business.images.map((image, index) => (
                        <button
                            key={image}
                            onClick={() => setActiveImage(index)}
                            className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg ${
                                activeImage === index
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
                                About {business.name}
                            </h2>

                            <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                                {business.description}
                            </p>

                            <button className="mt-3 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                                Read more
                            </button>
                        </section>

                        {/* Business stats */}
                        <section className="mt-10 border-y border-slate-200 py-7">
                            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                                <div>
                                    <p className="text-2xl font-bold">
                                        {business.details.rooms}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Rooms
                                    </p>
                                </div>

                                <div>
                                    <p className="text-2xl font-bold">
                                        {"★".repeat(business.details.stars)}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Hotel rating
                                    </p>
                                </div>

                                <div>
                                    <p className="text-2xl font-bold">
                                        {business.details.priceFrom.toLocaleString()}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        DA / night from
                                    </p>
                                </div>

                                <div>
                                    <p className="text-2xl font-bold">
                                        {business.rating}
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

                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {business.amenities.map((amenity) => (
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

                                <button className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                                    View all
                                </button>
                            </div>

                            <div className="mt-6 grid gap-5 md:grid-cols-2">
                                {rooms.map((room) => (
                                    <div
                                        key={room.name}
                                        className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-md"
                                    >
                                        <div className="relative aspect-video">
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
                                                {room.description}
                                            </p>

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

                                            <div className="mt-5 flex items-end justify-between">
                                                <div>
                                                    <span className="text-lg font-bold">
                                                        {room.price}
                                                    </span>
                                                    <span className="ml-1 text-xs text-slate-500">
                                                        {room.unit}
                                                    </span>
                                                </div>

                                                <span className="text-xs text-slate-500">
                                                    Up to {room.capacity} guests
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                                            {business.rating}
                                        </span>
                                        <span className="text-amber-500">
                                            ★★★★★
                                        </span>
                                        <span className="text-sm text-slate-500">
                                            {business.reviewCount} reviews
                                        </span>
                                    </div>
                                </div>

                                <button className="hidden rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 sm:block">
                                    Write a review
                                </button>
                            </div>

                            <div className="mt-8 divide-y divide-slate-200">
                                {reviews.map((review) => (
                                    <article
                                        key={review.name}
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
                                            {review.text}
                                        </p>
                                    </article>
                                ))}
                            </div>

                            <button className="mt-4 w-full rounded-lg border border-slate-200 py-3 text-sm font-semibold hover:bg-slate-50">
                                Show all reviews
                            </button>
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
                                        {business.details.priceFrom.toLocaleString()}{" "}
                                        <span className="text-sm font-medium text-slate-500">
                                            DA
                                        </span>
                                    </p>
                                </div>

                                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center">
                                    <p className="text-sm font-bold text-emerald-700">
                                        {business.rating}
                                    </p>
                                    <p className="text-[10px] text-emerald-600">
                                        Excellent
                                    </p>
                                </div>
                            </div>

                            <button className="mt-6 w-full rounded-lg bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                                Contact business
                            </button>

                            <button className="mt-2 w-full rounded-lg border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                Get directions
                            </button>

                            <div className="my-6 h-px bg-slate-200" />

                            <div className="space-y-4 text-sm">
                                <div className="flex gap-3">
                                    <span className="text-slate-400">📍</span>
                                    <span className="leading-5 text-slate-600">
                                        {business.address}
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <span className="text-slate-400">☎</span>
                                    <a
                                        href={`tel:${business.phone}`}
                                        className="text-slate-600 hover:text-emerald-700"
                                    >
                                        {business.phone}
                                    </a>
                                </div>

                                <div className="flex gap-3">
                                    <span className="text-slate-400">✉</span>
                                    <a
                                        href={`mailto:${business.email}`}
                                        className="break-all text-slate-600 hover:text-emerald-700"
                                    >
                                        {business.email}
                                    </a>
                                </div>

                                <div className="flex gap-3">
                                    <span className="text-slate-400">↗</span>
                                    <a
                                        href="#"
                                        className="text-slate-600 hover:text-emerald-700"
                                    >
                                        {business.website}
                                    </a>
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
                                        {business.name}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Interactive map
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-7">
                            <p className="text-sm font-semibold text-slate-500">
                                Address
                            </p>

                            <p className="mt-2 leading-6 text-slate-700">
                                {business.address}
                            </p>

                            <button className="mt-5 text-sm font-semibold text-emerald-700">
                                Get directions →
                            </button>

                            <div className="my-7 h-px bg-slate-200" />

                            <p className="text-sm font-semibold text-slate-500">
                                Nearby
                            </p>

                            <div className="mt-4 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">
                                        Jijel city centre
                                    </span>
                                    <span className="font-medium">1.2 km</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">
                                        Beach
                                    </span>
                                    <span className="font-medium">800 m</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">
                                        Restaurants
                                    </span>
                                    <span className="font-medium">500 m</span>
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
                        href="/businesses"
                        className="text-sm font-semibold text-emerald-700"
                    >
                        View all →
                    </Link>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            name: "Restaurant Le Port",
                            type: "Restaurant",
                            rating: 4.5,
                        },
                        {
                            name: "Hotel El Bahdja",
                            type: "Hotel",
                            rating: 4.3,
                        },
                        {
                            name: "Jijel Travel",
                            type: "Touristic Agency",
                            rating: 4.7,
                        },
                    ].map((item) => (
                        <Link
                            key={item.name}
                            href="#"
                            className="rounded-xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                    {item.type}
                                </span>

                                <span className="text-sm">
                                    <span className="text-amber-500">★</span>{" "}
                                    {item.rating}
                                </span>
                            </div>

                            <h3 className="mt-4 font-bold">{item.name}</h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Jijel, Algeria
                            </p>
                        </Link>
                    ))}
                </div>
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
                        {business.images.map((image) => (
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
