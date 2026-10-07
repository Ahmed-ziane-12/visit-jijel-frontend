"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import axios from "@/lib/axios";
import { uploadToCloudinary } from "@/lib/upload";
import type { BusinessMedia } from "@/types/business";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";

interface MediaManagerProps {
    modelType: "business" | "listing";
    modelId: number;
    media: BusinessMedia[];
    maxImages?: number;
    onChange: (media: BusinessMedia[]) => void;
}

const MAX_BYTES = 10 * 1024 * 1024;

export default function MediaManager({
    modelType,
    modelId,
    media,
    maxImages = 5,
    onChange,
}: MediaManagerProps) {
    const t = useTranslations("dashboard");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cover = media.find((item) => item.is_cover) ?? media[0] ?? null;
    const ordered = cover
        ? [cover, ...media.filter((item) => item.id !== cover.id)]
        : [];
    const canAdd = ordered.length < maxImages && !busy;

    const upload = async (files: FileList | File[]) => {
        const selected = Array.from(files)
            .filter((file) => file.type.startsWith("image/"))
            .filter((file) => file.size <= MAX_BYTES)
            .slice(0, maxImages - ordered.length);

        if (selected.length === 0) return;

        setBusy(true);
        setError(null);

        try {
            let next = [...ordered];

            for (const file of selected) {
                const isFirst = next.length === 0;
                const mediaItem = await uploadToCloudinary({
                    file,
                    modelType,
                    modelId,
                    collection: isFirst ? "cover" : "gallery",
                    isCover: isFirst,
                });

                next = [...next, mediaItem as BusinessMedia];
            }

            onChange(next);
        } catch {
            setError(t("upload_failed"));
        } finally {
            setBusy(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const remove = async (item: BusinessMedia) => {
        setBusy(true);
        setError(null);

        try {
            await axios.delete("/api/v1/media/delete", {
                data: { media_id: item.id },
            });

            const wasCover = item.is_cover;
            const next = ordered.filter((entry) => entry.id !== item.id);

            if (wasCover && next.length > 0) {
                next[0] = { ...next[0], is_cover: true };
            }

            onChange(next);
        } catch {
            setError(t("media_failed"));
        } finally {
            setBusy(false);
        }
    };

    const makeCover = async (item: BusinessMedia) => {
        if (item.is_cover) return;

        setBusy(true);
        setError(null);

        try {
            await axios.post("/api/v1/media/cover", { media_id: item.id });
            onChange(ordered.map((entry) => ({ ...entry, is_cover: entry.id === item.id })));
        } catch {
            setError(t("upload_failed"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-(--light-fg)">
                    {t("photos_hint", { max: maxImages })}
                </p>

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!canAdd}
                    className="inline-flex items-center gap-2 rounded-lg border border-(--border) px-4 py-2.5 text-sm font-medium transition hover:bg-(--dim-bg) disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {busy ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <ImagePlus size={16} />
                    )}
                    {t("photos_add")}
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                        if (event.target.files) void upload(event.target.files);
                    }}
                />
            </div>

            {error && (
                <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                    {error}
                </p>
            )}

            {ordered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-(--border) py-14 text-center">
                    <ImagePlus size={40} className="text-(--light-fg)" />
                    <p className="text-sm text-(--light-fg)">
                        {t("photos_empty")}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {ordered.map((item) => (
                        <div
                            key={item.id}
                            className="group relative overflow-hidden rounded-xl border border-(--border) bg-(--dim-bg)"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={item.secure_url}
                                alt=""
                                className="h-40 w-full object-cover"
                            />

                            {item.is_cover && (
                                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-(--primary-clr) px-2.5 py-1 text-[11px] font-semibold text-white">
                                    <Star size={11} className="fill-current" />
                                    {t("photos_cover")}
                                </span>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition group-hover:opacity-100">
                                {!item.is_cover && (
                                    <button
                                        type="button"
                                        onClick={() => void makeCover(item)}
                                        disabled={busy}
                                        className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-(--foreground) transition hover:bg-white/90 disabled:opacity-50"
                                    >
                                        {t("photos_set_cover")}
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => void remove(item)}
                                    disabled={busy}
                                    aria-label={t("photos_remove")}
                                    className="rounded-lg bg-white p-2 text-red-600 transition hover:bg-white/90 disabled:opacity-50"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {canAdd && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-(--border) text-(--light-fg) transition hover:border-(--primary-clr) hover:text-(--primary-clr)"
                        >
                            <ImagePlus size={24} />
                            <span className="text-xs font-medium">
                                {t("photos_add")}
                            </span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
