import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Video,
  TrendingUp,
  Radio,
  TrainTrack,
  Table as TableIcon,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  X,
} from 'lucide-react'
import {
  Panel,
  PanelHeader,
  PanelBody,
  StatusPill,
  SummaryStrip,
  UPlotChart,
  DataTable,
  Button,
  IconButton,
  Tooltip,
} from '@/components/ui'
import type { StatusVariant } from '@/components/ui/StatusPill'
import { useToast } from '@/components/ui/Toast'

/* ── KPI Summary Items ───────────────────────────────────── */
const summaryItems = [
  { label: 'Bags Loaded Today', value: 12403, delta: 14, deltaWindow: 'vs yesterday' },
  { label: 'Bags Unloaded Today', value: 8234, delta: -2, deltaWindow: 'vs yesterday' },
  { label: 'Active Wagons', value: 14, unit: 'wagons' },
  { label: 'Detection Accuracy', value: 97, suffix: '.4%' },
]

/* ── Wagon Data Definition ───────────────────────────────── */
interface WagonRecord {
  id: string
  trainId: string
  status: StatusVariant
  statusLabel: string
  door: string
  plannedCount: number
  countedBags: number
  delta: number
  lastMovement: string
}

const mockWagons: WagonRecord[] = [
  { id: 'WGN-8492', trainId: 'TRN-2024-08', status: 'live', statusLabel: 'LOADING', door: 'Door A', plannedCount: 500, countedBags: 450, delta: -50, lastMovement: '14:32:10' },
  { id: 'WGN-8493', trainId: 'TRN-2024-08', status: 'ok', statusLabel: 'VERIFIED', door: 'Door B', plannedCount: 500, countedBags: 500, delta: 0, lastMovement: '14:28:45' },
  { id: 'WGN-8494', trainId: 'TRN-2024-08', status: 'warn', statusLabel: 'MISMATCH', door: 'Door A', plannedCount: 500, countedBags: 482, delta: -18, lastMovement: '14:25:12' },
  { id: 'WGN-8495', trainId: 'TRN-2024-08', status: 'live', statusLabel: 'UNLOADING', door: 'Door B', plannedCount: 450, countedBags: 310, delta: -140, lastMovement: '14:31:55' },
  { id: 'WGN-8496', trainId: 'TRN-2024-08', status: 'ok', statusLabel: 'VERIFIED', door: 'Door A', plannedCount: 520, countedBags: 520, delta: 0, lastMovement: '13:58:20' },
  { id: 'WGN-8497', trainId: 'TRN-2024-08', status: 'alert', statusLabel: 'FLAGGED', door: 'Door A', plannedCount: 500, countedBags: 390, delta: -110, lastMovement: '14:12:04' },
  { id: 'WGN-8498', trainId: 'TRN-2024-08', status: 'idle', statusLabel: 'PENDING', door: 'Door B', plannedCount: 500, countedBags: 0, delta: -500, lastMovement: '12:45:00' },
  { id: 'WGN-8499', trainId: 'TRN-2024-08', status: 'idle', statusLabel: 'PENDING', door: 'Door A', plannedCount: 480, countedBags: 0, delta: -480, lastMovement: '12:45:00' },
  { id: 'WGN-8500', trainId: 'TRN-2024-08', status: 'ok', statusLabel: 'VERIFIED', door: 'Door B', plannedCount: 500, countedBags: 500, delta: 0, lastMovement: '13:10:15' },
  { id: 'WGN-8501', trainId: 'TRN-2024-08', status: 'ok', statusLabel: 'VERIFIED', door: 'Door A', plannedCount: 500, countedBags: 500, delta: 0, lastMovement: '13:35:40' },
  { id: 'WGN-8502', trainId: 'TRN-2024-08', status: 'warn', statusLabel: 'MISMATCH', door: 'Door B', plannedCount: 550, countedBags: 542, delta: -8, lastMovement: '14:02:18' },
  { id: 'WGN-8503', trainId: 'TRN-2024-08', status: 'idle', statusLabel: 'PENDING', door: 'Door A', plannedCount: 500, countedBags: 0, delta: -500, lastMovement: '12:45:00' },
]

