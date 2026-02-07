import { Video, History } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UploadSection } from "@/Components/UploadSection";
import AnalyticsPanel from "@/Components/Analysis";
import { RecommendationsSection } from "@/Components/RecommendationsSection";
import { UserAvatar } from "./../src/Components/UserAvatar";
import { useEffect, useState } from "react";
export const Dashboard = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (location.hash) {
            const element = document.querySelector(location.hash);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }, 100); // DOM render delay fix
            }
        }
    }, [location]);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 h-22 flex items-center">
                <style>{`
                    .nav-link {
                        transition: color 0.2s, box-shadow 0.2s;
                    }
                    .nav-link:hover {
                        color: #0ea5e9;
                        box-shadow: 0 2px 0 0 #0ea5e9;
                    }
                    .logo-link {
                        transition: color 0.2s;
                    }
                    .logo-link:hover {
                        color: #0ea5e9;
                    }
                `}</style>
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer logo-link" onClick={() => { navigate('/') }}>
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-400 to-cyan-500 flex items-center justify-center shadow-md">
                                <Video className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-2xl text-gray-900">VideoDiscovery</span>
                        </div>
                        {/* Navigation */}
                        <nav className="hidden md:flex items-center gap-10">
                            <a
                                href="/"
                                className="text-lg font-semibold text-gray-600 nav-link"
                            >
                                Home
                            </a>
                            <a
                                href="/"
                                onClick={(event) => {
                                    event.preventDefault();
                                    navigate("/", { state: { scrollTo: "features-section" } });
                                }}
                                className="text-lg font-semibold text-gray-600 nav-link"
                            >
                                Features
                            </a>

                            <a
                                href="/documentation"
                                className="text-lg font-semibold text-gray-600 nav-link"
                            >
                                Documentation
                            </a>


                        </nav>

                        {/* User Avatar */}
                        <div className="hidden md:flex items-center gap-4">

                            {/* History Icon */}
                            <button
                                onClick={() => navigate("/history")}
                                className="p-2 rounded-xl hover:bg-gray-100 transition group"
                                title="View History"
                            >
                                <History className="w-9 h-9 text-gray-600 mr-5 group-hover:text-cyan-500 transition" />
                            </button>

                            {/* User Avatar */}
                            <UserAvatar />
                        </div>

                        <button
                            type="button"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:text-cyan-600 hover:border-cyan-200 transition"
                            aria-label="Toggle navigation"
                        >
                            {menuOpen ? (
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18" />
                                    <path d="M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 6h16" />
                                    <path d="M4 12h16" />
                                    <path d="M4 18h16" />
                                </svg>
                            )}
                        </button>

                    </div>
                </div>
                {menuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
                        <div className="container mx-auto px-4 sm:px-6 py-4 space-y-3">
                            <button
                                onClick={() => {
                                    navigate("/");
                                    setMenuOpen(false);
                                }}
                                className="w-full text-left text-base font-semibold text-gray-700 hover:text-cyan-600"
                            >
                                Home
                            </button>
                            <button
                                onClick={() => {
                                    navigate("/", { state: { scrollTo: "features-section" } });
                                    setMenuOpen(false);
                                }}
                                className="w-full text-left text-base font-semibold text-gray-700 hover:text-cyan-600"
                            >
                                Features
                            </button>
                            <button
                                onClick={() => {
                                    navigate("/documentation");
                                    setMenuOpen(false);
                                }}
                                className="w-full text-left text-base font-semibold text-gray-700 hover:text-cyan-600"
                            >
                                Documentation
                            </button>
                            <button
                                onClick={() => {
                                    navigate("/history");
                                    setMenuOpen(false);
                                }}
                                className="w-full text-left text-base font-semibold text-gray-700 hover:text-cyan-600"
                            >
                                History
                            </button>

                            <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                                <button
                                    onClick={() => {
                                        navigate("/account");
                                        setMenuOpen(false);
                                    }}
                                    className="text-base font-semibold text-gray-700 hover:text-cyan-600"
                                >
                                    Account
                                </button>
                                <button
                                    onClick={() => {
                                        signOut();
                                        setMenuOpen(false);
                                    }}
                                    className="text-base font-semibold text-red-600 hover:text-red-700"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main className="mt-20 space-y-16 sm:space-y-24">
                <section id="analytics">
                    <AnalyticsPanel />
                </section>

                {/* 👇 VERY IMPORTANT */}
                <section id="uploadsection" className="scroll-mt-24">
                    <UploadSection />
                </section>

                <section id="recommendationsection" className="scroll-mt-24">
                    <RecommendationsSection />
                </section>
            </main>
        </>
    );
};
