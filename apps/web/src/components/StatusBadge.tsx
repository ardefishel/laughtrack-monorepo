const statusColors: Record<string, string> = {
  draft: 'bg-surface-secondary text-muted',
  published: 'bg-success/20 text-success',
  archived: 'bg-warning/20 text-warning',
  performed: 'bg-blue-500/20 text-blue-400',
  bombed: 'bg-danger/20 text-danger',
  killed: 'bg-success/20 text-success'
}

export function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-muted-dim text-xs">—</span>
  const colorClass = statusColors[status] ?? 'bg-surface-secondary text-muted'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  )
}
