# Beta Banner System

## Overview

The `BetaBanner` component is a reusable, dismissible announcement banner that appears at the top of the app. It's configured via a centralized config file for easy management.

## Quick Toggle

To **enable/disable** the beta banner, edit [src/lib/banner-config.ts](../src/lib/banner-config.ts):

```typescript
export const BANNER_CONFIG: Record<string, BannerConfig> = {
  beta: {
    enabled: true, // ← Change this to false to hide the banner
    type: "beta",
    dismissible: true,
    storageDismissKey: "promptmint_beta_banner_dismissed",
  },
};
```

## How It Works

1. **User dismisses banner** → stored in `localStorage` with key `promptmint_beta_banner_dismissed`
2. **Next visit** → banner stays hidden (unless localStorage is cleared)
3. **To show again** → change `enabled: false` then back to `true`, or users can clear localStorage

## Features

✅ **Sticky at top** - Always visible while scrolling  
✅ **Dismissible** - User can close it (with X button)  
✅ **Persistent** - Remembers user's preference  
✅ **Animated** - Smooth fade-in/out  
✅ **Responsive** - Works on mobile & desktop  
✅ **Styled** - Gradient background, matches app design

## Customization

### Change Banner Text

Edit [src/components/BetaBanner.tsx](../src/components/BetaBanner.tsx) starting at line ~70:

```tsx
<p className="text-sm font-bold text-foreground">
  Your custom announcement here
</p>
```

### Change Banner Color

Modify Tailwind classes in BetaBanner.tsx:

- `from-amber-500/10` - gradient start color
- `to-violet-500/10` - gradient end color
- `border-amber-500/20` - border color

Current colors: **Amber → Cyan → Violet**

### Make Non-Dismissible

Change in layout.tsx:

```tsx
<BetaBanner enabled={true} dismissible={false} />
```

## Future Use Cases

The config system supports multiple banners for different campaigns:

```typescript
export const BANNER_CONFIG: Record<string, BannerConfig> = {
  beta: {
    /* current beta banner */
  },

  promo: {
    enabled: false, // Disabled for now
    type: "promo",
    dismissible: true,
    storageDismissKey: "promptmint_promo_banner_dismissed",
  },

  alert: {
    enabled: false, // System alert template
    type: "alert",
    dismissible: false, // Can't dismiss critical alerts
    storageDismissKey: "promptmint_alert_banner_dismissed",
  },
};
```

To add a new banner:

1. Add entry to `BANNER_CONFIG`
2. Create new component (e.g., `PromoBanner.tsx`)
3. Import and add to layout

## Reset User Banners

If you want users to see a banner again:

**Option 1:** Change `enabled: true` in config (shows to all users)  
**Option 2:** Change `storageDismissKey` (users see it as a new banner)  
**Option 3:** Users manually clear localStorage key

## Implementation Details

- **Component:** [src/components/BetaBanner.tsx](../src/components/BetaBanner.tsx)
- **Config:** [src/lib/banner-config.ts](../src/lib/banner-config.ts)
- **Layout:** [src/app/layout.tsx](../src/app/layout.tsx) (line ~56)
- **Dependencies:** Framer Motion, Lucide Icons, shadcn/ui Button

## Removal (Post-Beta)

When beta ends (March 12th), simply:

1. Change `enabled: false` in `src/lib/banner-config.ts`
2. Or remove the BetaBanner import/line from `src/app/layout.tsx`

No rebuild required if using config toggle!
