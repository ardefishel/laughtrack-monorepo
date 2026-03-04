import { useI18n } from '@/lib/i18n-context'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
    head: () => ({
        meta: [
            { title: 'Privacy Policy — Laughtrack' },
            { name: 'description', content: 'Laughtrack Privacy Policy. Learn how we collect, use, and protect your data.' },
        ],
    }),
    component: PrivacyPolicy,
})

function PrivacyPolicy() {
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
                    className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    {t.privacy.title}
                </h1>
                <p className="text-sm mb-12" style={{ color: '#666' }}>
                    {t.privacy.lastUpdated}
                </p>

                <div className="space-y-10">
                    {t.privacy.sections.map((section, i) => (
                        <section key={i}>
                            <h2 className="text-xl font-semibold mb-3">{section.heading}</h2>
                            {section.paragraphs.map((p, j) => (
                                <p key={j} className="text-[15px] leading-relaxed mb-3" style={{ color: '#999' }}>
                                    {p}
                                </p>
                            ))}
                        </section>
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
