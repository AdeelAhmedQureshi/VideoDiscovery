import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "../contexts/AuthContext";
import { Toaster } from "sonner";
import { Header } from "./Components/Navbar";
import { Documentation } from "../pages/Documentation";
import { Hero } from "./Components/HeroSection";
import { Features } from "./Components/Features";
import { HowItWorks } from "./Components/HowitWorks";
import { FAQSection } from "./Components/FAQSection";
import { Footer } from "./Components/Footer";
import { Dashboard } from "../pages/Dashboard";
import { ProtectedRoute } from "./Components/ProtectedRoutes";
import Auth from "../pages/Auth";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Account from "../pages/Account";
import History from "../pages/History";
import Help from "../pages/Help";
import NotFound from "../pages/NotFound";
import Recommendation from "../pages/VideoRecommendation.jsx";
const ScrollToHash = () => {
  const location = useLocation();

  useEffect(() => {
    const targetId =
      location.state?.scrollTo ??
      (location.hash ? location.hash.replace("#", "") : null);

    if (!targetId) {
      return;
    }

    const element = document.getElementById(targetId);

    if (!element) {
      return;
    }

    setTimeout(() => {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }, [location]);

  return null;
};

export default function App() {
  return (
    <Router>
      <Toaster richColors position="top-right" />
      <ScrollToHash />
      <AuthProvider>
        <div className="app-shell flex flex-col">
          {/* Public routes */}
          <main className="flex-1">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Header />
                    <Hero />
                    <Features />
                    <HowItWorks />
                    <FAQSection />
                  </>
                }
              />

              {/* Auth page */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/help" element={<Help />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendations/:videoId"
                element={
                  <ProtectedRoute>
                    <Recommendation />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>



          </main>

          {/* Footer */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
