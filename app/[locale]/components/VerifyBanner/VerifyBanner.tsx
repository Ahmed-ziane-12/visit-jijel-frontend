"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "@/lib/axios";
import { X, Loader2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

export default function VerifyBanner() {
    const t = useTranslations("verify_banner");
    const { user } = useAuth();
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    if (!user || user.email_verified_at || dismissed) return null;
    if (user.is_admin || user.is_super_admin) return null;

    const handleResend = async () => {
        setSending(true);
        try {
            await axios.post("/api/v1/email/verification-notification");
            setSent(true);
        } catch {
            // ignore
        } finally {
            setSending(false);
        }
    };

    const containerStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        padding: "0.6rem 1.25rem",
        background: "#fef3c7",
        borderBottom: "1px solid #fde68a",
        fontSize: "0.82rem",
        color: "#92400e",
        flexWrap: "wrap",
        marginTop: "clamp(56px, 6vh, 72px)",
    };

    const btnStyle: React.CSSProperties = {
        background: "#eb662b",
        color: "white",
        border: "none",
        borderRadius: "6px",
        padding: "0.3rem 0.85rem",
        fontSize: "0.78rem",
        cursor: "pointer",
        fontFamily: "inherit",
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
    };

    const closeStyle: React.CSSProperties = {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#92400e",
        opacity: 0.6,
        padding: "0.15rem",
        display: "flex",
    };

    return (
        <div style={containerStyle}>
            <Mail size={15} />
            <span>
                {sent
                    ? t("sent")
                    : t("message")}
            </span>
            {!sent && (
                <button
                    style={btnStyle}
                    onClick={handleResend}
                    disabled={sending}
                >
                    {sending ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        t("resend_btn")
                    )}
                </button>
            )}
            <button style={closeStyle} onClick={() => setDismissed(true)}>
                <X size={15} />
            </button>
        </div>
    );
}
