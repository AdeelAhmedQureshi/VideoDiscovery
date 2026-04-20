import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const faqItems = [
  {
    question: "What kind of videos can I upload for analysis?",
    answer:
      "You can upload MP4, AVI, MOV videos. Our pipeline then extracts visual frames, speech, and text signals for multimodal understanding.",
  },
  {
    question: "How does VideoDiscovery find related videos?",
    answer:
      "We combine outputs from visual detection, audio transcription, and text embeddings to build a semantic profile that is used to rank highly relevant recommendations.",
  },
  {
    question: "Is my uploaded content secure?",
    answer:
      "Yes. Account access is protected, and uploaded data is handled through secure backend workflows designed to keep your content private.",
  },
  {
    question: "How long does analysis usually take?",
    answer:
      "Timing depends on video length and server load, but the system is optimized for fast turnaround so you can move quickly from upload to discovery.",
  },
  {
    question: "Do I need technical knowledge to use the platform?",
    answer:
      "No. The interface is designed for a simple flow: upload, analyze, and explore recommendations with clear visual feedback.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delayChildren: 0.05,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: "easeOut" },
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

  return (
    <section
      id="faq"
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfb_44%,#f8fbff_100%)]"
    >
      <div id="howitworks" className="bg-[linear-gradient(145deg,#f2fcfa_0%,#f6fbff_58%,#ffffff_100%)] rounded-3xl p-6 sm:p-10 lg:p-12 mb-16 mx-4 sm:mx-6 border border-slate-200/70 shadow-[0_24px_56px_-30px_rgba(15,23,42,0.25)]">
        <motion.div
          className="text-center mb-10 sm:mb-16"
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
                Frequently Asked Questions
            </motion.h1>
            <motion.div
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 rounded-full blur-sm transition-all duration-500 peer-hover:blur-md peer-hover:h-1.5 peer-hover:opacity-80"
              variants={headingVariants}
            ></motion.div>
          </div>
        </motion.div>

        <motion.div
          className="space-y-3 sm:space-y-4 max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={containerVariants}
        >
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={item.question}
                className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_16px_36px_-24px_rgba(15,23,42,0.38)] overflow-hidden"
                variants={itemVariants}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left hover:bg-slate-50/80 transition-colors duration-200"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="text-base sm:text-lg font-semibold text-slate-900">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 sm:w-6 sm:h-6 text-teal-600 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                <motion.div
                  id={`faq-answer-${index}`}
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-slate-600 leading-relaxed">{item.answer}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}