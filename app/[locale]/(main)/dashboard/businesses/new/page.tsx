"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import axios from "@/lib/axios";
import type { BusinessType } from "@/types/business";
import Breadcrumbs from "@/app/[locale]/components/Breadcrumbs/Breadcrumbs";
import {
    Building2,
    MapPin,
    Image as ImageIcon,
    FileText,
    Check,
    ChevronRight,
    ChevronLeft,
    Upload,
    X,
    Loader2,
    Star,
    AlertCircle,
    UtensilsCrossed,
    Hotel,
    Globe,
    Store,
} from "lucide-react";

const BUSINESS_TYPES: { value: BusinessType; icon: React.ElementType }[] = [
    { value: "restaurant", icon: UtensilsCrossed },
    { value: "hotel", icon: Hotel },
    { value: "touristic_agency", icon: Globe },
    { value: "real_estate_agency", icon: Store },
];

const TYPE_LABELS: Record<BusinessType, string> = {
    restaurant: "type_restaurant",
    hotel: "type_hotel",
    touristic_agency: "type_touristic_agency",
    real_estate_agency: "type_real_estate_agency",
};

const STEPS = [
    { key: "basic_info", icon: Building2 },
    { key: "location", icon: MapPin },
    { key: "images", icon: ImageIcon },
    { key: "preview", icon: FileText },
];

interface FileWithPreview {
    file: File;
    preview: string;
    isCover: boolean;
}

interface FormData {
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
    images: FileWithPreview[];
}

const INITIAL_FORM: FormData = {
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
    images: [],
};

