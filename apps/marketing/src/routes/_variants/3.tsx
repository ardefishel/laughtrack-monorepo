import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_variants/3')({
    head: () => ({
        meta: [
            { title: 'Laughtrack — Your Comedy Notebook, Digitized' },
            { name: 'description', content: 'The warm, familiar feeling of writing in a notebook — with the power of a modern app. Tag, search, and build sets from your ideas.' },
        ],
    }),
    component: ComediansNotebook,
})

/* ==========================================
   VARIANT 3: COMEDIAN'S NOTEBOOK
   Light, paper-textured, handwritten character
   ========================================== */

const features = [
    {
        title: 'Jot it down',
        desc: 'Quick capture for premises, punchlines, and half-baked ideas. Get it out of your head before it disappears.',
        tag: 'capture',
    },
    {
        title: 'Find it later',
        desc: 'Tags, search, filters. Your notebook, but one that actually lets you find things.',
        tag: 'organize',
    },
    {
        title: 'Build your set',
        desc: 'Drag jokes into setlists. Rearrange on the fly. Time it. Walk up ready.',
        tag: 'perform',
    },
    {
        title: 'Take it on stage',
        desc: 'Clean, high-contrast performance view. Just your words, nothing else.',
        tag: 'stage',
    },
]

const scribbles = [
    'reminder: callback to airplane bit',
    'TODO: tighten the grocery store tag',
    'new premise: why do...???',
    '★ this one killed tuesday',
]

