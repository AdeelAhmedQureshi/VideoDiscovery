import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { Toaster } from "sonner";
import { Header } from "./Components/Navbar";
import { Documentation } from "../pages/Documentation";
import { Hero } from "./Components/HeroSection";
import { Features } from "./Components/Features";
import { HowItWorks } from "./Components/HowitWorks";
import { Footer } from "./Components/Footer";
import { Dashboard } from "../pages/Dashboard";
import { ProtectedRoute } from "./Components/ProtectedRoutes";
import Auth from "../pages/Auth";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Account from "../pages/Account";
import History from "../pages/History";
export default function App() {
  return (
    <Router>
      <Toaster richColors position="top-right" />
      <AuthProvider>
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
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
                  </>
                }
              />

              {/* Auth page */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/documentation" element={<Documentation />} />
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
            </Routes>
            

          </main>

          {/* Footer */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
