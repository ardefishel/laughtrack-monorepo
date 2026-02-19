const statusColors: Record<string, string> = {
  draft: 'bg-[#3b3b3f] text-[#a1a1aa]',
  published: 'bg-[#166534]/20 text-[#4ade80]',
  archived: 'bg-[#78350f]/20 text-[#fbbf24]',
  performed: 'bg-[#1e3a5f]/20 text-[#60a5fa]',
  bombed: 'bg-[#7f1d1d]/20 text-[#f87171]',
  killed: 'bg-[#166534]/20 text-[#4ade80]'
}

export function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-[#71717a] text-xs">—</span>
  const colorClass = statusColors[status] ?? 'bg-[#3b3b3f] text-[#a1a1aa]'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  )
}
