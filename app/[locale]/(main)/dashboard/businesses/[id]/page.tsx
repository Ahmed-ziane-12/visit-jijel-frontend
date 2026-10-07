"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import axios from "@/lib/axios";
import { uploadToCloudinary } from "@/lib/upload";
import { useAuth } from "@/context/AuthContext";
import Breadcrumbs from "@/app/[locale]/components/Breadcrumbs/Breadcrumbs";
import ChipInput from "@/app/[locale]/components/ChipInput/ChipInput";
import ConfirmDialog from "@/app/[locale]/components/ConfirmDialog/ConfirmDialog";
import LocationMapPicker from "@/app/[locale]/components/LocationMapPicker/LocationMapPicker";
import MediaManager from "@/app/[locale]/components/MediaManager/MediaManager";
import type {
    Business,
    BusinessType,
    Listing,
    PriceUnit,
} from "@/types/business";
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    FileText,
    Image as ImageIcon,
    LayoutList,
    Loader2,
    Plus,
    Save,
} from "lucide-react";

const TABS = ["details", "photos", "listings"] as const;
type Tab = (typeof TABS)[number];

const TAB_ICONS: Record<Tab, React.ElementType> = {
    details: FileText,
    photos: ImageIcon,
    listings: LayoutList,
};

const TAB_PANEL = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.22, ease: "easeOut" as const },
};

const COLLAPSE_PANEL = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.25, ease: "easeInOut" as const },
};

const TYPE_OPTIONS: BusinessType[] = [
    "restaurant",
    "hotel",
    "touristic_agency",
    "real_estate_agency",
];

const PRICE_UNITS: PriceUnit[] = [
    "night",
    "person",
    "item",
    "stay",
    "day",
    "m2",
    "total",
];

const STATUSES: Listing["status"][] = ["draft", "published", "archived"];

const AMENITY_SUGGESTIONS = [
    "Free Wi-Fi",
    "Parking",
    "Air conditioning",
    "Restaurant",
    "24/7 reception",
    "Pool",
    "Gym",
    "Sea view",
];

const SERVICE_SUGGESTIONS = [
    "Room service",
    "Airport transfer",
    "Guided tours",
    "Breakfast",
    "Laundry",
];

interface FormState {
    type: BusinessType | "";
    name: string;
    description: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    wilaya: string;
    commune: string;
    latitude: string;
    longitude: string;
    average_price: string;
    price_unit: PriceUnit | "";
    number_of_rooms: string;
    star_rating: string;
    cuisine_type: string;
    seating_capacity: string;
    amenities: string[];
    services: string[];
}

interface ListingFormState {
    title: string;
    description: string;
    price: string;
    currency: string;
    capacity: string;
    amenities: string[];
    status: Listing["status"];
}

const EMPTY_FORM: FormState = {
    type: "",
    name: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    wilaya: "",
    commune: "",
    latitude: "",
    longitude: "",
    average_price: "",
    price_unit: "",
    number_of_rooms: "",
    star_rating: "",
    cuisine_type: "",
    seating_capacity: "",
    amenities: [],
    services: [],
};

const EMPTY_LISTING_FORM: ListingFormState = {
    title: "",
    description: "",
    price: "",
    currency: "DZD",
    capacity: "",
    amenities: [],
    status: "published",
};

const firstString = (value: string | null | undefined) => value ?? "";

const numberString = (value: number | string | null | undefined) =>
    value === null || value === undefined ? "" : String(value);

function formFromBusiness(business: Business): FormState {
    const detail = business.detail;

    return {
        type: business.type,
        name: firstString(business.name),
        description: firstString(business.description),
        phone: firstString(business.phone),
        email: firstString(business.email),
        website: firstString(business.website),
        address: firstString(business.address),
        wilaya: firstString(business.wilaya),
        commune: firstString(business.commune),
        latitude: numberString(business.latitude),
        longitude: numberString(business.longitude),
        average_price: detail ? numberString(detail.average_price) : "",
        price_unit: detail?.price_unit ?? "",
        number_of_rooms: detail ? numberString(detail.number_of_rooms) : "",
        star_rating: detail ? numberString(detail.star_rating) : "",
        cuisine_type: firstString(detail?.cuisine_type),
        seating_capacity: detail
            ? numberString(detail.seating_capacity)
            : "",
        amenities: detail?.amenities ?? [],
        services: detail?.services ?? [],
    };
}

const isValidNumber = (value: string, min: number, max: number) => {
    if (!value.trim()) return true;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= min && parsed <= max;
};

