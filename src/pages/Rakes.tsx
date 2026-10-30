import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrainTrack,
  ArrowRight,
  Layers,
  MapPin,
} from 'lucide-react'
import {
  Panel,
  PanelHeader,
  PanelBody,
  StatusPill,
  Button,
} from '@/components/ui'

interface RakeWorkOrder {
  rakeId: string
  trainId: string
  berth: string
  commodity: string
  manifestBags: number
  countedBags: number
  wagonsCount: number
  status: 'active' | 'completed' | 'queued'
  statusLabel: string
  supervisor: string
  dockedAt: string
  etaCompletion: string
  wagons: Array<{
    id: string
    seq: number
    status: 'ok' | 'warn' | 'live' | 'idle'
    counted: number
    planned: number
    delta: number
  }>
}

const RAKES_DATA: RakeWorkOrder[] = [
  {
    rakeId: 'RAKE-TRN-04',
    trainId: 'TR-2210',
    berth: 'Berth 4 • Bulk Grain Terminal',
    commodity: 'Food Grains (Wheat Grade A)',
    manifestBags: 6000,
    countedBags: 5410,
    wagonsCount: 12,
    status: 'active',
    statusLabel: 'IN PROGRESS',
    supervisor: 'Rajesh Sharma (Berth Master)',
    dockedAt: 'Today, 06:15 UTC',
    etaCompletion: '~45 mins',
    wagons: [
      { id: 'WGN-8491', seq: 1, status: 'ok', counted: 500, planned: 500, delta: 0 },
      { id: 'WGN-8492', seq: 2, status: 'live', counted: 450, planned: 500, delta: -1.2 },
      { id: 'WGN-8493', seq: 3, status: 'live', counted: 421, planned: 500, delta: -0.8 },
      { id: 'WGN-8494', seq: 4, status: 'ok', counted: 502, planned: 500, delta: +0.4 },
      { id: 'WGN-8495', seq: 5, status: 'warn', counted: 468, planned: 500, delta: -6.4 },
      { id: 'WGN-8496', seq: 6, status: 'ok', counted: 500, planned: 500, delta: 0 },
      { id: 'WGN-8497', seq: 7, status: 'idle', counted: 0, planned: 500, delta: 0 },
      { id: 'WGN-8498', seq: 8, status: 'idle', counted: 0, planned: 500, delta: 0 },
      { id: 'WGN-8499', seq: 9, status: 'ok', counted: 500, planned: 500, delta: 0 },
      { id: 'WGN-8500', seq: 10, status: 'ok', counted: 505, planned: 500, delta: +1.0 },
      { id: 'WGN-8501', seq: 11, status: 'warn', counted: 472, planned: 500, delta: -5.6 },
      { id: 'WGN-8502', seq: 12, status: 'idle', counted: 0, planned: 500, delta: 0 },
    ],
  },
  {
    rakeId: 'RAKE-TRN-02',
    trainId: 'TR-1044',
    berth: 'Berth 2 • Fertilizer Siding',
    commodity: 'Urea (46% Nitrogen) 50kg Bags',
    manifestBags: 7200,
    countedBags: 7192,
    wagonsCount: 12,
    status: 'completed',
    statusLabel: 'VERIFIED & CLEARED',
    supervisor: 'M. Anand (Shift 1 Lead)',
    dockedAt: 'Yesterday, 22:30 UTC',
    etaCompletion: 'Completed',
    wagons: Array.from({ length: 12 }, (_, i) => ({
      id: `WGN-310${i + 1}`,
      seq: i + 1,
      status: 'ok',
      counted: 600,
      planned: 600,
      delta: 0,
    })),
  },
  {
    rakeId: 'RAKE-TRN-07',
    trainId: 'TR-4480',
    berth: 'Siding C • Sugar Freight Loop',
    commodity: 'Refined White Sugar',
    manifestBags: 4500,
    countedBags: 0,
    wagonsCount: 10,
    status: 'queued',
    statusLabel: 'SCHEDULED DOCKING',
    supervisor: 'Pending Shift 2 Assignment',
    dockedAt: 'Scheduled 14:00 UTC',
    etaCompletion: 'Not Started',
    wagons: Array.from({ length: 10 }, (_, i) => ({
      id: `WGN-720${i + 1}`,
      seq: i + 1,
      status: 'idle',
      counted: 0,
      planned: 450,
      delta: 0,
    })),
  },
]

