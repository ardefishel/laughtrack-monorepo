import type { LearnCollection, LearnArticle } from '@/lib/types/learn';

/**
 * Mock data for Learn feature - Collections and Articles
 */

export const learnCollections: LearnCollection[] = [
  {
    id: 'basics',
    title: 'Stand-up Basics',
    description: 'Master the fundamentals of stand-up comedy - from crafting premises to delivering punchlines',
    icon: 'school',
    color: '#10B981',
    articleCount: 3,
    totalReadingTime: 25,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'intermediate',
    title: 'Intermediate Techniques',
    description: 'Level up your comedy with advanced timing, callbacks, and audience interaction',
    icon: 'trending-up',
    color: '#F59E0B',
    articleCount: 2,
    totalReadingTime: 20,
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z',
  },
  {
    id: 'advanced',
    title: 'Advanced Mastery',
    description: 'Push boundaries with experimental styles, character work, and special tight sets',
    icon: 'trophy',
    color: '#8B5CF6',
    articleCount: 2,
    totalReadingTime: 30,
    isPremium: true,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-25T00:00:00Z',
  },
  {
    id: 'examples',
    title: 'Example Material',
    description: 'Study legendary comedians and analyze their techniques through real performances',
    icon: 'play-circle',
    color: '#EF4444',
    articleCount: 2,
    totalReadingTime: 45,
    isPremium: true,
    createdAt: '2025-01-12T00:00:00Z',
    updatedAt: '2025-01-28T00:00:00Z',
  },
];

