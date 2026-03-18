import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_public')({
  component: () => (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Outlet />
    </div>
  ),
})
