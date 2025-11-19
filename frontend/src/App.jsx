import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";

import { Header } from "./Components/Navbar";
import { Documentation } from "../pages/Documentation";
import { Hero } from "./Components/HeroSection";
import { Features } from "./Components/Features";
import { UploadSection } from "./Components/UploadSection";
import { HowItWorks } from "./Components/HowitWorks";
import { RecommendationsSection } from "./Components/RecommendationsSection";
import { Footer } from "./Components/Footer";

import Auth from "../pages/Auth";

// Clerk imports
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">

          {/* Navbar */}
          <Header>
            {/* Replace Sign In / Sign Out buttons with Clerk components */}
            {/* <div className="ml-auto flex items-center gap-3">
              <SignedOut>
                <SignInButton>
                  <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg">
                    Sign In 2
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <UserButton />
              </SignedIn>
            </div> */}
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
                    <UploadSection />
                    <HowItWorks/>
                    <RecommendationsSection />
                  </>
                }
              />

              {/* Auth page (optional) */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/documentation" element={<Documentation />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