export const learnArticles: LearnArticle[] = [
  // Basics Collection
  {
    id: 'basics-premise',
    collectionId: 'basics',
    title: 'Crafting Your Premise',
    description: 'Learn how to find and develop strong premises that form the foundation of great jokes',
    difficulty: 'beginner',
    author: 'Sarah Mitchell',
    readingTime: 8,
    isPremium: false,
    sections: [
      {
        id: 'basics-premise-1',
        title: 'What is a Premise?',
        content: `A premise is the foundational idea or observation that your joke is built around. It's the "truth" you're presenting that your audience agrees with, creating a shared reality from which the joke can deviate.

**Key characteristics of a strong premise:**
- Relatable to your audience
- Specific enough to be clear
- Open enough to have multiple angles

The premise sets up the expectation, and your punchline either fulfills or subverts it in a surprising way.`,
        isPremium: false,
        order: 1,
      },
      {
        id: 'basics-premise-2',
        title: 'Finding Your Premises',
        content: `Look for premises in your everyday experiences. The best premises come from genuine observations about life that others have also noticed but haven't articulated.

**Sources for premises:**
- Personal experiences and stories
- Observations about society or culture
- Universal human experiences
- Subverting common expectations

For example, "I hate when my phone dies" is a premise many can relate to. A joke about it might explore the specific anxiety of watching that last 1% drain.`,
        isPremium: false,
        order: 2,
      },
      {
        id: 'basics-premise-3',
        title: 'Exercise: Premise Mining',
        content: `Take 10 minutes to write down 10 premises from your day. Don't try to be funny yet—just capture observations.

**Prompts to get started:**
- What annoyed me today?
- What did I overthink about?
- What social situation felt weird?
- What did I notice about myself?

These raw premises are the seeds that will grow into your material.`,
        isPremium: false,
        order: 3,
      },
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'basics-setup',
    collectionId: 'basics',
    title: 'The Art of Setup',
    description: 'Master the setup that primes your audience for the perfect punchline delivery',
    difficulty: 'beginner',
    author: 'Sarah Mitchell',
    readingTime: 10,
    isPremium: false,
    sections: [
      {
        id: 'basics-setup-1',
        title: 'Setup Fundamentals',
        content: `The setup provides context and primes your audience's expectations. A good setup is like loading a slingshot—you're building potential energy that will be released in your punchline.

**Elements of an effective setup:**
- Establishes the premise clearly
- Creates specific expectations
- Controls the pace and rhythm
- Plants information for later payoff

Your setup should be lean—every word earns its place. Cut anything that doesn't serve the joke's direction.`,
        isPremium: false,
        order: 1,
      },
      {
        id: 'basics-setup-2',
        title: 'Pacing and Rhythm',
        content: `The rhythm of your setup affects how the punchline lands. Short setups create urgency; longer setups build anticipation.

**Rhythm techniques:**
- Use pauses strategically
- Vary your sentence length
- Speed up for urgency, slow down for emphasis
- Let the words breathe where needed

Watch recordings of your sets to see where you're rushing or dragging.`,
        isPremium: false,
        order: 2,
      },
      {
        id: 'basics-setup-3',
        title: 'Common Setup Mistakes',
        content: `**Over-explaining:** Trust your audience. If they need extensive setup, your premise might need work.

**Filler words:** "So anyway," "Have you ever," and similar phrases dilute your setup's power.

**Wrong framing:** Leading the audience toward the wrong expectation makes your punchline fall flat.

**Inconsistent tone:** Your setup's tone should match your comedy's style—conversational for observational, heightened for absurdist.`,
        isPremium: false,
        order: 3,
      },
    ],
    createdAt: '2025-01-03T00:00:00Z',
    updatedAt: '2025-01-16T00:00:00Z',
  },
  {
    id: 'basics-punchline',
    collectionId: 'basics',
    title: 'Delivering the Punchline',
    description: 'The moment everything comes together—learn how to land your jokes consistently',
    difficulty: 'beginner',
    author: 'Sarah Mitchell',
    readingTime: 7,
    isPremium: false,
    sections: [
      {
        id: 'basics-punchline-1',
        title: 'Anatomy of a Punchline',
        content: `A punchline is the unexpected but inevitable conclusion to your setup. It operates on the principle of "set up expectation → deliver surprise."

**Types of punchlines:**
- **Subversion:** The opposite of what was expected
- **Escalation:** Taking the premise further than anticipated
- **Callback:** Referencing something from earlier in the set
- **Tag:** Adding additional punchlines after the main one

The best punchlines feel both surprising and obvious in retrospect.`,
        isPremium: false,
        order: 1,
      },
      {
        id: 'basics-punchline-2',
        title: 'The Rule of Threes',
        content: `The rule of threes is a comedy structure where you establish a pattern with two examples, then break it with a third.

**Structure:**
1. First example (establishes the pattern)
2. Second example (reinforces the pattern)
3. Third example (subverts the pattern)

This structure works because the audience anticipates continuation, making the subversion more impactful.`,
        isPremium: false,
        order: 2,
      },
      {
        id: 'basics-punchline-3',
        title: 'Premium: The Internal Logic',
        content: `Great punchlines often operate within a "secret rule" that your audience creates in their minds. Once they establish this rule, you can play with it.

**Example:**
"I tried online dating. First date, she showed up. Second date, she didn't. Third date, I didn't."

The internal logic: the speaker has bad luck with dates. The third example subverts expectations while maintaining this rule.

*This section is available to premium subscribers.*`,
        isPremium: true,
        order: 3,
      },
    ],
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-17T00:00:00Z',
  },

  // Intermediate Collection
  {
    id: 'intermediate-timing',
    collectionId: 'intermediate',
    title: 'Timing and Space',
    description: 'Advanced techniques for controlling timing and using silence as a comedic tool',
    difficulty: 'intermediate',
    author: 'Marcus Chen',
    readingTime: 12,
    isPremium: false,
    sections: [
      {
        id: 'intermediate-timing-1',
        title: 'The Power of Silence',
        content: `Pauses are as important as words. A well-placed beat before or after a punchline can increase its impact by orders of magnitude.

**Types of pauses:**
- **Anticipation pause:** Before the punchline, building tension
- **Reaction pause:** After the punchline, letting it land
- **Timing pause:** Mid-joke to control the rhythm

Practice your set with different pause placements to find what works best.`,
        isPremium: false,
        order: 1,
      },
      {
        id: 'intermediate-timing-2',
        title: 'The Double Take',
        content: `A double take is the reaction a comic gives after delivering a punchline—often implying "Did I just say that?" or "Can you believe I said that?"

**Techniques:**
- Brief pause with a look of realization
- Small physical reaction (head tilt, shoulder shrug)
- Brief acknowledgment before moving on

The double take acknowledges the audaciousness of your joke without explaining it.`,
        isPremium: false,
        order: 2,
      },
      {
        id: 'intermediate-timing-3',
        title: 'Premium: Organic Transitions',
        content: `Learn how to connect seemingly unrelated jokes through organic transitions that feel effortless.

*Premium content coming soon.*`,
        isPremium: true,
        order: 3,
      },
    ],
    createdAt: '2025-01-07T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z',
  },
  {
    id: 'intermediate-callbacks',
    collectionId: 'intermediate',
    title: 'Callbacks and Running Bits',
    description: 'Connect your material across your set for maximum impact',
    difficulty: 'intermediate',
    author: 'Marcus Chen',
    readingTime: 8,
    isPremium: false,
    sections: [
      {
        id: 'intermediate-callbacks-1',
        title: 'What is a Callback?',
        content: `A callback references an earlier joke in your set, creating cohesion and rewarding attentive audience members.

**Benefits:**
- Makes your set feel like a complete piece
- Creates surprise through unexpected connections
- Builds audience investment in your material

The best callbacks recontextualize earlier material, making both the callback and the original funnier.`,
        isPremium: false,
        order: 1,
      },
      {
        id: 'intermediate-callbacks-2',
        title: 'Types of Callbacks',
        content: `**Direct callback:** Explicitly references the earlier joke ("Remember when I said...")

**Implicit callback:** References the topic or theme without explicit acknowledgment

**Reverse callback:** Your earlier joke becomes the setup for this punchline

**Escalating callback:** Takes the earlier premise to an extreme

Choose your callback type based on how much attention you want to draw to the connection.`,
        isPremium: false,
        order: 2,
      },
    ],
    createdAt: '2025-01-09T00:00:00Z',
    updatedAt: '2025-01-21T00:00:00Z',
  },

  // Advanced Collection
  {
    id: 'advanced-character',
    collectionId: 'advanced',
    title: 'Character Work',
    description: 'Develop and perform distinct comedic characters for unique comedic perspectives',
    difficulty: 'advanced',
    author: 'Diana Ross',
    readingTime: 15,
    isPremium: true,
    sections: [
      {
        id: 'advanced-character-1',
        title: 'Creating Characters',
        content: `Characters give you freedom to say things you couldn't as yourself. A well-developed character has a unique worldview, speech patterns, and perspective.

**Character elements:**
- Distinct voice and vocabulary
- Specific worldview and opinions
- Physical mannerisms
- Consistent history and context

Start with a simple shift—adopt a slightly different perspective or voice—and build from there.`,
        isPremium: true,
        order: 1,
      },
      {
        id: 'advanced-character-2',
        title: 'Premium: Sustained Character Sets',
        content: `Learn how to perform an entire set as a character, building a complete narrative within that character's worldview.

*Premium content coming soon.*`,
        isPremium: true,
        order: 2,
      },
    ],
    createdAt: '2025-01-11T00:00:00Z',
    updatedAt: '2025-01-25T00:00:00Z',
  },
  {
    id: 'advanced-experimental',
    collectionId: 'advanced',
    title: 'Experimental Styles',
    description: 'Push boundaries with unconventional comedy formats and structures',
    difficulty: 'advanced',
    author: 'Diana Ross',
    readingTime: 15,
    isPremium: true,
    sections: [
      {
        id: 'advanced-experimental-1',
        title: 'Beyond Stand-up',
        content: `Experimental comedy breaks traditional stand-up structures to create unique experiences.

**Approaches to explore:**
- Storytelling as the primary vehicle
- Musical comedy elements
- Multimedia integration
- Audience participation as structure

The goal isn't to abandon comedy fundamentals—it's to find new ways to deliver them.`,
        isPremium: true,
        order: 1,
      },
      {
        id: 'advanced-experimental-2',
        title: 'Premium: Tight Sets',
        content: `A tight set is a completely polished, performance-ready piece that functions as a complete work.

*Premium content coming soon.*`,
        isPremium: true,
        order: 2,
      },
    ],
    createdAt: '2025-01-13T00:00:00Z',
    updatedAt: '2025-01-26T00:00:00Z',
  },

  // Examples Collection
  {
    id: 'examples-hasan',
    collectionId: 'examples',
    title: 'Hasan Minhaj: Bit on Pakistan',
    description: 'Analyzing Hasan Minhaj\'s political comedy and storytelling techniques',
    difficulty: 'intermediate',
    author: 'Analysis Team',
    readingTime: 20,
    isPremium: true,
    sections: [
      {
        id: 'examples-hasan-1',
        title: 'Context and Background',
        content: `Hasan Minhaj's special "Homecoming King" explores his experience growing up American with immigrant parents, including his family's relationship with Pakistan.

**Why this bit works:**
- Personal stakes create investment
- Cultural specificity educates while entertaining
- Family dynamics provide relatable tension
- Political observations are grounded in personal experience`,
        isPremium: true,
        order: 1,
      },
      {
        id: 'examples-hasan-2',
        title: 'Premium: Full Analysis',
        content: `This section contains a detailed frame-by-frame analysis of Hasan's setup, delivery, and punchline placement.

*Premium content coming soon.*`,
        isPremium: true,
        order: 2,
      },
    ],
    createdAt: '2025-01-14T00:00:00Z',
    updatedAt: '2025-01-27T00:00:00Z',
  },
  {
    id: 'examples-pandji',
    collectionId: 'examples',
    title: 'Pandji Pragiwaksono: Insane Story',
    description: 'Studying Pandji\'s storytelling mastery and crowd work techniques',
    difficulty: 'intermediate',
    author: 'Analysis Team',
    readingTime: 25,
    isPremium: true,
    sections: [
      {
        id: 'examples-pandji-1',
        title: 'Pandji\'s Comedy Style',
        content: `Pandji Pragiwaksono is one of Indonesia's most respected comedians, known for his intelligent observations and impeccable timing.

**Key techniques to observe:**
- Conversational yet heightened delivery
- Personal stories that reveal universal truths
- Smooth transitions between topics
- Confidence without arrogance

His "insane story" bits showcase his ability to find comedy in unexpected places.`,
        isPremium: true,
        order: 1,
      },
      {
        id: 'examples-pandji-2',
        title: 'Premium: Technique Breakdown',
        content: `This section contains detailed notes on Pandji's delivery, word choice, and audience engagement techniques.

*Premium content coming soon.*`,
        isPremium: true,
        order: 2,
      },
    ],
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-28T00:00:00Z',
  },
];

export function getCollectionById(id: string): LearnCollection | undefined {
  return learnCollections.find((c) => c.id === id);
}

export function getArticlesByCollection(collectionId: string): LearnArticle[] {
  return learnArticles.filter((a) => a.collectionId === collectionId);
}

export function getArticleById(id: string): LearnArticle | undefined {
  return learnArticles.find((a) => a.id === id);
}
