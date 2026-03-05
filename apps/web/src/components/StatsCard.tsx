export function StatsCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-warning/30 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-medium text-muted-dim uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}
