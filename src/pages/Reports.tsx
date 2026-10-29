import { useState, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  FileText,
  Download,
  Search,
  FileSpreadsheet,
} from 'lucide-react'
import {
  Panel,
  PanelHeader,
  StatusPill,
  Button,
  DataTable,
  Tooltip,
} from '@/components/ui'
import type { StatusVariant } from '@/components/ui/StatusPill'
import { useToast } from '@/components/ui/Toast'

interface ReportRecord {
  id: string
  title: string
  shift: string
  yard: string
  trainId: string
  wagonsCount: number
  manifestBags: number
  countedBags: number
  delta: number
  status: StatusVariant
  statusLabel: string
  generatedAt: string
}

const mockReports: ReportRecord[] = [
  {
    id: 'REP-1029-01',
    title: 'Morning Shift Manifest Audit',
    shift: 'Shift 01 (06:00 - 14:00)',
    yard: 'Yard 04 — North Berth',
    trainId: 'TRN-2024-08',
    wagonsCount: 12,
    manifestBags: 6000,
    countedBags: 5974,
    delta: -26,
    status: 'warn',
    statusLabel: 'MISMATCH (-26)',
    generatedAt: 'Today, 14:15 UTC',
  },
  {
    id: 'REP-1028-02',
    title: 'Night Shift Grain Loading Verification',
    shift: 'Shift 03 (22:00 - 06:00)',
    yard: 'Yard 04 — North Berth',
    trainId: 'TRN-2024-07',
    wagonsCount: 16,
    manifestBags: 8000,
    countedBags: 8000,
    delta: 0,
    status: 'ok',
    statusLabel: 'VERIFIED',
    generatedAt: 'Yesterday, 06:10 UTC',
  },
  {
    id: 'REP-1028-01',
    title: 'Wagon WGN-3391 Incident Audit',
    shift: 'Shift 02 (14:00 - 22:00)',
    yard: 'Yard 02 — South Pier',
    trainId: 'TRN-2024-06',
    wagonsCount: 1,
    manifestBags: 500,
    countedBags: 482,
    delta: -18,
    status: 'alert',
    statusLabel: 'FLAGGED',
    generatedAt: 'Yesterday, 19:45 UTC',
  },
  {
    id: 'REP-1027-03',
    title: 'Full Day Terminal Throughput Reconciliation',
    shift: 'Daily Aggregate',
    yard: 'All Yards',
    trainId: 'ALL-RAKES',
    wagonsCount: 48,
    manifestBags: 24000,
    countedBags: 23992,
    delta: -8,
    status: 'ok',
    statusLabel: 'VERIFIED (99.9%)',
    generatedAt: '27 Oct, 23:59 UTC',
  },
  {
    id: 'REP-1027-02',
    title: 'Afternoon Loading Rake #02',
    shift: 'Shift 02 (14:00 - 22:00)',
    yard: 'Yard 01 — Central Siding',
    trainId: 'TRN-2024-05',
    wagonsCount: 10,
    manifestBags: 5000,
    countedBags: 5000,
    delta: 0,
    status: 'ok',
    statusLabel: 'VERIFIED',
    generatedAt: '27 Oct, 18:30 UTC',
  },
  {
    id: 'REP-1026-01',
    title: 'Weekly Performance & Calibration Audit',
    shift: 'Weekly Aggregate',
    yard: 'All Yards',
    trainId: 'ALL-RAKES',
    wagonsCount: 184,
    manifestBags: 92000,
    countedBags: 91880,
    delta: -120,
    status: 'ok',
    statusLabel: 'VERIFIED',
    generatedAt: '26 Oct, 10:00 UTC',
  },
]

