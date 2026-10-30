import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera,
  Radio,
  Activity,
  AlertOctagon,
  Layers,
  ArrowRight,
} from 'lucide-react'
import {
  Panel,
  PanelHeader,
  PanelBody,
  StatusPill,
  Button,
} from '@/components/ui'

interface CameraStreamInfo {
  id: string
  name: string
  berth: string
  doorId: string
  streamType: 'WebRTC' | 'HLS'
  rtspEndpoint: string // masked in UI
  fps: number
  latencyMs: number
  resolution: string
  status: 'live' | 'degraded' | 'offline'
  statusLabel: string
  lastFrame: string
  doorCoords: {
    p1: [number, number]
    p2: [number, number]
    sideVector: [number, number]
  }
}

const CAMERAS_FLEET: CameraStreamInfo[] = [
  {
    id: 'CAM-01',
    name: 'Bay 1 Overhead Telemetry',
    berth: 'Berth 4 • Bulk Grain Terminal',
    doorId: 'DOOR-TRN-REAL-A',
    streamType: 'WebRTC',
    rtspEndpoint: 'rtsp://gate-cv:••••••••@10.14.20.101:554/live/bay1',
    fps: 25.0,
    latencyMs: 120,
    resolution: '1920x1080',
    status: 'live',
    statusLabel: 'LIVE STREAM',
    lastFrame: 'Just now',
    doorCoords: {
      p1: [750, 100],
      p2: [750, 950],
      sideVector: [1.0, 0.0],
    },
  },
  {
    id: 'CAM-02',
    name: 'Bay 2 Overhead Telemetry',
    berth: 'Berth 4 • Bulk Grain Terminal',
    doorId: 'DOOR-WGN-4471-B',
    streamType: 'HLS',
    rtspEndpoint: 'rtsp://gate-cv:••••••••@10.14.20.102:554/live/bay2',
    fps: 24.8,
    latencyMs: 3800,
    resolution: '1920x1080',
    status: 'live',
    statusLabel: 'HLS · ~3.8s',
    lastFrame: '2s ago',
    doorCoords: {
      p1: [1100, 600],
      p2: [1500, 600],
      sideVector: [0.0, 1.0],
    },
  },
  {
    id: 'CAM-03',
    name: 'Fertilizer Siding Cam West',
    berth: 'Berth 2 • Fertilizer Siding',
    doorId: 'DOOR-WGN-1102-A',
    streamType: 'WebRTC',
    rtspEndpoint: 'rtsp://gate-cv:••••••••@10.14.22.40:554/live/door1',
    fps: 25.0,
    latencyMs: 140,
    resolution: '1920x1080',
    status: 'live',
    statusLabel: 'LIVE STREAM',
    lastFrame: 'Just now',
    doorCoords: {
      p1: [500, 620],
      p2: [900, 620],
      sideVector: [0.0, 1.0],
    },
  },
  {
    id: 'CAM-04',
    name: 'Sugar Loop Portal Cam',
    berth: 'Siding C • Sugar Freight Loop',
    doorId: 'DOOR-DEFAULT-01',
    streamType: 'HLS',
    rtspEndpoint: 'rtsp://gate-cv:••••••••@10.14.28.15:554/live/portal',
    fps: 0,
    latencyMs: 0,
    resolution: '1920x1080',
    status: 'offline',
    statusLabel: 'OFFLINE (NO SIGNAL)',
    lastFrame: '35m ago',
    doorCoords: {
      p1: [400, 500],
      p2: [1200, 500],
      sideVector: [0.0, 1.0],
    },
  },
]

