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
    workflow: {
        label: string
        heading: string
        desc: string
        steps: Array<{
            icon: string
            title: string
            desc: string
        }>
    }
    privacy: {
        title: string
        lastUpdated: string
        sections: Array<{
            heading: string
            paragraphs: string[]
        }>
    }
    terms: {
        title: string
        lastUpdated: string
        sections: Array<{
            heading: string
            paragraphs: string[]
        }>
    }
    contact: {
        title: string
        description: string
        channels: Array<{
            label: string
            description: string
            href: string
            linkText: string
        }>
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
                    desc: 'Funny idea at 3am? Tap, type, done. Jot it as a note, then develop it into a premise and polished bit when you\'re ready.',
                },
                {
                    number: '02',
                    title: 'Premise → Bit Pipeline',
                    desc: 'Turn raw ideas into premises, then craft them into stage-ready bits. Tag, filter, and track status as your material evolves.',
                },
                {
                    number: '03',
                    title: 'Set Builder',
                    desc: 'Build setlists from your bits. Reorder on the fly, add stage notes between jokes. Walk on stage prepared.',
                },
                {
                    number: '04',
                    title: 'Reader Mode',
                    desc: 'Open your setlist in a clean, distraction-free view. Screen stays awake, text stays big. Just you and your material.',
                },
                {
                    number: '05',
                    title: 'Learn & Level Up',
                    desc: 'Sharpen your craft with built-in lessons on comedy techniques, stage presence, audience reading, and performance analytics.',
                },
                {
                    number: '06',
                    title: 'Cloud Sync',
                    desc: 'Your material lives on your device first. Sign in to back up and restore across devices — your jokes, always safe.',
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
        workflow: {
            label: 'Your Workflow',
            heading: 'From shower thought to standing ovation.',
            desc: 'Laughtrack mirrors how comedians actually work — raw idea to polished set, one step at a time.',
            steps: [
                {
                    icon: '💡',
                    title: 'Note',
                    desc: 'Capture the spark. A thought, a phrase, a weird observation — just get it down.',
                },
                {
                    icon: '🧠',
                    title: 'Premise',
                    desc: 'Shape the angle. Find the tension, the "what if", the point of view that makes it funny.',
                },
                {
                    icon: '🎯',
                    title: 'Bit',
                    desc: 'Write the joke. Punchlines, tags, callbacks — craft it until it hits.',
                },
                {
                    icon: '📋',
                    title: 'Setlist',
                    desc: 'Build your set. Order your bits, add stage notes, and walk up ready.',
                },
                {
                    icon: '🎤',
                    title: 'Stage',
                    desc: 'Open Reader Mode. Screen stays on, text stays big. Just you and the crowd.',
                },
            ],
        },
        privacy: {
            title: 'Privacy Policy',
            lastUpdated: 'Last updated: March 4, 2026',
            sections: [
                {
                    heading: '1. Introduction',
                    paragraphs: [
                        'Laughtrack ("we", "our", or "us") is a mobile application designed for stand-up comedians to capture ideas, write jokes, organize material into setlists, and perform with confidence. This Privacy Policy explains how we collect, use, and protect your information when you use our app. LaughTrack is operated by RTVCL. The legal basis for processing your personal data is your consent (given at account creation) and the performance of our service contract with you. This policy complies with Indonesia\'s Personal Data Protection Law (UU No. 27 Tahun 2022).',
                    ],
                },
                {
                    heading: '2. Information We Collect',
                    paragraphs: [
                        'Account Information: When you create an account, we collect your name, email address, and password. You may optionally provide a profile image.',
                        'Content Data: The app stores your comedy material locally on your device, including notes, premises, bits (jokes), and setlists. This content includes text, tags, and organizational metadata such as status labels and ordering.',
                        'Sync Data: If you choose to sync your data, your content is transmitted to our servers so it can be backed up and restored across your devices.',
                    ],
                },
                {
                    heading: '3. How We Use Your Information',
                    paragraphs: [
                        'We use your information to provide and improve Laughtrack, including: authenticating your account, enabling data sync and backup, and maintaining app functionality. We do not sell your personal data or comedy material to third parties. We do not use your personal data or comedy content for advertising purposes, and we do not share it with advertising networks.',
                    ],
                },
                {
                    heading: '4. Data Storage & Security',
                    paragraphs: [
                        'Your content is stored locally on your device using an on-device database. When you enable sync, data is encrypted in transit and stored securely on our servers. We implement industry-standard security measures to protect your information.',
                        'We retain your account information and synced content for as long as your account is active. If you request account deletion, all server-side data is permanently removed within 30 days.',
                    ],
                },
                {
                    heading: '5. Your Rights',
                    paragraphs: [
                        'You can access, update, or delete your account information at any time from the Account screen in the app. You can request a full deletion of your data by contacting us. If you delete your account, all associated data on our servers will be permanently removed.',
                    ],
                },
                {
                    heading: '6. Third-Party Services',
                    paragraphs: [
                        'We use Google Sign-In (provided by Google LLC) for authentication. When you sign in with Google, Google may collect your name, email address, and profile photo according to their own privacy policy. Please review Google\'s Privacy Policy at https://policies.google.com/privacy.',
                        'We do not share your comedy content (notes, premises, bits, or setlists) with any third-party service.',
                    ],
                },
                {
                    heading: '7. Children\'s Privacy',
                    paragraphs: [
                        'Laughtrack is not intended for use by children under 13 years of age. We do not knowingly collect personal information from children under 13.',
                    ],
                },
                {
                    heading: '8. Changes to This Policy',
                    paragraphs: [
                        'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.',
                    ],
                },
                {
                    heading: '9. Contact Us',
                    paragraphs: [
                        'If you have any questions about this Privacy Policy, please contact us at support@rtvcl.com.',
                    ],
                },
            ],
        },
        terms: {
            title: 'Terms of Service',
            lastUpdated: 'Last updated: March 4, 2026',
            sections: [
                {
                    heading: '1. Acceptance of Terms',
                    paragraphs: [
                        'By downloading, installing, or using Laughtrack ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.',
                    ],
                },
                {
                    heading: '2. Description of Service',
                    paragraphs: [
                        'Laughtrack is a mobile application designed for stand-up comedians to capture ideas, write and organize jokes (bits), develop premises, build setlists, and perform with confidence. The App stores your content locally on your device and optionally syncs to our servers.',
                    ],
                },
                {
                    heading: '3. User Accounts',
                    paragraphs: [
                        'You may create an account using your email address and password. You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating your account.',
                    ],
                },
                {
                    heading: '4. Your Content',
                    paragraphs: [
                        'You retain full ownership of all content you create in Laughtrack, including notes, premises, bits, and setlists. We do not claim any intellectual property rights over your comedy material. You are solely responsible for the content you create and store in the App.',
                    ],
                },
                {
                    heading: '5. Acceptable Use',
                    paragraphs: [
                        'You agree not to use the App to store or transmit content that violates any applicable law, or to attempt to gain unauthorized access to our systems. You may not reverse-engineer, decompile, or disassemble the App.',
                    ],
                },
                {
                    heading: '6. Data Sync & Storage',
                    paragraphs: [
                        'The optional sync feature backs up your content to our servers. While we implement reasonable security measures, we cannot guarantee absolute security. You are encouraged to maintain your own backups of important material.',
                    ],
                },
                {
                    heading: '7. Termination',
                    paragraphs: [
                        'You may delete your account at any time from the Account screen. We reserve the right to suspend or terminate accounts that violate these terms. Upon termination, your synced data will be permanently deleted from our servers.',
                    ],
                },
                {
                    heading: '8. Disclaimers',
                    paragraphs: [
                        'The App is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service. We are not liable for any loss of content or data due to device failure, sync issues, or other technical problems.',
                    ],
                },
                {
                    heading: '9. Limitation of Liability',
                    paragraphs: [
                        'To the maximum extent permitted by law, Laughtrack and its creators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App.',
                    ],
                },
                {
                    heading: '10. Changes to Terms',
                    paragraphs: [
                        'We may update these Terms of Service from time to time. Continued use of the App after changes constitutes acceptance of the new terms. We will notify users of significant changes through the App or via email.',
                    ],
                },
                {
                    heading: '11. Contact',
                    paragraphs: [
                        'If you have questions about these Terms of Service, please contact us at support@rtvcl.com.',
                    ],
                },
            ],
        },
        contact: {
            title: 'Get in Touch',
            description: 'Have a question, feature request, or just want to say hi? We\'d love to hear from you.',
            channels: [
                {
                    label: 'General Support',
                    description: 'For questions about the app, your account, or anything else.',
                    href: 'mailto:support@rtvcl.com',
                    linkText: 'support@rtvcl.com',
                },
                {
                    label: 'Bug Reports & Feature Requests',
                    description: 'Found a bug or have an idea to make Laughtrack better? Let us know.',
                    href: 'mailto:support@rtvcl.com?subject=Bug%20Report%20%2F%20Feature%20Request',
                    linkText: 'Send a report →',
                },
                {
                    label: 'Press & Partnerships',
                    description: 'For media inquiries, collaborations, or partnership opportunities.',
                    href: 'mailto:support@rtvcl.com?subject=Press%20%2F%20Partnership',
                    linkText: 'Reach out →',
                },
            ],
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
                    desc: 'Ide lucu jam 3 pagi? Ketuk, ketik, beres. Catat dulu sebagai note, nanti kembangkan jadi premis dan bit yang siap panggung.',
                },
                {
                    number: '02',
                    title: 'Premis → Bit Pipeline',
                    desc: 'Ubah ide mentah jadi premis, lalu garap jadi bit siap tampil. Kasih tag, filter, dan pantau status seiring materi lo berkembang.',
                },
                {
                    number: '03',
                    title: 'Susun Set',
                    desc: 'Bangun setlist dari bit-bit lo. Ubah urutan kapan aja, tambahin catatan panggung antar jokes. Naik panggung udah siap tempur.',
                },
                {
                    number: '04',
                    title: 'Mode Baca',
                    desc: 'Buka setlist dalam tampilan bersih tanpa gangguan. Layar tetap nyala, teks tetap gede. Cuma lo dan materi lo.',
                },
                {
                    number: '05',
                    title: 'Belajar & Naik Level',
                    desc: 'Asah kemampuan lo dengan pelajaran tentang teknik komedi, stage presence, membaca audiens, dan analisis performa.',
                },
                {
                    number: '06',
                    title: 'Sinkronisasi Cloud',
                    desc: 'Materi lo tersimpan di perangkat dulu. Login untuk backup dan restore lintas perangkat — jokes lo, selalu aman.',
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
        workflow: {
            label: 'Alur Kerjamu',
            heading: 'Dari ide random sampai standing ovation.',
            desc: 'Laughtrack ngikutin cara kerja komedian beneran — dari ide mentah jadi set matang, selangkah demi selangkah.',
            steps: [
                {
                    icon: '💡',
                    title: 'Note',
                    desc: 'Tangkap percikannya. Satu pikiran, satu frasa, satu observasi aneh — yang penting dicatat dulu.',
                },
                {
                    icon: '🧠',
                    title: 'Premis',
                    desc: 'Bentuk sudut pandangnya. Cari tensinya, "gimana kalau"-nya, perspektif yang bikin lucu.',
                },
                {
                    icon: '🎯',
                    title: 'Bit',
                    desc: 'Tulis jokesnya. Punchline, tag, callback — garap sampai nge-hit.',
                },
                {
                    icon: '📋',
                    title: 'Setlist',
                    desc: 'Susun set lo. Atur urutan bit, tambahin catatan panggung, naik udah siap.',
                },
                {
                    icon: '🎤',
                    title: 'Panggung',
                    desc: 'Buka Mode Baca. Layar tetap nyala, teks tetap gede. Cuma lo dan penonton.',
                },
            ],
        },
        privacy: {
            title: 'Kebijakan Privasi',
            lastUpdated: 'Terakhir diperbarui: 4 Maret 2026',
            sections: [
                {
                    heading: '1. Pendahuluan',
                    paragraphs: [
                        'Laughtrack ("kami") adalah aplikasi mobile yang dirancang untuk komedian stand-up untuk menangkap ide, menulis jokes, menyusun materi ke dalam setlist, dan tampil dengan percaya diri. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda saat menggunakan aplikasi kami. LaughTrack dioperasikan oleh RTVCL. Dasar hukum pemrosesan data pribadi Anda adalah persetujuan Anda (diberikan saat pembuatan akun) dan pelaksanaan kontrak layanan kami dengan Anda. Kebijakan ini mematuhi Undang-Undang Perlindungan Data Pribadi Indonesia (UU No. 27 Tahun 2022).',
                    ],
                },
                {
                    heading: '2. Informasi yang Kami Kumpulkan',
                    paragraphs: [
                        'Informasi Akun: Saat membuat akun, kami mengumpulkan nama, alamat email, dan kata sandi Anda. Anda dapat secara opsional memberikan foto profil.',
                        'Data Konten: Aplikasi menyimpan materi komedi Anda secara lokal di perangkat, termasuk catatan, premis, bit (jokes), dan setlist. Konten ini mencakup teks, tag, dan metadata organisasi seperti label status dan urutan.',
                        'Data Sinkronisasi: Jika Anda memilih untuk menyinkronkan data, konten Anda dikirim ke server kami agar dapat dicadangkan dan dipulihkan di seluruh perangkat Anda.',
                    ],
                },
                {
                    heading: '3. Cara Kami Menggunakan Informasi Anda',
                    paragraphs: [
                        'Kami menggunakan informasi Anda untuk menyediakan dan meningkatkan Laughtrack, termasuk: mengautentikasi akun Anda, mengaktifkan sinkronisasi dan pencadangan data, serta menjaga fungsionalitas aplikasi. Kami tidak menjual data pribadi atau materi komedi Anda kepada pihak ketiga. Kami tidak menggunakan data pribadi atau konten komedi Anda untuk tujuan periklanan, dan kami tidak membagikannya kepada jaringan periklanan.',
                    ],
                },
                {
                    heading: '4. Penyimpanan & Keamanan Data',
                    paragraphs: [
                        'Konten Anda disimpan secara lokal di perangkat menggunakan database on-device. Saat Anda mengaktifkan sinkronisasi, data dienkripsi saat transit dan disimpan dengan aman di server kami. Kami menerapkan langkah-langkah keamanan standar industri untuk melindungi informasi Anda.',
                        'Kami menyimpan informasi akun dan konten yang disinkronkan selama akun Anda aktif. Jika Anda meminta penghapusan akun, semua data di sisi server akan dihapus secara permanen dalam 30 hari.',
                    ],
                },
                {
                    heading: '5. Hak Anda',
                    paragraphs: [
                        'Anda dapat mengakses, memperbarui, atau menghapus informasi akun kapan saja dari layar Akun di aplikasi. Anda dapat meminta penghapusan penuh data Anda dengan menghubungi kami. Jika Anda menghapus akun, semua data terkait di server kami akan dihapus secara permanen.',
                    ],
                },
                {
                    heading: '6. Layanan Pihak Ketiga',
                    paragraphs: [
                        'Kami menggunakan Google Sign-In (disediakan oleh Google LLC) untuk autentikasi. Saat Anda masuk dengan Google, Google dapat mengumpulkan nama, alamat email, dan foto profil Anda sesuai kebijakan privasi mereka sendiri. Silakan tinjau Kebijakan Privasi Google di https://policies.google.com/privacy.',
                        'Kami tidak membagikan konten komedi Anda (catatan, premis, bit, atau setlist) kepada layanan pihak ketiga mana pun.',
                    ],
                },
                {
                    heading: '7. Privasi Anak-Anak',
                    paragraphs: [
                        'Laughtrack tidak ditujukan untuk digunakan oleh anak-anak di bawah 13 tahun. Kami tidak secara sadar mengumpulkan informasi pribadi dari anak-anak di bawah 13 tahun.',
                    ],
                },
                {
                    heading: '8. Perubahan Kebijakan Ini',
                    paragraphs: [
                        'Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan apa pun dengan memposting kebijakan baru di halaman ini dan memperbarui tanggal "Terakhir diperbarui".',
                    ],
                },
                {
                    heading: '9. Hubungi Kami',
                    paragraphs: [
                        'Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di support@rtvcl.com.',
                    ],
                },
            ],
        },
        terms: {
            title: 'Ketentuan Layanan',
            lastUpdated: 'Terakhir diperbarui: 4 Maret 2026',
            sections: [
                {
                    heading: '1. Penerimaan Ketentuan',
                    paragraphs: [
                        'Dengan mengunduh, menginstal, atau menggunakan Laughtrack ("Aplikasi"), Anda setuju untuk terikat oleh Ketentuan Layanan ini. Jika Anda tidak setuju dengan ketentuan ini, mohon jangan gunakan Aplikasi.',
                    ],
                },
                {
                    heading: '2. Deskripsi Layanan',
                    paragraphs: [
                        'Laughtrack adalah aplikasi mobile yang dirancang untuk komedian stand-up untuk menangkap ide, menulis dan menyusun jokes (bit), mengembangkan premis, membuat setlist, dan tampil dengan percaya diri. Aplikasi menyimpan konten Anda secara lokal di perangkat dan secara opsional menyinkronkan ke server kami.',
                    ],
                },
                {
                    heading: '3. Akun Pengguna',
                    paragraphs: [
                        'Anda dapat membuat akun menggunakan alamat email dan kata sandi. Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda. Anda harus memberikan informasi yang akurat saat membuat akun.',
                    ],
                },
                {
                    heading: '4. Konten Anda',
                    paragraphs: [
                        'Anda memiliki kepemilikan penuh atas semua konten yang Anda buat di Laughtrack, termasuk catatan, premis, bit, dan setlist. Kami tidak mengklaim hak kekayaan intelektual apa pun atas materi komedi Anda. Anda bertanggung jawab penuh atas konten yang Anda buat dan simpan di Aplikasi.',
                    ],
                },
                {
                    heading: '5. Penggunaan yang Dapat Diterima',
                    paragraphs: [
                        'Anda setuju untuk tidak menggunakan Aplikasi untuk menyimpan atau mengirimkan konten yang melanggar hukum yang berlaku, atau mencoba mendapatkan akses tidak sah ke sistem kami. Anda tidak boleh merekayasa balik, mendekompilasi, atau membongkar Aplikasi.',
                    ],
                },
                {
                    heading: '6. Sinkronisasi & Penyimpanan Data',
                    paragraphs: [
                        'Fitur sinkronisasi opsional mencadangkan konten Anda ke server kami. Meskipun kami menerapkan langkah-langkah keamanan yang wajar, kami tidak dapat menjamin keamanan absolut. Anda disarankan untuk menyimpan cadangan sendiri untuk materi penting.',
                    ],
                },
                {
                    heading: '7. Penghentian',
                    paragraphs: [
                        'Anda dapat menghapus akun kapan saja dari layar Akun. Kami berhak menangguhkan atau menghentikan akun yang melanggar ketentuan ini. Setelah penghentian, data yang disinkronkan akan dihapus secara permanen dari server kami.',
                    ],
                },
                {
                    heading: '8. Penafian',
                    paragraphs: [
                        'Aplikasi disediakan "apa adanya" tanpa jaminan dalam bentuk apa pun. Kami tidak menjamin layanan tanpa gangguan atau bebas kesalahan. Kami tidak bertanggung jawab atas kehilangan konten atau data karena kegagalan perangkat, masalah sinkronisasi, atau masalah teknis lainnya.',
                    ],
                },
                {
                    heading: '9. Batasan Tanggung Jawab',
                    paragraphs: [
                        'Sejauh diizinkan oleh hukum, Laughtrack dan pembuatnya tidak bertanggung jawab atas kerugian tidak langsung, insidental, khusus, atau konsekuensial yang timbul dari penggunaan Aplikasi.',
                    ],
                },
                {
                    heading: '10. Perubahan Ketentuan',
                    paragraphs: [
                        'Kami dapat memperbarui Ketentuan Layanan ini dari waktu ke waktu. Penggunaan Aplikasi secara berkelanjutan setelah perubahan berarti penerimaan ketentuan baru. Kami akan memberi tahu pengguna tentang perubahan signifikan melalui Aplikasi atau email.',
                    ],
                },
                {
                    heading: '11. Kontak',
                    paragraphs: [
                        'Jika Anda memiliki pertanyaan tentang Ketentuan Layanan ini, silakan hubungi kami di support@rtvcl.com.',
                    ],
                },
            ],
        },
        contact: {
            title: 'Hubungi Kami',
            description: 'Punya pertanyaan, permintaan fitur, atau sekadar ingin menyapa? Kami senang mendengar dari Anda.',
            channels: [
                {
                    label: 'Dukungan Umum',
                    description: 'Untuk pertanyaan tentang aplikasi, akun Anda, atau hal lainnya.',
                    href: 'mailto:support@rtvcl.com',
                    linkText: 'support@rtvcl.com',
                },
                {
                    label: 'Laporan Bug & Permintaan Fitur',
                    description: 'Menemukan bug atau punya ide untuk membuat Laughtrack lebih baik? Beri tahu kami.',
                    href: 'mailto:support@rtvcl.com?subject=Laporan%20Bug%20%2F%20Permintaan%20Fitur',
                    linkText: 'Kirim laporan →',
                },
                {
                    label: 'Pers & Kemitraan',
                    description: 'Untuk pertanyaan media, kolaborasi, atau peluang kemitraan.',
                    href: 'mailto:support@rtvcl.com?subject=Pers%20%2F%20Kemitraan',
                    linkText: 'Hubungi kami →',
                },
            ],
        },
        footer: {
            copyright: `© ${new Date().getFullYear()} Laughtrack. Dibikin buat komedian, sama orang yang ngerti.`,
            privacy: 'Privasi',
            terms: 'Ketentuan',
            contact: 'Kontak',
        },
    },
}
