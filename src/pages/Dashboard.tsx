import { ArrowUpRight, ArrowDownRight, Package, Truck, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', loaded: 4000, unloaded: 2400 },
  { name: 'Tue', loaded: 3000, unloaded: 1398 },
  { name: 'Wed', loaded: 2000, unloaded: 9800 },
  { name: 'Thu', loaded: 2780, unloaded: 3908 },
  { name: 'Fri', loaded: 1890, unloaded: 4800 },
  { name: 'Sat', loaded: 2390, unloaded: 3800 },
  { name: 'Sun', loaded: 3490, unloaded: 4300 },
];

const stats = [
  { name: 'Bags Loaded Today', value: '12,403', change: '+14%', trend: 'up', icon: Package, color: 'text-brand-500' },
  { name: 'Bags Unloaded Today', value: '8,234', change: '-2%', trend: 'down', icon: Package, color: 'text-slate-500' },
  { name: 'Active Wagons', value: '42', change: '+8%', trend: 'up', icon: Truck, color: 'text-amber-500' },
  { name: 'Detection Accuracy', value: '99.8%', change: '+0.1%', trend: 'up', icon: Activity, color: 'text-emerald-500' },
];

const activeWagons = [
  { id: 'WG-7782', trainId: 'TR-102', status: 'Loading', count: 450, time: '2 mins ago' },
  { id: 'WG-3391', trainId: 'TR-102', status: 'Unloading', count: 120, time: '5 mins ago' },
  { id: 'WG-8840', trainId: 'TR-105', status: 'Idle', count: 0, time: '12 mins ago' },
  { id: 'WG-1102', trainId: 'TR-105', status: 'Loading', count: 890, time: 'Just now' },
];

const activities = [
  { id: 1, type: 'Load', wagon: 'WG-1102', time: 'Just now', score: 0.99 },
  { id: 2, type: 'Load', wagon: 'WG-1102', time: '2 sec ago', score: 0.98 },
  { id: 3, type: 'Unload', wagon: 'WG-3391', time: '15 sec ago', score: 0.97 },
  { id: 4, type: 'Load', wagon: 'WG-7782', time: '1 min ago', score: 0.99 },
  { id: 5, type: 'Unload', wagon: 'WG-3391', time: '2 min ago', score: 0.96 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: Today, 14:32
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.name}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Activity (Last 7 Days)</h2>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLoaded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUnloaded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="loaded" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorLoaded)" name="Loaded" />
                <Area type="monotone" dataKey="unloaded" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorUnloaded)" name="Unloaded" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Live Feed
            </h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto min-h-[300px]">
            <div className="space-y-4">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="w-10 h-10 rounded bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {/* Placeholder for actual detection thumbnail */}
                    <Package className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Bag {act.type === 'Load' ? 'Loaded' : 'Unloaded'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {act.wagon} • Conf: {(act.score * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {act.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Wagons Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Active Wagons</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-medium">Wagon ID</th>
                <th className="px-6 py-4 font-medium">Train ID</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Bags Counted</th>
                <th className="px-6 py-4 font-medium">Last Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {activeWagons.map((wagon) => (
                <tr key={wagon.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => window.location.href = `/wagons/${wagon.id}`}>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {wagon.id}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {wagon.trainId}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${wagon.status === 'Loading' ? 'bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-300' : 
                        wagon.status === 'Unloading' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' : 
                        'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {wagon.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-slate-300">
                    {wagon.count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {wagon.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
