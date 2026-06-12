"use client";

import { useState } from "react";
import { Chevron, DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useTranslations } from "next-intl";

interface FilterSidebarProps {
    onApplyFilters: (filters: any) => void;
}

export default function FilterSidebar({ onApplyFilters }: FilterSidebarProps) {
    const t = useTranslations("filter");
    const [filters, setFilters] = useState({
        types: {
            destinations: true,
            businesses: true,
            events: true,
        },
        rating: [] as number[],
        location: "",
        dateRange: {
            from: undefined as Date | undefined,
            to: undefined as Date | undefined,
        },
    });

    const handleTypeChange = (type: keyof typeof filters.types) => {
        setFilters({
            ...filters,
            types: {
                ...filters.types,
                [type]: !filters.types[type],
            },
        });
    };

    const handleRatingChange = (rating: number) => {
        setFilters({
            ...filters,
            rating: filters.rating.includes(rating)
                ? filters.rating.filter((r) => r !== rating)
                : [...filters.rating, rating],
        });
    };

    const handleApply = () => {
        onApplyFilters(filters);
    };

    return (
        <aside className="w-95 bg-white border-r border-gray-200 p-6 sticky top-0 h-screen overflow-y-auto">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("title")}
                </h2>

                {/* Type Filter */}
                <div className="mb-6">
                    <h3 className="font-medium text-gray-700 mb-2">{t("type")}</h3>
                    <div className="space-y-2">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.types.destinations}
                                onChange={() =>
                                    handleTypeChange("destinations")
                                }
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 accent-orange-600"
                            />
                            <span className="ml-2 text-gray-600">
                                {t("destination")}
                            </span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.types.businesses}
                                onChange={() => handleTypeChange("businesses")}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 accent-orange-600"
                            />
                            <span className="ml-2 text-gray-600">
                                {t("business")}
                            </span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.types.events}
                                onChange={() => handleTypeChange("events")}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 accent-orange-600"
                            />
                            <span className="ml-2 text-gray-600">{t("event")}</span>
                        </label>
                    </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                    <h3 className="font-medium text-gray-700 mb-2">{t("rating")}</h3>
                    <div className="space-y-2">
                        {[4, 3, 2, 1].map((rating) => (
                            <label
                                key={rating}
                                className="flex items-center cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={filters.rating.includes(rating)}
                                    onChange={() => handleRatingChange(rating)}
                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 accent-orange-600"
                                />
                                <span className="ml-2 text-gray-600">
                                    {t("stars", { rating })}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Location Filter */}
                <div className="mb-6">
                    <h3 className="font-medium text-gray-700 mb-2">{t("location")}</h3>
                    <input
                        type="text"
                        placeholder={t("location_placeholder")}
                        value={filters.location}
                        onChange={(e) =>
                            setFilters({ ...filters, location: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ri accent-orange-600ng-orange-500 accent-orange-600"
                    />
                </div>

                {/* Date Range Picker */}
                <div className="mb-6">
                    <h3 className="font-medium text-gray-700 mb-2">
                        {t("date_range")}
                    </h3>
                    <div className="border border-gray-300 rounded-md p-2">
                        <DayPicker
                            mode="range"
                            modifiersClassNames={{
                                today: "text-[#eb662b]",
                                table: "border-separate border-spacing-y-1",
                                selected: `border-none `,
                                range_start:
                                    "bg-[#eb662b] text-white border-none rounded-s-lg",
                                range_end:
                                    "bg-[#eb662b] text-white border-none rounded-e-lg",
                                range_middle:
                                    "bg-[#eb652baf] text-white font-semibold",
                                disabled: "text-gray-400",
                            }}
                            styles={{
                                day: {
                                    width: "32px",
                                    height: "32px",
                                    fontSize: "12px",
                                },
                            }}
                            components={{
                                Chevron: (props) => (
                                    <Chevron
                                        {...props}
                                        className="fill-[#eb662b]"
                                    />
                                ),
                            }}
                            selected={filters.dateRange}
                            onSelect={(range) =>
                                setFilters({
                                    ...filters,
                                    dateRange: {
                                        from: range?.from,
                                        to: range?.to,
                                    },
                                })
                            }
                            numberOfMonths={1}
                            className="text-sm"
                        />
                    </div>
                </div>

                {/* Apply Filters Button */}
                <button
                    onClick={handleApply}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                >
                    {t("apply")}
                </button>
            </div>
        </aside>
    );
}
