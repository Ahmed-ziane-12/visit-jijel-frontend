"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import axios from "@/lib/axios";
import styles from "./page.module.css";
import Map from "@/app/[locale]/components/Map/Map";
import Image from "next/image";

import {
    BadgeInfo,
    CirclePlus,
    Clock,
    Landmark,
    Phone,
    Share2,
} from "lucide-react";
import Link from "next/link";

import { Destination, Media } from "@/types/map";
import Reviews from "@/app/[locale]/components/Reviews/Reviews";
import ConfirmDialog from "@/app/[locale]/components/ConfirmDialog/ConfirmDialog"; // Adjust import path as needed
import { useAuth } from "@/context/AuthContext";
import ImageShowcase from "@/app/[locale]/components/ImageShowcase/ImageShowcase";
import { useTranslations } from "next-intl";
const BLUR =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg==";

export default function ExplorePage() {
    const { id } = useParams<{ id: string }>();
    const t = useTranslations("destination");
    const commonT = useTranslations("common");
    const [coverImage, setCoverImage] = useState<string | undefined>("");
    const [destination, setDestination] = useState<Destination | null>(null);
    const [loading, setLoading] = useState(true);
    const [feedbackOpen, setfeedbackOpen] = useState(false);
    const [feedback, setfeedback] = useState("");
    const [feedbackTheme, setfeedbackTheme] = useState<"success" | "warning">(
        "success",
    );
    const [pendingReview, setPendingReview] = useState<{
        rating: number;
        body: string;
    } | null>(null);
    const [oldReviewId, setOldReviewId] = useState<number | null>(null);
    const [isDeletingOldReview, setIsDeletingOldReview] = useState(false);
    const { user } = useAuth();
    const [showcaseOpen, setShowcaseOpen] = useState(false);

    const mediaUrls = useMemo(
        () => (destination?.media ?? []).map((m) => m.secure_url),
        [destination],
    );

    useEffect(() => {
        const fetchDestination = async () => {
            try {
                const res = await axios.get(`/api/v1/destinations/${id}`);

                const data = res.data;

                setDestination(data);

                setCoverImage(
                    data.media?.find((m: Media) => m.is_cover)?.secure_url ??
                        data.media?.[0]?.secure_url,
                );
            } catch (err) {
                console.error("Failed to fetch destination:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDestination();
    }, [id]);

    const handleAddReview = async (rating: number, body: string) => {
        if (!destination) return;

        try {
            await axios.post("/api/v1/reviews", {
                destination_id: destination.id,
                rating,
                body,
            });

            // Success - refresh destination data to get updated reviews
            const res = await axios.get(`/api/v1/destinations/${id}`);
            setDestination(res.data);
            setfeedbackTheme("success");
            setfeedback(t("review_success"));
            setfeedbackOpen(true);
        } catch (error: any) {
            if (error.response?.status === 422) {
                const targetError = error.response.data?.errors?.target;
                const validationMessage = targetError?.[0];

                if (
                    validationMessage &&
                    validationMessage.includes("already reviewed")
                ) {
                    // Store the pending review data
                    setPendingReview({ rating, body });
                    setfeedbackTheme("warning");
                    setfeedback(validationMessage);
                    setfeedbackOpen(true);

                    // Find the existing review from destination.reviews
                    if (destination.reviews && user) {
                        const existingReview = destination.reviews.find(
                            (review) => review.user?.id === user.id,
                        );
                        if (existingReview) {
                            setOldReviewId(existingReview.id);
                        }
                    }
                } else {
                    // Handle other validation errors
                    console.error(
                        "Validation error:",
                        error.response.data.errors,
                    );
                    // You can show a toast or alert here
                    alert(validationMessage || t("review_validation_error"));
                }
            } else {
                console.error("Error adding review:", error);
                alert(t("review_error"));
            }
        }
    };

    const deleteOldReviewAndSubmitNew = async () => {
        console.log("Done");

        // if (!oldReviewId || !pendingReview || !destination) return;

        // setIsDeletingOldReview(true);

        // try {
        //     // Delete old review
        //     await axios.delete(`/api/v1/reviews/${oldReviewId}`);

        //     // Submit new review
        //     await axios.post("/api/v1/reviews", {
        //         destination_id: destination.id,
        //         rating: pendingReview.rating,
        //         body: pendingReview.body,
        //     });

        //     // Refresh destination data
        //     const res = await axios.get(`/api/v1/destinations/${id}`);
        //     setDestination(res.data);

        //     // Close dialog and clear state
        //     setfeedbackOpen(false);
        //     setPendingReview(null);
        //     setOldReviewId(null);

        //     // Show success message (optional)
        //     // alert("Review updated successfully!");
        // } catch (error) {
        //     console.error("Error updating review:", error);
        //     alert("Failed to update review. Please try again.");
        // } finally {
        //     setIsDeletingOldReview(false);
        // }
    };

    const closeErrorDialog = () => {
        setfeedbackOpen(false);
        setPendingReview(null);
        setfeedback("");
        setOldReviewId(null);
    };

    // const handleUpload = async () => {
    //     if (!file) return;
    //     if (!destination) return;

    //     setLoading(true);

    //     try {
    //         const media = await uploadToCloudinary({
    //             file,
    //             modelType: "destination",
    //             modelId: destination.id,
    //             collection: "gallery",
    //             isCover: true,
    //         });

    //         setImageUrl(media.secure_url);
    //     } catch (err) {
    //         console.error("Upload failed:", err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    if (!loading && !destination) {
        notFound();
    }

    return (
        <div className={styles.container}>
            <ConfirmDialog
                open={feedbackOpen}
                theme={feedbackTheme}
                title={t("review_title")}
                message={feedback}
                confirmLabel={t("review_confirm")}
                cancelLabel={t("review_cancel")}
                loading={isDeletingOldReview}
                onConfirm={closeErrorDialog}
                onCancel={closeErrorDialog}
            />
            <ImageShowcase
                images={mediaUrls}
                open={showcaseOpen}
                onClose={() => setShowcaseOpen(false)}
            />
            {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">{t("loading")}</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className={styles.imageGrid}>
                        <div className={`${styles.first} relative`}>
                            {coverImage ? (
                                <Image
                                    src={coverImage}
                                    alt={coverImage}
                                    width={1000}
                                    height={1000}
                                    placeholder="blur"
                                    blurDataURL={BLUR}
                                />
                            ) : (
                                <Image
                                    src="https://placehold.net/600x600.png"
                                    alt={t("placeholder_alt")}
                                    width={1000}
                                    height={1000}
                                />
                            )}
                        </div>
                        <div className={`${styles.rest}`}>
                            <div className={`${styles.image}`}>
                                {destination?.media &&
                                destination.media.length > 1 ? (
                                    <Image
                                        src={destination.media[1].secure_url}
                                        alt={destination.name}
                                        width={1000}
                                        height={1000}
                                        placeholder="blur"
                                        blurDataURL={BLUR}
                                    />
                                ) : (
                                    <Image
                                        src="https://placehold.net/600x600.png"
                                        alt={t("placeholder_alt")}
                                        width={1000}
                                        height={1000}
                                    />
                                )}
                            </div>
                            <div className={`${styles.image}`}>
                                {destination?.media &&
                                destination.media.length > 2 ? (
                                    <Image
                                        src={destination.media[2].secure_url}
                                        alt={destination.name}
                                        width={1000}
                                        height={1000}
                                        placeholder="blur"
                                        blurDataURL={BLUR}
                                    />
                                ) : (
                                    <Image
                                        src="https://placehold.net/600x600.png"
                                        alt={t("placeholder_alt")}
                                        width={1000}
                                        height={1000}
                                    />
                                )}
                            </div>
                            <div className={`${styles.image}`}>
                                {destination?.media &&
                                destination.media.length > 3 ? (
                                    <Image
                                        src={destination.media[3].secure_url}
                                        alt={destination.name}
                                        width={1000}
                                        height={1000}
                                        placeholder="blur"
                                        blurDataURL={BLUR}
                                    />
                                ) : (
                                    <Image
                                        src="https://placehold.net/600x600.png"
                                        alt={t("placeholder_alt")}
                                        width={1000}
                                        height={1000}
                                    />
                                )}
                            </div>
                            <div className={`${styles.image} ${styles.last}`}>
                                {destination?.media &&
                                destination.media.length > 4 ? (
                                    <>
                                        <Image
                                            src={
                                                destination.media[4].secure_url
                                            }
                                            alt=""
                                            width={1000}
                                            height={1000}
                                            className="object-cover"
                                            placeholder="blur"
                                            blurDataURL={BLUR}
                                        />

                                        {destination.media.length > 5 && (
                                            <button
                                                className={styles.moreImages}
                                                onClick={() =>
                                                    setShowcaseOpen(true)
                                                }
                                            >
                                                + {destination.media.length - 5}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <Image
                                        src="https://placehold.net/600x600.png"
                                        alt={t("placeholder_alt")}
                                        width={1000}
                                        height={1000}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={`${styles.details}`}>
                        <div className={`${styles.start}`}>
                            <div className={styles.about}>
                                <h1 className="flex items-center gap-4">
                                    <BadgeInfo className="text-(--primary-clr)" />{" "}
                                    {t("about")}
                                </h1>
                                <p>{destination?.description}</p>
                            </div>

                            <div className={styles.highlights}>
                                {destination?.tags?.map((tag) => (
                                    <Link
                                        href="/"
                                        key={tag}
                                        className={`${styles.tag}`}
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>

                            <div className={styles.reviews}>
                                <Reviews
                                    reviews={destination?.reviews}
                                    onSubmit={handleAddReview}
                                />
                            </div>
                        </div>
                        <div className={`${styles.end}`}>
                            <h1>
                                {t("about")} {destination?.name}
                            </h1>
                            <div className={styles.map}>
                                <Map
                                    destinations={
                                        destination ? [destination] : []
                                    }
                                    zoom={13}
                                    onDestinationClick={(dest) => {
                                        // Optional: handle click if needed
                                        console.log("Clicked:", dest.name);
                                    }}
                                />
                            </div>
                            <div className={styles.additional}>
                                <div className={styles.info}>
                                    <div className={styles.icon}>
                                        <Clock className="text-(--light-fg) w-6 h-6" />
                                    </div>
                                    <div>
                                        <h1>{t("opening_hours")}</h1>
                                        <p className="text-[0.9rem] font-bold">
                                            {t("opening_hours_value")}
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.info}>
                                    <div className={styles.icon}>
                                        <Phone
                                            className="text-(--light-fg)"
                                            size={24}
                                        />
                                    </div>
                                    <div>
                                        <h1>{t("contact")}</h1>
                                        <p className="text-[0.9rem] font-bold">
                                            {t("contact_value")}
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.info}>
                                    <div className={styles.icon}>
                                        <Landmark className="text-(--light-fg) w-6 h-6" />
                                    </div>
                                    <div>
                                        <h1>{t("facilities")}</h1>
                                        <p className="text-[0.9rem] font-bold">
                                            {t("facilities_value")}
                                        </p>
                                    </div>
                                </div>
                                <button className="p-4 flex justify-center items-center gap-4 w-full bg-(--primary-clr) text-white rounded-full">
                                    <CirclePlus />
                                    {t("add_to_trip")}
                                </button>
                                <button className="p-4 flex justify-center items-center gap-4 w-full text-(--light-fg) bg-[#00000015] rounded-full">
                                    <Share2 className="text-(--light-fg) w-6 h-6" />{" "}
                                    {t("share")}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
