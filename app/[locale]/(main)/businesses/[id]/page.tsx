import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import type { Business } from "@/types/business";
import axios from "@/lib/axios";
import { Building2, Loader2 } from "lucide-react";

const Business = () => {
    const params = useParams();
    const id = params?.id as string;
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        axios
            .get(`/api/v1/my-businesses`)
            .then(({ data }) => {
                const found = (data as Business[]).find(
                    (b) => b.id === Number(id),
                );
                setBusiness(found ?? null);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <div>
            {loading ? (
                <div className="flex items-center justify-center min-h-[40vh]">
                    <Loader2
                        size={28}
                        className="animate-spin text-(--light-fg)"
                    />
                </div>
            ) : !business ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20">
                    <Building2 size={48} className="text-(--light-fg)" />
                    <p className="text-lg text-(--light-fg)">
                        Business not found
                    </p>
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
};

export default Business;
