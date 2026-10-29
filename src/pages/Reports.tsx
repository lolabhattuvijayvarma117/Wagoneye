import { FileText, Download, Filter, Calendar } from 'lucide-react';

const reports = [
  {
    id: 'REP-001',
    title: 'Daily Shift Summary: Morning',
    date: 'Today, 14:00',
    summary: 'Operations proceeded smoothly. Total 12,403 bags loaded across 42 wagons. Wagon WG-1102 experienced a slight delay but recovered. Accuracy remained at 99.8%.',
    type: 'Shift Summary'
  },
  {
    id: 'REP-002',
    title: 'Wagon WG-3391 Incident Report',
    date: 'Yesterday, 18:30',
    summary: 'Anomaly detected during unloading sequence. 15 bags required manual verification due to obscure angles. Final count adjusted to 890 bags.',
    type: 'Incident'
  },
  {
    id: 'REP-003',
    title: 'Weekly Performance Overview',
    date: 'Oct 24, 2023',
    summary: 'Total volume increased by 14% compared to last week. Average load time per wagon decreased by 4 minutes. Highest volume recorded on Thursday.',
    type: 'Weekly'
  }
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <Calendar className="w-4 h-4" />
            Last 7 Days
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                  {report.type}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{report.date}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-1">
                {report.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                {report.summary}
              </p>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-500">{report.id}</span>
              <button className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                View full report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
