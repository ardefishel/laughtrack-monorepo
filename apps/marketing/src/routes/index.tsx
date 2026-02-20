import { useI18n } from '@/lib/i18n-context'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({
    head: () => ({
        meta: [
            { title: 'Laughtrack — The Comedian\'s Toolkit' },
            { name: 'description', content: 'Write, organize, and perform your best material. The distraction-free notebook built for stand-up comedians. Coming soon to iOS & Android.' },
        ],
    }),
    component: LandingPage,
})

function LandingPage() {
    const { t, toggleLocale, locale } = useI18n()
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (email.trim()) {
            setSubmitted(true)
        }
    }

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
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo-dark.png"
                            alt="Laughtrack"
                            className="w-8 h-8"
                        />
                        <span className="text-lg font-semibold tracking-tight text-[#f5f5f5]">
                            Laughtrack
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleLocale}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5"
                            style={{ color: 'rgba(255,255,255,0.5)' }}
                        >
                            {t.nav.switchLang}
                        </button>
                        <a
                            href="#waitlist"
                            className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
                            style={{ background: 'oklch(70.45% 0.1926 39.23)' }}
                        >
                            {t.nav.getApp}
                        </a>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="min-h-screen flex items-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]">
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 100px,
                rgba(255,255,255,0.5) 100px,
                rgba(255,255,255,0.5) 101px
              )`,
                        }}
                    />
                </div>

                <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 relative z-10">
                    <div className="stagger-children">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-8"
                            style={{
                                border: '1px solid oklch(70.45% 0.1926 39.23 / 0.4)',
                                color: 'oklch(70.45% 0.1926 39.23)',
                                background: 'oklch(70.45% 0.1926 39.23 / 0.08)',
                            }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(70.45% 0.1926 39.23)' }} />
                            {t.hero.badge}
                        </div>

                        <h1
                            className="font-bold tracking-tight leading-[0.95] mb-8"
                            style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', fontFamily: "'Playfair Display', serif" }}
                        >
                            {t.hero.line1}
                            <br />
                            {t.hero.line2}
                            <br />
                            <span style={{ color: 'oklch(70.45% 0.1926 39.23)' }}>{t.hero.line3}</span>
                        </h1>

                        <div className="max-w-lg">
                            <p className="text-lg leading-relaxed mb-10" style={{ color: '#999' }}>
                                {t.hero.desc}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="#waitlist"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold text-white transition-all duration-200 hover:scale-105"
                                    style={{ background: 'oklch(70.45% 0.1926 39.23)' }}
                                >
                                    {t.hero.cta}
                                </a>
                                <a
                                    href="#features"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold transition-all duration-200 hover:scale-105"
                                    style={{
                                        color: '#f5f5f5',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                    }}
                                >
                                    {t.hero.ctaSecondary}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DIVIDER */}
            <div className="max-w-6xl mx-auto px-6">
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* FEATURES */}
            <section id="features" className="py-32">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="mb-20">
                        <p
                            className="text-sm font-semibold tracking-[0.25em] uppercase mb-4"
                            style={{ color: 'oklch(70.45% 0.1926 39.23)' }}
                        >
                            {t.features.label}
                        </p>
                        <h2
                            className="text-4xl sm:text-5xl font-bold tracking-tight"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            {t.features.heading1}
                            <br />
                            {t.features.heading2}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
                        {t.features.items.map((f) => (
                            <div key={f.number} className="group">
                                <div className="flex items-start gap-6">
                                    <span
                                        className="text-sm font-mono font-bold shrink-0 pt-1"
                                        style={{ color: 'oklch(70.45% 0.1926 39.23)' }}
                                    >
                                        {f.number}
                                    </span>
                                    <div>
                                        <h3 className="text-xl font-bold mb-3 group-hover:translate-x-1 transition-transform duration-200">
                                            {f.title}
                                        </h3>
                                        <p className="text-[15px] leading-relaxed" style={{ color: '#999' }}>
                                            {f.desc}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className="mt-6 ml-12"
                                    style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PULL QUOTES */}
            <section className="py-32" style={{ background: '#0a0a0a' }}>
                <div className="max-w-4xl mx-auto px-6 space-y-20">
                    {t.testimonials.map((testimonial, i) => (
                        <div
                            key={i}
                            className="relative"
                            style={{
                                paddingLeft: '2rem',
                                borderLeft: '2px solid oklch(70.45% 0.1926 39.23)',
                            }}
                        >
                            <p
                                className="text-2xl sm:text-3xl font-medium leading-snug mb-6"
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontStyle: 'italic',
                                    color: '#e0e0e0',
                                }}
                            >
                                {testimonial.quote}
                            </p>
                            <div>
                                <p className="text-sm font-semibold">{testimonial.name}</p>
                                <p className="text-sm" style={{ color: '#666' }}>{testimonial.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* WAITLIST */}
            <section id="waitlist" className="py-32 relative overflow-hidden">
                {/* Glow backdrop */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
                    style={{
                        background: 'radial-gradient(circle, oklch(70.45% 0.1926 39.23), transparent 70%)',
                        filter: 'blur(80px)',
                    }}
                />

                <div className="max-w-2xl mx-auto px-6 relative z-10 text-center">
                    <div className="stagger-children">
                        <div className="inline-flex items-center gap-2 mb-6">
                            <span className="text-xl">📱</span>
                            <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: 'oklch(70.45% 0.1926 39.23)' }}>
                                {t.waitlist.platforms}
                            </span>
                        </div>

                        <h2
                            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            {t.waitlist.heading}
                        </h2>
                        <p className="text-lg mb-10 max-w-lg mx-auto" style={{ color: '#999' }}>
                            {t.waitlist.desc}
                        </p>

                        {submitted ? (
                            <div
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                <span className="text-xl">🎤</span>
                                <span className="text-[15px] font-medium">
                                    {locale === 'id' ? 'Kamu masuk! Kami akan menghubungi saat peluncuran.' : 'You\'re in! We\'ll reach out when we launch.'}
                                </span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <input
                                    type="email"
                                    required
                                    placeholder={t.waitlist.placeholder}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 px-5 py-3.5 rounded-full text-[15px] outline-none transition-all duration-200 focus:ring-2"
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#f5f5f5',
                                        caretColor: 'oklch(70.45% 0.1926 39.23)',
                                    }}
                                />
                                <button
                                    type="submit"
                                    className="px-7 py-3.5 rounded-full text-[15px] font-semibold text-white transition-all duration-200 hover:scale-105 shrink-0"
                                    style={{ background: 'oklch(70.45% 0.1926 39.23)' }}
                                >
                                    {t.waitlist.button}
                                </button>
                            </form>
                        )}

                        <p className="mt-4 text-sm" style={{ color: '#555' }}>
                            {t.waitlist.note}
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32" style={{ background: '#0a0a0a' }}>
                <div className="max-w-3xl mx-auto px-6 text-center stagger-children">
                    <h2
                        className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        {t.cta.heading}
                    </h2>
                    <p className="text-lg mb-10" style={{ color: '#999' }}>
                        {t.cta.desc}
                    </p>
                    <a
                        href="#waitlist"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white transition-all duration-200 hover:scale-105"
                        style={{ background: 'oklch(70.45% 0.1926 39.23)' }}
                    >
                        {t.cta.button}
                    </a>
                    <p className="mt-4 text-sm" style={{ color: '#555' }}>
                        {t.cta.note}
                    </p>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-8 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm" style={{ color: '#555' }}>
                        {t.footer.copyright}
                    </p>
                    <div className="flex gap-6 text-sm" style={{ color: '#555' }}>
                        <a href="#" className="hover:text-white transition-colors">{t.footer.privacy}</a>
                        <a href="#" className="hover:text-white transition-colors">{t.footer.terms}</a>
                        <a href="#" className="hover:text-white transition-colors">{t.footer.contact}</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
