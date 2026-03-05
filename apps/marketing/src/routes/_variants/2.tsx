import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_variants/2')({
    head: () => ({
        meta: [
            { title: 'Laughtrack — Step Into the Spotlight' },
            { name: 'description', content: 'Your material deserves a proper stage. Laughtrack is the comedian\'s toolkit for writing, organizing, and crushing every set.' },
        ],
    }),
    component: SpotlightStage,
})

/* ==========================================
   VARIANT 2: SPOTLIGHT STAGE
   Warm theatrical theme, stage-lit ambiance
   ========================================== */

const features = [
    {
        icon: '⚡',
        title: 'Lightning Capture',
        desc: 'Voice or text — grab ideas the second they hit. No fumbling, no lost gems.',
    },
    {
        icon: '🏷️',
        title: 'Smart Tags',
        desc: 'Crowdwork, callbacks, one-liners. Your material, organized your way.',
    },
    {
        icon: '🎯',
        title: 'Set Builder',
        desc: 'Drag. Drop. Reorder. Build the perfect 5, 15, or 45 in minutes.',
    },
    {
        icon: '🎤',
        title: 'Stage Mode',
        desc: 'Minimal. High-contrast. Big text. Just your words under the lights.',
    },
    {
        icon: '☁️',
        title: 'Cloud Sync',
        desc: 'Your jokes are backed up and available on every device. Always.',
    },
    {
        icon: '🌙',
        title: 'Dark First',
        desc: 'Built for green rooms and late nights. Easy on the eyes, always.',
    },
]

const stats = [
    { value: '10K+', label: 'Comedians' },
    { value: '500K+', label: 'Jokes Written' },
    { value: '4.9★', label: 'App Store' },
]

function SpotlightStage() {
    return (
        <div style={{ background: '#1a1714', color: '#f0e6d6' }}>
            {/* HERO with spotlight effect */}
            <section className="min-h-screen flex items-center relative overflow-hidden">
                {/* Spotlight cone */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: `
              radial-gradient(ellipse 500px 600px at 50% 20%, oklch(70.45% 0.1926 39.23 / 0.15) 0%, transparent 60%),
              radial-gradient(ellipse 800px 400px at 30% 80%, oklch(70.45% 0.1926 39.23 / 0.04) 0%, transparent 50%),
              radial-gradient(ellipse 300px 300px at 80% 60%, oklch(70.45% 0.1926 39.23 / 0.06) 0%, transparent 50%)
            `,
                        animation: 'spotlight-breathe 6s ease-in-out infinite',
                    }}
                />

                {/* Subtle stage floor line */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, oklch(70.45% 0.1926 39.23 / 0.3), transparent)' }}
                />

                <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 relative z-10 text-center">
                    <div className="stagger-children">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-10"
                            style={{
                                border: '1px solid oklch(70.45% 0.1926 39.23 / 0.4)',
                                color: 'oklch(70.45% 0.1926 39.23)',
                                background: 'oklch(70.45% 0.1926 39.23 / 0.08)',
                            }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(70.45% 0.1926 39.23)' }} />
                            Now on iOS
                        </div>

                        <h1
                            className="font-bold tracking-tight leading-[1.05] mb-6"
                            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
                        >
                            Step into
                            <br />
                            the <span className="accent-underline" style={{ color: 'oklch(70.45% 0.1926 39.23)' }}>spotlight</span>
                        </h1>

                        <p
                            className="text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
                            style={{ color: 'rgba(240, 230, 214, 0.6)' }}
                        >
                            Your material deserves more than a notes app.
                            Laughtrack is the writing tool built by comedians, for comedians.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href="#download"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-semibold text-white transition-all duration-300 hover:scale-105"
                                style={{
                                    background: 'oklch(70.45% 0.1926 39.23)',
                                    boxShadow: '0 0 40px oklch(70.45% 0.1926 39.23 / 0.3)',
                                }}
                            >
                                Get Laughtrack Free
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS BAR */}
            <section
                className="py-12"
                style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
            >
                <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-16">
                    {stats.map((s) => (
                        <div key={s.label} className="text-center">
                            <p
                                className="text-3xl font-bold mb-1"
                                style={{ color: 'oklch(70.45% 0.1926 39.23)' }}
                            >
                                {s.value}
                            </p>
                            <p className="text-sm" style={{ color: 'rgba(240, 230, 214, 0.5)' }}>
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FEATURES GRID */}
            <section id="features" className="py-32">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                            Everything you need on stage
                        </h2>
                        <p className="text-lg" style={{ color: 'rgba(240, 230, 214, 0.5)' }}>
                            And nothing you don't. Laughtrack is intentionally simple.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <div
                                key={f.title}
                                className="group p-7 rounded-2xl transition-all duration-300 hover:translate-y-[-2px]"
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            >
                                <span className="text-2xl mb-4 block">{f.icon}</span>
                                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'rgba(240, 230, 214, 0.55)' }}>
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIAL SPOTLIGHT */}
            <section className="py-32" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <div
                        className="relative p-12 rounded-3xl"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            boxShadow: '0 0 80px oklch(70.45% 0.1926 39.23 / 0.05)',
                        }}
                    >
                        <span
                            className="text-6xl block mb-4"
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                color: 'oklch(70.45% 0.1926 39.23 / 0.3)',
                            }}
                        >
                            "
                        </span>
                        <p
                            className="text-xl sm:text-2xl font-medium leading-relaxed mb-8"
                            style={{ color: '#e8dfd3' }}
                        >
                            I've tried every notes app out there. Laughtrack is the first one that
                            actually thinks like a comedian. The set builder alone changed how I prep.
                        </p>
                        <div>
                            <p className="font-semibold">Marcus T.</p>
                            <p className="text-sm" style={{ color: 'rgba(240, 230, 214, 0.4)' }}>
                                Headliner, Comedy Store LA
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section id="download" className="py-32 text-center relative overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'radial-gradient(ellipse 600px 400px at 50% 50%, oklch(70.45% 0.1926 39.23 / 0.1), transparent 70%)',
                    }}
                />
                <div className="max-w-3xl mx-auto px-6 relative z-10 stagger-children">
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                        The stage is yours.
                    </h2>
                    <p className="text-lg mb-10" style={{ color: 'rgba(240, 230, 214, 0.5)' }}>
                        Start writing your best material today. Free forever.
                    </p>
                    <a
                        href="#"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white transition-all duration-300 hover:scale-105"
                        style={{
                            background: 'oklch(70.45% 0.1926 39.23)',
                            boxShadow: '0 0 40px oklch(70.45% 0.1926 39.23 / 0.3)',
                        }}
                    >
                        Download for iOS
                    </a>
                    <p className="mt-4 text-sm" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>
                        Android coming soon.
                    </p>
                </div>
            </section>

            {/* FOOTER */}
            <footer
                className="py-8 px-6"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>
                        © {new Date().getFullYear()} Laughtrack. Built for comedians, by people who get it.
                    </p>
                    <div className="flex gap-6 text-sm" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
