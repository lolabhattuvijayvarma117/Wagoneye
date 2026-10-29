import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  Radio,
  FileCheck,
  TrendingUp,
} from 'lucide-react'
import {
  Panel,
  PanelHeader,
  PanelBody,
  StatusPill,
  Button,
  KeyValue,
  UPlotChart,
} from '@/components/ui'

interface TimelineEvent {
  id: string
  time: string
  direction: 'LOAD' | 'UNLOAD'
  door: 'Door A' | 'Door B'
  confidence: number
  frameId: string
  verified: boolean
}

const timelineEvents: TimelineEvent[] = [
  { id: 'EV-8492-28', time: '14:32:14', direction: 'LOAD', door: 'Door A', confidence: 0.985, frameId: 'FR-94812', verified: true },
  { id: 'EV-8492-27', time: '14:32:10', direction: 'LOAD', door: 'Door A', confidence: 0.991, frameId: 'FR-94808', verified: true },
  { id: 'EV-8492-26', time: '14:31:58', direction: 'LOAD', door: 'Door B', confidence: 0.978, frameId: 'FR-94796', verified: true },
  { id: 'EV-8492-25', time: '14:31:42', direction: 'LOAD', door: 'Door A', confidence: 0.965, frameId: 'FR-94780', verified: true },
  { id: 'EV-8492-24', time: '14:31:25', direction: 'LOAD', door: 'Door B', confidence: 0.982, frameId: 'FR-94763', verified: true },
  { id: 'EV-8492-23', time: '14:30:59', direction: 'LOAD', door: 'Door A', confidence: 0.989, frameId: 'FR-94737', verified: true },
  { id: 'EV-8492-22', time: '14:30:41', direction: 'LOAD', door: 'Door A', confidence: 0.954, frameId: 'FR-94719', verified: true },
  { id: 'EV-8492-21', time: '14:30:18', direction: 'LOAD', door: 'Door B', confidence: 0.976, frameId: 'FR-94696', verified: true },
]