export default function Rakes() {
  const navigate = useNavigate()
  const [selectedRake, setSelectedRake] = useState<RakeWorkOrder>(RAKES_DATA[0])

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-300)]">
        <div>
          <div className="flex items-center gap-2">
            <TrainTrack size={18} className="text-[var(--color-accent)]" />
            <h1 className="text-base font-semibold text-[var(--color-n-800)] tracking-tight">
              Rakes & Train Work Orders
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-n-200)] text-[var(--color-n-600)] num">
              3 Rakes In Yard
            </span>
          </div>
          <p className="text-xs text-[var(--color-n-500)] mt-1">
            Train-level optical tallying, multi-wagon sequence maps, and manifest clearing status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="h-8 gap-1.5"
          >
            <ArrowRight size={14} /> Open Control Room
          </Button>
        </div>
      </div>

      {/* Rake Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {RAKES_DATA.map((rake) => {
          const isSelected = selectedRake.rakeId === rake.rakeId
          const percent = Math.min(100, Math.round((rake.countedBags / rake.manifestBags) * 100))
          return (
            <div
              key={rake.rakeId}
              onClick={() => setSelectedRake(rake)}
              className={`p-4 rounded-md border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-[var(--color-n-100)] border-[var(--color-accent)] shadow-[0_0_0_1px_var(--color-accent)]'
                  : 'bg-[var(--color-n-50)] border-[var(--color-n-300)] hover:bg-[var(--color-n-100)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[var(--color-n-800)] num">
                    {rake.rakeId} • {rake.trainId}
                  </span>
                  <StatusPill
                    status={rake.status === 'active' ? 'live' : rake.status === 'completed' ? 'ok' : 'idle'}
                    label={rake.statusLabel}
                  />
                </div>
                <div className="text-xs text-[var(--color-n-600)] mt-1 flex items-center gap-1.5">
                  <MapPin size={12} className="text-[var(--color-n-400)]" />
                  <span>{rake.berth}</span>
                </div>
                <div className="text-[11px] text-[var(--color-n-400)] mt-0.5">
                  Cargo: {rake.commodity}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs num mb-1.5">
                  <span className="text-[var(--color-n-500)]">Progress</span>
                  <span className="font-medium text-[var(--color-n-800)]">
                    {rake.countedBags.toLocaleString()} / {rake.manifestBags.toLocaleString()} bags ({percent}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--color-n-200)] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      rake.status === 'completed' ? 'bg-[var(--color-status-ok)]' : 'bg-[var(--color-accent)]'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Rake Deep Dive */}
      <Panel className="border border-[var(--color-n-300)]">
        <PanelHeader
          title={`Work Order Detail: ${selectedRake.rakeId} (${selectedRake.trainId})`}
          icon={<Layers size={16} />}
          actions={
            <div className="flex items-center gap-4 text-xs font-mono text-[var(--color-n-500)]">
              <span>Supervisor: {selectedRake.supervisor}</span>
              <span>Docked: {selectedRake.dockedAt}</span>
            </div>
          }
        />
        <PanelBody className="p-5 space-y-6">
          {/* Horizontal Wagon Sequence Visualization */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-[var(--color-n-500)] font-medium">
                Wagon String Sequence ({selectedRake.wagons.length} Wagons Coupled)
              </span>
              <div className="flex items-center gap-3 text-xs num">
                <span className="flex items-center gap-1 text-[var(--color-n-500)]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-status-ok)]" /> Nominal
                </span>
                <span className="flex items-center gap-1 text-[var(--color-n-500)]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-status-live)]" /> Active Gate
                </span>
                <span className="flex items-center gap-1 text-[var(--color-n-500)]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-status-warn)]" /> Discrepant
                </span>
              </div>
            </div>

            <div className="p-3 rounded-md bg-[var(--color-n-150)] border border-[var(--color-n-300)] overflow-x-auto">
              <div className="flex items-center gap-2 min-w-[780px]">
                {/* Engine Locomotive marker */}
                <div className="w-14 h-16 rounded bg-[var(--color-n-200)] border border-[var(--color-n-300)] flex flex-col items-center justify-center text-[10px] num text-[var(--color-n-400)] shrink-0">
                  <TrainTrack size={16} className="text-[var(--color-n-500)]" />
                  <span>ENG</span>
                </div>

                {/* Coupled Wagon Cells */}
                {selectedRake.wagons.map((w) => {
                  const borderCol =
                    w.status === 'live'
                      ? 'border-[var(--color-status-live)] bg-[var(--color-status-live)]/10 text-[var(--color-status-live)]'
                      : w.status === 'warn'
                      ? 'border-[var(--color-status-warn)] bg-[var(--color-status-warn)]/10 text-[var(--color-status-warn)]'
                      : w.status === 'ok'
                      ? 'border-[var(--color-status-ok)]/50 bg-[var(--color-status-ok)]/10 text-[var(--color-status-ok)]'
                      : 'border-[var(--color-n-300)] bg-[var(--color-n-100)] text-[var(--color-n-500)]'

                  return (
                    <div
                      key={w.id}
                      onClick={() => navigate(`/wagons/${w.id}`)}
                      title={`Click to view ${w.id} camera logs`}
                      className={`flex-1 h-16 rounded border p-1.5 flex flex-col justify-between cursor-pointer transition-all hover:scale-102 hover:shadow-md ${borderCol}`}
                    >
                      <div className="flex items-center justify-between text-[10px] num">
                        <span className="font-bold">#{w.seq}</span>
                        {w.delta !== 0 && (
                          <span>{w.delta > 0 ? `+${w.delta}%` : `${w.delta}%`}</span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono font-medium truncate text-center">
                        {w.id}
                      </div>
                      <div className="text-[9px] num text-center opacity-80">
                        {w.counted}/{w.planned}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Detailed Work Order Table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded bg-[var(--color-n-100)] border border-[var(--color-n-300)] space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-n-500)]">
                Manifest Loading Target
              </span>
              <div className="text-xl font-semibold num text-[var(--color-n-800)]">
                {selectedRake.manifestBags.toLocaleString()} Bags
              </div>
              <p className="text-[11px] text-[var(--color-n-500)]">
                Certified manifest issued by Port Rail Operations.
              </p>
            </div>

            <div className="p-3.5 rounded bg-[var(--color-n-100)] border border-[var(--color-n-300)] space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-n-500)]">
                CV Tallied Across Doors
              </span>
              <div className="text-xl font-semibold num text-[var(--color-accent)]">
                {selectedRake.countedBags.toLocaleString()} Bags
              </div>
              <p className="text-[11px] text-[var(--color-n-500)]">
                Recorded via ByteTrack & calibrated door planes.
              </p>
            </div>

            <div className="p-3.5 rounded bg-[var(--color-n-100)] border border-[var(--color-n-300)] space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-n-500)]">
                Net Delta / Variance
              </span>
              <div className="text-xl font-semibold num text-[var(--color-status-warn)]">
                {selectedRake.manifestBags - selectedRake.countedBags > 0
                  ? `-${(selectedRake.manifestBags - selectedRake.countedBags).toLocaleString()} Bags`
                  : 'Cleared (0 Delta)'}
              </div>
              <p className="text-[11px] text-[var(--color-n-500)]">
                Pending door gate passes or reconciliation review.
              </p>
            </div>
          </div>
        </PanelBody>
      </Panel>
    </div>
  )
}
