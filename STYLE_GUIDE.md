# Style Guide

Design tokens and aesthetic guidelines for STUFF.MD.

## Design Philosophy

**Brutalist Minimalism**: Bold, geometric, and functional. Sharp edges, hard shadows, and high contrast. No gradients, no rounded corners (except where specified), no decorative elements.

## Color System

### Primary Colors

- **`off-white`** (`#F8F8F8`): Primary background light mode
- **`off-black`** (`#1A1A1A`): Primary background dark mode
- **`accent-black`** (`#000000`): Primary accent, borders, text
- **`brutal-gray`** (`#222222`): Dark mode surfaces, modals
- **`light-gray`** (`#CCCCCC`): Subtle borders, dividers

### Semantic Colors

- **`destructive-red`** (`#FF0000`): Delete actions, errors
- **`accent-yellow`** (`#FFFF00`): Highlights (if needed)

### Usage

- Use `off-white`/`off-black` for main backgrounds
- Use `accent-black` for primary borders and text
- Use `brutal-gray` for dark mode surfaces (modals, cards)
- Use opacity modifiers (`/40`, `/50`, `/60`, `/70`, `/80`) for subtle variations
- Always provide dark mode variants using `dark:` prefix

## Typography

### Font Family

- **Primary**: `IBM Plex Mono` (monospace)
- **System Fallback**: System monospace stack
- **Google Sign-In**: `Roboto` (for Google branding compliance)

### Scale

Use responsive typography with `clamp()`:

```css
/* Headings */
text-[clamp(1.65rem,3.25vw+0.9rem,2.9rem)]  /* Large headings */
text-2xl                                      /* Modal titles */
text-xl                                       /* Section headings */

/* Body */
text-base                                     /* Standard text */
text-sm                                       /* Secondary text */
text-xs                                       /* Labels, small text */
```

### Weight & Style

- **Black** (`font-black`): Headings, emphasis
- **Bold** (`font-bold`): Buttons, labels
- **Normal** (`font-normal`): Body text
- **Uppercase** (`uppercase`): Buttons, labels, headings
- **Tracking**: Use design tokens (`tracking-modal-title`, `tracking-heading`, etc.) instead of arbitrary values

## Spacing

Use Tailwind spacing scale with responsive `clamp()` for fluid layouts:

```css
/* Padding */
px-4 sm:px-5 md:px-6                         /* Horizontal padding */
py-3 sm:py-4 md:py-5                         /* Vertical padding */
p-[clamp(1.15rem,2vw+0.85rem,3.25rem)]       /* Responsive padding */

/* Gaps */
gap-2 sm:gap-3 md:gap-4                      /* Component gaps */
gap-[clamp(1.75rem,3.5vw+1rem,3.75rem)]       /* Section gaps */
```

### Spacing Scale

- `2` = 0.5rem (8px)
- `4` = 1rem (16px)
- `6` = 1.5rem (24px)
- `8` = 2rem (32px)

## Borders

### Width

- **Standard**: `border-2` (2px)
- **Emphasis**: `border-5` (5px) on hover for "extrude" effect
- Always use `border-accent-black` in light mode
- Use `dark:border-off-white/40` or `dark:border-off-white/50` in dark mode

### Radius

- **None** (default): Sharp corners, no border-radius
- **Modals**: `rounded-radius-modal` (1.5rem) or `rounded-radius-modal-large` (1.75rem) for large containers
- **Buttons**: `rounded-radius-button` (0 - sharp corners, brutalist)
- **Code blocks**: `rounded-radius-code` (3px)
- **Toasts**: `rounded-radius-toast` (2px)

## Shadows

### Brutalist Shadows

- **Light Mode**: `shadow-brutalist` = `4px 4px 0px theme(colors.off-black)`
- **Dark Mode**: `shadow-brutalist-dark` = `4px 4px 0px theme(colors.off-white)`
- **Reduced**: `shadow-brutalist-reduced` / `shadow-brutalist-dark-reduced` (2px offset)
- **Hover**: `hover:shadow-brutalist` with `hover:-translate-x-1 hover:-translate-y-1`

### Usage

- Apply to buttons, cards, modals
- Use on hover for interactive elements
- Remove on active state: `active:shadow-none active:translate-x-0 active:translate-y-0`

## Components

### Buttons

**Fill Variant** (Primary):

```tsx
bg-accent-black text-off-white
hover:shadow-brutalist hover:-translate-x-1 hover:-translate-y-1
dark:bg-off-white dark:text-off-black
```

**Default Variant** (Secondary):

```tsx
bg-off-white text-off-black border-2 border-accent-black
hover:border-5
dark:bg-off-black dark:text-off-white dark:border-off-white/80
```

**Common Classes**:

- `uppercase px-6 py-3 text-base font-mono font-normal`
- `transition-all duration-normal` (150ms from tokens)
- `focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4`

### Modals

```tsx
bg-off-white dark:bg-brutal-gray
border-2 border-accent-black dark:border-off-white/50
rounded-radius-modal  /* Desktop only - uses token */
shadow-lg
modal-enter  /* Animation */
z-modal  /* Base modal z-index */
```

### Cards/Notes

```tsx
border-2 border-accent-black dark:border-off-white/20
shadow-brutalist dark:shadow-brutalist-dark
bg-off-white dark:bg-brutal-gray
p-[clamp(0.75rem,2vw,1rem)]
```

### Loading States

- Use `BrutalistSpinner` component
- Use `brutalist-pulse` animation for skeleton loaders
- Respect `prefers-reduced-motion`

## Animations

### Transitions

- **Duration Tokens**:
  - `duration-fast` (100ms) - quick interactions
  - `duration-normal` (150ms) - standard interactions
  - `duration-medium` (200ms) - moderate transitions
  - `duration-slow` (250ms) - slower transitions
  - `duration-layout` (300ms) - layout changes
- **Timing**: `ease-in-out` for smooth, `linear` for harsh (brutalist)
- **Properties**: `transition-all` or specific properties

### Animations

- **Modal Enter**: `modal-enter` (150ms linear, scale + translate) - uses `duration-normal` token
- **Toast**: `toast-enter` / `toast-exit` (200ms ease-out) - uses `duration-medium` token
- **Pulse**: `brutalist-pulse` (1.5s ease-in-out, opacity 1 → 0.3)

### Accessibility

Always respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  animation: none;
}
```

## Responsive Design

### Breakpoints

- **Mobile**: Default (no prefix)
- **Small**: `sm:` (640px+)
- **Medium**: `md:` (768px+)
- **Large**: `lg:` (1024px+)

**JavaScript Usage**: Import breakpoints from `src/constants/breakpoints.ts`:

```typescript
import { BREAKPOINTS } from '../constants/breakpoints';
// BREAKPOINTS.md = 768
```

### Fluid Typography & Spacing

Use `clamp()` for responsive values:

```css
text-[clamp(0.92rem,1.1vw+0.58rem,1.18rem)]
px-[clamp(1.15rem,2vw+0.85rem,3.25rem)]
```

### Mobile-First

- Design mobile-first, enhance for larger screens
- Modals: Full-screen on mobile, centered on desktop
- Navigation: Collapsible sidebar on mobile

## Dark Mode

### Implementation

- Use `dark:` prefix for dark mode styles
- Ensure all components have dark mode variants
- Test contrast ratios (WCAG AA minimum)

### Color Mapping

| Light Mode     | Dark Mode     |
| -------------- | ------------- |
| `off-white`    | `off-black`   |
| `off-black`    | `off-white`   |
| `accent-black` | `off-white`   |
| `brutal-gray`  | `brutal-gray` |

## Focus States

### Accessibility

- Visible focus indicators: `focus-visible:ring-2`
- Ring offset: `focus-visible:ring-offset-4`
- Color: `focus-visible:ring-accent-black` (light) / `focus-visible:ring-off-white` (dark)

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order must be logical
- Focus must be visible and clear

## Design Token System

All design values are centralized in `tailwind.config.js` as design tokens. This ensures consistency and maintainability.

### Token Categories

#### Colors

- Primary: `off-white`, `off-black`, `accent-black`, `brutal-gray`, `light-gray`
- Semantic: `destructive-red`, `success-green`, `info-blue`
- Google Brand: `google-blue`, `google-green`, `google-yellow`, `google-red`, `google-focus-blue`
- Reference: `tailwind.config.js` → `theme.extend.colors`

#### Spacing

- Sidebar: `sidebar-collapsed-mobile` (72px), `sidebar-collapsed` (80px), `sidebar-expanded-mobile` (280px), `sidebar-expanded` (320px)
- Accessibility: `min-touch-target` (44px), `min-button-height` (48px)
- Design: `grid-pattern-size` (28px), `button-min-width` (240px)
- Usage: `w-[theme(spacing.sidebar-collapsed)]`, `min-h-min-touch-target`
- Reference: `tailwind.config.js` → `theme.extend.spacing`

#### Border Radius

- `radius-modal` (1.5rem), `radius-modal-large` (1.75rem), `radius-code` (3px), `radius-toast` (2px), `radius-button` (0)
- Usage: `rounded-radius-modal`
- Reference: `tailwind.config.js` → `theme.extend.borderRadius`

#### Z-Index

- `z-bulk-action` (40), `z-dropdown` (50), `z-toast` (60), `z-modal` (60), `z-modal-overlay` (70), `z-export-button` (100), `z-tooltip` (9999), `z-export-menu` (9999)
- Usage: `z-modal-overlay` for modals that appear above other modals
- Reference: `tailwind.config.js` → `theme.extend.zIndex`

#### Shadows

- `shadow-brutalist`, `shadow-brutalist-dark`, `shadow-brutalist-reduced`, `shadow-brutalist-dark-reduced`
- `shadow-bulk-action`, `shadow-bulk-action-dark`, `shadow-toast`
- Usage: `shadow-brutalist`, `dark:shadow-brutalist-dark`
- Reference: `tailwind.config.js` → `theme.extend.boxShadow`

#### Typography (Letter Spacing)

- `tracking-tight` (0.08em), `tracking-normal` (0.12em), `tracking-wide` (0.18em), `tracking-wider` (0.2em), `tracking-widest` (0.22em)
- `tracking-modal-title` (0.25em), `tracking-heading` (0.35em), `tracking-extreme` (0.24em), `tracking-ultra` (0.26em), `tracking-google` (0.2px)
- Usage: `tracking-modal-title`, `tracking-heading`
- Reference: `tailwind.config.js` → `theme.extend.letterSpacing`

#### Transition Durations

- `duration-fast` (100ms), `duration-normal` (150ms), `duration-medium` (200ms), `duration-slow` (250ms), `duration-layout` (300ms)
- Usage: `transition-all duration-normal`
- Reference: `tailwind.config.js` → `theme.extend.transitionDuration`

### Using Tokens

#### In Tailwind Classes

```tsx
// Spacing tokens
<div className="w-[theme(spacing.sidebar-collapsed)] min-h-min-touch-target">