export default function Cameras() {
  const navigate = useNavigate()
  const [selectedCam, setSelectedCam] = useState<CameraStreamInfo>(CAMERAS_FLEET[0])

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-300)]">
        <div>
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-[var(--color-accent)]" />
            <h1 className="text-base font-semibold text-[var(--color-n-800)] tracking-tight">
              Optical Sensor Fleet & Stream Health
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-n-200)] text-[var(--color-n-600)] num">
              4 Cameras Configured
            </span>
          </div>
          <p className="text-xs text-[var(--color-n-500)] mt-1">
            MediaMTX WebRTC gateway connectivity, latency monitoring, and door geometry vector mapping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/settings')}
            className="h-8 gap-1.5"
          >
            Door Geometry Settings
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="h-8 gap-1.5"
          >
            <ArrowRight size={14} /> Control Room
          </Button>
        </div>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CAMERAS_FLEET.map((cam) => {
          const isSelected = selectedCam.id === cam.id
          return (
            <div
              key={cam.id}
              onClick={() => setSelectedCam(cam)}
              className={`p-3.5 rounded-md border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-[var(--color-n-100)] border-[var(--color-accent)] shadow-[0_0_0_1px_var(--color-accent)]'
                  : 'bg-[var(--color-n-50)] border-[var(--color-n-300)] hover:bg-[var(--color-n-100)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--color-n-800)] num">
                    {cam.id}
                  </span>
                  <StatusPill
                    status={cam.status === 'live' ? 'live' : 'alert'}
                    label={cam.statusLabel}
                  />
                </div>
                <div className="text-xs text-[var(--color-n-700)] font-medium mt-1">
                  {cam.name}
                </div>
                <div className="text-[11px] text-[var(--color-n-400)] mt-0.5">
                  {cam.berth}
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-[var(--color-n-200)] text-[11px] num">
                <div className="flex items-center justify-between text-[var(--color-n-500)]">
                  <span>Stream Transport</span>
                  <span className="text-[var(--color-n-700)] font-medium">{cam.streamType}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--color-n-500)]">
                  <span>Latency</span>
                  <span
                    className={
                      cam.latencyMs > 2000
                        ? 'text-[var(--color-status-warn)]'
                        : 'text-[var(--color-status-ok)]'
                    }
                  >
                    {cam.latencyMs > 0 ? `${cam.latencyMs} ms` : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[var(--color-n-500)]">
                  <span>Frame Rate</span>
                  <span className="text-[var(--color-n-700)] font-medium">
                    {cam.fps > 0 ? `${cam.fps} FPS` : '0 FPS'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Camera Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Stream Preview Tile (7 cols) */}
        <Panel className="lg:col-span-7 border border-[var(--color-n-300)] flex flex-col">
          <PanelHeader
            title={`${selectedCam.id}: Stream Feed & Real-Time Geometry [${selectedCam.doorId}]`}
            icon={<Radio size={16} />}
            actions={
              <div className="flex items-center gap-2">
                <span className="text-[10px] num text-[var(--color-n-400)]">
                  {selectedCam.resolution} • {selectedCam.streamType}
                </span>
                <StatusPill
                  status={selectedCam.status === 'live' ? 'live' : 'alert'}
                  label={selectedCam.status === 'live' ? 'ACTIVE' : 'OFFLINE'}
                />
              </div>
            }
          />
          <PanelBody className="p-4 flex-1 flex flex-col justify-between">
            <div className="relative aspect-video w-full rounded bg-[var(--color-n-0)] border border-[var(--color-n-200)] overflow-hidden flex items-center justify-center">
              {selectedCam.id === 'CAM-01' ? (
                <video
                  src="/videos/annotated_loading.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : selectedCam.status === 'live' ? (
                <div className="text-center p-6 space-y-2">
                  <Activity size={32} className="mx-auto text-[var(--color-accent)] animate-pulse" />
                  <span className="text-xs font-mono text-[var(--color-n-700)] block">
                    {selectedCam.name} • {selectedCam.streamType}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--color-n-500)] block">
                    {selectedCam.rtspEndpoint}
                  </span>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <AlertOctagon size={32} className="mx-auto text-[var(--color-status-alert)]" />
                  <span className="text-xs font-mono text-[var(--color-status-alert)] block">
                    NO SIGNAL RECEIVED FROM RTSP GATEWAY
                  </span>
                  <span className="text-[11px] font-mono text-[var(--color-n-500)] block">
                    Last snapshot frame cached 35m ago
                  </span>
                </div>
              )}

              {/* Vector Geometry Overlay Details */}
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/90 z-10 pointer-events-none drop-shadow">
                <span>GATE: {selectedCam.doorId}</span>
                <span>
                  PLANE: [{selectedCam.doorCoords.p1.join(',')}] → [{selectedCam.doorCoords.p2.join(',')}]
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[var(--color-n-200)] flex items-center justify-between text-xs num text-[var(--color-n-500)]">
              <span>Masked RTSP Source: {selectedCam.rtspEndpoint}</span>
              <span className="text-[var(--color-n-400)]">Gateway: MediaMTX v1.8.4</span>
            </div>
          </PanelBody>
        </Panel>

        {/* Geometry & Telemetry Specification (5 cols) */}
        <Panel className="lg:col-span-5 border border-[var(--color-n-300)] flex flex-col">
          <PanelHeader
            title="Calibrated Door Geometry"
            icon={<Layers size={16} />}
            actions={
              <span className="text-[11px] text-[var(--color-status-ok)] num">
                Verified configs/wagon_doors.yaml
              </span>
            }
          />
          <PanelBody className="p-4 space-y-4">
            <div className="p-3.5 rounded bg-[var(--color-n-100)] border border-[var(--color-n-300)] space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-n-500)]">
                Virtual Crossing Plane
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs num">
                <div>
                  <span className="text-[var(--color-n-400)] block text-[10px]">Point P1 (X, Y)</span>
                  <strong className="text-[var(--color-n-800)] font-semibold">
                    [{selectedCam.doorCoords.p1[0]}, {selectedCam.doorCoords.p1[1]}]
                  </strong>
                </div>
                <div>
                  <span className="text-[var(--color-n-400)] block text-[10px]">Point P2 (X, Y)</span>
                  <strong className="text-[var(--color-n-800)] font-semibold">
                    [{selectedCam.doorCoords.p2[0]}, {selectedCam.doorCoords.p2[1]}]
                  </strong>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded bg-[var(--color-n-100)] border border-[var(--color-n-300)] space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-n-500)]">
                Directional Normal Vector
              </span>
              <div className="flex items-center justify-between text-xs num">
                <div>
                  <span className="text-[var(--color-n-400)] block text-[10px]">Vector [dx, dy]</span>
                  <strong className="text-[var(--color-accent)] font-semibold">
                    [{selectedCam.doorCoords.sideVector[0]}, {selectedCam.doorCoords.sideVector[1]}]
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[var(--color-n-400)] block text-[10px]">Crossing Logic</span>
                  <strong className="text-[var(--color-status-ok)] font-semibold">
                    +Dot Product = LOADED
                  </strong>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded bg-[var(--color-n-100)] border border-[var(--color-n-300)] space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-n-500)]">
                Stream Transport Protocol
              </span>
              <p className="text-xs text-[var(--color-n-600)] leading-relaxed">
                RTSP streams are pulled from camera optics inside the yard network and transmuxed into
                low-latency WebRTC streams via MediaMTX. No raw RTSP credentials or unsecured video
                sockets reach operator browsers.
              </p>
            </div>
          </PanelBody>
        </Panel>
      </div>
    </div>
  )
}
