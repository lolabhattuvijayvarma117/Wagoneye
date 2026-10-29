import { useEffect, useRef, useState } from 'react'
import uPlot from 'uplot'
import { cn } from '@/lib/cn'

export interface UPlotChartProps {
  options: Omit<uPlot.Options, 'width' | 'height'> & {
    width?: number
    height?: number
  }
  data: uPlot.AlignedData
  height?: number
  className?: string
  onReady?: (chart: uPlot) => void
}

export function UPlotChart({
  options,
  data,
  height = 240,
  className,
  onReady,
}: UPlotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<uPlot | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)

  // Measure container width
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ro = new ResizeObserver(entries => {
      const entry = entries[0]
      if (!entry) return
      const w = Math.floor(entry.contentRect.width)
      if (w > 0) {
        setContainerWidth(w)
      }
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Initialize or re-render chart when width or options change
  useEffect(() => {
    const el = containerRef.current
    if (!el || containerWidth <= 0) return

    // Clean up previous instance
    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }

    const opts: uPlot.Options = {
      ...options,
      width: containerWidth,
      height,
    }

    try {
      const u = new uPlot(opts, data, el)
      chartRef.current = u
      onReady?.(u)
    } catch (err) {
      console.error('Failed to initialize uPlot chart:', err)
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [containerWidth, height, options])

  // Update data if data changes without destroying chart
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setData(data)
    }
  }, [data])

  return (
    <div
      ref={containerRef}
      className={cn('w-full relative uplot-container select-none', className)}
      style={{ height, minHeight: height }}
    />
  )
}