// Color tokens with opacity
<div className="bg-off-black/5 text-off-white/40">

// Border radius tokens
<div className="rounded-radius-modal">

// Z-index tokens
<div className="z-modal-overlay">

// Shadow tokens
<div className="shadow-brutalist dark:shadow-brutalist-dark">

// Letter spacing tokens
<h1 className="tracking-modal-title">

// Duration tokens
<div className="transition-all duration-normal">
```

#### In CSS Variables

CSS variables in `src/index.css` reference tokens but use hex values (Tailwind's `theme()` doesn't work in CSS files). Comments document the token source:

```css
--tooltip-bg: #000000; /* accent-black from tailwind.config.js */
```

#### In JavaScript

Breakpoints are exported from `tailwind.config.js` and available via `src/constants/breakpoints.ts`:

```typescript
import { BREAKPOINTS } from '../constants/breakpoints';
const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`);
```

### Opacity Modifiers

Use Tailwind's built-in opacity modifiers instead of `rgba()`:

- `bg-off-black/5` instead of `rgba(0, 0, 0, 0.05)`
- `text-off-white/40` instead of `rgba(248, 248, 248, 0.4)`

### Exceptions

Some values remain hardcoded for valid reasons:

- **Google SVG colors**: Hardcoded in `GoogleSignInButton.tsx` SVG for brand compliance
- **Gradient backgrounds**: `rgba()` values in radial gradients (documented with comments)
- **Responsive clamp() values**: Intentionally fluid, not tokenized
- **Component-specific dimensions**: Menu widths, etc. (not part of core design system)

## Best Practices

1. **Consistency**: Use design tokens from `tailwind.config.js`, not arbitrary values
2. **Contrast**: Ensure WCAG AA compliance (4.5:1 for text)
3. **Performance**: Use CSS transitions, not JavaScript animations
4. **Accessibility**: Always provide focus states and ARIA labels
5. **Responsive**: Test on multiple screen sizes
6. **Dark Mode**: Always provide dark mode variants
7. **Token Reference**: When adding new design values, add them to `tailwind.config.js` first

## Examples

### Button

```tsx
<button className='uppercase px-6 py-3 text-base font-mono font-normal border-2 border-accent-black bg-accent-black text-off-white hover:shadow-brutalist hover:-translate-x-1 hover:-translate-y-1 transition-all duration-normal'>
  Save
</button>
```

### Card

```tsx
<div className='border-2 border-accent-black dark:border-off-white/20 shadow-brutalist dark:shadow-brutalist-dark p-4 bg-off-white dark:bg-brutal-gray'>
  Content
</div>
```

### Responsive Text

```tsx
<h1 className='text-[clamp(1.65rem,3.25vw+0.9rem,2.9rem)] font-black uppercase tracking-heading text-accent-black dark:text-off-white'>
  Heading
</h1>
```

### Modal Overlay (ConfirmationModal)

For modals that appear above other modals (e.g., delete confirmation from within EditNoteModal):

```tsx
<div className='fixed inset-0 z-modal-overlay ...'>
  {/* ConfirmationModal content */}
</div>
```
