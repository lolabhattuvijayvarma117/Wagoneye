import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Boxes,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Download,
} from 'lucide-react'
import {
  Panel,
  PanelHeader,
  StatusPill,
  Button,
  DataTable,
} from '@/components/ui'
import type { ColumnDef } from '@tanstack/react-table'

interface WagonRecord {
  id: string
  trainId: string
  berth: string
  commodity: string
  status: 'ok' | 'warn' | 'alert' | 'idle' | 'live'
  statusLabel: string
  plannedCount: number
  countedBags: number
  deltaPercent: number
  lastMovement: string
  confidence: number
}

const WAGONS_FLEET_DATA: WagonRecord[] = [
  {
    id: 'TRN-REAL-WGN',
    trainId: 'TR-2210',
    berth: 'Berth 4',
    commodity: 'Food Grains (Wheat)',
    status: 'ok',
    statusLabel: 'VERIFIED',
    plannedCount: 500,
    countedBags: 450,
    deltaPercent: 0.0,
    lastMovement: '2m ago',
    confidence: 0.94,
  },
  {
    id: 'WGN-8492',
    trainId: 'TR-2210',
    berth: 'Berth 4',
    commodity: 'Food Grains (Wheat)',
    status: 'live',
    statusLabel: 'ACTIVE',
    plannedCount: 500,
    countedBags: 450,
    deltaPercent: -1.2,
    lastMovement: 'Just now',
    confidence: 0.97,
  },
  {
    id: 'WGN-8493',
    trainId: 'TR-2210',
    berth: 'Berth 4',
    commodity: 'Food Grains (Wheat)',
    status: 'live',
    statusLabel: 'ACTIVE',
    plannedCount: 500,
    countedBags: 421,
    deltaPercent: -0.8,
    lastMovement: '1m ago',
    confidence: 0.95,
  },
  {
    id: 'WGN-8494',
    trainId: 'TR-2210',
    berth: 'Berth 4',
    commodity: 'Food Grains (Wheat)',
    status: 'ok',
    statusLabel: 'VERIFIED',
    plannedCount: 500,
    countedBags: 502,
    deltaPercent: +0.4,
    lastMovement: '4m ago',
    confidence: 0.98,
  },
  {
    id: 'WGN-8495',
    trainId: 'TR-2210',
    berth: 'Berth 4',
    commodity: 'Food Grains (Wheat)',
    status: 'warn',
    statusLabel: 'MISMATCH',
    plannedCount: 500,
    countedBags: 468,
    deltaPercent: -6.4,
    lastMovement: '6m ago',
    confidence: 0.78,
  },
  {
    id: 'WGN-8496',
    trainId: 'TR-2210',
    berth: 'Berth 4',
    commodity: 'Food Grains (Wheat)',
    status: 'ok',
    statusLabel: 'VERIFIED',
    plannedCount: 500,
    countedBags: 500,
    deltaPercent: 0.0,
    lastMovement: '12m ago',
    confidence: 0.99,
  },
  {
    id: 'WGN-8497',
    trainId: 'TR-2210',
    berth: 'Berth 4',
    commodity: 'Food Grains (Wheat)',
    status: 'idle',
    statusLabel: 'QUEUED',
    plannedCount: 500,
    countedBags: 0,
    deltaPercent: 0.0,
    lastMovement: 'Docked',
    confidence: 1.0,
  },
  {
    id: 'WGN-3101',
    trainId: 'TR-1044',
    berth: 'Berth 2',
    commodity: 'Urea Fertilizer',
    status: 'live',
    statusLabel: 'UNLOADING',
    plannedCount: 600,
    countedBags: 512,
    deltaPercent: -1.5,
    lastMovement: '2m ago',
    confidence: 0.96,
  },
  {
    id: 'WGN-3102',
    trainId: 'TR-1044',
    berth: 'Berth 2',
    commodity: 'Urea Fertilizer',
    status: 'warn',
    statusLabel: 'REVIEW REQ',
    plannedCount: 600,
    countedBags: 540,
    deltaPercent: +3.2,
    lastMovement: '5m ago',
    confidence: 0.68,
  },
  {
    id: 'WGN-7201',
    trainId: 'TR-3390',
    berth: 'Siding C',
    commodity: 'Refined Sugar',
    status: 'ok',
    statusLabel: 'COMPLETED',
    plannedCount: 450,
    countedBags: 450,
    deltaPercent: 0.0,
    lastMovement: '35m ago',
    confidence: 0.98,
  },
]

