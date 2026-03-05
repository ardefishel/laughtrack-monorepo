import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_variants/1')({
    head: () => ({
        meta: [
            { title: 'Laughtrack — Write Jokes. Build Sets. Kill It.' },
            { name: 'description', content: 'The distraction-free notebook for stand-up comedians. Capture ideas instantly, organize your material, and perform with confidence.' },
        ],
    }),
    component: EditorialNoir,
})

/* ==========================================
   VARIANT 1: EDITORIAL NOIR
   Dark, typographic, magazine-style layout
   ========================================== */

const features = [
    {
        title: 'Quick Capture',
        desc: 'Funny idea at 3am? Tap, type, done. Ideas are fragile — catch them before they vanish.',
        number: '01',
    },
    {
        title: 'Tag & Organize',
        desc: 'Crowdwork, observational, dark humor — tag your bits, filter your library, find anything in seconds.',
        number: '02',
    },
    {
        title: 'Set Builder',
        desc: 'Drag jokes into setlists. Reorder on the fly. Time your sets. Walk on stage prepared.',
        number: '03',
    },
    {
        title: 'Performance Mode',
        desc: 'Clean, distraction-free view on stage. Large text. Dark screen. Just you and your material.',
        number: '04',
    },
]

const testimonials = [
    {
        quote: '"I used to lose half my ideas in Notes app chaos. Laughtrack actually makes me want to write."',
        name: 'Jamie R.',
        role: 'Open Mic Regular, Chicago',
    },
    {
        quote: '"The set builder alone is worth it. I can rearrange my 15 in seconds before going up."',
        name: 'Priya K.',
        role: 'Touring Comedian',
    },
]

function EditorialNoir() {
    return (
        <div className="grain-overlay" style={{ background: '#0e0e0e', color: '#f5f5f5' }}>
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
                        <p
                            className="text-sm font-semibold tracking-[0.25em] uppercase mb-8"
                            style={{ color: 'oklch(70.45% 0.1926 39.23)' }}
                        >
                            For Stand-Up Comedians
                        </p>

                        <h1
                            className="font-bold tracking-tight leading-[0.95] mb-8"
                            style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', fontFamily: "'Playfair Display', serif" }}
                        >
                            Write jokes.
                            <br />
                            Build sets.
                            <br />
                            <span style={{ color: 'oklch(70.45% 0.1926 39.23)' }}>Kill it.</span>
                        </h1>

                        <div className="max-w-lg">
                            <p className="text-lg leading-relaxed mb-10" style={{ color: '#999' }}>
                                The distraction-free notebook built for comedians who take their craft seriously.
                                Capture ideas, organize material, perform with confidence.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="#download"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold text-white transition-all duration-200 hover:scale-105"
                                    style={{ background: 'oklch(70.45% 0.1926 39.23)' }}
                                >
                                    Download Free
                                </a>
                                <a
                                    href="#features"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold transition-all duration-200 hover:scale-105"
                                    style={{
                                        color: '#f5f5f5',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                    }}
                                >
                                    See Features ↓
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
                            What You Get
                        </p>
                        <h2
                            className="text-4xl sm:text-5xl font-bold tracking-tight"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Everything a comedian needs.
                            <br />
                            Nothing they don't.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
                        {features.map((f) => (
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
                    {testimonials.map((t, i) => (
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
                                {t.quote}
                            </p>
                            <div>
                                <p className="text-sm font-semibold">{t.name}</p>
                                <p className="text-sm" style={{ color: '#666' }}>{t.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section id="download" className="py-32">
                <div className="max-w-3xl mx-auto px-6 text-center stagger-children">
                    <h2
                        className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Your best set starts here.
                    </h2>
                    <p className="text-lg mb-10" style={{ color: '#999' }}>
                        Free to download. No account required to start writing.
                    </p>
                    <a
                        href="#"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white transition-all duration-200 hover:scale-105"
                        style={{ background: 'oklch(70.45% 0.1926 39.23)' }}
                    >
                        <span>Download for iOS</span>
                    </a>
                    <p className="mt-4 text-sm" style={{ color: '#555' }}>
                        Android coming soon.
                    </p>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-8 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm" style={{ color: '#555' }}>
                        © {new Date().getFullYear()} Laughtrack. Built for comedians, by people who get it.
                    </p>
                    <div className="flex gap-6 text-sm" style={{ color: '#555' }}>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