export default function WagonDetail() {
  const { id = 'WGN-8492' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  /* ── Cumulative Progress Chart Data ───────────────────── */
  const chartData = useMemo(() => {
    // 12 points representing 10-minute intervals over a 2-hour loading session
    const base = Math.floor(new Date().setHours(12, 30, 0, 0) / 1000)
    const timestamps: number[] = []
    const cumulativeCount: number[] = []
    const manifestTarget: number[] = []

    const counts = [0, 35, 78, 120, 185, 230, 290, 340, 385, 415, 435, 450]

    for (let i = 0; i < 12; i++) {
      timestamps.push(base + i * 600)
      cumulativeCount.push(counts[i])
      manifestTarget.push(500)
    }

    return [timestamps, cumulativeCount, manifestTarget] as unknown as uPlot.AlignedData
  }, [])

  const chartOptions = useMemo(() => {
    return {
      title: '',
      scales: {
        x: { time: true },
        y: { auto: true, range: [0, 550] as [number, number] },
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
              const m = String(d.getMinutes()).padStart(2, '0')
              return `${d.getHours()}:${m}`
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
          label: 'Cumulative Bags Loaded',
          stroke: '#38bdf8', // var(--color-series-loaded)
          width: 2.5,
          points: { show: true, size: 4 },
        },
        {
          label: 'Manifest Target (500)',
          stroke: '#5A6B8A', // var(--color-series-planned)
          width: 1.5,
          dash: [6, 4],
          points: { show: false },
        },
      ],
      cursor: {
        drag: { setScale: false },
      },
    }
  }, [])

  return (
    <div className="space-y-5 pb-8">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)]">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="h-8 gap-1.5"
          >
            <ArrowLeft size={14} /> Back
          </Button>

          <div>
            <div className="flex items-center gap-2.5">
              <h1
                className="text-xl font-bold text-[var(--color-n-800)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {id}
              </h1>
              <StatusPill status="live" label="ACTIVE LOADING" />
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--color-status-ok)]/15 text-[var(--color-status-ok)] border border-[var(--color-status-ok)]/30">
                <CheckCircle2 size={12} />
                VERIFIED BY MANIFEST
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-[var(--color-n-400)] font-mono">
              <span className="text-[var(--color-n-500)]">Train: TRN-2024-08 (Rake #04)</span>
              <span>•</span>
              <span>Arrived: 12:15:00 UTC</span>
              <span>•</span>
              <span>Est. Departure: 15:30:00 UTC</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Pill Group */}
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[var(--color-n-200)] pt-3 md:pt-0 md:pl-5">
          <KeyValue
            label="Planned Target"
            value="500 bags"
            mono
          />
          <div className="w-px h-8 bg-[var(--color-n-200)]" />
          <KeyValue
            label="Verified Count"
            value="450 bags"
            mono
          />
          <div className="w-px h-8 bg-[var(--color-n-200)]" />
          <KeyValue
            label="Remaining"
            value="50 bags"
            mono
          />
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Event Timeline (5 cols) */}
        <Panel className="lg:col-span-5 flex flex-col h-[520px]">
          <PanelHeader
            title="Bag Crossing Event Log"
            icon={<Clock size={16} />}
            actions={
              <span className="text-[11px] font-mono text-[var(--color-n-400)]">
                {timelineEvents.length} Recent Crossings
              </span>
            }
          />
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {timelineEvents.map(ev => (
              <div
                key={ev.id}
                className="p-2.5 rounded bg-[var(--color-n-100)] border border-[var(--color-n-200)] hover:border-[var(--color-n-300)] flex items-center justify-between gap-3 transition-colors"
              >
                {/* Simulated video frame thumbnail */}
                <div className="w-16 h-12 rounded bg-[var(--color-n-50)] border border-[var(--color-n-200)] relative overflow-hidden shrink-0 flex items-center justify-center group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="w-7 h-5 border border-[var(--color-accent)] bg-[var(--color-accent)]/20 rounded-xs" />
                  <span className="absolute bottom-0.5 right-1 text-[8px] font-mono text-[var(--color-n-400)]">
                    {ev.door === 'Door A' ? 'C01' : 'C02'}
                  </span>
                </div>

                {/* Event info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-[var(--color-n-700)]">
                      {ev.id}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--color-n-400)]">
                      {ev.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-[var(--color-n-500)]">
                    <span>{ev.door}</span>
                    <span>•</span>
                    <span className="text-[var(--color-n-400)]">{ev.frameId}</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-col items-end gap-1 shrink-0 font-mono">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                      ev.direction === 'LOAD'
                        ? 'bg-[#38bdf8]/15 text-[#38bdf8]'
                        : 'bg-[#fb923c]/15 text-[#fb923c]'
                    }`}
                  >
                    {ev.direction}
                  </span>
                  <span className="text-[10px] text-[var(--color-status-ok)]">
                    {(ev.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Right Column: Cumulative Load Chart & Telemetry (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <Panel className="flex flex-col">
            <PanelHeader
              title="Cumulative Loading Progress vs Manifest Target"
              icon={<TrendingUp size={16} />}
              actions={
                <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--color-n-400)]">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-0.5 bg-[#38bdf8]" /> Counted Progress
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-0.5 border-t border-dashed border-[#5A6B8A]" /> Manifest 500
                  </span>
                </div>
              }
            />
            <PanelBody className="p-4">
              <UPlotChart options={chartOptions} data={chartData} height={250} />
              <div className="mt-4 pt-3 border-t border-[var(--color-n-200)] grid grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-[var(--color-n-400)] uppercase">Completion</div>
                  <div className="text-base font-semibold text-[var(--color-status-ok)] mt-0.5">
                    90.0% (450/500)
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--color-n-400)] uppercase">Mean Flow Rate</div>
                  <div className="text-base font-semibold text-[var(--color-n-700)] mt-0.5">
                    23 bags / min
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--color-n-400)] uppercase">Est. Completion</div>
                  <div className="text-base font-semibold text-[var(--color-accent)] mt-0.5">
                    ~2.5 mins
                  </div>
                </div>
              </div>
            </PanelBody>
          </Panel>

          {/* Verification Badge Panel */}
          <div className="p-3 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded bg-[var(--color-status-ok)]/15 text-[var(--color-status-ok)]">
                <FileCheck size={18} />
              </span>
              <div>
                <div className="text-xs font-medium text-[var(--color-n-700)] font-mono">
                  MANIFEST VERIFICATION: PASS
                </div>
                <div className="text-[11px] text-[var(--color-n-400)] font-sans">
                  Current count is tracking within 1.2% allowable tolerance. No manual intervention required.
                </div>
              </div>
            </div>
            <StatusPill status="ok" label="OK" />
          </div>
        </div>
      </div>

      {/* 3. Bottom Section: Per-Door Breakdown Cards */}
      <Panel>
        <PanelHeader
          title="Per-Door Telemetry & Bag Flow Breakdown"
          icon={<Layers size={16} />}
        />
        <PanelBody className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Door A Card */}
          <div className="p-4 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio size={14} className="text-[var(--color-status-live)] animate-pulse" />
                <span className="text-sm font-semibold text-[var(--color-n-700)] font-mono">
                  DOOR A (Primary Chute)
                </span>
              </div>
              <StatusPill status="live" label="ACTIVE • 14 B/MIN" />
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-2 rounded bg-[var(--color-n-150)] border border-[var(--color-n-200)]">
                <div className="text-[10px] text-[var(--color-n-400)]">Bags Passed</div>
                <div className="text-base font-bold text-[var(--color-n-800)] mt-0.5">275</div>
              </div>
              <div className="p-2 rounded bg-[var(--color-n-150)] border border-[var(--color-n-200)]">
                <div className="text-[10px] text-[var(--color-n-400)]">Camera</div>
                <div className="text-base font-bold text-[var(--color-n-800)] mt-0.5">CAM-01</div>
              </div>
              <div className="p-2 rounded bg-[var(--color-n-150)] border border-[var(--color-n-200)]">
                <div className="text-[10px] text-[var(--color-n-400)]">Accuracy</div>
                <div className="text-base font-bold text-[var(--color-status-ok)] mt-0.5">99.2%</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--color-n-400)] font-mono pt-1 border-t border-[var(--color-n-200)]">
              <span>Boundary Line: X:120 Y:540</span>
              <span>Track Algorithm: ByteTrack-v2</span>
            </div>
          </div>

          {/* Door B Card */}
          <div className="p-4 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio size={14} className="text-[var(--color-status-ok)]" />
                <span className="text-sm font-semibold text-[var(--color-n-700)] font-mono">
                  DOOR B (Secondary Chute)
                </span>
              </div>
              <StatusPill status="ok" label="NOMINAL • 9 B/MIN" />
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-2 rounded bg-[var(--color-n-150)] border border-[var(--color-n-200)]">
                <div className="text-[10px] text-[var(--color-n-400)]">Bags Passed</div>
                <div className="text-base font-bold text-[var(--color-n-800)] mt-0.5">175</div>
              </div>
              <div className="p-2 rounded bg-[var(--color-n-150)] border border-[var(--color-n-200)]">
                <div className="text-[10px] text-[var(--color-n-400)]">Camera</div>
                <div className="text-base font-bold text-[var(--color-n-800)] mt-0.5">CAM-02</div>
              </div>
              <div className="p-2 rounded bg-[var(--color-n-150)] border border-[var(--color-n-200)]">
                <div className="text-[10px] text-[var(--color-n-400)]">Accuracy</div>
                <div className="text-base font-bold text-[var(--color-status-ok)] mt-0.5">98.6%</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--color-n-400)] font-mono pt-1 border-t border-[var(--color-n-200)]">
              <span>Boundary Line: X:120 Y:560</span>
              <span>Track Algorithm: ByteTrack-v2</span>
            </div>
          </div>
        </PanelBody>
      </Panel>
    </div>
  )
}