export default function Wagons() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'warn' | 'ok'>('all')

  const filteredData = useMemo(() => {
    return WAGONS_FLEET_DATA.filter((w) => {
      const matchesSearch =
        w.id.toLowerCase().includes(search.toLowerCase()) ||
        w.trainId.toLowerCase().includes(search.toLowerCase()) ||
        w.commodity.toLowerCase().includes(search.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'live' && (w.status === 'live' || w.statusLabel === 'ACTIVE')) ||
        (statusFilter === 'warn' && w.status === 'warn') ||
        (statusFilter === 'ok' && w.status === 'ok')
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  const columns = useMemo<ColumnDef<WagonRecord, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Wagon ID',
        size: 130,
        cell: (info) => (
          <div className="flex items-center gap-1.5 font-semibold text-[var(--color-n-800)] num">
            <span>{String(info.getValue())}</span>
            <ExternalLink size={12} className="text-[var(--color-n-400)] opacity-60" />
          </div>
        ),
      },
      {
        accessorKey: 'trainId',
        header: 'Train / Rake',
        size: 110,
        cell: (info) => (
          <span className="text-[var(--color-n-600)] num">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: 'berth',
        header: 'Berth / Siding',
        size: 110,
        cell: (info) => (
          <span className="text-[var(--color-n-600)]">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: 'commodity',
        header: 'Commodity',
        size: 150,
        cell: (info) => (
          <span className="text-[var(--color-n-700)] text-xs">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Reconciliation Status',
        size: 140,
        cell: (info) => {
          const row = info.row.original
          return <StatusPill status={row.status} label={row.statusLabel} />
        },
      },
      {
        accessorKey: 'plannedCount',
        header: 'Planned',
        size: 90,
        cell: (info) => (
          <div className="text-right num pr-2 text-[var(--color-n-600)]">
            {Number(info.getValue()).toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: 'countedBags',
        header: 'CV Counted',
        size: 100,
        cell: (info) => (
          <div className="text-right num pr-2 font-medium text-[var(--color-n-800)]">
            {Number(info.getValue()).toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: 'deltaPercent',
        header: 'Delta %',
        size: 90,
        cell: (info) => {
          const val = Number(info.getValue())
          const isZero = val === 0
          const isWarn = Math.abs(val) > 2
          return (
            <div
              className={`text-right num pr-2 font-medium ${
                isZero
                  ? 'text-[var(--color-status-ok)]'
                  : isWarn
                  ? 'text-[var(--color-status-warn)]'
                  : 'text-[var(--color-n-600)]'
              }`}
            >
              {val > 0 ? `+${val.toFixed(1)}%` : `${val.toFixed(1)}%`}
            </div>
          )
        },
      },
      {
        accessorKey: 'confidence',
        header: 'Mean Conf.',
        size: 90,
        cell: (info) => (
          <div className="text-right num pr-2 text-[var(--color-n-600)]">
            {(Number(info.getValue()) * 100).toFixed(1)}%
          </div>
        ),
      },
      {
        accessorKey: 'lastMovement',
        header: 'Last Gate Pass',
        size: 110,
        cell: (info) => (
          <span className="text-[var(--color-n-500)] text-[11px] num">
            {String(info.getValue())}
          </span>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-5 pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-300)]">
        <div>
          <div className="flex items-center gap-2">
            <Boxes size={18} className="text-[var(--color-accent)]" />
            <h1 className="text-base font-semibold text-[var(--color-n-800)] tracking-tight">
              Wagon Operations Fleet
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-n-200)] text-[var(--color-n-600)] num">
              {filteredData.length} Wagons
            </span>
          </div>
          <p className="text-xs text-[var(--color-n-500)] mt-1">
            Real-time optical tallying and manifest delta analysis per docked wagon.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const csv =
                'WagonID,TrainID,Berth,Commodity,Planned,Counted,DeltaPercent\n' +
                filteredData
                  .map(
                    (w) =>
                      `${w.id},${w.trainId},${w.berth},${w.commodity},${w.plannedCount},${w.countedBags},${w.deltaPercent}`
                  )
                  .join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `wagons-manifest-reconciliation-${Date.now()}.csv`
              a.click()
            }}
            className="h-8 gap-1.5"
          >
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-md bg-[var(--color-n-50)] border border-[var(--color-n-300)]">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-n-400)]" />
          <input
            type="text"
            placeholder="Search Wagon ID, Rake, Commodity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs rounded bg-[var(--color-n-150)] text-[var(--color-n-800)] border border-[var(--color-n-300)] focus:border-[var(--color-accent)] focus:outline-none num placeholder:text-[var(--color-n-400)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-[11px] text-[var(--color-n-400)] uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Filter size={12} /> Status:
          </span>
          {(['all', 'live', 'warn', 'ok'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-xs uppercase font-medium transition-colors shrink-0 num ${
                statusFilter === st
                  ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]/30'
                  : 'bg-[var(--color-n-150)] text-[var(--color-n-500)] hover:text-[var(--color-n-700)] border border-[var(--color-n-300)]'
              }`}
            >
              {st === 'all' ? 'All Wagons' : st === 'live' ? 'Active Live' : st === 'warn' ? 'Discrepant' : 'Nominal'}
            </button>
          ))}
        </div>
      </div>

      {/* Virtualized DataTable */}
      <Panel className="border border-[var(--color-n-300)]">
        <PanelHeader
          title="Fleet Manifest & Optical Count Ledger"
          icon={<ArrowUpDown size={15} />}
          actions={
            <span className="text-[11px] text-[var(--color-n-500)] num">
              Click any wagon row to inspect camera event clips
            </span>
          }
        />
        <div className="h-[520px]">
          <DataTable
            data={filteredData}
            columns={columns}
            rowHeight={42}
            onRowClick={(row) => navigate(`/wagons/${row.id}`)}
          />
        </div>
      </Panel>
    </div>
  )
}
