"use client";

import {
    User,
    Mail,
    Briefcase,
    CalendarDays,
    MapPin,
    FileText,
    Image as ImageIcon,
} from "lucide-react";
import { Media } from "@/types/map";

interface ProfileSidebarProps {
    name: string;
    email: string;
    bio?: string;
    phone?: string;
    role?: string;
    city?: string;
    joinDate?: string;
    tripCount?: number;
    photos: Media[];
    onPhotoClick?: (url: string) => void;
}

export default function ProfileSidebar({
    name,
    email,
    bio,
    phone,
    role,
    city,
    joinDate,
    tripCount,
    photos,
    onPhotoClick,
}: ProfileSidebarProps) {
    return (
        <div className="flex flex-col gap-4">
            {/* About Card */}
            <div className="rounded-xl border border-(--border) bg-white p-5">
                <h3 className="mb-4 text-base font-bold">About</h3>

                {bio && (
                    <div className="mb-4 flex items-start gap-3 text-sm text-[var(--light-fg)]">
                        <FileText size={18} className="mt-0.5 shrink-0" />
                        <p className="leading-relaxed">{bio}</p>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {role && (
                        <div className="flex items-center gap-3 text-sm">
                            <Briefcase
                                size={18}
                                className="shrink-0 text-[var(--light-fg)]"
                            />
                            <span>{role}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                        <Mail
                            size={18}
                            className="shrink-0 text-[var(--light-fg)]"
                        />
                        <span className="truncate">{email}</span>
                    </div>
                    {city && (
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin
                                size={18}
                                className="shrink-0 text-[var(--light-fg)]"
                            />
                            <span>{city}</span>
                        </div>
                    )}
                    {joinDate && (
                        <div className="flex items-center gap-3 text-sm">
                            <CalendarDays
                                size={18}
                                className="shrink-0 text-[var(--light-fg)]"
                            />
                            <span>Joined {joinDate}</span>
                        </div>
                    )}
                </div>

                {typeof tripCount === "number" && tripCount > 0 && (
                    <div className="mt-4 border-t border-(--border) pt-4 text-center text-sm text-[var(--light-fg)]">
                        <span className="font-bold text-(--main-fg)">
                            {tripCount}
                        </span>{" "}
                        trips completed
                    </div>
                )}
            </div>

            {/* Photos Card */}
            {photos.length > 0 && (
                <div className="rounded-xl border border-(--border) bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-base font-bold">Photos</h3>
                        <button className="text-xs font-medium text-(--primary-clr) hover:underline">
                            See All
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                        {photos.slice(0, 9).map((photo) => (
                            <button
                                key={photo.id}
                                onClick={() => onPhotoClick?.(photo.secure_url)}
                                className="aspect-square overflow-hidden rounded-lg"
                            >
                                <img
                                    src={photo.secure_url}
                                    alt=""
                                    className="h-full w-full object-cover transition-transform hover:scale-105"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
