import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-6">
      <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-pink-200/40 blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/60 bg-white/80 p-10 text-center shadow-xl backdrop-blur">
        <div className="mx-auto mb-6 inline-flex items-center justify-center rounded-2xl bg-cyan-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-widest text-cyan-700">
          Lost in the stream
        </div>
        <h1 className="mb-3 text-6xl font-extrabold text-gray-900 sm:text-7xl">404</h1>
        <p className="mb-8 text-lg text-gray-600 sm:text-xl">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-cyan-600"
          >
            Go back home
          </a>
          <a
            href="/documentation"
            className="inline-flex items-center justify-center rounded-xl border border-cyan-200 px-6 py-3 text-base font-semibold text-cyan-700 transition hover:border-cyan-300 hover:text-cyan-800"
          >
            Read docs
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
