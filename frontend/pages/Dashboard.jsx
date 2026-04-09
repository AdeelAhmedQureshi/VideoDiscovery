import { Video, History } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UploadSection } from "@/Components/UploadSection";
import AnalyticsPanel from "@/Components/Analysis";
import { RecommendationsSection } from "@/Components/RecommendationsSection";
import { UserAvatar } from "./../src/Components/UserAvatar";
import { useEffect, useState } from "react";
import { waitForBackendReady } from "../Services/BackendStatusApi";
export const Dashboard = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [backendReady, setBackendReady] = useState(false);
    const [checkingBackend, setCheckingBackend] = useState(true);
    const [backendError, setBackendError] = useState("");

    const verifyBackendReadiness = async () => {
        setCheckingBackend(true);
        setBackendError("");

        const result = await waitForBackendReady({
            maxWaitMs: 120000,
            pollIntervalMs: 2500,
            requestTimeoutMs: 3000,
        });

        if (result.ready) {
            setBackendReady(true);
            setBackendError("");
        } else {
            setBackendReady(false);
            setBackendError("Network error: backend is not reachable. Please check if the server is running.");
        }

        setCheckingBackend(false);
    };

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

    useEffect(() => {
        verifyBackendReadiness();
    }, []);

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

            <main className="mt-20 space-y-2 sm:space-y-4">
                {checkingBackend && (
                    <section className="min-h-[55vh] flex items-center justify-center px-4">
                        <div className="max-w-xl w-full rounded-2xl border border-cyan-200 bg-cyan-50/80 px-6 py-8 text-center shadow-sm">
                            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-500" />
                            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-cyan-700">System Initialization</p>
                            <h2 className="mt-1 text-xl font-bold text-cyan-900">Preparing AI Services</h2>
                            <p className="mt-2 text-sm sm:text-base text-cyan-800 leading-relaxed">
                                Core inference services are warming up. Dashboard insights will appear automatically once all services are available.
                            </p>
                            <p className="mt-3 text-xs sm:text-sm text-cyan-700/90">
                                This usually takes a moment after server startup.
                            </p>
                        </div>
                    </section>
                )}

                {!checkingBackend && backendError && (
                    <section className="min-h-[55vh] flex items-center justify-center px-4">
                        <div className="max-w-xl w-full rounded-2xl border border-rose-200 bg-rose-50/90 px-6 py-8 text-center shadow-sm">
                            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-rose-700">Connection Issue</p>
                            <h2 className="mt-1 text-xl font-bold text-rose-900">Unable to Reach Backend Services</h2>
                            <p className="mt-2 text-sm sm:text-base text-rose-800 leading-relaxed">{backendError}</p>
                            <button
                                onClick={verifyBackendReadiness}
                                className="mt-5 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
                            >
                                Retry Connection
                            </button>
                        </div>
                    </section>
                )}

                {!checkingBackend && backendReady && (
                    <>
                        <section id="analytics">
                            <AnalyticsPanel />
                        </section>

                        <section id="uploadsection" className="scroll-mt-24">
                            <UploadSection />
                        </section>

                        <section id="recommendationsection" className="scroll-mt-24">
                            <RecommendationsSection />
                        </section>
                    </>
                )}
            </main>
        </>
    );
};
