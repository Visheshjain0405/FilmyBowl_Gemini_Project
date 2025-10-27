import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, FileText, Edit3, Users, Calendar, Clock, Target, Zap } from 'lucide-react';

const Dashboard = () => {
  // Dummy data for charts
  const dailyArticleData = [
    { date: 'Mon', articles: 12, words: 4500 },
    { date: 'Tue', articles: 18, words: 6200 },
    { date: 'Wed', articles: 15, words: 5800 },
    { date: 'Thu', articles: 22, words: 8100 },
    { date: 'Fri', articles: 28, words: 9800 },
    { date: 'Sat', articles: 16, words: 5500 },
    { date: 'Sun', articles: 8, words: 2800 }
  ];

  const monthlyData = [
    { month: 'Jan', articles: 245, rewritten: 180 },
    { month: 'Feb', articles: 285, rewritten: 220 },
    { month: 'Mar', articles: 325, rewritten: 280 },
    { month: 'Apr', articles: 380, rewritten: 310 },
    { month: 'May', articles: 420, rewritten: 350 },
    { month: 'Jun', articles: 460, rewritten: 390 }
  ];

  const categoryData = [
    { name: 'Technology', value: 35, color: '#6366f1' },
    { name: 'Business', value: 25, color: '#8b5cf6' },
    { name: 'Health', value: 20, color: '#06b6d4' },
    { name: 'Lifestyle', value: 12, color: '#10b981' },
    { name: 'Sports', value: 8, color: '#f59e0b' }
  ];

  const performanceData = [
    { time: '00:00', cpu: 45, memory: 62 },
    { time: '04:00', cpu: 52, memory: 58 },
    { time: '08:00', cpu: 78, memory: 72 },
    { time: '12:00', cpu: 85, memory: 81 },
    { time: '16:00', cpu: 72, memory: 69 },
    { time: '20:00', cpu: 58, memory: 64 }
  ];

  const stats = [
    {
      title: 'Total Articles Fetched',
      value: '2,847',
      change: '+12.5%',
      changeType: 'positive',
      icon: FileText,
      color: 'indigo'
    },
    {
      title: 'Words Generated',
      value: '1.2M',
      change: '+18.2%',
      changeType: 'positive',
      icon: Edit3,
      color: 'purple'
    },
    {
      title: 'Active Users',
      value: '456',
      change: '+5.1%',
      changeType: 'positive',
      icon: Users,
      color: 'cyan'
    },
    {
      title: 'Daily Average',
      value: '127',
      change: '-2.4%',
      changeType: 'negative',
      icon: TrendingUp,
      color: 'green'
    }
  ];

  const StatCard = ({ stat }) => {
    const Icon = stat.icon;
    const colorClasses = {
      indigo: 'bg-indigo-500 text-indigo-100',
      purple: 'bg-purple-500 text-purple-100',
      cyan: 'bg-cyan-500 text-cyan-100',
      green: 'bg-green-500 text-green-100'
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
          <div className={`text-sm font-semibold ${
            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            {stat.change}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your content.</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Last 7 days</span>
                </div>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors duration-200">
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Articles Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Daily Article Fetching</h3>
                <p className="text-sm text-gray-600">Articles fetched per day this week</p>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">Real-time</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyArticleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area type="monotone" dataKey="articles" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Words Generated Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Words Generated</h3>
                <p className="text-sm text-gray-600">Total words generated daily</p>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-xs text-gray-500">High activity</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyArticleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="words" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lower Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Performance */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Monthly Performance</h3>
                <p className="text-sm text-gray-600">Articles vs Rewritten articles comparison</p>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-xs text-gray-500">Target: 500/month</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line type="monotone" dataKey="articles" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="rewritten" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Article Categories</h3>
                <p className="text-sm text-gray-600">Distribution by category</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'Article fetched', title: 'AI Revolution in Healthcare', time: '2 mins ago', status: 'success' },
              { action: 'Article rewritten', title: 'Future of Remote Work', time: '5 mins ago', status: 'success' },
              { action: 'Batch processing', title: '15 articles processed', time: '12 mins ago', status: 'processing' },
              { action: 'Article fetched', title: 'Cryptocurrency Trends 2024', time: '18 mins ago', status: 'success' },
              { action: 'User joined', title: 'New team member added', time: '1 hour ago', status: 'info' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'processing' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.title}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;