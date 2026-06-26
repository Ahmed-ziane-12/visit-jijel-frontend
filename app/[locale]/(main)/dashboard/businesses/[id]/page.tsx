"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumbs from "@/app/[locale]/components/Breadcrumbs/Breadcrumbs";
import axios from "@/lib/axios";
import type { Business } from "@/types/business";
import { Loader2, Building2 } from "lucide-react";

export default function BusinessDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        axios.get(`/api/v1/my-businesses`).then(({ data }) => {
            const found = (data as Business[]).find((b) => b.id === Number(id));
            setBusiness(found ?? null);
        }).catch(() => {}).finally(() => setLoading(false));
    }, [id]);

    return (
        <div style={{ padding: "clamp(56px, 6vh, 72px) 2rem 2rem 2rem" }} className="w-full">
            <Breadcrumbs />

            {loading ? (
                <div className="flex items-center justify-center min-h-[40vh]">
                    <Loader2 size={28} className="animate-spin text-(--light-fg)" />
                </div>
            ) : !business ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20">
                    <Building2 size={48} className="text-(--light-fg)" />
                    <p className="text-lg text-(--light-fg)">Business not found</p>
                </div>
            ) : (
                <div className="mt-6">
                    <h1 className="text-2xl font-bold">{business.name}</h1>
                    <p className="text-sm text-(--light-fg) mt-1 capitalize">
                        {business.type?.replace("_", " ")}
                    </p>
                </div>
            )}
        </div>
    );
}
