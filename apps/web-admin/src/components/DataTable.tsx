import { Link } from '@tanstack/react-router'

export interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  linkTo?: (item: T) => string
  emptyMessage?: string
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  linkTo,
  emptyMessage = 'No data found'
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-12 text-center">
        <p className="text-[#71717a] text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#27272a]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#27272a]">
          {data.map((item) => {
            const row = (
              <tr
                key={item.id}
                className={`${linkTo ? 'cursor-pointer hover:bg-[#1e1e24]' : ''} transition-colors`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-sm ${col.className ?? ''}`}>
                    {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            )

            if (linkTo) {
              return (
                <Link key={item.id} to={linkTo(item)} className="contents">
                  {row}
                </Link>
              )
            }

            return row
          })}
        </tbody>
      </table>
    </div>
  )
}