/* ── Event Stream Definition ─────────────────────────────── */
interface CrossingEvent {
  id: string
  time: string
  wagonId: string
  door: string
  direction: 'LOAD' | 'UNLOAD'
  confidence: number
  status: 'VERIFIED' | 'REVIEW' | 'FLAGGED'
}

const mockEvents: CrossingEvent[] = [
  { id: 'EV-9902', time: '14:32:14', wagonId: 'WGN-8492', door: 'Door A', direction: 'LOAD', confidence: 0.985, status: 'VERIFIED' },
  { id: 'EV-9901', time: '14:32:11', wagonId: 'WGN-8492', door: 'Door A', direction: 'LOAD', confidence: 0.991, status: 'VERIFIED' },
  { id: 'EV-9900', time: '14:32:07', wagonId: 'WGN-8495', door: 'Door B', direction: 'UNLOAD', confidence: 0.973, status: 'VERIFIED' },
  { id: 'EV-9899', time: '14:31:58', wagonId: 'WGN-8494', door: 'Door A', direction: 'LOAD', confidence: 0.584, status: 'REVIEW' },
  { id: 'EV-9898', time: '14:31:52', wagonId: 'WGN-8492', door: 'Door A', direction: 'LOAD', confidence: 0.988, status: 'VERIFIED' },
  { id: 'EV-9897', time: '14:31:47', wagonId: 'WGN-8495', door: 'Door B', direction: 'UNLOAD', confidence: 0.962, status: 'VERIFIED' },
  { id: 'EV-9896', time: '14:31:39', wagonId: 'WGN-8497', door: 'Door A', direction: 'LOAD', confidence: 0.512, status: 'FLAGGED' },
  { id: 'EV-9895', time: '14:31:31', wagonId: 'WGN-8492', door: 'Door A', direction: 'LOAD', confidence: 0.979, status: 'VERIFIED' },
]

/* ── Attention Alerts ────────────────────────────────────── */
interface AttentionIssue {
  id: string
  severity: 'alert' | 'warn'
  title: string
  description: string
  wagonId?: string
  time: string
}

