import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import TravelLines from "../components/TravelLine/TravelLines";
import VerifyBanner from "../components/VerifyBanner/VerifyBanner";
import styles from "./page.module.css";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <VerifyBanner />

            <div className="wrapper">{children}</div>
            <Footer />
        </>
    );
}
