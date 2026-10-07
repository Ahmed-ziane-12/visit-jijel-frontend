"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import Breadcrumbs from "@/app/[locale]/components/Breadcrumbs/Breadcrumbs";
import ChipInput from "@/app/[locale]/components/ChipInput/ChipInput";
import ConfirmDialog from "@/app/[locale]/components/ConfirmDialog/ConfirmDialog";
import MediaManager from "@/app/[locale]/components/MediaManager/MediaManager";
import type { Listing } from "@/types/business";
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Pencil,
    Save,
    Trash2,
} from "lucide-react";

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

interface EditableState {
    title: string;
    description: string;
    price: string;
    currency: string;
    capacity: string;
    amenities: string[];
    status: Listing["status"];
}

function toEditable(listing: Listing): EditableState {
    return {
        title: listing.title ?? "",
        description: listing.description ?? "",
        price: listing.price ?? "",
        currency: listing.currency ?? "DZD",
        capacity:
            listing.capacity === null || listing.capacity === undefined
                ? ""
                : String(listing.capacity),
        amenities: listing.amenities ?? [],
        status: listing.status ?? "draft",
    };
}

export default function ListingDetailPage() {
    const t = useTranslations("dashboard");
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const locale = params?.locale as string;
    const businessId = Number(params?.id);
    const listingId = Number(params?.listingId);

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    const [form, setForm] = useState<EditableState | null>(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError(false);

        try {
            const { data } = await axios.get<Listing>(
                `/api/v1/businesses/${businessId}/listings/${listingId}`,
            );
            setListing(data);
            setForm(toEditable(data));
        } catch {
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    }, [businessId, listingId]);

    useEffect(() => {
        if (!authLoading && user?.profile?.role !== "business_owner") {
            router.replace(`/${locale}/dashboard`);
        }
    }, [authLoading, user, locale, router]);

    useEffect(() => {
        if (
            !businessId ||
            !listingId ||
            authLoading ||
            user?.profile?.role !== "business_owner"
        ) {
            return;
        }
        void load();
    }, [businessId, listingId, authLoading, user, load]);

    const backHref = `/${locale}/dashboard/businesses/${businessId}#listings`;

    const updateField = <K extends keyof EditableState>(
        key: K,
        value: EditableState[K],
    ) => {
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
        setError(null);
        setSaved(false);
    };

    const save = async () => {
        if (!form) return;

        if (!form.title.trim()) {
            setError(t("listing_title_required"));
            return;
        }

        const price = Number(form.price);
        if (form.price.trim() && (!Number.isFinite(price) || price < 0)) {
            setError(t("invalid_number"));
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const { data } = await axios.put<Listing>(
                `/api/v1/businesses/${businessId}/listings/${listingId}`,
                {
                    title: form.title.trim(),
                    description: form.description || null,
                    price: form.price ? price : null,
                    currency: form.currency,
                    capacity: form.capacity
                        ? parseInt(form.capacity, 10)
                        : null,
                    amenities: form.amenities.length ? form.amenities : [],
                    status: form.status,
                },
            );

            setListing(data);
            setForm(toEditable(data));
            setEditing(false);
            setSaved(true);
            window.setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            const response = err as {
                response?: {
                    data?: {
                        errors?: Record<string, string[]>;
                        message?: string;
                    };
                };
            };
            const errors = response.response?.data?.errors;
            setError(
                errors
                    ? Object.values(errors).flat().join("\n")
                    : (response.response?.data?.message ?? t("save_failed")),
            );
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        setDeleting(true);
        setError(null);

        try {
            await axios.delete(
                `/api/v1/businesses/${businessId}/listings/${listingId}`,
            );
            router.push(backHref);
        } catch (err) {
            const response = err as {
                response?: { data?: { message?: string } };
            };
            setError(response.response?.data?.message ?? t("save_failed"));
            setDeleting(false);
            setConfirmDelete(false);
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
            ) : loadError || !listing || !form ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20">
                    <AlertCircle size={48} className="text-(--light-fg)" />
                    <p className="text-lg text-(--light-fg)">
                        {t("listing_not_found")}
                    </p>
                    <button
                        onClick={() => router.push(backHref)}
                        className="inline-flex items-center gap-2 rounded-lg bg-(--primary-clr) px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
                    >
                        <ArrowLeft size={16} />
                        {t("back_to_business")}
                    </button>
                </div>
            ) : (
                <>
                    <header className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-[1.8rem] font-bold">
                                    {listing.title}
                                </h1>

                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                        listing.status === "published"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-500"
                                    }`}
                                >
                                    {t(`listing_status_${listing.status}`)}
                                </span>
                            </div>

                            <p className="mt-1 text-sm font-medium text-(--primary-clr)">
                                {listing.price
                                    ? `${listing.price} ${listing.currency}`
                                    : t("listing_no_price")}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {saved && (
                                <p className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                                    <CheckCircle2 size={15} />
                                    {t("saved")}
                                </p>
                            )}

                            {!editing && (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-(--border) px-4 py-2.5 text-sm font-medium transition hover:bg-(--dim-bg)"
                                >
                                    <Pencil size={15} />
                                    {t("listing_edit")}
                                </button>
                            )}

                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                                <Trash2 size={15} />
                                {t("listing_delete")}
                            </button>
                        </div>
                    </header>

                    {error && (
                        <p className="whitespace-pre-line rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <section className="rounded-xl border border-(--border) p-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="title"
                                    className="mb-1.5 block text-sm font-medium"
                                >
                                    {t("listing_title")}
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    maxLength={200}
                                    value={form.title}
                                    disabled={!editing}
                                    onChange={(event) =>
                                        updateField("title", event.target.value)
                                    }
                                    className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20 disabled:bg-(--dim-bg) disabled:text-(--light-fg)"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="description"
                                    className="mb-1.5 block text-sm font-medium"
                                >
                                    {t("listing_description")}
                                </label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    value={form.description}
                                    disabled={!editing}
                                    onChange={(event) =>
                                        updateField(
                                            "description",
                                            event.target.value,
                                        )
                                    }
                                    className="w-full resize-y rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20 disabled:bg-(--dim-bg) disabled:text-(--light-fg)"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="price"
                                    className="mb-1.5 block text-sm font-medium"
                                >
                                    {t("listing_price")}
                                </label>
                                <input
                                    id="price"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    inputMode="decimal"
                                    value={form.price}
                                    disabled={!editing}
                                    onChange={(event) =>
                                        updateField("price", event.target.value)
                                    }
                                    className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20 disabled:bg-(--dim-bg) disabled:text-(--light-fg)"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="currency"
                                    className="mb-1.5 block text-sm font-medium"
                                >
                                    {t("listing_currency")}
                                </label>
                                <select
                                    id="currency"
                                    value={form.currency}
                                    disabled={!editing}
                                    onChange={(event) =>
                                        updateField(
                                            "currency",
                                            event.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20 disabled:bg-(--dim-bg) disabled:text-(--light-fg)"
                                >
                                    {["DZD", "EUR", "USD", "GBP"].map(
                                        (code) => (
                                            <option key={code} value={code}>
                                                {code}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="capacity"
                                    className="mb-1.5 block text-sm font-medium"
                                >
                                    {t("listing_capacity")}
                                </label>
                                <input
                                    id="capacity"
                                    type="number"
                                    min={1}
                                    step="1"
                                    inputMode="numeric"
                                    value={form.capacity}
                                    disabled={!editing}
                                    onChange={(event) =>
                                        updateField(
                                            "capacity",
                                            event.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20 disabled:bg-(--dim-bg) disabled:text-(--light-fg)"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="status"
                                    className="mb-1.5 block text-sm font-medium"
                                >
                                    {t("listing_status")}
                                </label>
                                <select
                                    id="status"
                                    value={form.status}
                                    disabled={!editing}
                                    onChange={(event) =>
                                        updateField(
                                            "status",
                                            event.target
                                                .value as Listing["status"],
                                        )
                                    }
                                    className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none transition-all focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20 disabled:bg-(--dim-bg) disabled:text-(--light-fg)"
                                >
                                    {STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {t(`listing_status_${status}`)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-2">
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
                                {!editing && (
                                    <p className="mt-1.5 text-xs text-(--light-fg)">
                                        {t("listing_read_only_hint")}
                                    </p>
                                )}
                            </div>
                        </div>

                        {editing && (
                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setForm(toEditable(listing));
                                        setEditing(false);
                                        setError(null);
                                    }}
                                    disabled={saving}
                                    className="rounded-lg border border-(--border) px-5 py-2.5 text-sm font-medium transition hover:bg-(--dim-bg)"
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    onClick={() => void save()}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-lg bg-(--primary-clr) px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                                >
                                    {saving ? (
                                        <Loader2
                                            size={15}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Save size={15} />
                                    )}
                                    {t("save_changes")}
                                </button>
                            </div>
                        )}
                    </section>

                    <section className="rounded-xl border border-(--border) p-5">
                        <h2 className="mb-4 text-lg font-semibold">
                            {t("tab_photos")}
                        </h2>

                        <MediaManager
                            modelType="listing"
                            modelId={listing.id}
                            media={listing.media ?? []}
                            maxImages={5}
                            onChange={(media) =>
                                setListing((prev) =>
                                    prev ? { ...prev, media } : prev,
                                )
                            }
                        />
                    </section>
                </>
            )}

            <ConfirmDialog
                open={confirmDelete}
                theme="danger"
                title={t("listing_delete_title")}
                message={t("listing_delete_message")}
                confirmLabel={t("listing_delete")}
                loading={deleting}
                onConfirm={() => void remove()}
                onCancel={() => setConfirmDelete(false)}
            />
        </div>
    );
}