export default function BusinessManagementPage() {
    const t = useTranslations("dashboard");
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const locale = params?.locale as string;
    const id = Number(params?.id);

    const [business, setBusiness] = useState<Business | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    const [tab, setTab] = useState<Tab>("details");
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [confirmTypeChange, setConfirmTypeChange] = useState(false);

    const [showListingForm, setShowListingForm] = useState(false);
    const [listingForm, setListingForm] =
        useState<ListingFormState>(EMPTY_LISTING_FORM);
    const [listingFiles, setListingFiles] = useState<File[]>([]);
    const [listingPreviews, setListingPreviews] = useState<string[]>([]);
    const [creatingListing, setCreatingListing] = useState(false);

    const listingFileRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError(false);

        try {
            const { data } = await axios.get<Business>(
                `/api/v1/my-businesses/${id}`,
            );
            setBusiness(data);
            setForm(formFromBusiness(data));
        } catch {
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const loadListings = useCallback(async () => {
        try {
            const { data } = await axios.get<Listing[]>(
                `/api/v1/my-businesses/${id}/listings`,
            );
            setListings(data);
        } catch {
            setListings([]);
        }
    }, [id]);

    useEffect(() => {
        if (!authLoading && user?.profile?.role !== "business_owner") {
            router.replace(`/${locale}/dashboard`);
        }
    }, [authLoading, user, locale, router]);

    useEffect(() => {
        if (!id || authLoading || user?.profile?.role !== "business_owner") {
            return;
        }
        void load();
    }, [id, authLoading, user, load]);

    useEffect(() => {
        const hash = window.location.hash.replace("#", "");
        if ((TABS as readonly string[]).includes(hash)) {
            setTab(hash as Tab);
        }
    }, []);

    useEffect(() => {
        if (tab === "listings" && business) void loadListings();
    }, [tab, business, loadListings]);

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setError(null);
        setSaved(false);
    };

    const flashSaved = () => {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 3000);
    };

    const buildPayload = () => {
        const detail: Record<string, unknown> = {
            average_price: form.average_price
                ? parseFloat(form.average_price)
                : null,
            price_unit: form.price_unit || null,
            number_of_rooms:
                form.type === "hotel" && form.number_of_rooms
                    ? parseInt(form.number_of_rooms, 10)
                    : null,
            star_rating:
                form.type === "hotel" && form.star_rating
                    ? parseInt(form.star_rating, 10)
                    : null,
            cuisine_type:
                form.type === "restaurant" && form.cuisine_type.trim()
                    ? form.cuisine_type.trim()
                    : null,
            seating_capacity:
                form.type === "restaurant" && form.seating_capacity
                    ? parseInt(form.seating_capacity, 10)
                    : null,
            amenities: form.amenities.length ? form.amenities : [],
            services: form.services.length ? form.services : [],
        };

        const sanitizeUrl = (url: string) => {
            const trimmed = url.trim();
            if (!trimmed) return null;
            return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
        };

        return {
            type: form.type,
            name: form.name.trim(),
            description: form.description || null,
            phone: form.phone || null,
            email: form.email || null,
            website: sanitizeUrl(form.website),
            address: form.address || null,
            wilaya: form.wilaya || null,
            commune: form.commune || null,
            latitude: form.latitude ? parseFloat(form.latitude) : null,
            longitude: form.longitude ? parseFloat(form.longitude) : null,
            detail,
        };
    };

    const submit = async () => {
        setSaving(true);
        setError(null);

        try {
            const { data } = await axios.put<Business>(
                `/api/v1/businesses/${id}`,
                buildPayload(),
            );
            setBusiness(data);
            setForm(formFromBusiness(data));
            flashSaved();
        } catch (err) {
            const response = err as {
                response?: { data?: { errors?: Record<string, string[]>; message?: string } };
            };
            const errors = response.response?.data?.errors;
            setError(
                errors
                    ? Object.values(errors).flat().join("\n")
                    : (response.response?.data?.message ?? t("save_failed")),
            );
        } finally {
            setSaving(false);
            setConfirmTypeChange(false);
        }
    };

    const handleSave = () => {
        if (!form.type || !form.name.trim()) {
            setError(t("name_required"));
            return;
        }

        if (
            !isValidNumber(form.average_price, 0, 99999999.99) ||
            !isValidNumber(form.number_of_rooms, 0, 100000) ||
            !isValidNumber(form.seating_capacity, 0, 100000) ||
            !isValidNumber(form.star_rating, 1, 5)
        ) {
            setError(t("invalid_number"));
            return;
        }

        if (business && form.type !== business.type) {
            setConfirmTypeChange(true);
            return;
        }

        void submit();
    };

    const switchTab = (next: Tab) => {
        setTab(next);
        setError(null);
        setSaved(false);
        window.history.replaceState(null, "", `#${next}`);
    };

    const addListingFiles = (files: FileList | File[]) => {
        const valid = Array.from(files)
            .filter((file) => file.type.startsWith("image/"))
            .filter((file) => file.size <= 10 * 1024 * 1024)
            .slice(0, 5 - listingFiles.length);

        if (valid.length === 0) return;

        setListingFiles((prev) => [...prev, ...valid]);
        setListingPreviews((prev) => [
            ...prev,
            ...valid.map((file) => URL.createObjectURL(file)),
        ]);
    };

    const removeListingFile = (index: number) => {
        URL.revokeObjectURL(listingPreviews[index]);
        setListingFiles((prev) => prev.filter((_, i) => i !== index));
        setListingPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const closeListingForm = () => {
        listingPreviews.forEach((preview) => URL.revokeObjectURL(preview));
        setShowListingForm(false);
        setListingForm(EMPTY_LISTING_FORM);
        setListingFiles([]);
        setListingPreviews([]);
        setError(null);
    };

    const createListing = async () => {
        if (!listingForm.title.trim()) {
            setError(t("listing_title_required"));
            return;
        }

        setCreatingListing(true);
        setError(null);

        try {
            const payload: Record<string, unknown> = {
                title: listingForm.title.trim(),
                description: listingForm.description || null,
                price: listingForm.price ? parseFloat(listingForm.price) : null,
                currency: listingForm.currency,
                capacity: listingForm.capacity
                    ? parseInt(listingForm.capacity, 10)
                    : null,
                amenities: listingForm.amenities.length
                    ? listingForm.amenities
                    : [],
                status: listingForm.status,
            };

            const { data: listing } = await axios.post<Listing>(
                `/api/v1/businesses/${id}/listings`,
                payload,
            );

            for (let i = 0; i < listingFiles.length; i++) {
                await uploadToCloudinary({
                    file: listingFiles[i],
                    modelType: "listing",
                    modelId: listing.id,
                    collection: i === 0 ? "cover" : "gallery",
                    isCover: i === 0,
                });
            }

            closeListingForm();
            setListings((prev) => [{ ...listing, media: [] }, ...prev]);
            flashSaved();
        } catch (err) {
            const response = err as {
                response?: { data?: { errors?: Record<string, string[]>; message?: string } };
            };
            const errors = response.response?.data?.errors;
            setError(
                errors
                    ? Object.values(errors).flat().join("\n")
                    : (response.response?.data?.message ?? t("save_failed")),
            );
        } finally {
            setCreatingListing(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 size={32} className="animate-spin text-(--light-fg)" />
            </div>
        );
    }

    if (user.profile?.role !== "business_owner") {
        return null;
    }

    return (
        <div
            style={{ padding: "clamp(56px, 6vh, 72px) 2rem 2rem 2rem" }}
            className="flex w-full flex-col gap-6"
        >
            <Breadcrumbs />

            {loading ? (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <Loader2
                        size={28}
                        className="animate-spin text-(--light-fg)"
                    />
                </div>
            ) : loadError || !business ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20">
                    <AlertCircle size={48} className="text-(--light-fg)" />
                    <p className="text-lg text-(--light-fg)">
                        {t("not_found")}
                    </p>
                    <button
                        onClick={() => router.push(`/${locale}/dashboard`)}
                        className="inline-flex items-center gap-2 rounded-lg bg-(--primary-clr) px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
                    >
                        <ArrowLeft size={16} />
                        {t("back_to_dashboard")}
                    </button>
                </div>
            ) : (
                <>
                    <header className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <button
                                onClick={() =>
                                    router.push(`/${locale}/dashboard`)
                                }
                                className="mb-2 inline-flex items-center gap-1.5 text-sm text-(--light-fg) transition hover:text-(--primary-clr)"
                            >
                                <ArrowLeft size={15} />
                                {t("back_to_dashboard")}
                            </button>

                            <h1 className="text-[1.8rem] font-bold">
                                {business.name}
                            </h1>

                            <p className="mt-1 text-sm capitalize text-(--light-fg)">
                                {t(`type_${business.type}`)}
                                {business.is_verified && (
                                    <span className="ms-2 inline-flex items-center gap-1 rounded-full bg-(--primary-clr)/10 px-2 py-0.5 text-xs font-semibold text-(--primary-clr)">
                                        <CheckCircle2 size={12} />
                                        {t("verified")}
                                    </span>
                                )}
                            </p>
                        </div>

                        {saved && (
                            <p className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
                                <CheckCircle2 size={16} />
                                {t("saved")}
                            </p>
                        )}
                    </header>

                    <nav className="flex gap-1 overflow-x-auto border-b border-(--border)">
                        {TABS.map((key) => {
                            const Icon = TAB_ICONS[key];

                            return (
                                <button
                                    key={key}
                                    onClick={() => switchTab(key)}
                                    className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                                        tab === key
                                            ? "border-(--primary-clr) text-(--primary-clr)"
                                            : "border-transparent text-(--light-fg) hover:text-(--foreground)"
                                    }`}
                                >
                                    <Icon size={15} />
                                    {t(`tab_${key}`)}
                                </button>
                            );
                        })}
                    </nav>

                    {error && (
                        <p className="whitespace-pre-line rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <AnimatePresence mode="wait" initial={false}>
                        {tab === "details" && (
                            <motion.section
                                key="details"
                                className="space-y-6"
                                initial={TAB_PANEL.initial}
                                animate={TAB_PANEL.animate}
                                exit={TAB_PANEL.exit}
                                transition={TAB_PANEL.transition}
                            >
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="type"
                                            className="mb-1.5 block text-sm font-medium"
                                        >
                                            {t("form_type")}
                                        </label>
                                        <select
                                            id="type"
                                            value={form.type}
                                            onChange={(event) =>
                                                updateField(
                                                    "type",
                                                    event.target.value as BusinessType,
                                                )
                                            }
                                            className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                        >
                                            <option value="">
                                                {t("form_type_placeholder")}
                                            </option>
                                            {TYPE_OPTIONS.map((value) => (
                                                <option key={value} value={value}>
                                                    {t(`type_${value}`)}
                                                </option>
                                            ))}
                                        </select>

                                        {form.type &&
                                            business.type !== form.type && (
                                                <p className="mt-1.5 text-xs text-amber-600">
                                                    {t("type_pending_change")}
                                                </p>
                                            )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="mb-1.5 block text-sm font-medium"
                                        >
                                            {t("form_name")}
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            maxLength={150}
                                            value={form.name}
                                            onChange={(event) =>
                                                updateField(
                                                    "name",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={t("form_name_placeholder")}
                                            className="w-full rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="description"
                                        className="mb-1.5 block text-sm font-medium"
                                    >
                                        {t("form_description")}
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={4}
                                        value={form.description}
                                        onChange={(event) =>
                                            updateField(
                                                "description",
                                                event.target.value,
                                            )
                                        }
                                        placeholder={t(
                                            "form_description_placeholder",
                                        )}
                                        className="w-full resize-y rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <label
                                            htmlFor="phone"
                                            className="mb-1.5 block text-sm font-medium"
                                        >
                                            {t("form_phone")}
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            maxLength={20}
                                            value={form.phone}
                                            onChange={(event) =>
                                                updateField(
                                                    "phone",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="+213 5X XX XX XX"
                                            className="w-full rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-1.5 block text-sm font-medium"
                                        >
                                            {t("form_contact_email")}
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            maxLength={150}
                                            value={form.email}
                                            onChange={(event) =>
                                                updateField(
                                                    "email",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="contact@example.com"
                                            className="w-full rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="website"
                                            className="mb-1.5 block text-sm font-medium"
                                        >
                                            {t("form_website")}
                                        </label>
                                        <input
                                            id="website"
                                            type="text"
                                            maxLength={255}
                                            value={form.website}
                                            onChange={(event) =>
                                                updateField(
                                                    "website",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="https://example.com"
                                            className="w-full rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-(--border) pt-6">
                                    <h2 className="text-lg font-semibold">
                                        {t("location")}
                                    </h2>

                                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label
                                                htmlFor="address"
                                                className="mb-1.5 block text-sm font-medium"
                                            >
                                                {t("form_address")}
                                            </label>
                                            <input
                                                id="address"
                                                type="text"
                                                value={form.address}
                                                onChange={(event) =>
                                                    updateField(
                                                        "address",
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    "form_address_placeholder",
                                                )}
                                                className="w-full rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="wilaya"
                                                className="mb-1.5 block text-sm font-medium"
                                            >
                                                {t("form_wilaya")}
                                            </label>
                                            <input
                                                id="wilaya"
                                                type="text"
                                                maxLength={100}
                                                value={form.wilaya}
                                                onChange={(event) =>
                                                    updateField(
                                                        "wilaya",
                                                        event.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="commune"
                                                className="mb-1.5 block text-sm font-medium"
                                            >
                                                {t("form_commune")}
                                            </label>
                                            <input
                                                id="commune"
                                                type="text"
                                                maxLength={100}
                                                value={form.commune}
                                                onChange={(event) =>
                                                    updateField(
                                                        "commune",
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    "form_commune_placeholder",
                                                )}
                                                className="w-full rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="latitude"
                                                className="mb-1.5 block text-sm font-medium"
                                            >
                                                {t("form_latitude")}
                                            </label>
                                            <input
                                                id="latitude"
                                                type="text"
                                                inputMode="decimal"
                                                value={form.latitude}
                                                onChange={(event) =>
                                                    updateField(
                                                        "latitude",
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="36.820"
                                                className="w-full rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="longitude"
                                                className="mb-1.5 block text-sm font-medium"
                                            >
                                                {t("form_longitude")}
                                            </label>
                                            <input
                                                id="longitude"
                                                type="text"
                                                inputMode="decimal"
                                                value={form.longitude}
                                                onChange={(event) =>
                                                    updateField(
                                                        "longitude",
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="5.766"
                                                className="w-full rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <LocationMapPicker
                                            latitude={form.latitude}
                                            longitude={form.longitude}
                                            hint={t("location_map_hint")}
                                            onSelect={(lat, lng) => {
                                                updateField("latitude", String(lat));
                                                updateField(
                                                    "longitude",
                                                    String(lng),
                                                );
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-(--border) pt-6">
                                    <h2 className="text-lg font-semibold">
                                        {t("details")}
                                    </h2>

                                    <p className="mt-1 text-sm text-(--light-fg)">
                                        {t("form_details_hint")}
                                    </p>

                                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="average_price"
                                                className="mb-1.5 block text-sm font-medium"
                                            >
                                                {t("form_average_price")}
                                            </label>
                                            <input
                                                id="average_price"
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                inputMode="decimal"
                                                value={form.average_price}
                                                onChange={(event) =>
                                                    updateField(
                                                        "average_price",
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    "form_average_price_placeholder",
                                                )}
                                                className="w-full rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="price_unit"
                                                className="mb-1.5 block text-sm font-medium"
                                            >
                                                {t("form_price_unit")}
                                            </label>
                                            <select
                                                id="price_unit"
                                                value={form.price_unit}
                                                onChange={(event) =>
                                                    updateField(
                                                        "price_unit",
                                                        event.target
                                                            .value as PriceUnit,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                            >
                                                <option value="">
                                                    {t("form_price_unit_none")}
                                                </option>
                                                {PRICE_UNITS.map((unit) => (
                                                    <option
                                                        key={unit}
                                                        value={unit}
                                                    >
                                                        {t(`price_unit_${unit}`)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {form.type === "hotel" && (
                                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label
                                                    htmlFor="number_of_rooms"
                                                    className="mb-1.5 block text-sm font-medium"
                                                >
                                                    {t("form_number_of_rooms")}
                                                </label>
                                                <input
                                                    id="number_of_rooms"
                                                    type="number"
                                                    min={0}
                                                    step="1"
                                                    inputMode="numeric"
                                                    value={form.number_of_rooms}
                                                    onChange={(event) =>
                                                        updateField(
                                                            "number_of_rooms",
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="42"
                                                    className="w-full rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="star_rating"
                                                    className="mb-1.5 block text-sm font-medium"
                                                >
                                                    {t("form_star_rating")}
                                                </label>
                                                <select
                                                    id="star_rating"
                                                    value={form.star_rating}
                                                    onChange={(event) =>
                                                        updateField(
                                                            "star_rating",
                                                            event.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                                >
                                                    <option value="">
                                                        {t(
                                                            "form_star_rating_none",
                                                        )}
                                                    </option>
                                                    {[1, 2, 3, 4, 5].map(
                                                        (stars) => (
                                                            <option
                                                                key={stars}
                                                                value={stars}
                                                            >
                                                                {"★".repeat(stars)}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {form.type === "restaurant" && (
                                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label
                                                    htmlFor="cuisine_type"
                                                    className="mb-1.5 block text-sm font-medium"
                                                >
                                                    {t("form_cuisine_type")}
                                                </label>
                                                <input
                                                    id="cuisine_type"
                                                    type="text"
                                                    maxLength={100}
                                                    value={form.cuisine_type}
                                                    onChange={(event) =>
                                                        updateField(
                                                            "cuisine_type",
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder={t(
                                                        "form_cuisine_type_placeholder",
                                                    )}
                                                    className="w-full rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="seating_capacity"
                                                    className="mb-1.5 block text-sm font-medium"
                                                >
                                                    {t("form_seating_capacity")}
                                                </label>
                                                <input
                                                    id="seating_capacity"
                                                    type="number"
                                                    min={0}
                                                    step="1"
                                                    inputMode="numeric"
                                                    value={form.seating_capacity}
                                                    onChange={(event) =>
                                                        updateField(
                                                            "seating_capacity",
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="80"
                                                    className="w-full rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <label
                                            htmlFor="amenities"
                                            className="mb-1.5 block text-sm font-medium"
                                        >
                                            {t("form_amenities")}
                                        </label>
                                        <ChipInput
                                            id="amenities"
                                            value={form.amenities}
                                            onChange={(value) =>
                                                updateField("amenities", value)
                                            }
                                            placeholder={t(
                                                "form_amenities_placeholder",
                                            )}
                                            suggestions={AMENITY_SUGGESTIONS}
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <label
                                            htmlFor="services"
                                            className="mb-1.5 block text-sm font-medium"
                                        >
                                            {t("form_services")}
                                        </label>
                                        <ChipInput
                                            id="services"
                                            value={form.services}
                                            onChange={(value) =>
                                                updateField("services", value)
                                            }
                                            placeholder={t(
                                                "form_services_placeholder",
                                            )}
                                            suggestions={SERVICE_SUGGESTIONS}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end border-t border-(--border) pt-6">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 rounded-lg bg-(--primary-clr) px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving ? (
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Save size={16} />
                                        )}
                                        {saving ? t("saving") : t("save_changes")}
                                    </button>
                                </div>
                            </motion.section>
                        )}

                        {tab === "photos" && (
                            <motion.section
                                key="photos"
                                initial={TAB_PANEL.initial}
                                animate={TAB_PANEL.animate}
                                exit={TAB_PANEL.exit}
                                transition={TAB_PANEL.transition}
                            >
                                <h2 className="mb-4 text-lg font-semibold">
                                    {t("tab_photos")}
                                </h2>

                                <MediaManager
                                    modelType="business"
                                    modelId={business.id}
                                    media={business.media ?? []}
                                    maxImages={5}
                                    onChange={(media) =>
                                        setBusiness((prev) =>
                                            prev ? { ...prev, media } : prev,
                                        )
                                    }
                                />
                            </motion.section>
                        )}

                        {tab === "listings" && (
                            <motion.section
                                key="listings"
                                initial={TAB_PANEL.initial}
                                animate={TAB_PANEL.animate}
                                exit={TAB_PANEL.exit}
                                transition={TAB_PANEL.transition}
                            >
                                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            {t("tab_listings")}
                                        </h2>
                                        <p className="mt-1 text-sm text-(--light-fg)">
                                            {t("listings_hint")}
                                        </p>
                                    </div>

                                    <motion.button
                                        onClick={() => setShowListingForm(true)}
                                        whileTap={{ scale: 0.96 }}
                                        className="inline-flex items-center gap-2 rounded-lg bg-(--primary-clr) px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
                                    >
                                        <Plus size={16} />
                                        {t("listing_new")}
                                    </motion.button>
                                </div>

                                <AnimatePresence initial={false}>
                                    {showListingForm && (
                                        <motion.div
                                            key="listing-form"
                                            className="mb-6 overflow-hidden"
                                            initial={COLLAPSE_PANEL.initial}
                                            animate={COLLAPSE_PANEL.animate}
                                            exit={COLLAPSE_PANEL.exit}
                                            transition={COLLAPSE_PANEL.transition}
                                        >
                                            <div className="rounded-xl border border-(--border) bg-(--background) p-5 shadow-sm">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <h3 className="font-semibold">
                                                        {t("listing_new")}
                                                    </h3>
                                                    <button
                                                        onClick={closeListingForm}
                                                        aria-label={t("close")}
                                                        className="text-(--light-fg) transition hover:text-(--foreground)"
                                                    >
                                                        ×
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    <div className="sm:col-span-2">
                                                        <label
                                                            htmlFor="listing_title"
                                                            className="mb-1.5 block text-sm font-medium"
                                                        >
                                                            {t("listing_title")}
                                                        </label>
                                                        <input
                                                            id="listing_title"
                                                            type="text"
                                                            maxLength={200}
                                                            value={listingForm.title}
                                                            onChange={(event) => {
                                                                setListingForm(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        title: event.target
                                                                            .value,
                                                                    }),
                                                                );
                                                                setError(null);
                                                            }}
                                                            className="w-full rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                                        />
                                                    </div>

                                                    <div className="sm:col-span-2">
                                                        <label
                                                            htmlFor="listing_description"
                                                            className="mb-1.5 block text-sm font-medium"
                                                        >
                                                            {t("listing_description")}
                                                        </label>
                                                        <textarea
                                                            id="listing_description"
                                                            rows={3}
                                                            value={listingForm.description}
                                                            onChange={(event) =>
                                                                setListingForm((prev) => ({
                                                                    ...prev,
                                                                    description:
                                                                        event.target.value,
                                                                }))
                                                            }
                                                            className="w-full resize-y rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label
                                                            htmlFor="listing_price"
                                                            className="mb-1.5 block text-sm font-medium"
                                                        >
                                                            {t("listing_price")}
                                                        </label>
                                                        <input
                                                            id="listing_price"
                                                            type="number"
                                                            min={0}
                                                            step="0.01"
                                                            inputMode="decimal"
                                                            value={listingForm.price}
                                                            onChange={(event) =>
                                                                setListingForm((prev) => ({
                                                                    ...prev,
                                                                    price: event.target
                                                                        .value,
                                                                }))
                                                            }
                                                            className="w-full rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label
                                                            htmlFor="listing_currency"
                                                            className="mb-1.5 block text-sm font-medium"
                                                        >
                                                            {t("listing_currency")}
                                                        </label>
                                                        <select
                                                            id="listing_currency"
                                                            value={listingForm.currency}
                                                            onChange={(event) =>
                                                                setListingForm((prev) => ({
                                                                    ...prev,
                                                                    currency:
                                                                        event.target.value,
                                                                }))
                                                            }
                                                            className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                                        >
                                                            {["DZD", "EUR", "USD", "GBP"].map(
                                                                (code) => (
                                                                    <option
                                                                        key={code}
                                                                        value={code}
                                                                    >
                                                                        {code}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label
                                                            htmlFor="listing_capacity"
                                                            className="mb-1.5 block text-sm font-medium"
                                                        >
                                                            {t("listing_capacity")}
                                                        </label>
                                                        <input
                                                            id="listing_capacity"
                                                            type="number"
                                                            min={1}
                                                            step="1"
                                                            inputMode="numeric"
                                                            value={listingForm.capacity}
                                                            onChange={(event) =>
                                                                setListingForm((prev) => ({
                                                                    ...prev,
                                                                    capacity:
                                                                        event.target.value,
                                                                }))
                                                            }
                                                            className="w-full rounded-xl border border-(--border) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label
                                                            htmlFor="listing_status"
                                                            className="mb-1.5 block text-sm font-medium"
                                                        >
                                                            {t("listing_status")}
                                                        </label>
                                                        <select
                                                            id="listing_status"
                                                            value={listingForm.status}
                                                            onChange={(event) =>
                                                                setListingForm((prev) => ({
                                                                    ...prev,
                                                                    status: event.target
                                                                        .value as Listing[
                                                                        "status"
                                                                    ],
                                                                }))
                                                            }
                                                            className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20"
                                                        >
                                                            {STATUSES.map((status) => (
                                                                <option
                                                                    key={status}
                                                                    value={status}
                                                                >
                                                                    {t(
                                                                        `listing_status_${status}`,
                                                                    )}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="sm:col-span-2">
                                                        <label
                                                            htmlFor="listing_amenities"
                                                            className="mb-1.5 block text-sm font-medium"
                                                        >
                                                            {t("form_amenities")}
                                                        </label>
                                                        <ChipInput
                                                            id="listing_amenities"
                                                            value={listingForm.amenities}
                                                            onChange={(value) =>
                                                                setListingForm((prev) => ({
                                                                    ...prev,
                                                                    amenities: value,
                                                                }))
                                                            }
                                                            placeholder={t(
                                                                "form_amenities_placeholder",
                                                            )}
                                                            suggestions={
                                                                AMENITY_SUGGESTIONS
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <p className="mb-2 text-sm font-medium">
                                                        {t("photos_add")}
                                                    </p>

                                                    <div className="flex flex-wrap gap-3">
                                                        {listingPreviews.map(
                                                            (preview, index) => (
                                                                <div
                                                                    key={preview}
                                                                    className="relative h-24 w-32 overflow-hidden rounded-lg border border-(--border)"
                                                                >
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src={preview}
                                                                        alt=""
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                    <button
                                                                        onClick={() =>
                                                                            removeListingFile(
                                                                                index,
                                                                            )
                                                                        }
                                                                        aria-label={t(
                                                                            "photos_remove",
                                                                        )}
                                                                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ),
                                                        )}

                                                        {listingPreviews.length < 5 && (
                                                            <button
                                                                onClick={() =>
                                                                    listingFileRef.current?.click()
                                                                }
                                                                className="flex h-24 w-32 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-(--border) text-xs text-(--light-fg) transition hover:border-(--primary-clr) hover:text-(--primary-clr)"
                                                            >
                                                                <Plus size={18} />
                                                                {t("photos_add")}
                                                            </button>
                                                        )}
                                                    </div>

                                                    <input
                                                        ref={listingFileRef}
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        className="hidden"
                                                        onChange={(event) => {
                                                            if (event.target.files) {
                                                                addListingFiles(
                                                                    event.target.files,
                                                                );
                                                            }
                                                            event.target.value = "";
                                                        }}
                                                    />
                                                </div>

                                                <div className="mt-5 flex justify-end gap-3">
                                                    <button
                                                        onClick={closeListingForm}
                                                        disabled={creatingListing}
                                                        className="rounded-lg border border-(--border) px-5 py-2.5 text-sm font-medium transition hover:bg-(--dim-bg)"
                                                    >
                                                        {t("cancel")}
                                                    </button>
                                                    <motion.button
                                                        onClick={() => void createListing()}
                                                        disabled={creatingListing}
                                                        whileTap={{ scale: 0.96 }}
                                                        className="inline-flex items-center gap-2 rounded-lg bg-(--primary-clr) px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                                                    >
                                                        {creatingListing && (
                                                            <Loader2
                                                                size={15}
                                                                className="animate-spin"
                                                            />
                                                        )}
                                                        {t("listing_create")}
                                                    </motion.button>
                                                    </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {listings.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-(--border) py-14 text-center">
                                        <LayoutList
                                            size={38}
                                            className="text-(--light-fg)"
                                        />
                                        <p className="text-sm text-(--light-fg)">
                                            {t("listings_empty")}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {listings.map((listing, index) => (
                                            <motion.button
                                                key={listing.id}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.25,
                                                    delay: Math.min(index * 0.05, 0.3),
                                                }}
                                                layout
                                                onClick={() =>
                                                    router.push(
                                                        `/${locale}/dashboard/businesses/${id}/listings/${listing.id}`,
                                                    )
                                                }
                                                className="flex gap-4 rounded-xl border border-(--border) p-4 text-start transition hover:-translate-y-0.5 hover:shadow-md"
                                            >
                                                <div className="h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-(--dim-bg)">
                                                    {listing.media?.[0] && (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img
                                                            src={
                                                                listing.media[0]
                                                                    .secure_url
                                                            }
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="truncate font-semibold">
                                                            {listing.title}
                                                        </h3>
                                                        <span
                                                            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                                                listing.status ===
                                                                "published"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-gray-100 text-gray-500"
                                                            }`}
                                                        >
                                                            {t(
                                                                `listing_status_${listing.status}`,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 text-sm font-medium text-(--primary-clr)">
                                                        {listing.price
                                                            ? `${listing.price} ${listing.currency}`
                                                            : t("listing_no_price")}
                                                    </p>

                                                    <p className="mt-1 line-clamp-2 text-xs text-(--light-fg)">
                                                        {listing.description ??
                                                            t(
                                                                "listing_no_description",
                                                            )}
                                                    </p>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </motion.section>
                        )}
                    </AnimatePresence>
                </>
            )}

            <ConfirmDialog
                open={confirmTypeChange}
                theme="warning"
                title={t("type_warning_title")}
                message={t("type_warning_message")}
                confirmLabel={t("type_warning_confirm")}
                loading={saving}
                onConfirm={() => void submit()}
                onCancel={() => setConfirmTypeChange(false)}
            />
        </div>
    );
}
