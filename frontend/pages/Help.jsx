import { MessageCircleQuestion, LifeBuoy, Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Help() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: "easeOut",
        delayChildren: 0.05,
        staggerChildren: 0.1,
      },
    },
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 22, scale: 0.96, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_8%_12%,rgba(20,184,166,0.1),transparent_34%),radial-gradient(circle_at_90%_0%,rgba(14,165,233,0.08),transparent_36%),linear-gradient(180deg,#ffffff_0%,#f7fbfb_48%,#f8fbff_100%)] py-16 sm:py-24 px-5 sm:px-6 mt-14">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-teal-800 mb-10 transition-colors font-semibold"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-lg font-medium">Back</span>
        </button>

        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.7 }}
          variants={containerVariants}
        >
          <div className="inline-block relative mb-4">
            <motion.h1
              className="display-font inline-block text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent bg-[length:200%_200%] transition-[background-position,filter,transform] duration-500 hover:bg-[position:100%_50%] hover:scale-[1.02] hover:drop-shadow-[0_0_14px_rgba(20,184,166,0.35)] peer"
              variants={headingVariants}
            >
              Help & Support
            </motion.h1>
            <motion.div
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 rounded-full blur-sm transition-all duration-500 peer-hover:blur-md peer-hover:h-1.5 peer-hover:opacity-80"
              variants={headingVariants}
            />
          </div>
          <motion.p className="text-base sm:text-lg text-slate-600 mt-4 sm:mt-6" variants={headingVariants}>
            Find quick answers, platform guidance, and ways to contact our support team.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={containerVariants}
        >
          <motion.div
            className="p-7 bg-white/90 rounded-2xl border border-slate-200/80 shadow-[0_18px_36px_-22px_rgba(15,23,42,0.35)]"
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-50 flex items-center justify-center mb-4">
              <MessageCircleQuestion className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Read FAQs</h3>
            <p className="text-slate-600 text-sm mb-4">Common questions about upload formats, analysis flow, and recommendations.</p>
            <a href="/#faq" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
              Go to FAQs
            </a>
          </motion.div>

          <motion.div
            className="p-7 bg-white/90 rounded-2xl border border-slate-200/80 shadow-[0_18px_36px_-22px_rgba(15,23,42,0.35)]"
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 to-sky-50 flex items-center justify-center mb-4">
              <LifeBuoy className="w-7 h-7 text-cyan-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Use Documentation</h3>
            <p className="text-slate-600 text-sm mb-4">Step-by-step usage guidance to start quickly and use all key features.</p>
            <a href="/documentation" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
              Open Documentation
            </a>
          </motion.div>

          <motion.div
            className="p-7 bg-white/90 rounded-2xl border border-slate-200/80 shadow-[0_18px_36px_-22px_rgba(15,23,42,0.35)]"
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-50 flex items-center justify-center mb-4">
              <Mail className="w-7 h-7 text-sky-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Contact Support</h3>
            <p className="text-slate-600 text-sm mb-4">Need help with your account or recommendations? Reach us directly by email.</p>
            <a href="mailto:contact@videodiscovery.com" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
              contact@videodiscovery.com
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}