import { Link } from '@tanstack/react-router'

type RouteErrorStateProps = {
  title: string
  message: string
  backTo: string
  backLabel: string
}

export function RouteErrorState({ title, message, backTo, backLabel }: RouteErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
      <h1 className="mb-2 text-2xl font-semibold text-foreground">{title}</h1>
      <p className="mb-4 text-sm text-muted">{message}</p>
      <Link
        to={backTo}
        className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:border-warning/30 hover:text-warning"
      >
        {backLabel}
      </Link>
    </div>
  )
}
