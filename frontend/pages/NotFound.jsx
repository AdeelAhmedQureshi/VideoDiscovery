import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_14%,rgba(20,184,166,0.13),transparent_34%),radial-gradient(circle_at_90%_0%,rgba(14,165,233,0.1),transparent_35%),linear-gradient(180deg,#f7fcfb_0%,#f7fbff_100%)] flex items-center justify-center px-6">
      <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-slate-200/70 bg-white/88 p-10 text-center shadow-[0_24px_55px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="mx-auto mb-6 inline-flex items-center justify-center rounded-2xl bg-teal-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-widest text-teal-700">
          Lost in the stream
        </div>
        <h1 className="display-font mb-3 text-6xl font-extrabold text-slate-900 sm:text-7xl">404</h1>
        <p className="mb-8 text-lg text-slate-600 sm:text-xl">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:from-teal-700 hover:to-cyan-700"
          >
            Go back home
          </a>
          <a
            href="/documentation"
            className="inline-flex items-center justify-center rounded-xl border border-teal-200 px-6 py-3 text-base font-semibold text-teal-700 transition hover:border-teal-300 hover:text-teal-800"
          >
            Read docs
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
