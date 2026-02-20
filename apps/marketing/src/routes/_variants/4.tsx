import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_variants/4')({
    head: () => ({
        meta: [
            { title: 'LAUGHTRACK — WRITE. PERFORM. REPEAT.' },
            { name: 'description', content: 'Raw. Fast. No nonsense. The comedy writing app that gets out of your way and lets you work.' },
        ],
    }),
    component: NeonOpenMic,
})

/* ==========================================
   VARIANT 4: NEON OPEN MIC
   Bold, neon-lit, high-energy punk aesthetic
   ========================================== */

const features = [
    {
        title: 'CAPTURE',
        desc: 'Voice or text. Tap and go. Your 3am shower thought is safe.',
        border: '#ff6b35',
    },
    {
        title: 'ORGANIZE',
        desc: 'Tags. Search. Filters. Your chaos, sorted.',
        border: '#00d4aa',
    },
    {
        title: 'BUILD',
        desc: 'Drag jokes into sets. Time them. Rearrange in seconds.',
        border: '#ff6b35',
    },
    {
        title: 'PERFORM',
        desc: 'Stage mode. Dark. Big text. Nothing else. Go kill.',
        border: '#00d4aa',
    },
]

function NeonOpenMic() {
    return (
        <div style={{ background: '#000', color: '#fff' }}>
            {/* HERO */}
            <section className="min-h-screen flex items-center relative overflow-hidden">
                {/* Grid background */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
            `,
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Neon glow blobs */}
                <div
                    className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.07]"
                    style={{
                        background: 'radial-gradient(circle, #ff6b35, transparent 70%)',
                        filter: 'blur(80px)',
                    }}
                />
                <div
                    className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.05]"
                    style={{
                        background: 'radial-gradient(circle, #00d4aa, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />

                <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 relative z-10">
                    <div className="stagger-children">
                        <div className="flex items-center gap-3 mb-8">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                    background: '#ff6b35',
                                    boxShadow: '0 0 10px #ff6b35, 0 0 20px #ff6b3540',
                                }}
                            />
                            <span
                                className="text-xs font-mono font-bold tracking-[0.3em] uppercase"
                                style={{ color: '#ff6b35' }}
                            >
                                Open Mic Night — Every Night
                            </span>
                        </div>

                        <h1
                            className="font-bold leading-[0.9] mb-8"
                            style={{
                                fontSize: 'clamp(3.5rem, 10vw, 8rem)',
                                fontFamily: "'Space Mono', monospace",
                                letterSpacing: '-0.03em',
                            }}
                        >
                            <span className="block">WRITE.</span>
                            <span className="block neon-text" style={{ color: '#ff6b35' }}>
                                PERFORM.
                            </span>
                            <span className="block neon-text-cyan" style={{ color: '#00d4aa' }}>
                                REPEAT.
                            </span>
                        </h1>

                        <p
                            className="text-lg max-w-lg mb-10 font-mono"
                            style={{ color: '#666' }}
                        >
                            {'>'} The comedy writing app that doesn't waste your time.
                            Raw tools. Zero fluff.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <a
                                href="#download"
                                className="neon-border inline-flex items-center gap-2 px-8 py-4 rounded-none text-[15px] font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105"
                                style={{
                                    color: '#ff6b35',
                                    background: 'rgba(255, 107, 53, 0.08)',
                                }}
                            >
                                [ DOWNLOAD ]
                            </a>
                            <a
                                href="#features"
                                className="inline-flex items-center gap-2 px-8 py-4 text-[15px] font-mono font-bold uppercase tracking-wider transition-all duration-200"
                                style={{
                                    color: '#00d4aa',
                                }}
                            >
                                see features_
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* DIVIDER */}
            <div
                className="h-px"
                style={{
                    background: 'linear-gradient(90deg, transparent, #ff6b35, #00d4aa, transparent)',
                }}
            />

            {/* FEATURES — Brutalist grid */}
            <section id="features" className="py-28">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="mb-16">
                        <h2
                            className="text-2xl font-bold font-mono tracking-tight uppercase"
                            style={{ color: '#fff' }}
                        >
                            {'// '}<span style={{ color: '#00d4aa' }}>FEATURES</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="group p-8 transition-all duration-200"
                                style={{
                                    border: `1px solid ${f.border}30`,
                                }}
                            >
                                <h3
                                    className="text-xl font-mono font-bold mb-3 tracking-wider"
                                    style={{ color: f.border }}
                                >
                                    {f.title}
                                </h3>
                                <p
                                    className="text-sm font-mono leading-relaxed"
                                    style={{ color: '#888' }}
                                >
                                    {f.desc}
                                </p>
                                <div
                                    className="mt-6 h-0.5 w-0 group-hover:w-full transition-all duration-500"
                                    style={{ background: f.border }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIAL — Terminal style */}
            <section className="py-24" style={{ background: '#0a0a0a' }}>
                <div className="max-w-3xl mx-auto px-6">
                    <div
                        className="rounded-lg overflow-hidden"
                        style={{ border: '1px solid #333' }}
                    >
                        {/* Terminal header */}
                        <div
                            className="flex items-center gap-2 px-4 py-3"
                            style={{ background: '#1a1a1a', borderBottom: '1px solid #333' }}
                        >
                            <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
                            <div className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }} />
                            <div className="w-3 h-3 rounded-full" style={{ background: '#28ca42' }} />
                            <span className="ml-3 text-xs font-mono" style={{ color: '#666' }}>
                                reviews.txt
                            </span>
                        </div>
                        {/* Terminal body */}
                        <div className="p-6 font-mono text-sm leading-relaxed" style={{ background: '#0d0d0d' }}>
                            <p style={{ color: '#666' }}>$ cat latest_review</p>
                            <br />
                            <p style={{ color: '#ddd' }}>
                                "Finally, an app that doesn't try to be everything.
                                <br />
                                It's a joke notebook. It does that one thing perfectly.
                                <br />
                                Set builder is <span style={{ color: '#ff6b35' }}>*chef's kiss*</span>."
                            </p>
                            <br />
                            <p style={{ color: '#00d4aa' }}>— @davecomedynyc</p>
                            <p style={{ color: '#666' }}>$ _</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section id="download" className="py-28 text-center relative overflow-hidden">
                {/* Glow */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.06]"
                    style={{
                        background: 'radial-gradient(circle, #ff6b35, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />

                <div className="max-w-3xl mx-auto px-6 relative z-10 stagger-children">
                    <h2
                        className="text-4xl sm:text-5xl font-bold font-mono tracking-tight uppercase mb-6"
                    >
                        <span style={{ color: '#ff6b35' }}>GET</span>
                        {' '}
                        <span style={{ color: '#00d4aa' }}>ON</span>
                        {' '}
                        STAGE
                    </h2>
                    <p className="text-lg font-mono mb-10" style={{ color: '#666' }}>
                        {'>'} free download. no account needed. just start writing.
                    </p>
                    <a
                        href="#"
                        className="neon-border inline-flex items-center gap-3 px-10 py-4 text-base font-mono font-bold uppercase tracking-widest transition-all duration-200 hover:scale-105"
                        style={{
                            color: '#ff6b35',
                            background: 'rgba(255, 107, 53, 0.08)',
                        }}
                    >
                        [ DOWNLOAD iOS ]
                    </a>
                    <p className="mt-4 text-sm font-mono" style={{ color: '#444' }}>
            // android: coming_soon
                    </p>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-8 px-6" style={{ borderTop: '1px solid #222' }}>
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-mono" style={{ color: '#444' }}>
                        © {new Date().getFullYear()} LAUGHTRACK // BUILT_FOR_COMEDIANS
                    </p>
                    <div className="flex gap-6 text-xs font-mono" style={{ color: '#444' }}>
                        <a href="#" className="hover:text-[#ff6b35] transition-colors">PRIVACY</a>
                        <a href="#" className="hover:text-[#ff6b35] transition-colors">TERMS</a>
                        <a href="#" className="hover:text-[#ff6b35] transition-colors">CONTACT</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
