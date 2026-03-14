# LaughTrack Mobile Roadmap

This document captures the current ranked roadmap for the mobile app so the team can keep product and engineering priorities in one place.

It is intentionally lightweight. The goal is to track the highest-value improvements, not to replace detailed implementation plans or feature docs.

## Purpose

- Keep the current mobile priorities visible.
- Preserve the reasoning behind the ranking.
- Provide a simple reference point before turning work into tickets or implementation plans.

## Prioritization Rules

Items are ranked primarily by impact, then by effort.

- Higher rank means the work is currently more valuable to the app.
- Product clarity, user trust, and engineering stability take priority over adding more surface area.
- This roadmap should be reviewed whenever priorities shift or a major item is completed.

## Ranked Roadmap

### 1. Stabilize the mobile app with testing

Why this ranks first:

- The mobile app already contains meaningful local DB, sync, auth, and form logic.
- There are currently no mobile test files and no working mobile test runner configured.
- Every future change becomes safer once the critical flows have test coverage.

Recommended focus:

- Add a real mobile test setup.
- Start with sync, WatermelonDB-backed flows, and form hooks.
- Cover the highest-risk flows before expanding feature scope.

Relevant code paths:

- `apps/mobile/src/lib/sync.ts`
- `apps/mobile/src/features/auth/context/auth-context.tsx`
- `apps/mobile/src/features/note/hooks/`
- `apps/mobile/src/features/bit/hooks/`
- `apps/mobile/src/features/premise/hooks/`
- `apps/mobile/src/features/setlist/hooks/`

### 2. Fix empty and first-run states across the app

Why this ranks second:

- The app has strong core flows, but some screens likely feel blank instead of guided.
- Better empty states are a relatively low-effort way to make the app feel more complete.
- First-run guidance improves onboarding without requiring major new features.

Recommended focus:

- Add better empty states for recent works and material lists.
- Add clearer first-action guidance and CTA language.
- Make blank screens feel intentional rather than unfinished.

Relevant code paths:

- `apps/mobile/src/app/(app)/(tabs)/home/index.tsx`
- `apps/mobile/src/features/material/components/material-list-screen.tsx`

### 3. Decide the future of the Learn tab

Why this ranks third:

- The Learn tab is currently a polished placeholder in primary navigation.
- That creates product ambiguity: it looks important, but does not yet deliver user value.
- A clear decision here will improve focus and overall product coherence.

Recommended focus:

- Either turn the Learn tab into a real lightweight feature.
- Or de-emphasize/remove it from primary navigation until it is ready.
- Avoid keeping a long-lived placeholder in a top-level tab.

Relevant code path:

- `apps/mobile/src/app/(app)/(tabs)/learn/index.tsx`

### 4. Consolidate repeated UI and list patterns

Why this ranks fourth:

- The app is starting to show repeated patterns in list hooks and screen shells.
- That repetition increases maintenance cost and raises the chance of inconsistent behavior.
- Cleaning this up now will make future features easier to ship.

Recommended focus:

- Consolidate repeated entity list hooks where practical.
- Reuse shared list-shell and card patterns more aggressively.
- Standardize repeated screen behavior before more entities or tabs are added.

Relevant code paths:

- `apps/mobile/src/features/note/hooks/use-note-list.ts`
- `apps/mobile/src/features/bit/hooks/use-bit-list.ts`
- `apps/mobile/src/features/premise/hooks/use-premise-list.ts`
- `apps/mobile/src/features/setlist/hooks/use-setlist-list.ts`
- `apps/mobile/src/features/material/components/material-list-screen.tsx`

### 5. Improve trust signals around sync and auth

Why this ranks fifth:

- Sync and auth appear functional, but feedback is still fairly minimal.
- Better inline feedback would make the app feel more reliable and polished.
- This is especially important for user trust around account state and data safety.

Recommended focus:

- Improve auth validation and error presentation.
- Make sync state easier to understand.
- Add clearer user-facing feedback around success, failure, and status.

Relevant code paths:

- `apps/mobile/src/app/(app)/(auth)/sign-in.tsx`
- `apps/mobile/src/app/(app)/(auth)/sign-up.tsx`
- `apps/mobile/src/app/(app)/(tabs)/account/index.tsx`
- `apps/mobile/src/lib/sync.ts`

## Notes

- This roadmap is intentionally high-level.
- Detailed implementation plans should live in feature docs or separate planning documents when work begins.
- The order here reflects current judgment, not a permanent commitment.

## Next Review

- Review this roadmap after any major mobile feature ships or when one of the top-ranked items is completed.
