export type Locale = 'en' | 'id'

export interface Translations {
    nav: {
        getApp: string
        switchLang: string
    }
    hero: {
        badge: string
        line1: string
        line2: string
        line3: string
        desc: string
        cta: string
        ctaSecondary: string
    }
    features: {
        label: string
        heading1: string
        heading2: string
        items: Array<{
            number: string
            title: string
            desc: string
        }>
    }
    testimonials: Array<{
        quote: string
        name: string
        role: string
    }>
    waitlist: {
        heading: string
        desc: string
        placeholder: string
        button: string
        note: string
        platforms: string
    }
    cta: {
        heading: string
        desc: string
        button: string
        note: string
    }
    footer: {
        copyright: string
        privacy: string
        terms: string
        contact: string
    }
}

export const translations: Record<Locale, Translations> = {
    en: {
        nav: {
            getApp: 'Get Early Access',
            switchLang: '🇮🇩 Bahasa',
        },
        hero: {
            badge: 'Coming Soon — iOS & Android',
            line1: 'Write jokes.',
            line2: 'Build sets.',
            line3: 'Kill it.',
            desc: 'The distraction-free notebook built for comedians who take their craft seriously. Capture ideas, organize material, perform with confidence.',
            cta: 'Join the Waitlist',
            ctaSecondary: 'See Features ↓',
        },
        features: {
            label: 'What You Get',
            heading1: 'Everything a comedian needs.',
            heading2: 'Nothing they don\'t.',
            items: [
                {
                    number: '01',
                    title: 'Quick Capture',
                    desc: 'Funny idea at 3am? Tap, type, done. Ideas are fragile — catch them before they vanish.',
                },
                {
                    number: '02',
                    title: 'Tag & Organize',
                    desc: 'Crowdwork, observational, dark humor — tag your bits, filter your library, find anything in seconds.',
                },
                {
                    number: '03',
                    title: 'Set Builder',
                    desc: 'Drag jokes into setlists. Reorder on the fly. Time your sets. Walk on stage prepared.',
                },
                {
                    number: '04',
                    title: 'Performance Mode',
                    desc: 'Clean, distraction-free view on stage. Large text. Dark screen. Just you and your material.',
                },
            ],
        },
        testimonials: [
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
        ],
        waitlist: {
            heading: 'Get early access.',
            desc: 'Be the first to try Laughtrack when we launch. Join the beta waitlist and help us shape the app.',
            placeholder: 'your@email.com',
            button: 'Join the Beta',
            note: 'No spam. Just launch updates and early access.',
            platforms: 'Launching on iOS and Android',
        },
        cta: {
            heading: 'Your best set starts here.',
            desc: 'Join the waitlist now. Be among the first comedians to try Laughtrack.',
            button: 'Get Early Access',
            note: 'Coming soon to iOS & Android.',
        },
        footer: {
            copyright: `© ${new Date().getFullYear()} Laughtrack. Built for comedians, by people who get it.`,
            privacy: 'Privacy',
            terms: 'Terms',
            contact: 'Contact',
        },
    },
    id: {
        nav: {
            getApp: 'Daftar Sekarang',
            switchLang: '🇬🇧 English',
        },
        hero: {
            badge: 'Segera Hadir — iOS & Android',
            line1: 'Tulis jokes.',
            line2: 'Susun set.',
            line3: 'Kuasain panggung.',
            desc: 'Ide bagus terlalu sering hilang di Notes. Laughtrack dibuat khusus buat komedian — tangkap ide kapan aja, susun materi tanpa ribet, naik panggung dengan percaya diri.',
            cta: 'Gabung Waitlist',
            ctaSecondary: 'Lihat Fitur ↓',
        },
        features: {
            label: 'Fitur Utama',
            heading1: 'Semua yang lo butuhkan.',
            heading2: 'Sisanya? Nggak perlu.',
            items: [
                {
                    number: '01',
                    title: 'Tangkap Ide',
                    desc: 'Ide lucu jam 3 pagi? Ketuk, ketik, beres. Ide itu gampang ilang — save sebelum keburu lupa.',
                },
                {
                    number: '02',
                    title: 'Tag & Rapiin',
                    desc: 'Crowdwork, observasi, dark jokes — kasih tag, filter sesuka hati, cari materi dalam hitungan detik.',
                },
                {
                    number: '03',
                    title: 'Susun Set',
                    desc: 'Drag jokes ke setlist. Ubah urutan kapan aja. Pake timer. Naik panggung udah siap tempur.',
                },
                {
                    number: '04',
                    title: 'Mode Panggung',
                    desc: 'Layar bersih, teks gede, latar gelap. Nggak ada gangguan. Cuma lo dan materi lo.',
                },
            ],
        },
        testimonials: [
            {
                quote: '"Dulu ide gue berserakan di Notes. Sejak pake Laughtrack, nulis jadi kebiasaan lagi."',
                name: 'Jamie R.',
                role: 'Open Mic Reguler, Chicago',
            },
            {
                quote: '"Set builder-nya doang udah worth it. Gue bisa reshuffle set 15 menit sebelum naik."',
                name: 'Priya K.',
                role: 'Komedian Tur',
            },
        ],
        waitlist: {
            heading: 'Jadi yang pertama.',
            desc: 'Daftar sekarang, dapetin akses beta duluan. Bantu kita bikin Laughtrack makin solid.',
            placeholder: 'email@kamu.com',
            button: 'Gabung Beta',
            note: 'Nggak ada spam. Cuma update rilis dan akses awal.',
            platforms: 'Segera di iOS dan Android',
        },
        cta: {
            heading: 'Mulai dari sini.',
            desc: 'Gabung waitlist. Jadi salah satu komedian pertama yang nyobain Laughtrack.',
            button: 'Daftar Sekarang',
            note: 'Segera hadir di iOS & Android.',
        },
        footer: {
            copyright: `© ${new Date().getFullYear()} Laughtrack. Dibikin buat komedian, sama orang yang ngerti.`,
            privacy: 'Privasi',
            terms: 'Ketentuan',
            contact: 'Kontak',
        },
    },
}
