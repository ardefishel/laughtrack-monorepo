import { useI18n } from '@/lib/i18n-context'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/contact')({
    head: () => ({
        meta: [
            { title: 'Contact — Laughtrack' },
            { name: 'description', content: 'Get in touch with the Laughtrack team. We\'d love to hear from you.' },
        ],
    }),
    component: ContactPage,
})

function ContactPage() {
    const { t } = useI18n()

    return (
        <div className="grain-overlay" style={{ background: '#0e0e0e', color: '#f5f5f5' }}>
            {/* NAV */}
            <nav
                className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
                style={{
                    background: 'rgba(14, 14, 14, 0.85)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/icon-dark.png" alt="Laughtrack" className="w-6 h-6" />
                        <span className="text-lg font-semibold tracking-tight text-[#f5f5f5]">
                            Laughtrack
                        </span>
                    </Link>
                </div>
            </nav>

            {/* CONTENT */}
            <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
                <h1
                    className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    {t.contact.title}
                </h1>
                <p className="text-lg leading-relaxed mb-12" style={{ color: '#999' }}>
                    {t.contact.description}
                </p>

                <div className="space-y-8">
                    {t.contact.channels.map((channel, i) => (
                        <div
                            key={i}
                            className="rounded-2xl p-6"
                            style={{
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                            }}
                        >
                            <h2 className="text-lg font-semibold mb-2">{channel.label}</h2>
                            <p className="text-[15px] leading-relaxed mb-3" style={{ color: '#999' }}>
                                {channel.description}
                            </p>
                            <a
                                href={channel.href}
                                className="text-[15px] font-medium transition-colors hover:underline"
                                style={{ color: 'oklch(70.45% 0.1926 39.23)' }}
                            >
                                {channel.linkText}
                            </a>
                        </div>
                    ))}
                </div>
            </main>

            {/* FOOTER */}
            <footer className="py-8 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm" style={{ color: '#555' }}>
                        {t.footer.copyright}
                    </p>
                    <div className="flex gap-6 text-sm" style={{ color: '#555' }}>
                        <Link to="/privacy" className="hover:text-white transition-colors">{t.footer.privacy}</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">{t.footer.terms}</Link>
                        <Link to="/contact" className="hover:text-white transition-colors">{t.footer.contact}</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