export default function CreateBusinessPage() {
    const t = useTranslations("dashboard");
    const router = useRouter();
    const params = useParams();
    const locale = params?.locale as string;

    const [step, setStep] = useState(0);
    const [form, setForm] = useState<FormData>(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            form.images.forEach((img) => URL.revokeObjectURL(img.preview));
        };
    }, [form.images]);

    const updateField = useCallback(
        <K extends keyof FormData>(key: K, value: FormData[K]) => {
            setForm((prev) => ({ ...prev, [key]: value }));
            setError(null);
        },
        []
    );

    const addFiles = useCallback((files: FileList | File[]) => {
        const valid: FileWithPreview[] = Array.from(files)
            .filter((f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024)
            .map((file, i) => ({
                file,
                preview: URL.createObjectURL(file),
                isCover: false,
            }));

        if (valid.length === 0) return;

        setForm((prev) => {
            const existing = [...prev.images];
            if (existing.length === 0) valid[0].isCover = true;
            return { ...prev, images: [...existing, ...valid].slice(0, 5) };
        });
    }, []);

    const removeImage = useCallback((index: number) => {
        setForm((prev) => {
            const images = prev.images.filter((_, i) => i !== index);
            if (images.length > 0 && !images.some((img) => img.isCover)) {
                images[0].isCover = true;
            }
            return { ...prev, images };
        });
    }, []);

    const setCover = useCallback((index: number) => {
        setForm((prev) => ({
            ...prev,
            images: prev.images.map((img, i) => ({
                ...img,
                isCover: i === index,
            })),
        }));
    }, []);

    const canProceed = (): boolean => {
        if (step === 0) return form.type !== "" && form.name.trim().length > 0;
        if (step === 1) return true;
        if (step === 2) return true;
        return true;
    };

    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >
        ) => {
            const { name, value } = e.target;
            updateField(name as keyof FormData, value);
        },
        [updateField]
    );

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);

        const sanitizeUrl = (url: string) => {
            const trimmed = url.trim();
            if (!trimmed) return undefined;
            return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
        };

        try {
            const { data: business } = await axios.post("/api/v1/businesses", {
                type: form.type,
                name: form.name.trim(),
                description: form.description || undefined,
                phone: form.phone || undefined,
                email: form.email || undefined,
                website: sanitizeUrl(form.website),
                address: form.address || undefined,
                wilaya: form.wilaya || undefined,
                commune: form.commune || undefined,
                latitude: form.latitude ? parseFloat(form.latitude) : undefined,
                longitude: form.longitude
                    ? parseFloat(form.longitude)
                    : undefined,
            });

            if (form.images.length > 0) {
                setUploadProgress(t("uploading_images"));
                const folder = "businesses";

                for (let i = 0; i < form.images.length; i++) {
                    const img = form.images[i];

                    const { data: sig } = await axios.post(
                        "/api/v1/media/signature",
                        { folder }
                    );

                    const cloudForm = new FormData();
                    cloudForm.append("file", img.file);
                    cloudForm.append("api_key", sig.api_key);
                    cloudForm.append("timestamp", String(sig.timestamp));
                    cloudForm.append("signature", sig.signature);
                    cloudForm.append("folder", sig.folder);

                    const cloudRes = await fetch(
                        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
                        { method: "POST", body: cloudForm }
                    );
                    const cloudData = await cloudRes.json();

                    if (!cloudRes.ok) {
                        throw new Error(
                            cloudData.error?.message ?? "Upload failed"
                        );
                    }

                    await axios.post("/api/v1/media/store", {
                        model_type: "business",
                        model_id: business.id,
                        collection: img.isCover ? "cover" : "gallery",
                        is_cover: img.isCover,
                        cloudinary_public_id: cloudData.public_id,
                        url: cloudData.url,
                        secure_url: cloudData.secure_url,
                        format: cloudData.format,
                        resource_type: cloudData.resource_type,
                        width: cloudData.width,
                        height: cloudData.height,
                        bytes: cloudData.bytes,
                    });
                }
            }

            router.push(`/${locale}/dashboard?created=true`);
        } catch (err: unknown) {
            let msg = "Failed to create business";
            if (err && typeof err === "object" && "response" in err) {
                const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
                const serverMsg = axiosErr.response?.data?.message;
                const serverErrors = axiosErr.response?.data?.errors;
                if (serverErrors) {
                    msg = Object.values(serverErrors).flat().join("\n");
                } else if (serverMsg) {
                    msg = serverMsg;
                }
            } else if (err instanceof Error) {
                msg = err.message;
            }
            setError(msg);
        } finally {
            setSubmitting(false);
            setUploadProgress(null);
        }
    };

    return (
        <div
            style={{ padding: "clamp(56px, 6vh, 72px) 2rem 2rem 2rem" }}
            className="w-full max-w-3xl mx-auto flex flex-col gap-8"
        >
            <Breadcrumbs />

            <div>
                <h1 className="text-[1.8rem] font-bold">
                    {t("create_business")}
                </h1>

                <div className="flex items-center gap-0 mt-8 mb-10">
                    {STEPS.map((s, i) => {
                        const StepIcon = s.icon;
                        const isActive = i === step;
                        const isDone = i < step;
                        return (
                            <div
                                key={s.key}
                                className="flex items-center flex-1"
                            >
                                <button
                                    onClick={() => i < step && setStep(i)}
                                    disabled={i > step}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                                        isActive
                                            ? "bg-(--primary-clr) text-white"
                                            : isDone
                                              ? "text-(--primary-clr) cursor-pointer hover:bg-(--primary-clr)/10"
                                              : "text-(--light-fg) cursor-default"
                                    }`}
                                >
                                    <StepIcon size={16} />
                                    <span className="hidden sm:inline">
                                        {t(s.key)}
                                    </span>
                                </button>
                                {i < STEPS.length - 1 && (
                                    <ChevronRight
                                        size={16}
                                        className={`mx-2 shrink-0 ${
                                            isDone
                                                ? "text-(--primary-clr)"
                                                : "text-(--border)"
                                        }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            {error.split("\n").map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {step === 0 && (
                <section className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {t("form_type")} *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {BUSINESS_TYPES.map(({ value, icon: Icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => updateField("type", value)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                        form.type === value
                                            ? "border-(--primary-clr) bg-(--primary-clr)/5"
                                            : "border-(--border) hover:border-(--primary-clr)/40"
                                    }`}
                                >
                                    <Icon
                                        size={24}
                                        className={
                                            form.type === value
                                                ? "text-(--primary-clr)"
                                                : "text-(--light-fg)"
                                        }
                                    />
                                    <span
                                        className={`text-xs font-medium ${
                                            form.type === value
                                                ? "text-(--primary-clr)"
                                                : "text-(--light-fg)"
                                        }`}
                                    >
                                        {t(TYPE_LABELS[value])}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium mb-1.5"
                        >
                            {t("form_name")} *
                        </label>
                        <input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleInputChange}
                            placeholder={t("form_name_placeholder")}
                            maxLength={150}
                            className="w-full px-4 py-2.5 rounded-xl border border-(--border) focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20 outline-none transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium mb-1.5"
                        >
                            {t("form_description")}
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={form.description}
                            onChange={handleInputChange}
                            placeholder={t("form_description_placeholder")}
                            rows={4}
                            className="w-full px-4 py-2.5 rounded-xl border border-(--border) focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20 outline-none transition-all text-sm resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium mb-1.5"
                            >
                                {t("form_phone")}
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                value={form.phone}
                                onChange={handleInputChange}
                                placeholder="+213 5X XX XX XX"
                                maxLength={20}
                                className="w-full px-4 py-2.5 rounded-xl border border-(--border) focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium mb-1.5"
                            >
                                {t("form_contact_email")}
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleInputChange}
                                placeholder="contact@example.com"
                                className="w-full px-4 py-2.5 rounded-xl border border-(--border) focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="website"
                            className="block text-sm font-medium mb-1.5"
                        >
                            {t("form_website")}
                        </label>
                        <input
                            id="website"
                            name="website"
                            value={form.website}
                            onChange={handleInputChange}
                            placeholder="https://example.com"
                            className="w-full px-4 py-2.5 rounded-xl border border-(--border) focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20 outline-none transition-all text-sm"
                        />
                    </div>
                </section>
            )}

            {step === 1 && (
                <section className="space-y-6">
                    <div>
                        <label
                            htmlFor="address"
                            className="block text-sm font-medium mb-1.5"
                        >
                            {t("form_address")}
                        </label>
                        <input
                            id="address"
                            name="address"
                            value={form.address}
                            onChange={handleInputChange}
                            placeholder={t("form_address_placeholder")}
                            className="w-full px-4 py-2.5 rounded-xl border border-(--border) focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20 outline-none transition-all text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="wilaya"
                                className="block text-sm font-medium mb-1.5"
                            >
                                {t("form_wilaya")}
                            </label>
                            <input
                                id="wilaya"
                                name="wilaya"
                                value={form.wilaya}
                                onChange={handleInputChange}
                                placeholder="Jijel"
                                className="w-full px-4 py-2.5 rounded-xl border border-(--border) focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="commune"
                                className="block text-sm font-medium mb-1.5"
                            >
                                {t("form_commune")}
                            </label>
                            <input
                                id="commune"
                                name="commune"
                                value={form.commune}
                                onChange={handleInputChange}
                                placeholder={t("form_commune_placeholder")}
                                className="w-full px-4 py-2.5 rounded-xl border border-(--border) focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="latitude"
                                className="block text-sm font-medium mb-1.5"
                            >
                                {t("form_latitude")}
                            </label>
                            <input
                                id="latitude"
                                name="latitude"
                                type="number"
                                step="any"
                                value={form.latitude}
                                onChange={handleInputChange}
                                placeholder="36.820"
                                className="w-full px-4 py-2.5 rounded-xl border border-(--border) focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="longitude"
                                className="block text-sm font-medium mb-1.5"
                            >
                                {t("form_longitude")}
                            </label>
                            <input
                                id="longitude"
                                name="longitude"
                                type="number"
                                step="any"
                                value={form.longitude}
                                onChange={handleInputChange}
                                placeholder="5.766"
                                className="w-full px-4 py-2.5 rounded-xl border border-(--border) focus:border-(--primary-clr) focus:ring-2 focus:ring-(--primary-clr)/20 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    <LocationMapPicker
                        latitude={form.latitude}
                        longitude={form.longitude}
                        onSelect={(lat, lng) => {
                            updateField("latitude", String(lat));
                            updateField("longitude", String(lng));
                        }}
                    />
                </section>
            )}

            {step === 2 && (
                <section className="space-y-6">
                    <div>
                        <p className="text-sm text-(--light-fg) mb-4">
                            {t("form_images_hint")}
                        </p>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed border-(--border) hover:border-(--primary-clr)/40 hover:bg-(--primary-clr)/5 transition-all cursor-pointer"
                        >
                            <Upload
                                size={32}
                                className="text-(--light-fg)"
                            />
                            <p className="text-sm font-medium">
                                {t("form_upload")}
                            </p>
                            <p className="text-xs text-(--light-fg)">
                                PNG, JPG, WebP - Max 10MB each
                            </p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files) addFiles(e.target.files);
                                e.target.value = "";
                            }}
                        />
                    </div>

                    {form.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {form.images.map((img, i) => (
                                <div
                                    key={i}
                                    className="relative group rounded-xl overflow-hidden border border-(--border) aspect-square"
                                >
                                    <img
                                        src={img.preview}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={() => setCover(i)}
                                            className={`p-1.5 rounded-lg bg-white/90 hover:bg-white transition-all cursor-pointer ${
                                                img.isCover
                                                    ? "text-yellow-500"
                                                    : "text-(--light-fg)"
                                            }`}
                                            title={t("form_cover")}
                                        >
                                            <Star
                                                size={14}
                                                fill={
                                                    img.isCover
                                                        ? "currentColor"
                                                        : "none"
                                                }
                                            />
                                        </button>
                                        <button
                                            onClick={() => removeImage(i)}
                                            className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-red-500 transition-all cursor-pointer"
                                            title={t("form_remove")}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    {img.isCover && (
                                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-yellow-400 text-xs font-semibold text-yellow-900">
                                            {t("form_cover")}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {step === 3 && (
                <section className="space-y-6">
                    <div className="rounded-xl border border-(--border) divide-y divide-(--border)">
                        <div className="p-5 flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--primary-clr)/10 text-(--primary-clr)">
                                <Building2 size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-(--light-fg) uppercase tracking-wide font-medium">
                                    {t("basic_info")}
                                </p>
                                <p className="font-medium mt-0.5">
                                    {form.type
                                        ? t(TYPE_LABELS[form.type as BusinessType])
                                        : "-"}
                                    {" — "}
                                    {form.name || "-"}
                                </p>
                                {form.description && (
                                    <p className="text-sm text-(--light-fg) mt-1 line-clamp-2">
                                        {form.description}
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-(--light-fg)">
                                    {form.phone && <span>{form.phone}</span>}
                                    {form.email && <span>{form.email}</span>}
                                    {form.website && <span>{form.website}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="p-5 flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-(--light-fg) uppercase tracking-wide font-medium">
                                    {t("location")}
                                </p>
                                <p className="text-sm mt-0.5">
                                    {[
                                        form.address,
                                        form.commune,
                                        form.wilaya,
                                    ]
                                        .filter(Boolean)
                                        .join(", ") || (
                                        <span className="text-(--light-fg)">
                                            No address provided
                                        </span>
                                    )}
                                </p>
                                {(form.latitude || form.longitude) && (
                                    <p className="text-xs text-(--light-fg) mt-1">
                                        {form.latitude || "?"} &deg;N,{" "}
                                        {form.longitude || "?"} &deg;E
                                    </p>
                                )}
                            </div>
                        </div>

                        {form.images.length > 0 && (
                            <div className="p-5 flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                    <ImageIcon size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-(--light-fg) uppercase tracking-wide font-medium">
                                        {t("images")}
                                    </p>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {form.images.map((img, i) => (
                                            <div
                                                key={i}
                                                className="relative w-16 h-16 rounded-lg overflow-hidden border border-(--border)"
                                            >
                                                <img
                                                    src={img.preview}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                                {img.isCover && (
                                                    <span className="absolute top-0.5 right-0.5">
                                                        <Star
                                                            size={10}
                                                            className="text-yellow-500"
                                                            fill="currentColor"
                                                        />
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-(--border)">
                {step > 0 ? (
                    <button
                        onClick={() => setStep((s) => s - 1)}
                        disabled={submitting}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-(--border) text-sm font-medium hover:bg-(--border)/50 transition-all cursor-pointer disabled:opacity-50"
                    >
                        <ChevronLeft size={16} />
                        {t("prev_step")}
                    </button>
                ) : (
                    <div />
                )}

                {step < STEPS.length - 1 ? (
                    <button
                        onClick={() => setStep((s) => s + 1)}
                        disabled={!canProceed()}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-(--primary-clr) text-white text-sm font-medium hover:brightness-110 transition-all cursor-pointer disabled:opacity-40"
                    >
                        {t("next_step")}
                        <ChevronRight size={16} />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-(--primary-clr) text-white text-sm font-medium hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                {uploadProgress || t("creating")}
                            </>
                        ) : (
                            <>
                                <Check size={16} />
                                {t("submit")}
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

function LocationMapPicker({
    latitude,
    longitude,
    onSelect,
}: {
    latitude: string;
    longitude: string;
    onSelect: (lat: number, lng: number) => void;
}) {
    const mapRef = useRef<HTMLDivElement>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const L = await import("leaflet");

            await import("leaflet/dist/leaflet.css");

            if (cancelled || !mapRef.current) return;

            const lat = parseFloat(latitude) || 36.820;
            const lng = parseFloat(longitude) || 5.766;

            const map = L.map(mapRef.current, {
                center: [lat, lng],
                zoom: 13,
                zoomControl: true,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(map);

            const markerIcon = L.divIcon({
                html: `<div style="background:#eb662b;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
                className: "",
            });

            const marker = L.marker([lat, lng], {
                icon: markerIcon,
                draggable: true,
            }).addTo(map);

            marker.on("dragend", () => {
                const pos = marker.getLatLng();
                onSelect(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)));
            });

            map.on("click", (e: L.LeafletMouseEvent) => {
                marker.setLatLng(e.latlng);
                onSelect(
                    parseFloat(e.latlng.lat.toFixed(6)),
                    parseFloat(e.latlng.lng.toFixed(6))
                );
            });

            markerRef.current = marker;
            mapInstanceRef.current = map;
            setLoaded(true);

            return () => {
                map.remove();
            };
        })();

        return () => {
            cancelled = true;
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!markerRef.current || !mapInstanceRef.current) return;
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lng)) return;
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
    }, [latitude, longitude]);

    return (
        <div className="space-y-2">
            <p className="text-xs text-(--light-fg)">
                Click on the map to set the location
            </p>
            <div
                ref={mapRef}
                className="h-56 rounded-xl overflow-hidden border border-(--border)"
                style={{ zIndex: 0 }}
            />
        </div>
    );
}
