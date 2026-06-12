"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface SearchCardProps {
    id: number | string;
    name: string;
    description?: string;
    image?: string;
    badge?: string;
    type: "destination" | "business" | "event";
    onButtonClick?: (id: string | number) => void;
}

export default function SearchCard({
    id,
    name,
    description,
    image,
    badge,
    type,
    onButtonClick,
}: SearchCardProps) {
    const searchT = useTranslations("search");
    const [isFavourite, setIsFavourite] = useState(false);

    const getBadgeColor = () => {
        switch (type) {
            case "destination":
                return "bg-[var(--lighter-primary)] text-orange-800";
            case "business":
                return "bg-green-100 text-green-800";
            case "event":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getButtonText = () => {
        switch (type) {
            case "destination":
                return searchT("explore_destination");
            case "business":
                return searchT("view_business");
            case "event":
                return searchT("learn_more");
            default:
                return searchT("view_details");
        }
    };

    return (
        <div className="bg-[var(--background)] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
            {/* Image Section */}
            <div className="relative h-48 w-full">
                <Image
                    src={image || "/p4.jpg"}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            {/* Details Section */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Badge and Favourite Button */}
                <div className="flex justify-between items-start mb-2">
                    {badge ? (
                        <span
                            className={`text-xs font-medium px-2 py-1 rounded ${getBadgeColor()}`}
                        >
                            {badge}
                        </span>
                    ) : (
                        <div className="h-6" /> // Spacer to maintain layout
                    )}
                    <button
                        onClick={() => setIsFavourite(!isFavourite)}
                        className="text-[var(--light-fg)] hover:text-red-500 transition-colors"
                        aria-label={searchT("add_to_favourites")}
                    >
                        {isFavourite ? (
                            <svg
                                className="w-5 h-5 fill-red-500 text-red-500"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5 fill-none stroke-current"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg text-[var(--foreground)] mb-2 line-clamp-1">
                    {name}
                </h3>

                {/* Description */}
                {description && (
                    <p className="text-[var(--light-fg)] text-sm mb-4 line-clamp-2 flex-grow">
                        {description}
                    </p>
                )}

                {/* Full Width Button */}
                <button
                    onClick={() => onButtonClick?.(id)}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors mt-2"
                >
                    {getButtonText()}
                </button>
            </div>
        </div>
    );
}
