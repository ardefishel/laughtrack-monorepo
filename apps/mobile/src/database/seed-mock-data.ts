import type { Database } from '@nozbe/watermelondb'
import { dbLogger } from '@/lib/loggers'
import type { Attitude, PremiseStatus } from '@/types'
import type { BitStatus } from '@/domain/bit'
import { Note } from '@/features/note/data/note.model'
import { Premise } from '@/features/premise/data/premise.model'
import { Bit } from '@/features/bit/data/bit.model'
import { Setlist } from '@/features/setlist/data/setlist.model'
import { NOTE_TABLE, PREMISE_TABLE, BIT_TABLE, SETLIST_TABLE } from './constants'

const tags = (...names: string[]) => JSON.stringify(names)

const MOCK_NOTES = [
    { content: 'Guy at coffee shop ordered a "medium large" — what does that even mean? Is that just a large you feel guilty about?' },
    { content: 'My dog stares at me while I work from home like I\'m the worst TV show he\'s ever seen.' },
    { content: 'Tried to parallel park today. Three attempts. An old lady on the sidewalk started giving me hand signals. We\'re best friends now.' },
    { content: 'Why do we say "I slept like a baby" as a good thing? Babies wake up screaming every 2 hours.' },
    { content: 'The WiFi went out for 5 minutes. Had to talk to my family. They seem like nice people.' },
    { content: 'Autocorrect changed "on my way" to "on my waffle." Nobody questioned it.' },
    { content: 'Every grocery store trip starts with a list and ends with me buying 3 types of cheese I didn\'t need.' },
]

type MockPremise = {
    content: string
    status: PremiseStatus
    attitude: Attitude | null
    tags: string
    bitIndices: number[]
}

const MOCK_PREMISES: MockPremise[] = [
    {
        content: 'Modern technology has made us less patient, not more connected',
        status: 'ready',
        attitude: 'confused',
        tags: tags('Technology', 'Observations'),
        bitIndices: [0, 4],
    },
    {
        content: 'Dogs understand work-from-home culture better than most managers',
        status: 'ready',
        attitude: 'proud',
        tags: tags('Animals', 'Work'),
        bitIndices: [1],
    },
    {
        content: 'Parallel parking is a trust exercise between you and every pedestrian',
        status: 'draft',
        attitude: 'embarrassed',
        tags: tags('Driving', 'City Life'),
        bitIndices: [2],
    },
    {
        content: 'We use baby metaphors for things that are actually terrible',
        status: 'draft',
        attitude: 'angry',
        tags: tags('Language'),
        bitIndices: [3],
    },
    {
        content: 'The grocery store is where discipline goes to die',
        status: 'rework',
        attitude: 'disgusted',
        tags: tags('Food', 'Self-Control'),
        bitIndices: [5],
    },
]

type MockBit = {
    content: string
    status: BitStatus
    tags: string
}

const MOCK_BITS: MockBit[] = [
    {
        content: '<html>\n<p><b>The WiFi Apocalypse</b></p>\n<p>So the WiFi goes out for <b>five minutes</b>, right? Five minutes. And suddenly I\'m sitting at the dinner table making eye contact with my family like a <i>Victorian ghost</i>.</p>\n<blockquote><p>My wife goes, "How was your day?"</p><p>And I\'m like, "I don\'t know, I usually just text you that from the other room."</p></blockquote>\n<p>We sat there in silence for a bit. I could hear the <b>clock ticking</b>. I didn\'t even know we had a clock.</p>\n</html>',
        status: 'final',
        tags: tags('Technology', 'Family', 'Crowd Favorite'),
    },
    {
        content: '<html>\n<p><b>My Dog, the Life Coach</b></p>\n<p>My dog watches me work from home and I swear he thinks I have the <b>worst job</b> in the world.</p>\n<p>He\'s lying on the couch, I\'m on my <i>third</i> Zoom call, and he gives me this look like... <b>"bro, just bark at them and hang up, that\'s what I do."</b></p>\n<p>And honestly? His approach has a better success rate than most of my meetings.</p>\n</html>',
        status: 'tested',
        tags: tags('Animals', 'Work', 'Relatable'),
    },
    {
        content: '<html>\n<p><b>The Parking Saga</b></p>\n<p>I tried parallel parking downtown. Three-point turn became a <b>thirteen-point turn</b>.</p>\n<p>My parking strategy has three phases:</p>\n<ol><li>Pull up with confidence I absolutely do not have.</li><li>Reverse like I understand geometry.</li><li>Accept help from a stranger who has now become my coach.</li></ol>\n<p>An old lady on the sidewalk started directing me like she\'s <i>landing a 747</i>. Hand signals and everything.</p>\n<p>By the end she\'s applauding. The people at the café are watching. I take a bow through the windshield.</p>\n<p>We\'re getting <b>brunch next Saturday</b>. She texts me motivational quotes now.</p>\n</html>',
        status: 'tested',
        tags: tags('Driving', 'City Life', 'Storytelling'),
    },
    {
        content: '<html>\n<p><b>Sleeping Like a Baby</b></p>\n<p>People say <i>"I slept like a baby"</i> like that\'s a flex.</p>\n<p>Really? You <b>woke up screaming</b> at 2 AM, couldn\'t form words, and someone had to rock you back to sleep?</p>\n<p>That\'s not restful. That\'s a <b>Tuesday</b> for me.</p>\n</html>',
        status: 'draft',
        tags: tags('Language', 'Observations'),
    },
    {
        content: '<html>\n<p><b>Autocorrect Runs My Life</b></p>\n<p>Autocorrect has <b>too much power</b>. I texted my boss "on my way" and it sent <i>"on my waffle."</i></p>\n<p>He just replied <b>"nice, what kind?"</b></p>\n<p>Didn\'t even question it. That\'s how little faith people have in my communication skills.</p>\n<p>Now every Monday he asks me about waffles. I have to <u>keep the lie going</u>. I\'ve become the <s>on my way</s> waffle guy. I don\'t even like waffles.</p>\n</html>',
        status: 'final',
        tags: tags('Technology', 'Work'),
    },
    {
        content: '<html>\n<p><b>The Grocery Store Heist</b></p>\n<p>Every time I go to the grocery store I bring a <u>responsible, adult list</u>. Eggs, milk, bread.</p>\n<p>I come home with:</p>\n<ul><li>Four artisanal cheeses</li><li>A pineapple</li><li>Something called <i>"truffle honey"</i></li><li>A candle that smells like "weekend"</li></ul>\n<p>The list is still in my pocket. <b>Untouched.</b> Like a ransom note I ignored.</p>\n</html>',
        status: 'rework',
        tags: tags('Food', 'Self-Control'),
    },
    {
        content: '<html>\n<p><b>Medium Large</b></p>\n<p>You ever order a coffee and the barista goes <i>"what size?"</i> and your brain just <b>panics</b>?</p>\n<p>I said "medium large." <b>MEDIUM LARGE.</b></p>\n<p>That\'s not a size. That\'s what happens when your mouth starts a word your brain didn\'t approve. The barista just stared at me like I\'d invented a new language.</p>\n<p>She gave me a large. We both knew what happened. <i>Neither of us spoke of it again.</i></p>\n</html>',
        status: 'draft',
        tags: tags('Food', 'Language', 'Awkward Moments'),
    },
]

