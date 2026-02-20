/// <reference types="vite/client" />
import { I18nProvider } from '@/lib/i18n-context'
import '@/styles.css'
import {
    createRootRoute,
    HeadContent,
    Outlet,
    Scripts,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { title: 'Laughtrack — The Comedian\'s Toolkit' },
            { name: 'description', content: 'Write, organize, and perform your best material. The distraction-free notebook built for stand-up comedians.' },
            { property: 'og:title', content: 'Laughtrack — The Comedian\'s Toolkit' },
            { property: 'og:description', content: 'Write, organize, and perform your best material.' },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary_large_image' },
        ],
        links: [
            { rel: 'icon', href: '/favicon.png', type: 'image/png' },
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Caveat:wght@400..700&family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
            },
        ],
    }),
    component: RootComponent,
})

function RootComponent() {
    return (
        <RootDocument>
            <I18nProvider>
                <Outlet />
            </I18nProvider>
        </RootDocument>
    )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body className="antialiased">
                {children}
                <Scripts />
            </body>
        </html>
    )
}
