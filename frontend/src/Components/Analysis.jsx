import { Video, Brain, MessageSquare, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardStats() {
  const stats = [
    {
      title: "Total Videos",
      value: "24",
      icon: <Video size={28} />,
      color: "from-cyan-500 to-teal-400",
      hoverBorder: "hover:border-cyan-200",
    },
    {
      title: "AI Recommendations",
      value: "156",
      icon: <Brain size={28} />,
      color: "from-indigo-500 to-purple-400",
      hoverBorder: "hover:border-indigo-400",
    },
    {
      title: "Feedback Submitted",
      value: "89",
      icon: <MessageSquare size={28} />,
      color: "from-pink-500 to-rose-400",
      hoverBorder: "hover:border-pink-400",
    },
    {
      title: "Avg Rating",
      value: "4.8",
      icon: <Star size={28} />,
      color: "from-yellow-500 to-orange-400",
      hoverBorder: "hover:border-yellow-400",
    },
  ];

  // Same animation style as Hero text
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 40,
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: i * 0.15,
      },
    }),
  };

  return (
    <section className="h-60 bg-gradient-to-br from-cyan-50 to-slate-100 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
        >
          {stats.map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
              className={`
                relative overflow-hidden rounded-2xl
                bg-white/70 backdrop-blur-lg
                shadow-md p-6
                border border-transparent ${item.hoverBorder}
              `}
            >
              {/* Glow */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${item.color}`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.18 }}
                transition={{ duration: 0.3 }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col gap-5">
                <div
                  className={`w-fit p-3 rounded-xl text-white bg-gradient-to-br ${item.color} shadow-md`}
                >
                  {item.icon}
                </div>

                <h2 className="text-3xl font-bold text-gray-800">
                  {item.value}
                </h2>

                <p className="text-sm font-medium text-gray-600">
                  {item.title}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
