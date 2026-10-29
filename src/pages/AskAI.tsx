import { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Send,
  Sparkles,
  Terminal,
  FileCode,
  Database,
  Cpu,
} from 'lucide-react'
import {
  Panel,
  PanelHeader,
  Button,
  StatusPill,
} from '@/components/ui'
import { cn } from '@/lib/cn'

interface SourceItem {
  name: string
  type: 'manifest' | 'camera_log' | 'telemetry_db'
  recordId: string
}

interface ChatMessage {
  id: string
  sender: 'operator' | 'ai'
  content: string
  timestamp: string
  sources?: SourceItem[]
  telemetryTable?: {
    headers: string[]
    rows: string[][]
  }
}

const presetPrompts = [
  'How many bags unloaded from wagon 12?',
  'Show count discrepancies for Rake #4',
  'Summarize Cam-02 accuracy',
  'Check overdue wagons in Yard 04',
]

const initialMessages: ChatMessage[] = [
  {
    id: 'msg-01',
    sender: 'ai',
    content:
      'WagonEye Yard Assistant online. Direct access enabled to real-time YOLOv8s event streams, ByteTrack door telemetry, and manifest CSV databases. Query any wagon ID, rake reconciliation status, or camera metrics.',
    timestamp: '14:20:00 UTC',
    sources: [
      { name: 'Yard 04 Ingestion Stream', type: 'camera_log', recordId: 'CAM-LOG-TODAY' },
      { name: 'Rake TRN-2024-08 Manifest', type: 'manifest', recordId: 'CSV-MAN-8490' },
    ],
  },
  {
    id: 'msg-02',
    sender: 'operator',
    content: 'Show count discrepancies for Rake #4',
    timestamp: '14:21:10 UTC',
  },
  {
    id: 'msg-03',
    sender: 'ai',
    content:
      'Analysis for Rake #4 (TRN-2024-08) complete. Out of 12 wagons audited, 2 wagons exhibit count discrepancies exceeding nominal variance:\n\n• WGN-8494: Planned 500 bags, counted 482 bags (Delta: -18 bags, -3.6%)\n• WGN-8497: Planned 500 bags, counted 390 bags (Delta: -110 bags, active loading flagged for occlusion)\n\nRemaining 10 wagons match manifest within ±0.2% tolerance.',
    timestamp: '14:21:12 UTC',
    telemetryTable: {
      headers: ['Wagon', 'Manifest', 'Counted', 'Delta', 'Status'],
      rows: [
        ['WGN-8494', '500', '482', '-18', 'MISMATCH'],
        ['WGN-8497', '500', '390', '-110', 'FLAGGED'],
      ],
    },
    sources: [
      { name: 'Manifest CSV: TRN-2024-08', type: 'manifest', recordId: 'MAN-08-REV2' },
      { name: 'CAM-01 Door A Crossing Ledger', type: 'camera_log', recordId: 'EVT-9902' },
      { name: 'PostgreSQL Telemetry DB', type: 'telemetry_db', recordId: 'tbl_rake_reconciliation' },
    ],
  },
]

