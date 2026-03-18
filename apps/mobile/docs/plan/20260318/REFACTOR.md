# Mobile Refactoring Opportunities

Audit of `apps/mobile/src/` identifying code quality improvements. The **note feature** (`features/note/`) is the cleanest reference pattern — its separation of `useNoteList` (shared hook) + `note-actions.ts` (service layer) is the target architecture.

---

## 🔴 HIGH Impact

### 1. Barrel Exports Defeat Tree-Shaking

**Files:** `features/*/index.ts` (all 6 feature barrels)

All feature barrels use `export *`, which defeats Metro tree-shaking and bloats the bundle. For example, `features/bit/index.ts` re-exports the entire HTML editor engine — any consumer importing just `BitCard` pulls in the editor, heading-recovery heuristics, and all HTML utilities.

**Fix:** Replace `export *` with named exports, or remove barrels entirely and import directly from source files.

---

### 2. `useSetlistForm` — 378-Line Monolith

**File:** `features/setlist/hooks/use-setlist-form.ts`

The largest hook in the codebase. `handleSave` alone is 100+ lines mixing UI state management with raw DB write logic (nested loops for bit-setlist relation syncing). Pure helper functions (`toPersistedSetlistItems`, `extractBitIds`, `uniqueSortedIds`) are defined as standalone functions at file scope — already independently importable, but tightly coupled to the hook file.

**Fix:**
- Extract a `saveSetlist(database, { description, tags, items, existingSetlist? })` service function (following the `note-actions.ts` pattern).
- Move the file-scope helpers to `database/utils/` or `features/setlist/utils/` so they can be tested and reused without importing the hook file.
- Extract a `fetchBitsByIds(database, ids)` utility — the try/catch-per-bit pattern is duplicated in `hydrateItemsWithBits` and the `addedBits` effect.

---

### 3. Filter Modal Duplication

**Files:** `app/(app)/(modal)/bit-filter.tsx`, `premise-filter.tsx`, `setlist-filter.tsx`

Three filter modals each independently reimplement:
- `toggleStatus` / `toggleTag` / `toggleAttitude` with identical `Set` add/delete pattern
- `availableTags` fetched by observing all records and extracting tags
- `clearAll` and `applyFilters` with the same `router.back()` → `requestAnimationFrame` → `setParams` lifecycle

**Fix:**
- Extract a `useSetToggle<T>(initial)` hook for the repeated Set toggle pattern.
- Extract a `useAvailableTags(table, parseTagsFn)` hook to DRY tag observation.
- Create a shared `useFilterModal({ onApply })` hook for the apply/clear lifecycle.

---

### 4. `useObservedBits` Bypasses Shared Hook

**File:** `features/bit/hooks/use-observed-bits.ts`

Manually reimplements the subscribe → map → setState pattern that `database/hooks/use-observed-updated-list.ts` already provides generically. The note feature already uses the shared hook correctly via `useNoteList`.

**Fix:** Replace with:
```ts
export function useObservedBits() {
    const { items } = useObservedUpdatedList<BitModel, Bit>({
        table: BIT_TABLE,
        mapModel: bitModelToDomain,
    })
    return items
}
```

---

### 5. FlashList Missing `estimatedItemSize`

**File:** `features/material/components/material-list-screen.tsx`

The `FlashList` in `MaterialListScreen` omits the required `estimatedItemSize` prop. This causes console warnings and suboptimal cell recycling performance.

**Fix:** Add `estimatedItemSize={120}` (or measured value) to the FlashList.

---

## 🟡 MEDIUM Impact

### 6. Form Hooks — Multi-useState Sprawl

**Files:** `features/bit/hooks/use-bit-form.ts` (9 states), `features/premise/hooks/use-premise-form.ts` (7 states), `features/setlist/hooks/use-setlist-form.ts` (8+ states)

All three form hooks manage many individual `useState` calls and reset them one-by-one on the non-editing path (e.g., `setBitModel(null); setContent(''); setStatus('draft'); setTags([]); ...`).

**Fix:** Consolidate into `useReducer` with a single `RESET` action and a `LOAD` action that sets all fields from the domain model at once.

