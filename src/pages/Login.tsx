import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrainFront,
  ArrowRight,
  ShieldCheck,
  Server,
  Radio,
  User,
  KeyRound,
} from 'lucide-react'
import { Button, StatusPill } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'

export default function Login() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [operatorId, setOperatorId] = useState('OP-8492')
  const [password, setPassword] = useState('••••••••••••')
  const [yardLocation, setYardLocation] = useState('yard-04')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      showToast({
        title: 'Authentication Successful',
        description: `Terminal session opened for operator ${operatorId} at Yard 04.`,
        variant: 'ok',
      })
      navigate('/dashboard')
    }, 600)
  }

  return (
    <div className="min-h-screen w-screen flex bg-[var(--color-n-0)] text-[var(--color-n-600)] overflow-hidden">
      {/* ── Left Side: Industrial Telemetry Console ──────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[var(--color-n-50)] border-r border-[var(--color-n-200)] flex-col justify-between p-10 overflow-hidden select-none">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(to right, #29334A 1px, transparent 1px), linear-gradient(to bottom, #29334A 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Diagonal industrial hazard line accent top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-status-live)] to-[var(--color-accent)]" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded bg-[var(--color-n-100)] text-[var(--color-accent)] border border-[var(--color-n-200)]">
              <TrainFront size={22} />
            </span>
            <div>
              <span
                className="text-base font-bold tracking-wider text-[var(--color-n-800)] uppercase font-mono"
              >
                WAGONEYE CONTROL CONSOLE
              </span>
              <div className="text-[10px] text-[var(--color-n-400)] font-mono">
                TERMINAL DISPATCH & COMPUTER VISION TELEMETRY v2.4.0
              </div>
            </div>
          </div>

          <StatusPill status="live" label="SYSTEMS ONLINE" />
        </div>

        {/* Middle: Industrial SVG Schematic & Diagnostics */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--color-n-100)] border border-[var(--color-n-200)] text-xs font-mono text-[var(--color-accent)]">
              <Radio size={13} className="animate-pulse" />
              PORT TERMINAL TELEMETRY BUS ACTIVE
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-n-800)] font-sans">
              High-Precision Freight & Wagon Bag Reconciliation
            </h1>
            <p className="text-xs text-[var(--color-n-400)] leading-relaxed font-sans">
              Autonomous dual-camera optical crossing detection powered by YOLOv8s and ByteTrack. Real-time manifest mismatch detection for bulk port operations.
            </p>
          </div>

          {/* Telemetry Readout Box */}
          <div className="p-4 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-[var(--color-n-400)] border-b border-[var(--color-n-200)] pb-2">
              <span className="flex items-center gap-1.5">
                <Server size={13} className="text-[var(--color-accent)]" />
                EDGE INFERENCE STACK
              </span>
              <span className="text-[var(--color-status-ok)]">ALL NODES SYNCD</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[var(--color-n-400)]">YOLOv8s Ingestion Engine:</span>
                <span className="text-[var(--color-status-ok)] font-medium">RUNNING (25 FPS)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-n-400)]">Active Optical Streams:</span>
                <span className="text-[var(--color-n-700)]">CAM-01, CAM-02, CAM-03</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-n-400)]">Active Yard Siding:</span>
                <span className="text-[var(--color-n-700)]">Yard 04 • Berth 4 Rail Line</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-n-400)]">Mean Detection Precision:</span>
                <span className="text-[var(--color-status-ok)] font-medium">99.4% (mAP50)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[var(--color-n-400)] border-t border-[var(--color-n-200)] pt-4">
          <span>PORT LOGISTICS CORRIDOR 04</span>
          <span>STATION ID: WGN-TER-04A</span>
        </div>
      </div>

      {/* ── Right Side: Crisp Industrial Login Form ──────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[var(--color-n-0)]">
        <div className="w-full max-w-sm space-y-7">
          {/* Header */}
          <div className="space-y-1.5">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <span className="p-1.5 rounded bg-[var(--color-n-100)] text-[var(--color-accent)] border border-[var(--color-n-200)]">
                <TrainFront size={18} />
              </span>
              <span className="text-sm font-bold font-mono tracking-wider text-[var(--color-n-800)] uppercase">
                WAGONEYE
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--color-n-800)] font-sans">
              Operator Sign-In
            </h2>
            <p className="text-xs text-[var(--color-n-400)] font-sans">
              Authenticate using your port yard terminal badge or operator credentials
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Operator ID */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono uppercase text-[var(--color-n-400)]">
                Operator Call-Sign / ID
              </label>
              <div className="relative">
                <User
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-n-400)] pointer-events-none"
                />
                <input
                  type="text"
                  required
                  value={operatorId}
                  onChange={e => setOperatorId(e.target.value)}
                  placeholder="e.g. OP-8492"
                  className="w-full h-9 pl-8 pr-3 text-xs bg-[var(--color-n-100)] text-[var(--color-n-800)] placeholder-[var(--color-n-400)] rounded border border-[var(--color-n-200)] focus:outline-none focus:border-[var(--color-accent)] font-mono transition-colors"
                />
              </div>
            </div>

            {/* Passcode */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-mono uppercase text-[var(--color-n-400)]">
                  Security Passcode
                </label>
                <span className="text-[10px] text-[var(--color-n-400)] font-mono">
                  Shift Auth
                </span>
              </div>
              <div className="relative">
                <KeyRound
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-n-400)] pointer-events-none"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter passcode"
                  className="w-full h-9 pl-8 pr-3 text-xs bg-[var(--color-n-100)] text-[var(--color-n-800)] placeholder-[var(--color-n-400)] rounded border border-[var(--color-n-200)] focus:outline-none focus:border-[var(--color-accent)] font-mono transition-colors"
                />
              </div>
            </div>

            {/* Yard Berth Location */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono uppercase text-[var(--color-n-400)]">
                Assigned Terminal Berth
              </label>
              <select
                value={yardLocation}
                onChange={e => setYardLocation(e.target.value)}
                className="w-full h-9 px-2.5 text-xs bg-[var(--color-n-100)] text-[var(--color-n-800)] rounded border border-[var(--color-n-200)] focus:outline-none focus:border-[var(--color-accent)] font-mono transition-colors"
              >
                <option value="yard-04">Yard 04 — North Berth (Bulk Grain)</option>
                <option value="yard-02">Yard 02 — South Pier (Freight)</option>
                <option value="yard-01">Yard 01 — Central Siding (Manifest Depot)</option>
              </select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full font-mono text-xs tracking-wider uppercase h-10 mt-2 gap-2"
            >
              <span>Authenticate & Enter Console</span>
              <ArrowRight size={14} />
            </Button>
          </form>

          {/* Compliance & Security Notice */}
          <div className="pt-4 border-t border-[var(--color-n-200)] flex items-start gap-2.5 text-[11px] text-[var(--color-n-400)] font-sans">
            <ShieldCheck size={16} className="text-[var(--color-status-ok)] shrink-0 mt-0.5" />
            <p className="leading-snug">
              Authorized personnel only. Access logs and camera inference streams are audited per Port Logistics Safety Regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
