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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-50 w-250 justify-center ml-68">
      {/* Total Videos */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-linear-to-br from-cyan-400 to-cyan-500 flex items-center justify-center text-white">
          <Video className="w-6 h-6" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Total Videos</p>
          <p className="text-2xl font-bold text-gray-900">{totalVideos}</p>
        </div>
      </div>

      {/* Total Views */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-linear-to-br from-cyan-400 to-cyan-500 flex items-center justify-center text-white">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Total Views</p>
          <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-linear-to-br from-cyan-400 to-cyan-500 flex items-center justify-center text-white">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">AI Insights</p>
          <p className="text-2xl font-bold text-gray-900">{aiInsights}</p>
        </div>
      </div>

      {/* Uploads Over Time Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 col-span-1 md:col-span-3 mt-6">
        <p className="text-gray-700 font-medium mb-3">Uploads Over Time</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={analyticsData}>
            <XAxis dataKey="name" stroke="#8884d8" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="uploads" fill="url(#colorUv)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
