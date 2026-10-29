import { useRef, useState } from 'react'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/cn'

interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  rowHeight?: number
  className?: string
  onRowClick?: (row: TData) => void
  getRowId?: (row: TData) => string
}

export function DataTable<TData>({
  data,
  columns,
  rowHeight = 40,
  className,
  onRowClick,
  getRowId,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(getRowId ? { getRowId } : {}),
  })

  const rows = table.getRowModel().rows
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0
  const paddingBottom = virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1].end : 0

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto h-full', className)}
      style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
      aria-rowcount={rows.length}
    >
      <table className="w-full border-collapse table-fixed">
        <thead className="sticky top-0 z-10 bg-[var(--color-n-150)] shadow-[inset_0_-1px_0_var(--color-n-200)]">
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(header => {
                const canSort = header.column.getCanSort()
                const sorted = header.column.getIsSorted()
                return (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className={cn(
                      'px-3 py-2 text-left text-[11px] font-medium text-[var(--color-n-400)] uppercase tracking-wider',
                      canSort && 'cursor-pointer select-none hover:text-[var(--color-n-600)]'
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <span className="text-[var(--color-n-300)]">
                          {sorted === 'asc' ? <ChevronUp size={12} /> : sorted === 'desc' ? <ChevronDown size={12} /> : <ChevronsUpDown size={12} />}
                        </span>
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {paddingTop > 0 && <tr><td style={{ height: paddingTop }} /></tr>}
          {virtualRows.map(vrow => {
            const row = rows[vrow.index]
            return (
              <tr
                key={row.id}
                aria-rowindex={vrow.index + 1}
                className={cn(
                  'border-b border-[var(--color-n-200)] transition-colors duration-[80ms]',
                  onRowClick && 'cursor-pointer hover:bg-[var(--color-n-150)]'
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 text-[var(--color-n-600)] truncate"
                    style={{ height: rowHeight }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            )
          })}
          {paddingBottom > 0 && <tr><td style={{ height: paddingBottom }} /></tr>}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="flex items-center justify-center h-32 text-sm text-[var(--color-n-400)]"
          style={{ fontFamily: 'var(--font-sans)' }}>
          No data
        </div>
      )}
    </div>
  )
}
