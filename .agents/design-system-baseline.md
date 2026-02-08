# Design System Baseline

> LaughTrack UI Design System Documentation

## Color Tokens

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| `bg-background` | Theme default | Page backgrounds |
| `bg-surface` | Theme default | Card/container backgrounds |
| `bg-primary` | Theme default | Primary actions, buttons |
| `bg-accent` | Theme default | Accent elements |
| `bg-field-background` | Theme default | Input fields |

### Status Colors
| Token | Usage |
|-------|-------|
| `bg-success` | Published content, positive states |
| `bg-warning` | Draft content, pending states |
| `bg-muted` | Archived content, disabled states |

### Text Colors
| Token | Usage |
|-------|-------|
| `text-foreground` | Primary text, titles |
| `text-muted` | Secondary text, descriptions |
| `text-muted-dim` | Tertiary text, timestamps (custom token) |

### Custom Token Definition
```css
@layer theme {
  :root {
    @variant light {
      --muted-dim: hsl(0, 0%, 70%);
    }
    @variant dark {
      --muted-dim: hsl(0, 0%, 40%);
    }
  }
}
```

## Typography Scale

### Headlines & Titles
| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-lg font-semibold` | 18px | 600 | Card titles, section headers |

### Body Text
| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-sm leading-relaxed` | 14px | 400 | Card descriptions, body text |

### Captions & Metadata
| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-xs` | 12px | 400 | Timestamps, status labels |
| `text-xs text-muted/70 font-medium lowercase` | 12px | 500 | Status indicators |

### Typography Classes Reference
- `font-medium` - Medium weight (500)
- `font-semibold` - Semibold weight (600)
- `leading-snug` - Tight line height
- `leading-relaxed` - Relaxed line height (1.625)
- `lowercase` - Transform text to lowercase

## Spacing System

### Card Spacing
| Class | Value | Usage |
|-------|-------|-------|
| `p-3` | 12px | Minimal card padding |
| `p-4` | 16px | Standard padding (legacy) |
| `mb-3` | 12px | Card margin bottom |
| `mx-4` | 16px | Card horizontal margin |

### List Spacing
| Class | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Status dot + label gap |
| `gap-2` | 8px | Standard gap |
| `contentContainerStyle={{ paddingVertical: 12 }}` | 12px | List vertical padding |

### Input Spacing
| Class | Value | Usage |
|-------|-------|-------|
| `min-h-[44px]` | 44px | Minimum touch target |
| `py-2.5` | 10px | Input vertical padding |

## Component Variants

### Card
```tsx
// Minimal flat card
<Card className="p-3 bg-surface">
  {/* Content */}
</Card>
```

**Preferred**: `variant="flat"` (default when no border classes) for minimalist look.

### Status Indicator
```tsx
// Minimal dot + text
<MinimalStatusIndicator status="published" showLabel />
// Or just dot
<MinimalStatusIndicator status="draft" />
```

**Reference**: `components/ui/MinimalStatusIndicator.tsx`

### TextField (Input)
```tsx
<TextField className="flex-1">
  <TextField.Input
    placeholder="Add a new joke..."
    className="text-foreground min-h-[44px] py-2.5 pl-8"
    multiline
  />
</TextField>
```

### Icons
| Size | Usage |
|------|-------|
| `size={16}` | Toggle icons, quick capture |
| `size={20}` | Search icons |
| `size={48}` | Empty state icons |

## Accessibility Guidelines

### Touch Targets
- Minimum: 44x44px (iOS) / 48x48dp (Android)
- All interactive elements meet this minimum

### Contrast
- `text-foreground` on `bg-surface` - AA compliant
- `text-muted` on `bg-surface` - AA compliant
- Status dots use semantic colors (success/warning) for clear differentiation

### Status Indicators
- Dots always include text labels (never dot-only)
- Status uses `lowercase` for consistent visual weight

## Icon Patterns

### Icon Size Standards
| Context | Size | Example |
|---------|------|---------|
| Quick capture toggle | 16px | Flash icon |
| Search toggle | 20px | Search icon |
| Empty state | 48px | Chatbubble icon |
| Action buttons | 18px | Send, refresh |

### Icon Color States
| State | Color | Example |
|-------|-------|---------|
| Active/warning | `text-warning/80` | Quick capture ON |
| Inactive/muted | `text-muted/40` | Quick capture OFF |
| Primary action | `text-accent` | Send button |
| Disabled | `text-muted/60` | Disabled button |

## File Reference

| Component | Path |
|-----------|------|
| JokeCard | `components/JokeCard.tsx` |
| MinimalStatusIndicator | `components/ui/MinimalStatusIndicator.tsx` |
| JokesScreen | `app/(tabs)/index.tsx` |
| Global styles | `global.css` |