export default function Reports() {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedYard, setSelectedYard] = useState('ALL')
  const [discrepancyOnly, setDiscrepancyOnly] = useState(false)
  const [dateRange, setDateRange] = useState('LAST_7_DAYS')

  // Filter logic
  const filteredReports = useMemo(() => {
    return mockReports.filter(rep => {
      const matchSearch =
        search === '' ||
        rep.title.toLowerCase().includes(search.toLowerCase()) ||
        rep.id.toLowerCase().includes(search.toLowerCase()) ||
        rep.trainId.toLowerCase().includes(search.toLowerCase())

      const matchYard =
        selectedYard === 'ALL' || rep.yard.toLowerCase().includes(selectedYard.toLowerCase())

      const matchDiscrepancy = !discrepancyOnly || rep.delta !== 0

      return matchSearch && matchYard && matchDiscrepancy
    })
  }, [search, selectedYard, discrepancyOnly])

  // Single report export
  const handleExportSingle = (report: ReportRecord) => {
    // Generate CSV string
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'ReportID,Title,Yard,TrainID,Wagons,ManifestBags,CountedBags,Delta,Status,Timestamp',
        `${report.id},"${report.title}","${report.yard}",${report.trainId},${report.wagonsCount},${report.manifestBags},${report.countedBags},${report.delta},${report.statusLabel},"${report.generatedAt}"`,
      ].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${report.id}-manifest-audit.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast({
      title: 'Report Downloaded',
      description: `Manifest CSV for ${report.id} generated and saved.`,
      variant: 'ok',
    })
  }

  // Export All
  const handleExportAll = () => {
    const csvRows = [
      'ReportID,Title,Yard,TrainID,Wagons,ManifestBags,CountedBags,Delta,Status,Timestamp',
      ...filteredReports.map(
        r =>
          `${r.id},"${r.title}","${r.yard}",${r.trainId},${r.wagonsCount},${r.manifestBags},${r.countedBags},${r.delta},${r.statusLabel},"${r.generatedAt}"`
      ),
    ]

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvRows.join('\n'))
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `wagoneye-reports-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast({
      title: 'Export Complete',
      description: `Exported ${filteredReports.length} audit reports to CSV.`,
      variant: 'ok',
    })
  }

  const columns = useMemo<ColumnDef<ReportRecord, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Report ID',
        size: 110,
        cell: info => (
          <span className="font-semibold text-[var(--color-n-700)]">
            {String(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Report Title & Shift',
        size: 260,
        cell: info => {
          const row = info.row.original
          return (
            <div>
              <div className="font-sans font-medium text-[var(--color-n-800)] truncate">
                {row.title}
              </div>
              <div className="text-[10px] text-[var(--color-n-400)] truncate">
                {row.shift} • {row.yard}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'trainId',
        header: 'Train / Rake',
        size: 120,
        cell: info => (
          <span className="text-[var(--color-n-500)]">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: 'manifestBags',
        header: 'Planned',
        size: 90,
        cell: info => (
          <span className="text-[var(--color-n-500)]">{Number(info.getValue()).toLocaleString()}</span>
        ),
      },
      {
        accessorKey: 'countedBags',
        header: 'Counted',
        size: 90,
        cell: info => (
          <span className="text-[var(--color-n-800)] font-medium">
            {Number(info.getValue()).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'delta',
        header: 'Delta',
        size: 90,
        cell: info => {
          const delta = Number(info.getValue())
          return (
            <span
              style={{
                color:
                  delta === 0
                    ? 'var(--color-status-ok)'
                    : delta > -20
                    ? 'var(--color-status-warn)'
                    : 'var(--color-status-alert)',
              }}
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Audit Status',
        size: 140,
        cell: info => {
          const row = info.row.original
          return <StatusPill status={row.status} label={row.statusLabel} />
        },
      },
      {
        accessorKey: 'generatedAt',
        header: 'Timestamp',
        size: 130,
        cell: info => (
          <span className="text-[var(--color-n-400)]">{String(info.getValue())}</span>
        ),
      },
      {
        id: 'actions',
        header: 'Action',
        size: 80,
        cell: info => {
          const row = info.row.original
          return (
            <Tooltip content="Export CSV">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleExportSingle(row)
                }}
                className="p-1 rounded text-[var(--color-n-400)] hover:text-[var(--color-accent)] hover:bg-[var(--color-n-200)] transition-colors"
                aria-label={`Download report ${row.id}`}
              >
                <Download size={14} />
              </button>
            </Tooltip>
          )
        },
      },
    ],
    []
  )

  return (
    <div className="space-y-5 pb-8">
      {/* 1. Header & Quick Audit KPI Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-xl font-bold text-[var(--color-n-800)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            AUDIT & RECONCILIATION REPORTS
          </h1>
          <p className="text-xs text-[var(--color-n-400)] mt-0.5">
            Automated computer vision shift reconciliation logs & manifest verification records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportAll}
            className="gap-1.5"
          >
            <FileSpreadsheet size={14} /> Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              showToast({
                title: 'PDF Generation Queued',
                description: 'Full manifest verification package PDF is being compiled.',
                variant: 'ok',
              })
            }}
            className="gap-1.5"
          >
            <Download size={14} /> Export PDF Package
          </Button>
        </div>
      </div>

      {/* 2. Audit KPI Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] flex flex-col gap-1">
          <span className="text-[11px] font-mono text-[var(--color-n-400)] uppercase">
            Total Audits Logged
          </span>
          <span
            className="text-2xl font-medium text-[var(--color-n-800)] font-mono"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {mockReports.length}
          </span>
          <span className="text-[10px] text-[var(--color-n-400)]">Across 3 active yards</span>
        </div>

        <div className="p-3 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] flex flex-col gap-1">
          <span className="text-[11px] font-mono text-[var(--color-n-400)] uppercase">
            Verified Sessions
          </span>
          <span
            className="text-2xl font-medium text-[var(--color-status-ok)] font-mono"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {mockReports.filter(r => r.status === 'ok').length}
          </span>
          <span className="text-[10px] text-[var(--color-status-ok)]">100% manifest match</span>
        </div>

        <div className="p-3 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] flex flex-col gap-1">
          <span className="text-[11px] font-mono text-[var(--color-n-400)] uppercase">
            Discrepancies Flagged
          </span>
          <span
            className="text-2xl font-medium text-[var(--color-status-warn)] font-mono"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {mockReports.filter(r => r.delta !== 0).length}
          </span>
          <span className="text-[10px] text-[var(--color-status-warn)]">Within review threshold</span>
        </div>

        <div className="p-3 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] flex flex-col gap-1">
          <span className="text-[11px] font-mono text-[var(--color-n-400)] uppercase">
            Total Bags Audited
          </span>
          <span
            className="text-2xl font-medium text-[var(--color-n-800)] font-mono"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            135,446
          </span>
          <span className="text-[10px] text-[var(--color-n-400)]">Reconciliation rate: 99.8%</span>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="p-3 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-n-400)] pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by report ID, rake, title..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-[var(--color-n-150)] text-[var(--color-n-700)] placeholder-[var(--color-n-400)] rounded border border-[var(--color-n-200)] focus:outline-none focus:border-[var(--color-accent)] font-mono"
            />
          </div>

          {/* Yard Select */}
          <select
            value={selectedYard}
            onChange={(e) => setSelectedYard(e.target.value)}
            className="h-8 px-2.5 text-xs bg-[var(--color-n-150)] text-[var(--color-n-700)] rounded border border-[var(--color-n-200)] focus:outline-none focus:border-[var(--color-accent)] font-mono"
          >
            <option value="ALL">All Yards</option>
            <option value="Yard 04">Yard 04 (North)</option>
            <option value="Yard 02">Yard 02 (South)</option>
            <option value="Yard 01">Yard 01 (Central)</option>
          </select>

          {/* Date range filter */}
          <div className="flex items-center gap-1 bg-[var(--color-n-150)] p-0.5 rounded border border-[var(--color-n-200)] text-xs font-mono">
            <button
              onClick={() => setDateRange('TODAY')}
              className={`px-2 py-1 rounded transition-colors ${
                dateRange === 'TODAY'
                  ? 'bg-[var(--color-n-200)] text-[var(--color-accent)] font-medium'
                  : 'text-[var(--color-n-400)] hover:text-[var(--color-n-600)]'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('LAST_7_DAYS')}
              className={`px-2 py-1 rounded transition-colors ${
                dateRange === 'LAST_7_DAYS'
                  ? 'bg-[var(--color-n-200)] text-[var(--color-accent)] font-medium'
                  : 'text-[var(--color-n-400)] hover:text-[var(--color-n-600)]'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange('ALL_TIME')}
              className={`px-2 py-1 rounded transition-colors ${
                dateRange === 'ALL_TIME'
                  ? 'bg-[var(--color-n-200)] text-[var(--color-accent)] font-medium'
                  : 'text-[var(--color-n-400)] hover:text-[var(--color-n-600)]'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Discrepancy toggle */}
        <label className="flex items-center gap-2 text-xs font-mono text-[var(--color-n-600)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={discrepancyOnly}
            onChange={(e) => setDiscrepancyOnly(e.target.checked)}
            className="rounded border-[var(--color-n-300)] text-[var(--color-accent)] focus:ring-0"
          />
          Show Discrepancies Only
        </label>
      </div>

      {/* 4. Reports Table */}
      <Panel className="flex flex-col h-[500px]">
        <PanelHeader
          title="Manifest Audit Records & Export Log"
          icon={<FileText size={16} />}
          actions={
            <span className="text-[11px] font-mono text-[var(--color-n-400)]">
              {filteredReports.length} Records Found
            </span>
          }
        />
        <div className="flex-1 min-h-0">
          <DataTable
            data={filteredReports}
            columns={columns}
            rowHeight={46}
          />
        </div>
      </Panel>
    </div>
  )
}
