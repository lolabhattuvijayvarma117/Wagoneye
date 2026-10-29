import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Package } from 'lucide-react';


const events = [
  { id: 1, type: 'Load', time: '11:02:45', score: 0.99, image: null },
  { id: 2, type: 'Load', time: '11:02:42', score: 0.98, image: null },
  { id: 3, type: 'Load', time: '11:02:38', score: 0.95, image: null },
  { id: 4, type: 'Load', time: '11:02:35', score: 0.97, image: null },
  { id: 5, type: 'Load', time: '11:02:31', score: 0.99, image: null },
];

export default function WagonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wagon {id}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-300">
              Loading
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> TR-102</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Arrived: 09:45 AM</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart & Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Counted</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">450</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Session Duration</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">1h 17m</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Cumulative Load Progress</h2>
            <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm text-slate-400">
              Cumulative Load Progress (migrating to uPlot)
            </div>
          </div>
        </div>

        {/* Right Column - Event Timeline */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Detection Timeline</h2>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-8">
              {events.map((event) => (
                <div key={event.id} className="relative pl-6">
                  <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-white dark:ring-slate-800" />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Bag {event.type}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {event.time} • Confidence: {(event.score * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