export default function AskAI() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isProcessing])

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim() || isProcessing) return

    const now = new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false }) + ' UTC'
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'operator',
      content: promptText,
      timestamp: now,
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsProcessing(true)

    // Simulate AI response based on keywords
    setTimeout(() => {
      let aiResponse = ''
      let table: ChatMessage['telemetryTable'] | undefined = undefined
      let sources: SourceItem[] = []

      const lower = promptText.toLowerCase()

      if (lower.includes('wagon 12') || lower.includes('wagon #12') || lower.includes('wgn-8503')) {
        aiResponse =
          'Wagon #12 (WGN-8503) arrived at Berth 4 on TRN-2024-08. Status: Pending unloading. 0 bags unloaded to date. Manifest indicates 500 bags of bulk grain scheduled for Door A processing at 15:45 UTC.'
        sources = [
          { name: 'Yard Siding Queue API', type: 'telemetry_db', recordId: 'BERTH-4-QUEUE' },
          { name: 'TRN-2024-08 Manifest', type: 'manifest', recordId: 'CSV-MAN-8490' },
        ]
      } else if (lower.includes('cam-02') || lower.includes('accuracy')) {
        aiResponse =
          'Camera CAM-02 (Yard Door B) diagnostic summary:\n• Mean detection confidence: 98.6%\n• Total bags tracked today: 8,234\n• Frame rate: Stable 25.0 FPS (0 frame drops detected in last 3 hours)\n• Bounding box tracking stability score: 0.994'
        table = {
          headers: ['Metric', 'Current Value', 'Threshold', 'Health'],
          rows: [
            ['Confidence', '98.6%', '> 90.0%', 'NOMINAL'],
            ['FPS', '25.0 FPS', '25.0 FPS', 'OPTIMAL'],
            ['ByteTrack Buffer', '30 frames', '30 frames', 'HEALTHY'],
          ],
        }
        sources = [
          { name: 'CAM-02 Telemetry Stream', type: 'camera_log', recordId: 'RTSP-CAM02-METRICS' },
          { name: 'YOLOv8s Model Inference Log', type: 'telemetry_db', recordId: 'INF-LOG-942' },
        ]
      } else if (lower.includes('overdue')) {
        aiResponse =
          'Yard 04 Overdue Assessment:\nZero wagons currently exceed maximum allowable dwell time (3.0 hours). Average wagon turnover time is currently 1 hour 42 minutes, tracking 18 minutes ahead of shift target.'
        sources = [
          { name: 'Dwell Time Tracker API', type: 'telemetry_db', recordId: 'DWELL-YARD04' },
        ]
      } else {
        aiResponse = `Telemetry analysis complete for query "${promptText}". Queried active yard databases and verified 14 active wagons across 2 active rakes. All tracking models operating within normal parameters.`
        sources = [
          { name: 'WagonEye Telemetry DB', type: 'telemetry_db', recordId: 'GENERAL-QUERY' },
        ]
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false }) + ' UTC',
        telemetryTable: table,
        sources,
      }

      setMessages(prev => [...prev, aiMsg])
      setIsProcessing(false)
    }, 700)
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-3 pb-2">
      {/* Top Header Panel */}
      <div className="p-3.5 rounded-md bg-[var(--color-n-100)] border border-[var(--color-n-200)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[var(--color-n-150)] border border-[var(--color-n-200)] flex items-center justify-center text-[var(--color-accent)]">
            <Terminal size={16} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[var(--color-n-800)] font-mono">
              WAGONEYE YARD INTELLIGENCE (AI ASSISTANT)
            </h1>
            <p className="text-[11px] text-[var(--color-n-400)]">
              Industrial natural language query console grounded in live computer vision logs and manifest CSV records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[var(--color-n-400)] bg-[var(--color-n-150)] px-2 py-1 rounded border border-[var(--color-n-200)]">
            <Cpu size={12} className="text-[var(--color-accent)]" />
            MODEL: YOLOv8s + ByteTrack + Claude-3.5
          </span>
          <StatusPill status="ok" label="TELEMETRY SYNCED" />
        </div>
      </div>

      {/* Main Chat Conversation Container */}
      <Panel className="flex-1 min-h-0 flex flex-col">
        <PanelHeader
          title="Operator Query Session"
          icon={<Bot size={16} />}
          actions={
            <span className="text-[10px] font-mono text-[var(--color-n-400)]">
              SESSION: YARD04-CONSOLE-OP8492
            </span>
          }
        />

        {/* Message scroll list */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {messages.map(msg => (
            <div
              key={msg.id}
              className={cn(
                'flex flex-col max-w-3xl rounded-md p-3.5 border transition-all text-xs',
                msg.sender === 'operator'
                  ? 'ml-auto bg-[var(--color-n-150)] border-[var(--color-n-200)] text-[var(--color-n-800)] w-full md:w-3/4'
                  : 'mr-auto bg-[var(--color-n-100)] border-[var(--color-n-200)] text-[var(--color-n-700)] w-full md:w-5/6'
              )}
            >
              {/* Message metadata header */}
              <div className="flex items-center justify-between border-b border-[var(--color-n-200)] pb-1.5 mb-2 text-[10px] text-[var(--color-n-400)]">
                <span className="font-semibold uppercase tracking-wider text-[var(--color-n-500)] flex items-center gap-1.5">
                  {msg.sender === 'operator' ? (
                    <>OPERATOR [OP-8492]</>
                  ) : (
                    <>
                      <Sparkles size={12} className="text-[var(--color-accent)]" />
                      YARD INTELLIGENCE ENGINE
                    </>
                  )}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message text content */}
              <div className="whitespace-pre-wrap leading-relaxed text-[12px] font-mono text-[var(--color-n-700)]">
                {msg.content}
              </div>

              {/* Optional Telemetry Data Table */}
              {msg.telemetryTable && (
                <div className="mt-3 rounded border border-[var(--color-n-200)] overflow-hidden">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead className="bg-[var(--color-n-150)] text-[var(--color-n-400)]">
                      <tr>
                        {msg.telemetryTable.headers.map((h, i) => (
                          <th key={i} className="px-2.5 py-1.5 font-medium uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-n-200)] bg-[var(--color-n-50)]">
                      {msg.telemetryTable.rows.map((r, ri) => (
                        <tr key={ri} className="hover:bg-[var(--color-n-150)]">
                          {r.map((cell, ci) => (
                            <td key={ci} className="px-2.5 py-1.5 text-[var(--color-n-700)]">
                              {ci === 4 ? (
                                <span
                                  className={
                                    cell === 'NOMINAL' || cell === 'OPTIMAL'
                                      ? 'text-[var(--color-status-ok)] font-semibold'
                                      : 'text-[var(--color-status-warn)] font-semibold'
                                  }
                                >
                                  {cell}
                                </span>
                              ) : (
                                cell
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Structured Sources Section */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[var(--color-n-200)] flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-n-400)]">
                    GROUNDED SOURCES:
                  </span>
                  {msg.sources.map((src, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[var(--color-n-150)] text-[var(--color-n-600)] border border-[var(--color-n-200)] font-mono"
                    >
                      {src.type === 'manifest' ? (
                        <FileCode size={10} className="text-[var(--color-accent)]" />
                      ) : src.type === 'camera_log' ? (
                        <Terminal size={10} className="text-[var(--color-status-live)]" />
                      ) : (
                        <Database size={10} className="text-[var(--color-status-warn)]" />
                      )}
                      <span>{src.name}</span>
                      <span className="text-[var(--color-n-400)]">[{src.recordId}]</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Processing state indicator */}
          {isProcessing && (
            <div className="mr-auto max-w-sm rounded-md p-3 bg-[var(--color-n-100)] border border-[var(--color-n-200)] text-xs text-[var(--color-n-500)] flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-ping" />
              <span>Scanning yard event stream & manifest ledgers...</span>
            </div>
          )}
        </div>

        {/* Preset Prompt Chips Strip */}
        <div className="px-4 py-2 border-t border-[var(--color-n-200)] bg-[var(--color-n-50)] flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[10px] font-mono uppercase text-[var(--color-n-400)] shrink-0">
            Presets:
          </span>
          {presetPrompts.map(prompt => (
            <button
              key={prompt}
              onClick={() => handleSendPrompt(prompt)}
              disabled={isProcessing}
              className="px-2.5 py-1 rounded text-[11px] font-mono bg-[var(--color-n-100)] hover:bg-[var(--color-n-150)] hover:text-[var(--color-accent)] text-[var(--color-n-600)] border border-[var(--color-n-200)] transition-colors shrink-0 disabled:opacity-40"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input prompt form */}
        <form
          onSubmit={e => {
            e.preventDefault()
            handleSendPrompt(input)
          }}
          className="p-3 border-t border-[var(--color-n-200)] bg-[var(--color-n-100)] flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about wagon counts, camera accuracy, or manifest discrepancies..."
              className="w-full h-9 pl-3 pr-8 text-xs bg-[var(--color-n-150)] text-[var(--color-n-700)] placeholder-[var(--color-n-400)] rounded border border-[var(--color-n-200)] focus:outline-none focus:border-[var(--color-accent)] font-mono transition-colors"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!input.trim() || isProcessing}
            className="h-9 px-4 text-xs font-mono gap-1.5"
          >
            <Send size={13} />
            <span>SUBMIT</span>
          </Button>
        </form>
      </Panel>
    </div>
  )
}
