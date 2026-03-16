import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/setlists')({
  component: () => <Outlet />,
})
