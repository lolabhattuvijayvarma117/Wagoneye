import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  ArrowRight,
  Cpu,
  Layers,
  MapPin,
  Terminal,
  Activity,
  Award,
  TrainFront,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { Button, StatusPill } from '@/components/ui'

export default function Corporate() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--color-n-0)] text-[var(--color-n-700)] selection:bg-[var(--color-accent)] selection:text-black">
      {/* 1. Corporate Header */}
      <header className="sticky top-0 z-50 h-16 bg-[var(--color-n-100)]/90 backdrop-blur border-b border-[var(--color-n-300)] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)]">
            <TrainFront size={18} />
          </div>
          <div>
            <span className="text-sm font-bold tracking-wider uppercase text-[var(--color-n-800)] num block leading-none">
              WAGONEYE
            </span>
            <span className="text-[10px] text-[var(--color-n-500)] tracking-widest uppercase block mt-0.5">
              Port & Rail Vision Systems
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[var(--color-n-600)]">
          <a href="#services" className="hover:text-[var(--color-accent)] transition-colors">
            CV Capabilities
          </a>
          <a href="#work-orders" className="hover:text-[var(--color-accent)] transition-colors">
            Rake Work Orders
          </a>
          <a href="#locations" className="hover:text-[var(--color-accent)] transition-colors">
            Port Terminals
          </a>
          <a href="#clients" className="hover:text-[var(--color-accent)] transition-colors">
            Sectors & Compliance
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/login')}
            className="text-xs h-8"
          >
            Operator Sign In
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-xs h-8 gap-1.5"
          >
            Control Room <ArrowRight size={14} />
          </Button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative px-6 py-20 max-w-7xl mx-auto border-b border-[var(--color-n-300)]">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-n-150)] border border-[var(--color-n-300)] text-xs font-mono text-[var(--color-accent)]">
            <Activity size={14} className="animate-pulse" />
            <span>Operational at Bulk Cargo Berth 4 • Automated Siding Telemetry</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-n-800)] leading-tight">
            Autonomous Computer Vision Bag Tallying for Port Rail Freight
          </h1>

          <p className="text-base text-[var(--color-n-600)] leading-relaxed">
            WagonEye eliminates paper tallies, theft, and billing disputes across bulk cargo train
            wagons. Powered by edge-native YOLOv8s and ByteTrack algorithms, our system detects,
            tracks, and reconciles sack movements across virtual door planes in real time with 99.4%
            reconciliation accuracy.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="text-sm h-11 px-6 gap-2"
            >
              Launch Yard Control Room <ArrowRight size={16} />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                const el = document.getElementById('work-orders')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="text-sm h-11 px-6"
            >
              Inspect Work Orders
            </Button>
          </div>
        </div>

        {/* Live Aggregated Metrics Strip */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-md bg-[var(--color-n-50)] border border-[var(--color-n-300)]">
          <div>
            <span className="text-[10px] text-[var(--color-n-500)] uppercase tracking-wider block">
              Bags Tallied Today
            </span>
            <div className="text-2xl font-bold num text-[var(--color-n-800)] mt-1">
              8,189 <span className="text-xs text-[var(--color-status-ok)] font-normal">▲ 12%</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-[var(--color-n-500)] uppercase tracking-wider block">
              Active Rakes & Sidings
            </span>
            <div className="text-2xl font-bold num text-[var(--color-accent)] mt-1">
              3 Rakes / 36 Wagons
            </div>
          </div>
          <div>
            <span className="text-[10px] text-[var(--color-n-500)] uppercase tracking-wider block">
              Manifest Reconciliation
            </span>
            <div className="text-2xl font-bold num text-[var(--color-status-ok)] mt-1">
              99.4% Verified
            </div>
          </div>
          <div>
            <span className="text-[10px] text-[var(--color-n-500)] uppercase tracking-wider block">
              Edge Pipeline Latency
            </span>
            <div className="text-2xl font-bold num text-[var(--color-n-800)] mt-1">
              120 ms <span className="text-xs text-[var(--color-n-500)] font-normal">WebRTC</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Services & CV Capabilities */}
      <section id="services" className="px-6 py-16 max-w-7xl mx-auto border-b border-[var(--color-n-300)]">
        <div className="mb-10">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)]">
            Core Architecture
          </span>
          <h2 className="text-2xl font-bold text-[var(--color-n-800)] mt-1">
            Engineered for Harsh Industrial Cargo Yards
          </h2>
          <p className="text-xs text-[var(--color-n-500)] mt-1">
            Deterministic optical inspection built to run reliably on edge workstations and low-bandwidth port networks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="p-5 rounded-md bg-[var(--color-n-50)] border border-[var(--color-n-300)] space-y-3">
            <div className="w-9 h-9 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center">
              <Cpu size={18} />
            </div>
            <h3 className="text-sm font-semibold text-[var(--color-n-800)]">
              1. Real-Time Sack Detection
            </h3>
            <p className="text-xs text-[var(--color-n-500)] leading-relaxed">
              YOLOv8s running at 25+ FPS paired with zero-shot OWL-ViT pre-labeling. Detects burlap
              sacks, poly-woven fertilizer bags, and sugar bags through dust and uneven platform lighting.
            </p>
          </div>

          <div className="p-5 rounded-md bg-[var(--color-n-50)] border border-[var(--color-n-300)] space-y-3">
            <div className="w-9 h-9 rounded bg-[var(--color-status-ok)]/10 text-[var(--color-status-ok)] flex items-center justify-center">
              <Activity size={18} />
            </div>
            <h3 className="text-sm font-semibold text-[var(--color-n-800)]">
              2. Occlusion-Proof ByteTrack
            </h3>
            <p className="text-xs text-[var(--color-n-500)] leading-relaxed">
              30-frame persistent Kalman-filter tracking buffers track IDs through door pillar
              occlusions and crowding when two laborers cross gates simultaneously.
            </p>
          </div>

          <div className="p-5 rounded-md bg-[var(--color-n-50)] border border-[var(--color-n-300)] space-y-3">
            <div className="w-9 h-9 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center">
              <Layers size={18} />
            </div>
            <h3 className="text-sm font-semibold text-[var(--color-n-800)]">
              3. Vector Boundary Crossing
            </h3>
            <p className="text-xs text-[var(--color-n-500)] leading-relaxed">
              Configurable 2D segment intersection lines with directional normal vectors calculate
              exact Loaded vs. Unloaded vectors, deduplicating by track ID so bags are never double-counted.
            </p>
          </div>

          <div className="p-5 rounded-md bg-[var(--color-n-50)] border border-[var(--color-n-300)] space-y-3">
            <div className="w-9 h-9 rounded bg-[var(--color-status-warn)]/10 text-[var(--color-status-warn)] flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <h3 className="text-sm font-semibold text-[var(--color-n-800)]">
              4. Manifest Audit & Review
            </h3>
            <p className="text-xs text-[var(--color-n-500)] leading-relaxed">
              Flags low-confidence events (&lt; 0.60) into an operator review drawer and reconciles
              final wagon counts against official shipper manifests with instant CSV exports.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Operations & Active Work Orders */}
      <section id="work-orders" className="px-6 py-16 max-w-7xl mx-auto border-b border-[var(--color-n-300)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)]">
              Terminal Work Orders
            </span>
            <h2 className="text-2xl font-bold text-[var(--color-n-800)] mt-1">
              Active Rake Schedules & Manifest Reconciliation
            </h2>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/rakes')}
            className="text-xs h-8 gap-1.5 self-start md:self-auto"
          >
            All Rakes View <ChevronRight size={14} />
          </Button>
        </div>

        <div className="rounded-md border border-[var(--color-n-300)] bg-[var(--color-n-50)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[var(--color-n-100)] border-b border-[var(--color-n-300)] uppercase font-mono text-[10px] text-[var(--color-n-500)] tracking-wider">
                <tr>
                  <th className="p-3">Work Order / Rake ID</th>
                  <th className="p-3">Berth / Siding</th>
                  <th className="p-3">Commodity</th>
                  <th className="p-3">Supervisor</th>
                  <th className="p-3 text-right">Manifest Target</th>
                  <th className="p-3 text-right">CV Tallied</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-n-300)] text-[var(--color-n-700)]">
                <tr className="hover:bg-[var(--color-n-100)]/60 transition-colors">
                  <td className="p-3 font-semibold num text-[var(--color-n-800)]">
                    RAKE-TRN-04 (TR-2210)
                  </td>
                  <td className="p-3">Berth 4 • Bulk Grain Loop</td>
                  <td className="p-3 text-[var(--color-n-600)]">Food Grains (Wheat)</td>
                  <td className="p-3 text-[var(--color-n-600)]">Rajesh Sharma</td>
                  <td className="p-3 text-right num">6,000 bags</td>
                  <td className="p-3 text-right num font-semibold text-[var(--color-accent)]">
                    5,410 bags
                  </td>
                  <td className="p-3 text-center">
                    <StatusPill status="live" label="IN PROGRESS" />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => navigate('/wagons/TRN-REAL-WGN')}
                      className="text-[var(--color-accent)] hover:underline text-xs inline-flex items-center gap-1 font-mono"
                    >
                      Inspect <ExternalLink size={12} />
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-[var(--color-n-100)]/60 transition-colors">
                  <td className="p-3 font-semibold num text-[var(--color-n-800)]">
                    RAKE-TRN-02 (TR-1044)
                  </td>
                  <td className="p-3">Berth 2 • Fertilizer Siding</td>
                  <td className="p-3 text-[var(--color-n-600)]">Urea (50kg bags)</td>
                  <td className="p-3 text-[var(--color-n-600)]">M. Anand</td>
                  <td className="p-3 text-right num">7,200 bags</td>
                  <td className="p-3 text-right num font-semibold text-[var(--color-status-ok)]">
                    7,192 bags
                  </td>
                  <td className="p-3 text-center">
                    <StatusPill status="ok" label="CLEARED" />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => navigate('/reports')}
                      className="text-[var(--color-accent)] hover:underline text-xs inline-flex items-center gap-1 font-mono"
                    >
                      Audit Report <ExternalLink size={12} />
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-[var(--color-n-100)]/60 transition-colors">
                  <td className="p-3 font-semibold num text-[var(--color-n-800)]">
                    RAKE-TRN-07 (TR-4480)
                  </td>
                  <td className="p-3">Siding C • Sugar Loop</td>
                  <td className="p-3 text-[var(--color-n-600)]">Refined Sugar</td>
                  <td className="p-3 text-[var(--color-n-500)]">Pending Shift 2</td>
                  <td className="p-3 text-right num">4,500 bags</td>
                  <td className="p-3 text-right num text-[var(--color-n-500)]">0 bags</td>
                  <td className="p-3 text-center">
                    <StatusPill status="idle" label="QUEUED" />
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-[var(--color-n-400)] text-xs font-mono">Standby</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Port Locations Directory */}
      <section id="locations" className="px-6 py-16 max-w-7xl mx-auto border-b border-[var(--color-n-300)]">
        <div className="mb-8">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)]">
            Deployments & Infrastructure
          </span>
          <h2 className="text-2xl font-bold text-[var(--color-n-800)] mt-1">
            Port Terminals & Rail Freight Sidings
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              name: 'Chennai Port Bulk Terminal',
              berth: 'Berth 4 (Grains & Pulses)',
              cams: 4,
              rakes: 1,
              status: 'live',
              tz: 'UTC+05:30',
            },
            {
              name: 'Visakhapatnam Rail Siding',
              berth: 'Berth 2 (Fertilizer Yard)',
              cams: 6,
              rakes: 1,
              status: 'live',
              tz: 'UTC+05:30',
            },
            {
              name: 'Kandla West Terminal',
              berth: 'Grain Silo Loop C',
              cams: 4,
              rakes: 1,
              status: 'live',
              tz: 'UTC+05:30',
            },
            {
              name: 'Paradip Industrial Siding',
              berth: 'Bulk Export Bay 1',
              cams: 2,
              rakes: 0,
              status: 'idle',
              tz: 'UTC+05:30',
            },
          ].map((loc) => (
            <div
              key={loc.name}
              className="p-4 rounded-md bg-[var(--color-n-50)] border border-[var(--color-n-300)] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-n-800)]">{loc.name}</span>
                <StatusPill
                  status={loc.status === 'live' ? 'live' : 'idle'}
                  label={loc.status === 'live' ? 'ONLINE' : 'STANDBY'}
                />
              </div>
              <div className="text-[11px] text-[var(--color-n-500)] flex items-center gap-1.5">
                <MapPin size={12} className="text-[var(--color-n-400)]" />
                <span>{loc.berth}</span>
              </div>
              <div className="pt-2 border-t border-[var(--color-n-200)] flex items-center justify-between text-[11px] num text-[var(--color-n-600)]">
                <span>{loc.cams} Cameras</span>
                <span>{loc.tz}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Clients, Compliance & Trust */}
      <section id="clients" className="px-6 py-16 max-w-7xl mx-auto border-b border-[var(--color-n-300)]">
        <div className="mb-8">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)]">
            Industrial Trust & Governance
          </span>
          <h2 className="text-2xl font-bold text-[var(--color-n-800)] mt-1">
            Built for Port Authorities & Rail Shippers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="p-5 rounded-md bg-[var(--color-n-50)] border border-[var(--color-n-300)] space-y-2">
            <h3 className="font-semibold text-sm text-[var(--color-n-800)] flex items-center gap-2">
              <ShieldCheck size={16} className="text-[var(--color-status-ok)]" />
              SLA & Manifest Reconciliation
            </h3>
            <p className="text-[var(--color-n-500)] leading-relaxed">
              Guaranteed &lt; 0.5% variance on standard burlap and poly-woven sacks. Automated
              reconciliation against CSV manifests reduces detention demurrage charges and paperwork
              clearance times by over 80%.
            </p>
          </div>

          <div className="p-5 rounded-md bg-[var(--color-n-50)] border border-[var(--color-n-300)] space-y-2">
            <h3 className="font-semibold text-sm text-[var(--color-n-800)] flex items-center gap-2">
              <Award size={16} className="text-[var(--color-accent)]" />
              Customs & Audit Compliance
            </h3>
            <p className="text-[var(--color-n-500)] leading-relaxed">
              Every crossing event records UTC timestamps, bounding box coordinates, and cropped
              thumbnails. One-click CVAT XML 1.1 and COCO JSON export supports legal audit disputes
              and active learning retraining.
            </p>
          </div>

          <div className="p-5 rounded-md bg-[var(--color-n-50)] border border-[var(--color-n-300)] space-y-2">
            <h3 className="font-semibold text-sm text-[var(--color-n-800)] flex items-center gap-2">
              <Terminal size={16} className="text-[var(--color-n-400)]" />
              Edge Architecture & Security
            </h3>
            <p className="text-[var(--color-n-500)] leading-relaxed">
              Operates locally at berths via MediaMTX WebRTC and local SQLite/PostgreSQL storage. No
              raw camera credentials or unencrypted RTSP streams leave the yard firewall.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Corporate Footer */}
      <footer className="px-6 py-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[var(--color-n-500)]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center font-bold font-mono">
            W
          </div>
          <span className="font-mono text-[var(--color-n-700)]">
            WagonEye Systems • Yard Control Architecture v2.4
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/dashboard')} className="hover:text-[var(--color-n-800)]">
            Control Room
          </button>
          <button onClick={() => navigate('/wagons')} className="hover:text-[var(--color-n-800)]">
            Fleet Ledger
          </button>
          <button onClick={() => navigate('/cameras')} className="hover:text-[var(--color-n-800)]">
            Sensor Health
          </button>
          <button onClick={() => navigate('/login')} className="hover:text-[var(--color-n-800)]">
            Operator Login
          </button>
        </div>

        <div className="text-[11px] num">
          API Status: <span className="text-[var(--color-status-ok)]">● 127.0.0.1:8000 (FastAPI)</span>
        </div>
      </footer>
    </div>
  )
}