---

### 7. Detail Screen Header Boilerplate

**Files:** `app/(app)/(detail)/bit/[id].tsx`, `note/[id].tsx`, `premise/[id].tsx`, `setlist/[id].tsx`

All 4 detail screens repeat the same `useLayoutEffect` + `navigation.setOptions` pattern for setting `headerTitle` and a `headerRight` Save/Create button with identical styling.

**Fix:** Extract a `useDetailHeader({ title, onSave, canSave, isEditing })` hook or a shared `DetailHeaderRight` component.

---

### 8. Card Components — Shared Layout

**Files:** `features/bit/components/bit-card.tsx`, `features/premise/components/premise-card.tsx`, `features/setlist/components/setlist-card.tsx`

All three cards share an identical outer structure: `SwipeableRow` → `PressableFeedback` → `Card` → left color bar (`View w-1 rounded-full`) + content column. The delete action config is also identical.

**Fix:** Extract a `MaterialCard` shell component:
```tsx
<MaterialCard accentColor="bg-blue-500" onPress={onPress} onDelete={onDelete}>
    {/* card-specific content */}
</MaterialCard>
```

---

### 9. Unsafe Route Param Casts

**File:** `features/premise/hooks/use-premise-form.ts`

Route params are cast without validation:
```ts
setStatus(selectedStatus as PremiseStatus)    // line 160
setAttitude(selectedAttitude as Attitude)      // line 168
```

**Fix:** Use a Zod `safeParse` or a type guard (like `isBitStatus` already exists in `use-bit-form.ts`).

---

### 10. Startup Reconciliation Blocks JS Thread

**File:** `app/_layout.tsx` (lines 24–30)

Two DB reconciliation passes (`reconcilePremiseBitLinks`, `reconcileSetlistBitLinks`) run eagerly on every cold start. While they're async, they compete for the JS thread during the critical startup window.

**Fix:** Defer with `InteractionManager.runAfterInteractions` to let the initial render complete first.

---

## 🟢 LOW Impact

### 11. Inconsistent Tag Parsing

**Files:** `database/mappers/setlistMapper.ts` vs `database/utils/json.ts`

`setlistMapper` has its own `parseSetlistTagNamesJson` that handles both `string[]` and `{name: string}[]` formats. Bit/premise mappers use the shared `parseStringArrayJson` which only handles `string[]`.

**Fix:** Upgrade `parseStringArrayJson` to handle both formats, or document why setlist needs special handling.

---

### 12. File Naming Inconsistency

**Files:** `database/sync/reconcilePremiseBitLinks.ts`, `reconcileSetlistBitLinks.ts`

These use camelCase filenames while the project convention is kebab-case (`bit-card.tsx`, `use-bit-form.ts`, `note-actions.ts`).

**Fix:** Rename to `reconcile-premise-bit-links.ts` and `reconcile-setlist-bit-links.ts`.

---

### 13. Duplicate Date Validation

**Files:** `features/home/hooks/use-recent-works.ts` (`isValidDate`), `database/mappers/setlistMapper.ts` (`toValidDate`)

Two independent date-validation helpers with overlapping logic.

**Fix:** Extract to `database/utils/dates.ts` and reuse.

---

### 14. `types.ts` Barrel Re-exports Runtime Schemas

**File:** `src/types.ts`

Re-exports both Zod runtime schemas (`BitSchema`, `SetlistSchema`, etc.) and TypeScript types. Consumers importing only types still pull in Zod runtime code.

**Fix:** Split into `types.ts` (type-only exports) and `schemas.ts` (runtime Zod exports), or ensure consumers use `import type`.

---

### 15. Modal Screen Config Repetition

**File:** `app/(app)/_layout.tsx`

8 modal `Stack.Screen` entries repeat `presentation: 'formSheet', headerShown: false, contentStyle: { backgroundColor: field }`, differing only in `sheetAllowedDetents`.

**Fix:** Extract a helper:
```ts
const formSheet = (detent: number) => ({
    presentation: 'formSheet' as const,
    sheetAllowedDetents: [detent],
    headerShown: false,
    contentStyle: { backgroundColor: field },
})
```
