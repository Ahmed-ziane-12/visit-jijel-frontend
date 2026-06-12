// components/UploadModal/UploadModal.tsx

"use client";

import { useState, useRef, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { uploadToCloudinary } from "@/lib/upload";
import styles from "./UploadModal.module.css";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    modelType: string;
    modelId: number;
    collection: string;
    isCover: boolean;
    onUploadSuccess?: (url: string) => void;
    onUploadError?: (error: Error) => void;
    acceptedFileTypes?: string;
    maxSize?: number; // in MB
}

export default function UploadModal({
    isOpen,
    onClose,
    modelType,
    modelId,
    collection,
    isCover,
    onUploadSuccess,
    onUploadError,
    acceptedFileTypes = "image/jpeg,image/png,image/webp,image/jpg",
    maxSize = 5, // 5MB default
}: UploadModalProps) {
    const t = useTranslations("upload");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFile: File) => {
        setError(null);

        // Validate file type
        if (!acceptedFileTypes.includes(selectedFile.type)) {
            setError(t("invalid_type", { types: acceptedFileTypes }));
            return;
        }

        // Validate file size
        if (selectedFile.size > maxSize * 1024 * 1024) {
            setError(t("too_large", { size: maxSize }));
            return;
        }

        setFile(selectedFile);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const media = await uploadToCloudinary({
                file,
                modelType,
                modelId,
                collection,
                isCover,
            });

            if (onUploadSuccess) {
                onUploadSuccess(media.secure_url);
            }

            onClose();
            resetModal();
        } catch (err) {
            console.error("Upload failed:", err);
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : t("failed");
            setError(errorMessage);
            if (onUploadError) {
                onUploadError(
                    err instanceof Error ? err : new Error(errorMessage),
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const resetModal = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        setDragActive(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className={styles.modalOverlay} onClick={handleClose}>
                <motion.div
                    className={styles.modalContainer}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.modalHeader}>
                        <h2 className={styles.modalTitle}>
                            {t(isCover ? "title_cover" : "title_profile")}
                        </h2>
                        <button
                            className={styles.closeButton}
                            onClick={handleClose}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className={styles.modalBody}>
                        {!preview ? (
                            <div
                                className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ""}`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={acceptedFileTypes}
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            handleFileSelect(e.target.files[0]);
                                        }
                                    }}
                                    className={styles.fileInput}
                                />
                                <Upload
                                    size={48}
                                    className={styles.uploadIcon}
                                />
                                <p className={styles.uploadText}>
                                    {t("drag_text")}
                                </p>
                                <p className={styles.uploadHint}>
                                    {t("hint_text", { size: maxSize })}
                                </p>
                            </div>
                        ) : (
                            <div className={styles.previewContainer}>
                                <img
                                    src={preview}
                                    alt={t("preview_alt")}
                                    className={styles.preview}
                                />
                                <button
                                    className={styles.changeButton}
                                    onClick={() => {
                                        setFile(null);
                                        setPreview(null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = "";
                                        }
                                    }}
                                >
                                    {t("choose_btn")}
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className={styles.errorMessage}>{error}</div>
                        )}
                    </div>

                    <div className={styles.modalFooter}>
                        <button
                            className={styles.cancelButton}
                            onClick={handleClose}
                        >
                            {t("cancel_btn")}
                        </button>
                        <button
                            className={styles.uploadButton}
                            onClick={handleUpload}
                            disabled={!file || loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className={styles.spinner}
                                    />
                                    {t("uploading")}
                                </>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    {t("upload_btn")}
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
