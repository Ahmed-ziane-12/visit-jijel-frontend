import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "@/app/[locale]/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeContextProvider } from "@/context/ThemeContext";
import { ThemeProvider } from "@/providers/ThemeProvider";
import TravelLines from "./components/TravelLine/TravelLines";
import type { Metadata } from "next";

export const metadata: Metadata = {
    icons: "/logo_s.svg",
    title: "visit Jijel",
    description: "Best Trip Planning App For Jijel",
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    return (
        <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <body>
                <ThemeContextProvider>
                    <ThemeProvider>
                        <NextIntlClientProvider>
                            <AuthProvider>
                                {/* <TravelLines /> */}
                                <div className="wrapper">{children}</div>
                            </AuthProvider>
                        </NextIntlClientProvider>
                    </ThemeProvider>
                </ThemeContextProvider>
            </body>
        </html>
    );
}
