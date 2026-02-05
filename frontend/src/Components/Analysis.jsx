import { Video, Brain, MessageSquare, Star } from "lucide-react";

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
      hoverBorder: "hover:border-indigo-200",
    },
    {
      title: "Feedback Submitted",
      value: "89",
      icon: <MessageSquare size={28} />,
      color: "from-pink-500 to-rose-400",
      hoverBorder: "hover:border-pink-200",
    },
    {
      title: "Avg Rating",
      value: "4.8",
      icon: <Star size={28} />,
      color: "from-yellow-500 to-orange-400",
      hoverBorder: "hover:border-yellow-200",
    },
  ];

  return (
    <div className="h-[200px] bg-gradient-to-br from-cyan-50 to-slate-100 p-6 flex items-center justify-center cursor-pointer ">
      <div className="grid gap-6 grid-cols-4  mt-20 max-w-10xl ">
        {stats.map((item, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-lg shadow-md transition-all duration-300 p-6 hover:-translate-y-4 border border-transparent hover:border-[3px] ${item.hoverBorder}`}
          >
            {/* gradient glow */}
            <div
              className={`absolute inset-0 opacity-0 bg-gradient-to-br ${item.color} transition duration-300`}
            />

            {/* content */}
            <div className="relative z-10 flex flex-col items-start gap-5 ">
              <div
                className={`p-3 rounded-xl text-white bg-gradient-to-br ${item.color} shadow-md`}
              >
                {item.icon}
              </div>

              <h1 className="text-3xl font-bold text-gray-800">
                {item.value}
              </h1>

              <p className="text-gray-600 text-sm font-medium">
                {item.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