function ComediansNotebook() {
    return (
        <div style={{ background: '#faf5ef', color: '#2c2420' }}>
            {/* HERO */}
            <section className="min-h-screen flex items-center relative overflow-hidden">
                {/* Notebook lines background */}
                <div
                    className="absolute inset-0 paper-texture opacity-60"
                />
                {/* Left margin line */}
                <div
                    className="absolute top-0 bottom-0 hidden md:block"
                    style={{ left: '80px', width: '2px', background: 'rgba(220, 80, 80, 0.12)' }}
                />

                <div className="max-w-5xl mx-auto px-6 sm:px-16 pt-28 pb-16 relative z-10">
                    <div className="stagger-children">
                        <p
                            className="text-sm font-semibold tracking-widest uppercase mb-6"
                            style={{ color: 'oklch(70.45% 0.1926 39.23)' }}
                        >
                            The Comedian's Toolkit
                        </p>

                        <h1 className="mb-8" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
                            <span className="font-bold tracking-tight" style={{ display: 'block' }}>
                                Your best bits
                            </span>
                            <span
                                className="accent-underline"
                                style={{
                                    fontFamily: "'Caveat', cursive",
                                    fontWeight: 700,
                                    color: 'oklch(70.45% 0.1926 39.23)',
                                    fontSize: '1.15em',
                                }}
                            >
                                deserve better than Notes app
                            </span>
                        </h1>

                        <p
                            className="text-lg max-w-xl leading-relaxed mb-10"
                            style={{ color: '#7a7068' }}
                        >
                            Laughtrack is the notebook that thinks like a comedian. Write ideas, organize
                            material, build sets, and go on stage with confidence.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <a
                                href="#download"
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold text-white transition-all duration-200 hover:scale-105"
                                style={{ background: 'oklch(70.45% 0.1926 39.23)' }}
                            >
                                Start Writing Free
                            </a>
                            <a
                                href="#features"
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold transition-all duration-200 hover:scale-105"
                                style={{
                                    color: '#2c2420',
                                    border: '1px solid #d4cdc4',
                                }}
                            >
                                How it works ↓
                            </a>
                        </div>
                    </div>

                    {/* Floating scribble notes */}
                    <div className="hidden lg:block absolute right-0 top-1/4 space-y-4">
                        {scribbles.map((s, i) => (
                            <div
                                key={i}
                                className="px-4 py-2 rounded shadow-sm transition-transform duration-300 hover:rotate-0"
                                style={{
                                    background: i % 2 === 0 ? '#fff9e6' : '#fff',
                                    border: '1px solid #e8e4de',
                                    fontFamily: "'Caveat', cursive",
                                    fontSize: '15px',
                                    color: '#5a534e',
                                    transform: `rotate(${i % 2 === 0 ? '-2' : '1.5'}deg)`,
                                    maxWidth: '220px',
                                    animationDelay: `${i * 0.15}s`,
                                }}
                            >
                                {s}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DIVIDER */}
            <div className="max-w-4xl mx-auto px-6">
                <div
                    style={{
                        height: '2px',
                        background: 'repeating-linear-gradient(90deg, #d4cdc4 0, #d4cdc4 8px, transparent 8px, transparent 14px)',
                    }}
                />
            </div>

            {/* FEATURES */}
            <section id="features" className="py-28">
                <div className="max-w-5xl mx-auto px-6 sm:px-16">
                    <div className="mb-16">
                        <h2
                            className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
                        >
                            How comedians use Laughtrack
                        </h2>
                        <p style={{ color: '#7a7068' }}>
                            Simple tools for the messy, beautiful process of writing comedy.
                        </p>
                    </div>

                    <div className="space-y-12">
                        {features.map((f, i) => (
                            <div
                                key={f.tag}
                                className="group flex flex-col sm:flex-row gap-6 sm:gap-10 items-start p-6 rounded-2xl transition-all duration-200 hover:bg-white"
                                style={{
                                    border: '1px solid transparent',
                                }}
                            >
                                <div
                                    className="shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-sm font-bold"
                                    style={{
                                        background: 'oklch(70.45% 0.1926 39.23 / 0.1)',
                                        color: 'oklch(70.45% 0.1926 39.23)',
                                        fontFamily: "'Caveat', cursive",
                                        fontSize: '24px',
                                    }}
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </div>
                                <div>
                                    <span
                                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase mb-3"
                                        style={{
                                            background: 'oklch(70.45% 0.1926 39.23 / 0.1)',
                                            color: 'oklch(70.45% 0.1926 39.23)',
                                        }}
                                    >
                                        {f.tag}
                                    </span>
                                    <h3 className="text-xl font-bold mb-2 group-hover:translate-x-1 transition-transform">
                                        {f.title}
                                    </h3>
                                    <p className="text-[15px] leading-relaxed" style={{ color: '#7a7068' }}>
                                        {f.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* QUOTE SECTION */}
            <section
                className="py-24"
                style={{ background: '#f5f0e8' }}
            >
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <p
                        className="text-2xl sm:text-3xl leading-snug mb-8"
                        style={{
                            fontFamily: "'Caveat', cursive",
                            color: '#3d3530',
                        }}
                    >
                        "It's like having the world's most organized comedy notebook in your pocket.
                        Except it doesn't have coffee stains on it. Yet."
                    </p>
                    <div style={{ color: '#7a7068' }}>
                        <p className="font-semibold text-sm" style={{ color: '#2c2420' }}>Sarah L.</p>
                        <p className="text-sm">Open Mic Circuit, NYC</p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section id="download" className="py-28 text-center">
                <div className="max-w-3xl mx-auto px-6 stagger-children">
                    <h2
                        className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
                    >
                        Open a fresh page.
                    </h2>
                    <p
                        className="text-lg mb-10"
                        style={{
                            fontFamily: "'Caveat', cursive",
                            color: '#7a7068',
                            fontSize: '1.3rem',
                        }}
                    >
                        (The first joke is always the hardest. We'll make it easy.)
                    </p>
                    <a
                        href="#"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white transition-all duration-200 hover:scale-105"
                        style={{ background: 'oklch(70.45% 0.1926 39.23)' }}
                    >
                        Download for iOS
                    </a>
                    <p className="mt-4 text-sm" style={{ color: '#b0a89e' }}>
                        Android coming soon.
                    </p>
                </div>
            </section>

            {/* FOOTER */}
            <footer
                className="py-8 px-6"
                style={{ borderTop: '1px solid #e8e4de' }}
            >
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm" style={{ color: '#b0a89e' }}>
                        © {new Date().getFullYear()} Laughtrack. Built for comedians, by people who get it.
                    </p>
                    <div className="flex gap-6 text-sm" style={{ color: '#b0a89e' }}>
                        <a href="#" className="hover:text-[#2c2420] transition-colors">Privacy</a>
                        <a href="#" className="hover:text-[#2c2420] transition-colors">Terms</a>
                        <a href="#" className="hover:text-[#2c2420] transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