export async function seedMockData(db: Database): Promise<void> {
    dbLogger.info('Seeding mock data: clearing existing data...')

    await db.write(async () => {
        await db.get<Note>(NOTE_TABLE).query().destroyAllPermanently()
        await db.get<Premise>(PREMISE_TABLE).query().destroyAllPermanently()
        await db.get<Bit>(BIT_TABLE).query().destroyAllPermanently()
        await db.get<Setlist>(SETLIST_TABLE).query().destroyAllPermanently()
    })

    dbLogger.info('Existing data cleared. Inserting mock data...')

    await db.write(async () => {
        for (const noteData of MOCK_NOTES) {
            await db.get<Note>(NOTE_TABLE).create((note) => {
                note.content = noteData.content
            })
        }

        const createdBits: { id: string }[] = []
        for (const bitData of MOCK_BITS) {
            const bit = await db.get<Bit>(BIT_TABLE).create((bit) => {
                bit.content = bitData.content
                bit.status = bitData.status
                bit.tagsJson = bitData.tags
                bit.premiseId = null
                bit.setlistIdsJson = JSON.stringify([])
            })
            createdBits.push({ id: bit.id })
        }

        for (const premiseData of MOCK_PREMISES) {
            const linkedBitIds = premiseData.bitIndices.map((i) => createdBits[i].id)

            const premise = await db.get<Premise>(PREMISE_TABLE).create((premise) => {
                premise.content = premiseData.content
                premise.status = premiseData.status
                premise.attitude = premiseData.attitude
                premise.tagsJson = premiseData.tags
                premise.bitIdsJson = JSON.stringify(linkedBitIds)
                premise.sourceNoteId = null
            })

            for (const bitIndex of premiseData.bitIndices) {
                const bitModel = await db.get<Bit>(BIT_TABLE).find(createdBits[bitIndex].id)
                await bitModel.update((b) => {
                    b.premiseId = premise.id
                })
            }
        }

        const allBitIds = createdBits.map((b) => b.id)

        const setlistNoteItem = {
            id: 'sli-note-1',
            type: 'set-note' as const,
            setlistNote: {
                id: 'sn-1',
                content: '— Pause for crowd work here —',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        }

        await db.get<Setlist>(SETLIST_TABLE).create((setlist) => {
            setlist.description = 'Open Mic Night — 10 min set'
            setlist.itemsJson = JSON.stringify([
                { id: `sli-${allBitIds[0]}`, type: 'bit', bitId: allBitIds[0] },
                { id: `sli-${allBitIds[1]}`, type: 'bit', bitId: allBitIds[1] },
                setlistNoteItem,
                { id: `sli-${allBitIds[2]}`, type: 'bit', bitId: allBitIds[2] },
                { id: `sli-${allBitIds[3]}`, type: 'bit', bitId: allBitIds[3] },
            ])
            setlist.tagsJson = tags('Open Mic', 'Short Set')
        })

        await db.get<Setlist>(SETLIST_TABLE).create((setlist) => {
            setlist.description = 'Weekend Showcase — Best Of'
            setlist.itemsJson = JSON.stringify(
                allBitIds.slice(0, 6).map((bitId) => ({
                    id: `sli-showcase-${bitId}`,
                    type: 'bit' as const,
                    bitId,
                }))
            )
            setlist.tagsJson = tags('Showcase', 'Best Of')
        })
    })

    dbLogger.info('Mock data seeded successfully')
}
