import { useState } from 'react'
import {
  Camera,
  Sliders,
  Bell,
  Save,
  Plus,
  Trash2,
  Server,
} from 'lucide-react'
import {
  Panel,
  PanelHeader,
  PanelBody,
  Button,
  StatusPill,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui'
import { useToast } from '@/components/ui/Toast'

interface CameraConfig {
  id: string
  name: string
  door: string
  rtspUrl: string
  fps: number
  lineCoords: { x1: number; y1: number; x2: number; y2: number }
  status: 'ok' | 'alert' | 'warn'
}

export default function Settings() {
  const { showToast } = useToast()

  // Cameras state
  const [cameras, setCameras] = useState<CameraConfig[]>([
    {
      id: 'CAM-01',
      name: 'Berth 4 Primary Camera',
      door: 'Door A',
      rtspUrl: 'rtsp://operator:livepass@192.168.4.101:554/h264/ch1/main',
      fps: 25,
      lineCoords: { x1: 0, y1: 540, x2: 1920, y2: 540 },
      status: 'ok',
    },
    {
      id: 'CAM-02',
      name: 'Berth 4 Secondary Camera',
      door: 'Door B',
      rtspUrl: 'rtsp://operator:livepass@192.168.4.102:554/h264/ch1/main',
      fps: 25,
      lineCoords: { x1: 0, y1: 560, x2: 1920, y2: 560 },
      status: 'ok',
    },
    {
      id: 'CAM-03',
      name: 'Berth 2 Aux Camera',
      door: 'Door C',
      rtspUrl: 'rtsp://operator:livepass@192.168.2.105:554/h264/ch1/main',
      fps: 20,
      lineCoords: { x1: 0, y1: 512, x2: 1920, y2: 512 },
      status: 'alert',
    },
  ])

  // Detection Thresholds state
  const [yoloConfidence, setYoloConfidence] = useState(0.65)
  const [byteTrackBuffer, setByteTrackBuffer] = useState(30)
  const [doorCrossingOffset, setDoorCrossingOffset] = useState(15)
  const [occlusionThreshold, setOcclusionThreshold] = useState(0.45)
  const [inferenceDevice] = useState('CUDA:0 (NVIDIA RTX 4090)')

  // Notifications state
  const [mismatchAlertPercent, setMismatchAlertPercent] = useState(2.0)
  const [alertOnLowConfidence, setAlertOnLowConfidence] = useState(true)
  const [alertOnCameraDisconnect, setAlertOnCameraDisconnect] = useState(true)
  const [webhookUrl, setWebhookUrl] = useState('https://yard-api.internal.port/telemetry/webhooks/alerts')

  const handleSaveCameraConfig = (camId: string) => {
    showToast({
      title: 'Camera Settings Applied',
      description: `Parameters for ${camId} updated and RTSP pipeline re-synced.`,
      variant: 'ok',
    })
  }

  const handleSaveThresholds = () => {
    showToast({
      title: 'Inference Thresholds Updated',
      description: 'YOLOv8s & ByteTrack hyperparameters re-loaded into inference worker.',
      variant: 'ok',
    })
  }

  const handleSaveNotifications = () => {
    showToast({
      title: 'Alert Policies Saved',
      description: 'Operator notification rules and webhook endpoints saved.',
      variant: 'ok',
    })
  }

  return (
    <div className="space-y-5 pb-8 max-w-6xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1
            className="text-xl font-bold text-[var(--color-n-800)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            SYSTEM & TELEMETRY CONFIGURATION
          </h1>
          <p className="text-xs text-[var(--color-n-400)] mt-0.5">
            Configure optical cameras, YOLOv8s neural thresholds, ByteTrack pipeline, and alert routing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusPill status="ok" label="SYSTEM NORMAL" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="cameras" className="w-full">
        <TabsList className="bg-[var(--color-n-100)] rounded-t-md border-b border-[var(--color-n-200)]">
          <TabsTrigger value="cameras" className="flex items-center gap-2 font-mono text-xs">
            <Camera size={14} />
            <span>Camera Nodes ({cameras.length})</span>
          </TabsTrigger>
          <TabsTrigger value="inference" className="flex items-center gap-2 font-mono text-xs">
            <Sliders size={14} />
            <span>Neural Detection & Tracking</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 font-mono text-xs">
            <Bell size={14} />
            <span>Alert Routing & Policies</span>
          </TabsTrigger>
        </TabsList>

        {/* ── 1. Camera Nodes Tab ─────────────────────────── */}
        <TabsContent value="cameras" className="mt-0">
          <Panel className="rounded-t-none border-t-0 space-y-4">
            <PanelHeader
              title="Registered RTSP Yard Cameras"
              icon={<Camera size={16} />}
              actions={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const newCam: CameraConfig = {
                      id: `CAM-0${cameras.length + 1}`,
                      name: `Aux Yard Camera ${cameras.length + 1}`,
                      door: 'Door D',
                      rtspUrl: 'rtsp://operator:livepass@192.168.4.110:554/live',
                      fps: 25,
                      lineCoords: { x1: 0, y1: 540, x2: 1920, y2: 540 },
                      status: 'ok',
                    }
                    setCameras(prev => [...prev, newCam])
                    showToast({
                      title: 'Camera Added',
                      description: `${newCam.id} provisioned in Yard configuration.`,
                      variant: 'ok',
                    })
                  }}
                  className="gap-1.5"
                >
                  <Plus size={14} /> Add Camera Node
                </Button>
              }
            />
            <PanelBody className="p-4 space-y-4">
              {cameras.map(cam => (
                <div
                  key={cam.id}
                  className="p-4 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-n-200)] pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sm text-[var(--color-n-800)]">
                        {cam.id}: {cam.name}
                      </span>
                      <span className="text-xs font-mono text-[var(--color-n-400)]">[{cam.door}]</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusPill status={cam.status} label={cam.status === 'ok' ? 'ONLINE' : 'OFFLINE'} />
                      <button
                        onClick={() => {
                          setCameras(prev => prev.filter(c => c.id !== cam.id))
                          showToast({
                            title: 'Camera Removed',
                            description: `${cam.id} removed from configuration.`,
                            variant: 'warn',
                          })
                        }}
                        className="p-1.5 rounded text-[var(--color-n-400)] hover:text-[var(--color-status-alert)] hover:bg-[var(--color-n-150)] transition-colors"
                        aria-label={`Delete ${cam.id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs font-mono">
                    {/* RTSP Stream URL */}
                    <div className="md:col-span-7">
                      <label className="block text-[10px] text-[var(--color-n-400)] uppercase mb-1">
                        RTSP Stream URI
                      </label>
                      <input
                        type="text"
                        defaultValue={cam.rtspUrl}
                        onChange={e => {
                          const v = e.target.value
                          setCameras(prev => prev.map(c => (c.id === cam.id ? { ...c, rtspUrl: v } : c)))
                        }}
                        className="w-full h-8 px-2.5 rounded bg-[var(--color-n-150)] text-[var(--color-n-700)] border border-[var(--color-n-200)] focus:border-[var(--color-accent)] focus:outline-none"
                      />
                    </div>

                    {/* Frame Rate */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-[var(--color-n-400)] uppercase mb-1">
                        FPS Target
                      </label>
                      <input
                        type="number"
                        defaultValue={cam.fps}
                        onChange={e => {
                          const v = parseInt(e.target.value) || 25
                          setCameras(prev => prev.map(c => (c.id === cam.id ? { ...c, fps: v } : c)))
                        }}
                        className="w-full h-8 px-2.5 rounded bg-[var(--color-n-150)] text-[var(--color-n-700)] border border-[var(--color-n-200)] focus:border-[var(--color-accent)] focus:outline-none"
                      />
                    </div>

                    {/* Door Line Y coordinate */}
                    <div className="md:col-span-3">
                      <label className="block text-[10px] text-[var(--color-n-400)] uppercase mb-1">
                        Gate Line Y Coord
                      </label>
                      <input
                        type="number"
                        defaultValue={cam.lineCoords.y1}
                        onChange={e => {
                          const y = parseInt(e.target.value) || 540
                          setCameras(prev =>
                            prev.map(c =>
                              c.id === cam.id
                                ? { ...c, lineCoords: { ...c.lineCoords, y1: y, y2: y } }
                                : c
                            )
                          )
                        }}
                        className="w-full h-8 px-2.5 rounded bg-[var(--color-n-150)] text-[var(--color-n-700)] border border-[var(--color-n-200)] focus:border-[var(--color-accent)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--color-n-200)]">
                    <span className="text-[11px] text-[var(--color-n-400)] font-mono">
                      Resolution: 1920x1080 • Codec: H.264 Main Profile
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSaveCameraConfig(cam.id)}
                      className="text-xs h-7 gap-1 font-mono"
                    >
                      <Save size={12} /> Apply
                    </Button>
                  </div>
                </div>
              ))}
            </PanelBody>
          </Panel>
        </TabsContent>

        {/* ── 2. Inference Thresholds Tab ─────────────────── */}
        <TabsContent value="inference" className="mt-0">
          <Panel className="rounded-t-none border-t-0">
            <PanelHeader
              title="YOLOv8s & ByteTrack Neural Telemetry Pipeline"
              icon={<Sliders size={16} />}
              actions={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveThresholds}
                  className="gap-1.5 font-mono text-xs"
                >
                  <Save size={13} /> Save Hyperparameters
                </Button>
              }
            />
            <PanelBody className="p-5 space-y-6">
              {/* Device banner */}
              <div className="p-3 rounded bg-[var(--color-n-100)] border border-[var(--color-n-200)] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Server size={15} className="text-[var(--color-accent)]" />
                  <span className="text-[var(--color-n-500)]">Active Accelerator:</span>
                  <span className="font-semibold text-[var(--color-n-800)]">{inferenceDevice}</span>
                </div>
                <StatusPill status="ok" label="CUDA READY" />
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* YOLOv8 Confidence Threshold */}
                <div className="p-4 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] space-y-3">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-xs font-semibold text-[var(--color-n-700)]">
                      YOLOv8s Confidence Threshold
                    </span>
                    <span className="text-sm font-bold text-[var(--color-accent)]">
                      {yoloConfidence.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.30"
                    max="0.95"
                    step="0.05"
                    value={yoloConfidence}
                    onChange={e => setYoloConfidence(parseFloat(e.target.value))}
                    className="w-full accent-[var(--color-accent)]"
                  />
                  <p className="text-[11px] text-[var(--color-n-400)] font-sans">
                    Minimum detector confidence for bag classification. Higher reduces false positives from shadow occlusions; lower captures indistinct shapes.
                  </p>
                </div>

                {/* ByteTrack Buffer Frames */}
                <div className="p-4 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] space-y-3">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-xs font-semibold text-[var(--color-n-700)]">
                      ByteTrack Memory Buffer
                    </span>
                    <span className="text-sm font-bold text-[var(--color-accent)]">
                      {byteTrackBuffer} frames (~1.2s)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={byteTrackBuffer}
                    onChange={e => setByteTrackBuffer(parseInt(e.target.value))}
                    className="w-full accent-[var(--color-accent)]"
                  />
                  <p className="text-[11px] text-[var(--color-n-400)] font-sans">
                    Number of frames an occluded or lost track is retained before being dropped from memory.
                  </p>
                </div>

                {/* Door Crossing Offset */}
                <div className="p-4 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] space-y-3">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-xs font-semibold text-[var(--color-n-700)]">
                      Door Crossing Boundary Offset
                    </span>
                    <span className="text-sm font-bold text-[var(--color-accent)]">
                      ±{doorCrossingOffset} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="1"
                    value={doorCrossingOffset}
                    onChange={e => setDoorCrossingOffset(parseInt(e.target.value))}
                    className="w-full accent-[var(--color-accent)]"
                  />
                  <p className="text-[11px] text-[var(--color-n-400)] font-sans">
                    Hysteresis band around the virtual door line to prevent double-counting oscillating bags on conveyor rollers.
                  </p>
                </div>

                {/* Occlusion Warning Threshold */}
                <div className="p-4 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] space-y-3">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-xs font-semibold text-[var(--color-n-700)]">
                      Occlusion Flagging Threshold
                    </span>
                    <span className="text-sm font-bold text-[var(--color-status-warn)]">
                      {occlusionThreshold.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.20"
                    max="0.70"
                    step="0.05"
                    value={occlusionThreshold}
                    onChange={e => setOcclusionThreshold(parseFloat(e.target.value))}
                    className="w-full accent-[var(--color-accent)]"
                  />
                  <p className="text-[11px] text-[var(--color-n-400)] font-sans">
                    Threshold at which overlapping bags prompt a "REVIEW" tag in the operator event stream.
                  </p>
                </div>
              </div>
            </PanelBody>
          </Panel>
        </TabsContent>

        {/* ── 3. Notification Routing Tab ─────────────────── */}
        <TabsContent value="notifications" className="mt-0">
          <Panel className="rounded-t-none border-t-0">
            <PanelHeader
              title="Operator Alerts & Signal Policies"
              icon={<Bell size={16} />}
              actions={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveNotifications}
                  className="gap-1.5 font-mono text-xs"
                >
                  <Save size={13} /> Save Policies
                </Button>
              }
            />
            <PanelBody className="p-5 space-y-5">
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono font-semibold text-[var(--color-n-800)]">
                      MANIFEST COUNT MISMATCH ALERTS
                    </div>
                    <p className="text-[11px] text-[var(--color-n-400)] mt-0.5">
                      Trigger visual warning pill when wagon counted delta exceeds percentage of planned manifest
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-[var(--color-n-400)]">Threshold:</span>
                    <select
                      value={mismatchAlertPercent}
                      onChange={e => setMismatchAlertPercent(parseFloat(e.target.value))}
                      className="h-8 px-2 rounded bg-[var(--color-n-150)] text-[var(--color-n-700)] border border-[var(--color-n-200)]"
                    >
                      <option value="1.0">± 1.0% (Strict)</option>
                      <option value="2.0">± 2.0% (Standard)</option>
                      <option value="5.0">± 5.0% (Tolerant)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono font-semibold text-[var(--color-n-800)]">
                      LOW CONFIDENCE NOTIFICATION (&lt; 0.60)
                    </div>
                    <p className="text-[11px] text-[var(--color-n-400)] mt-0.5">
                      Highlight low-confidence detections in real-time attention panel for quick manual verification
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertOnLowConfidence}
                      onChange={e => setAlertOnLowConfidence(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[var(--color-n-200)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]" />
                  </label>
                </div>

                <div className="p-4 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono font-semibold text-[var(--color-n-800)]">
                      CAMERA RTSP DISCONNECT / FRAME DROP SIGNAL
                    </div>
                    <p className="text-[11px] text-[var(--color-n-400)] mt-0.5">
                      Sound audible tone and display critical alert banner immediately upon RTSP pipeline failure
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertOnCameraDisconnect}
                      onChange={e => setAlertOnCameraDisconnect(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[var(--color-n-200)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]" />
                  </label>
                </div>

                {/* Webhook endpoint */}
                <div className="p-4 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] space-y-2">
                  <label className="block text-xs font-mono font-semibold text-[var(--color-n-800)]">
                    DISPATCH WEBHOOK ENDPOINT
                  </label>
                  <p className="text-[11px] text-[var(--color-n-400)]">
                    Sends JSON telemetry payloads for critical audit violations to port logistics operations bus
                  </p>
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                    className="w-full h-8 px-2.5 rounded bg-[var(--color-n-150)] text-[var(--color-n-700)] border border-[var(--color-n-200)] focus:border-[var(--color-accent)] focus:outline-none font-mono text-xs"
                  />
                </div>
              </div>
            </PanelBody>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  )
}