const initialIssues: AttentionIssue[] = [
  {
    id: 'ATT-1',
    severity: 'alert',
    title: 'Camera CAM-03 Offline',
    description: 'RTSP video stream lost on Door B line. Switched to fallback frame buffer.',
    time: '14:28:10',
  },
  {
    id: 'ATT-2',
    severity: 'warn',
    title: 'Count Mismatch Detected',
    description: 'WGN-8494 counted 482 bags vs planned 500 bags (Delta -18). Operator sign-off needed.',
    wagonId: 'WGN-8494',
    time: '14:25:12',
  },
  {
    id: 'ATT-3',
    severity: 'warn',
    title: 'Low Confidence Crossing (<0.6)',
    description: 'WGN-8497 Door A: Occlusion detected during event EV-9896 (confidence: 0.51).',
    wagonId: 'WGN-8497',
    time: '14:31:39',
  },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [issues, setIssues] = useState(initialIssues)
  const [activeCam, setActiveCam] = useState<'CAM-01' | 'CAM-02'>('CAM-01')
  const [selectedEvent, setSelectedEvent] = useState<CrossingEvent | null>(null)

  /* ── Throughput Chart Options and Data ─────────────────── */
  const chartData = useMemo(() => {
    // 10 hourly points from 06:00 to 15:00 (timestamps in epoch seconds)
    const base = Math.floor(new Date().setHours(6, 0, 0, 0) / 1000)
    const timestamps: number[] = []
    const loaded: number[] = []
    const unloaded: number[] = []
    const planned: number[] = []

    const loadedValues = [420, 680, 1120, 1450, 1380, 1600, 1540, 1420, 1380, 1413]
    const unloadedValues = [280, 450, 720, 980, 910, 1050, 1100, 940, 890, 914]
    const plannedValues = [1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200]

    for (let i = 0; i < 10; i++) {
      timestamps.push(base + i * 3600)
      loaded.push(loadedValues[i])
      unloaded.push(unloadedValues[i])
      planned.push(plannedValues[i])
    }

    return [timestamps, loaded, unloaded, planned] as unknown as uPlot.AlignedData
  }, [])

  const chartOptions = useMemo(() => {
    return {
      title: '',
      scales: {
        x: { time: true },
        y: { auto: true },
      },
      axes: [
        {
          stroke: '#5A6B8A',
          grid: { stroke: '#1E2535', width: 1 },
          ticks: { stroke: '#29334A', width: 1 },
          font: '10px "IBM Plex Mono", monospace',
          values: (_u: uPlot, vals: number[]) =>
            vals.map(v => {
              const d = new Date(v * 1000)
              return `${String(d.getHours()).padStart(2, '0')}:00`
            }),
        },
        {
          stroke: '#5A6B8A',
          grid: { stroke: '#1E2535', width: 1 },
          ticks: { stroke: '#29334A', width: 1 },
          font: '10px "IBM Plex Mono", monospace',
          size: 44,
        },
      ],
      series: [
        {},
        {
          label: 'Loaded',
          stroke: '#38bdf8', // var(--color-series-loaded)
          width: 2,
          points: { show: true, size: 4 },
        },
        {
          label: 'Unloaded',
          stroke: '#fb923c', // var(--color-series-unloaded)
          width: 2,
          points: { show: true, size: 4 },
        },
        {
          label: 'Planned Target',
          stroke: '#5A6B8A', // var(--color-series-planned)
          width: 1.5,
          dash: [6, 4],
          points: { show: false },
        },
      ],
      cursor: {
        drag: { setScale: false },
        points: { size: 6 },
      },
    }
  }, [])

  /* ── Wagons Table Columns ──────────────────────────────── */
  const wagonColumns = useMemo<ColumnDef<WagonRecord, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Wagon ID',
        size: 110,
        cell: info => (
          <span className="font-semibold text-[var(--color-n-700)]">
            {String(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'trainId',
        header: 'Train ID',
        size: 120,
        cell: info => (
          <span className="text-[var(--color-n-500)]">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: info => {
          const row = info.row.original
          return <StatusPill status={row.status} label={row.statusLabel} />
        },
      },
      {
        accessorKey: 'plannedCount',
        header: 'Planned',
        size: 90,
        meta: { numeric: true },
        cell: info => (
          <span className="text-[var(--color-n-500)]">{Number(info.getValue()).toLocaleString()}</span>
        ),
      },
      {
        accessorKey: 'countedBags',
        header: 'Counted',
        size: 90,
        meta: { numeric: true },
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
        meta: { numeric: true },
        cell: info => {
          const delta = Number(info.getValue())
          const isZero = delta === 0
          const isPositive = delta > 0
          return (
            <span
              style={{
                color: isZero
                  ? 'var(--color-status-ok)'
                  : isPositive
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
        accessorKey: 'lastMovement',
        header: 'Last Movement',
        size: 110,
        cell: info => (
          <span className="text-[var(--color-n-400)]">{String(info.getValue())}</span>
        ),
      },
    ],
    []
  )

  const handleDismissIssue = (id: string) => {
    setIssues(prev => prev.filter(i => i.id !== id))
    showToast({
      title: 'Alert Acknowledged',
      description: `Issue ${id} has been marked as handled.`,
      variant: 'ok',
    })
  }

  return (
    <div className="space-y-5 pb-8">
      {/* 1. Top Summary Strip */}
      <SummaryStrip items={summaryItems} className="rounded-md" />

      {/* 2. Top Grid: Live Footage Wall (Left) + Throughput Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Live Footage Wall (7 cols) */}
        <Panel className="lg:col-span-7 flex flex-col">
          <PanelHeader
            title="Live Footage Wall"
            icon={<Video size={16} />}
            actions={
              <div className="flex items-center gap-2">
                <div className="flex bg-[var(--color-n-100)] p-0.5 rounded border border-[var(--color-n-200)] text-xs">
                  <button
                    onClick={() => setActiveCam('CAM-01')}
                    className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors ${activeCam === 'CAM-01'
                      ? 'bg-[var(--color-n-200)] text-[var(--color-accent)] font-medium'
                      : 'text-[var(--color-n-400)] hover:text-[var(--color-n-600)]'
                      }`}
                  >
                    CAM-01
                  </button>
                  <button
                    onClick={() => setActiveCam('CAM-02')}
                    className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors ${activeCam === 'CAM-02'
                      ? 'bg-[var(--color-n-200)] text-[var(--color-accent)] font-medium'
                      : 'text-[var(--color-n-400)] hover:text-[var(--color-n-600)]'
                      }`}
                  >
                    CAM-02
                  </button>
                </div>
                <StatusPill status="live" label="25 FPS" />
              </div>
            }
          />
          <PanelBody className="p-3 flex-1 flex flex-col">
            <div className="relative aspect-video w-full rounded bg-[var(--color-n-0)] border border-[var(--color-n-200)] overflow-hidden flex items-center justify-center group">
              {/* Simulated Industrial Camera View Background */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a111a] via-[#05080c] to-[#040608] opacity-90" />

              {/* Grid telemetry overlay */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #29334A 1px, transparent 1px), linear-gradient(to bottom, #29334A 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Telemetry OSD Header */}
              <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-[var(--color-n-400)] z-10 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-status-live)] font-bold">● REC</span>
                  <span>{activeCam}</span>
                  <span>[BAY 1 • DOOR A]</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>RES: 1920x1080</span>
                  <span>CODEC: H.264</span>
                  <span className="text-[var(--color-n-600)]">BITRATE: 4.2 Mbps</span>
                </div>
              </div>

              {/* Simulated Door Crossing Boundary Line */}
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex items-center">
                <div className="w-full border-t-2 border-dashed border-[var(--color-status-live)] opacity-70 relative">
                  <span className="absolute -top-4 left-4 bg-[var(--color-n-50)]/90 px-1.5 py-0.5 rounded text-[9px] font-mono text-[var(--color-status-live)] border border-[var(--color-status-live)]/40">
                    DETECTION GATE: DOOR_A_LINE_Y: 540
                  </span>
                </div>
              </div>

              {/* Simulated Detection Track Bounding Boxes */}
              <div className="absolute left-1/3 top-1/3 w-28 h-20 border border-[var(--color-accent)] bg-[var(--color-accent)]/10 rounded-sm flex flex-col justify-between p-1 pointer-events-none animate-pulse">
                <div className="flex items-center justify-between text-[9px] font-mono text-[var(--color-accent)] leading-none">
                  <span>BAG #1042</span>
                  <span className="tabular-nums">0.98</span>
                </div>
                <div className="text-[8px] font-mono text-[var(--color-status-ok)] leading-none">
                  FLOW: LOAD →
                </div>
              </div>

              <div className="absolute right-1/4 top-2/5 w-28 h-20 border border-[var(--color-status-ok)] bg-[var(--color-status-ok)]/10 rounded-sm flex flex-col justify-between p-1 pointer-events-none">
                <div className="flex items-center justify-between text-[9px] font-mono text-[var(--color-status-ok)] leading-none">
                  <span>BAG #1043</span>
                  <span className="tabular-nums">0.96</span>
                </div>
                <div className="text-[8px] font-mono text-[var(--color-status-ok)] leading-none">
                  VERIFIED
                </div>
              </div>

              {/* Telemetry OSD Footer */}
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-[var(--color-n-500)] z-10 pointer-events-none">
                <span>TARGET: WGN-8492</span>
                <span>TOTAL DOOR PASSES: 450</span>
              </div>
            </div>

            {/* Camera Switcher Strip */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div
                onClick={() => setActiveCam('CAM-01')}
                className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between ${activeCam === 'CAM-01'
                  ? 'border-[var(--color-accent)] bg-[var(--color-n-100)]'
                  : 'border-[var(--color-n-200)] bg-[var(--color-n-50)] hover:bg-[var(--color-n-100)]'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Radio size={14} className="text-[var(--color-status-live)] animate-pulse" />
                  <span className="text-xs font-mono font-medium text-[var(--color-n-700)] leading-none">CAM-01: Yard Door A</span>
                </div>
                <StatusPill status="live" label="ACTIVE" />
              </div>

              <div
                onClick={() => setActiveCam('CAM-02')}
                className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between ${activeCam === 'CAM-02'
                  ? 'border-[var(--color-accent)] bg-[var(--color-n-100)]'
                  : 'border-[var(--color-n-200)] bg-[var(--color-n-50)] hover:bg-[var(--color-n-100)]'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Radio size={14} className="text-[var(--color-status-ok)]" />
                  <span className="text-xs font-mono font-medium text-[var(--color-n-700)] leading-none">CAM-02: Yard Door B</span>
                </div>
                <StatusPill status="ok" label="STANDBY" />
              </div>
            </div>
          </PanelBody>
        </Panel>

        {/* Throughput Chart (5 cols) */}
        <Panel className="lg:col-span-5 flex flex-col">
          <PanelHeader
            title="Hourly Throughput (Loaded vs Unloaded)"
            icon={<TrendingUp size={16} />}
            actions={
              <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--color-n-400)]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-[#38bdf8]" /> Loaded
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-[#fb923c]" /> Unloaded
                </span>
              </div>
            }
          />
          <PanelBody className="p-4 flex-1 flex flex-col justify-center">
            <UPlotChart options={chartOptions} data={chartData} height={280} />
            <div className="mt-3 pt-2 border-t border-[var(--color-n-200)] flex items-center justify-between text-xs text-[var(--color-n-500)] font-mono">
              <span>Manifest Target: 1,200 bags/hr</span>
              <span className="text-[var(--color-status-ok)]">Peak: 1,600 bags/hr (11:00)</span>
            </div>
          </PanelBody>
        </Panel>
      </div>

      {/* 3. Middle Section: Rake Status Visualizer Strip */}
      <Panel>
        <PanelHeader
          title="Rake #04 Status Strip — TRN-2024-08 (12 Wagons)"
          icon={<TrainTrack size={16} />}
          actions={
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-[var(--color-n-400)]">
                <span className="w-2 h-2 rounded-xs bg-[var(--color-status-ok)]" /> Nominal
              </span>
              <span className="flex items-center gap-1 text-[var(--color-n-400)]">
                <span className="w-2 h-2 rounded-xs bg-[var(--color-status-warn)]" /> Mismatch
              </span>
              <span className="flex items-center gap-1 text-[var(--color-n-400)]">
                <span className="w-2 h-2 rounded-xs bg-[var(--color-status-alert)]" /> Flagged
              </span>
            </div>
          }
        />
        <PanelBody className="p-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 px-1 -mx-1">
            {mockWagons.map((wagon, idx) => {
              const bg =
                wagon.status === 'ok'
                  ? 'var(--color-status-ok)'
                  : wagon.status === 'live'
                    ? 'var(--color-status-live)'
                    : wagon.status === 'warn'
                      ? 'var(--color-status-warn)'
                      : wagon.status === 'alert'
                        ? 'var(--color-status-alert)'
                        : 'var(--color-n-300)'

              return (
                <Tooltip
                  key={wagon.id}
                  content={
                    <div className="p-1 space-y-1 font-mono">
                      <div className="font-bold text-[var(--color-n-800)]">{wagon.id} (Wagon #{idx + 1})</div>
                      <div>Status: {wagon.statusLabel}</div>
                      <div>Planned: {wagon.plannedCount} | Counted: {wagon.countedBags}</div>
                      <div>Delta: {wagon.delta > 0 ? `+${wagon.delta}` : wagon.delta}</div>
                    </div>
                  }
                >
                  <button
                    onClick={() => navigate(`/wagons/${wagon.id}`)}
                    className="flex-shrink-0 w-[72px] h-14 rounded-md border border-[var(--color-n-200)] bg-[var(--color-n-100)] hover:border-[var(--color-accent)] transition-all p-1.5 flex flex-col justify-between text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold text-[var(--color-n-700)] group-hover:text-[var(--color-accent)] leading-none">
                        #{idx + 1}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: bg }}
                      />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-[var(--color-n-400)] truncate leading-none">
                        {wagon.id}
                      </div>
                      <div className="text-[11px] font-mono font-medium text-[var(--color-n-800)] leading-none mt-0.5">
                        {wagon.countedBags}/{wagon.plannedCount}
                      </div>
                    </div>
                  </button>
                </Tooltip>
              )
            })}
          </div>
        </PanelBody>
      </Panel>

      {/* 4. Bottom Grid: Wagons Virtualized DataTable (Left) + Event Stream & Attention Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Wagons Table (7 cols) */}
        <Panel className="lg:col-span-7 flex flex-col h-[460px]">
          <PanelHeader
            title="Active Rake Manifest & Bag Telemetry"
            icon={<TableIcon size={16} />}
            actions={
              <span className="text-[11px] font-mono text-[var(--color-n-400)]">
                {mockWagons.length} Wagons Active
              </span>
            }
          />
          <div className="flex-1 min-h-0">
            <DataTable
              data={mockWagons}
              columns={wagonColumns}
              onRowClick={row => navigate(`/wagons/${row.id}`)}
              rowHeight={38}
            />
          </div>
        </Panel>

        {/* Right Stack: Attention Panel (Top) + Event Stream (Bottom) (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Attention Panel */}
          <Panel className="flex flex-col">
            <PanelHeader
              title="Operator Attention Required"
              icon={<ShieldAlert size={16} />}
              actions={
                <span className="text-[11px] font-mono text-[var(--color-status-warn)] font-medium">
                  {issues.length} ACTIONABLE
                </span>
              }
            />
            <PanelBody className="p-3 space-y-2">
              {issues.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--color-status-ok)] flex items-center justify-center gap-2 font-mono">
                  <CheckCircle2 size={16} /> All active checkpoints nominal
                </div>
              ) : (
                issues.map(issue => (
                  <div
                    key={issue.id}
                    className="p-2.5 rounded bg-[var(--color-n-100)] border border-[var(--color-n-200)] flex items-start justify-between gap-3"
                    style={{
                      borderLeftColor:
                        issue.severity === 'alert'
                          ? 'var(--color-status-alert)'
                          : 'var(--color-status-warn)',
                      borderLeftWidth: 3,
                    }}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--color-n-700)]">
                          {issue.title}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--color-n-400)]">
                          {issue.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--color-n-500)] line-clamp-2">
                        {issue.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {issue.wagonId && (
                        <IconButton
                          label="Inspect wagon"
                          size="sm"
                          onClick={() => navigate(`/wagons/${issue.wagonId}`)}
                        >
                          <ExternalLink size={14} />
                        </IconButton>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDismissIssue(issue.id)}
                        className="text-[10px] h-6 px-2"
                      >
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </PanelBody>
          </Panel>

          {/* Real-time Event Stream */}
          <Panel className="flex flex-col flex-1 min-h-[220px]">
            <PanelHeader
              title="Real-Time Detection Event Stream"
              icon={<Radio size={16} />}
              actions={
                <StatusPill status="live" label="STREAMING" />
              }
            />
            <div className="flex-1 overflow-y-auto max-h-[210px] p-2 space-y-1 font-mono text-xs">
              {mockEvents.map(ev => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="px-2.5 py-1.5 rounded bg-[var(--color-n-100)] hover:bg-[var(--color-n-150)] cursor-pointer border border-[var(--color-n-200)] flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[var(--color-n-400)]">{ev.time}</span>
                    <span className="font-semibold text-[var(--color-n-700)]">{ev.wagonId}</span>
                    <span className="text-[10px] text-[var(--color-n-500)]">{ev.door}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${ev.direction === 'LOAD'
                        ? 'bg-[#38bdf8]/15 text-[#38bdf8]'
                        : 'bg-[#fb923c]/15 text-[#fb923c]'
                        }`}
                    >
                      {ev.direction}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${ev.confidence > 0.95
                        ? 'text-[var(--color-status-ok)]'
                        : ev.confidence > 0.8
                          ? 'text-[var(--color-status-warn)]'
                          : 'text-[var(--color-status-alert)]'
                        }`}
                    >
                      {(ev.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Event Inspector Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] rounded-md shadow-[var(--shadow-float)] overflow-hidden">
            <div className="h-10 px-4 bg-[var(--color-n-150)] border-b border-[var(--color-n-200)] flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-[var(--color-n-700)]">
                EVENT INSPECTOR: {selectedEvent.id}
              </span>
              <IconButton
                label="Close"
                size="sm"
                onClick={() => setSelectedEvent(null)}
              >
                <X size={14} />
              </IconButton>
            </div>
            <div className="p-4 space-y-4">
              {/* Simulated camera frame thumbnail */}
              <div className="aspect-video w-full rounded bg-[var(--color-n-50)] border border-[var(--color-n-200)] relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="w-32 h-20 border border-[var(--color-accent)] bg-[var(--color-accent)]/15 rounded flex items-center justify-center">
                  <span className="text-[10px] font-mono text-[var(--color-accent)] font-bold">
                    BAG CLASSIFIED
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] font-mono text-[var(--color-n-400)]">
                  <span>{selectedEvent.door}</span>
                  <span>{selectedEvent.time}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2 rounded bg-[var(--color-n-150)] border border-[var(--color-n-200)]">
                  <div className="text-[10px] text-[var(--color-n-400)] uppercase">Target Wagon</div>
                  <div className="font-semibold text-[var(--color-n-800)] mt-0.5">{selectedEvent.wagonId}</div>
                </div>
                <div className="p-2 rounded bg-[var(--color-n-150)] border border-[var(--color-n-200)]">
                  <div className="text-[10px] text-[var(--color-n-400)] uppercase">Direction</div>
                  <div className="font-semibold text-[var(--color-n-800)] mt-0.5">{selectedEvent.direction}</div>
                </div>
                <div className="p-2 rounded bg-[var(--color-n-150)] border border-[var(--color-n-200)]">
                  <div className="text-[10px] text-[var(--color-n-400)] uppercase">Confidence</div>
                  <div className="font-semibold text-[var(--color-status-ok)] mt-0.5">
                    {(selectedEvent.confidence * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="p-2 rounded bg-[var(--color-n-150)] border border-[var(--color-n-200)]">
                  <div className="text-[10px] text-[var(--color-n-400)] uppercase">Verification</div>
                  <div className="font-semibold text-[var(--color-n-800)] mt-0.5">{selectedEvent.status}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-n-200)]">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  Dismiss
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    navigate(`/wagons/${selectedEvent.wagonId}`)
                    setSelectedEvent(null)
                  }}
                >
                  Open Wagon Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
