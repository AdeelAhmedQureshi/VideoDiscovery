import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Video, Users, TrendingUp } from 'lucide-react';

const analyticsData = [
  { name: 'Jan', uploads: 12 },
  { name: 'Feb', uploads: 18 },
  { name: 'Mar', uploads: 9 },
  { name: 'Apr', uploads: 15 },
  { name: 'May', uploads: 20 },
];

export default function AnalyticsPanel({ totalVideos = 25, totalViews = 1200, aiInsights = 5 }) {
  return (
    <div className="container mx-auto px-4 py-6 ">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 justify-center">
        {/* Total Videos */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex items-center gap-4 max-w-sm w-full mx-auto">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center text-white shrink-0">
            <Video className="w-7 h-7" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Videos</p>
            <p className="text-2xl font-bold text-gray-900">{totalVideos}</p>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex items-center gap-4 max-w-sm w-full mx-auto">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center text-white shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Views</p>
            <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex items-center gap-4 max-w-sm w-full mx-auto">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center text-white shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">AI Insights</p>
            <p className="text-2xl font-bold text-gray-900">{aiInsights}</p>
          </div>
        </div>
      </div>


      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 mt-8  flex justify-center items-center flex-col">
        <p className="text-gray-700 font-medium mb-4 text-base">
          Uploads Over Time
        </p>

        <div className="w-[800px] h-[300px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              <Bar dataKey="uploads" fill="url(#colorUv)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
