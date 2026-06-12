"use client";
import Breadcrumbs from "@/app/[locale]/components/Breadcrumbs/Breadcrumbs";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const page = () => {
    const params = useParams();
    const router = useRouter();
    const profileId = params?.id as string;
    return (
        <div style={{ padding: "clamp(56px, 6vh, 72px) 2rem 2rem 2rem" }}>
            <Breadcrumbs />
            {profileId}
        </div>
    );
};

export default page;
