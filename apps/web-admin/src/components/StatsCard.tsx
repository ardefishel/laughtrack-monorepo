export function StatsCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 hover:border-[#f59e0b]/30 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-medium text-[#71717a] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-semibold text-[#f5f5f5]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}
