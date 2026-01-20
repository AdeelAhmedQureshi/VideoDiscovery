import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";

import { Header } from "./Components/Navbar";
import { Documentation } from "../pages/Documentation";
import { Hero } from "./Components/HeroSection";
import { Features } from "./Components/Features";
import { HowItWorks } from "./Components/HowitWorks";
import { Footer } from "./Components/Footer";
import {Dashboard} from "../pages/Dashboard";
import Auth from "../pages/Auth";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">

          {/* Navbar */}
          <Header>

          </Header>

          {/* Routes */}
          <main className="flex-1">
            <Routes>
              {/* Home page */}
              <Route
                path="/"
                element={
                  <>
                    <Hero />
                    <Features />
                    <HowItWorks />
                  </>
                }
              />

              {/* Auth page (optional) */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
