"use client";

import Image from "next/image";
import Link from "next/link";
import {
    BadgeCheck,
    Eye,
    Pencil,
    Trash2,
    LayoutList,
    Building2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { Business } from "@/types/business";

const TYPE_ICONS: Record<string, React.ElementType> = {
    restaurant: Building2,
    hotel: Building2,
    touristic_agency: Building2,
    real_estate_agency: Building2,
};

type BusinessCardProps = {
    business: Business;
    typeLabel: string;
    typeIcon?: React.ElementType;
    typeColor?: string;
    typeBg?: string;
    coverUrl?: string;
    locale: string;
    onManage?: (id: number) => void;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
    onManageHref?: string;
    onEditHref?: string;
};

const BusinessCard = ({
    business,
    typeLabel,
    typeIcon: TypeIcon,
    coverUrl,
    locale,
    onManage,
    onEdit,
    onDelete,
    onManageHref,
    onEditHref,
}: BusinessCardProps) => {
    const t = useTranslations("business_card");
    const Icon = TypeIcon ?? Building2;

    return (
        <div className="group w-95 relative rounded-xl border border-(--border) bg-(--background) shadow-sm hover:shadow-md transition-all overflow-hidden">
            {coverUrl && (
                <div className="relative h-32 overflow-hidden">
                    <Image
                        src={coverUrl}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-400 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
            )}

            <div className={`p-5`}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--primary-clr)/10 text-(--primary-clr)">
                            <Icon size={20} />
                        </div>
                        <div className="min-w-0">
                            <Link
                                href={`/${locale}/dashboard/businesses/${business.id}`}
                                className="font-semibold text-[1.05rem] truncate block hover:text-(--primary-clr) transition-colors"
                            >
                                {business.name}
                            </Link>
                            <p className="text-xs text-(--light-fg) mt-0.5">
                                {typeLabel}
                            </p>
                        </div>
                    </div>

                    {business.is_verified && (
                        <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                            <BadgeCheck size={12} />
                            {t("verified")}
                        </span>
                    )}
                </div>

                {business.description && (
                    <p className="text-sm text-(--light-fg) mt-3 line-clamp-2">
                        {business.description}
                    </p>
                )}

                <div className="flex items-center gap-4 mt-4 text-sm text-(--light-fg)">
                    <span className="flex items-center gap-1.5">
                        <LayoutList size={14} />
                        {business.listings_count ?? 0} {t("listings")}
                    </span>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-(--border)">
                    {onManageHref ? (
                        <Link
                            href={onManageHref}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--primary-clr) hover:bg-(--primary-clr)/10 transition-colors"
                        >
                            <Eye size={15} />
                            {t("manage_assets")}
                        </Link>
                    ) : onManage ? (
                        <button
                            onClick={() => onManage(business.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--primary-clr) hover:bg-(--primary-clr)/10 transition-colors cursor-pointer"
                        >
                            <Eye size={15} />
                            {t("manage_assets")}
                        </button>
                    ) : null}

                    {onEditHref ? (
                        <Link
                            href={onEditHref}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--light-fg) hover:bg-(--border)/50 transition-colors"
                        >
                            <Pencil size={14} />
                            {t("edit")}
                        </Link>
                    ) : onEdit ? (
                        <button
                            onClick={() => onEdit(business.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--light-fg) hover:bg-(--border)/50 transition-colors cursor-pointer"
                        >
                            <Pencil size={14} />
                            {t("edit")}
                        </button>
                    ) : null}

                    {onDelete && (
                        <button
                            onClick={() => onDelete(business.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors ml-auto cursor-pointer"
                        >
                            <Trash2 size={14} />
                            {t("delete")}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessCard;
