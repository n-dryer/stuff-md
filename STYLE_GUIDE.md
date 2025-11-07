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
- **Tracking**: Use `tracking-wider` or `tracking-[0.35em]` for uppercase text

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
- **Modals**: `rounded-[1.5rem]` or `rounded-[1.75rem]` for large containers
- **Buttons**: Sharp corners (no radius)

## Shadows

### Brutalist Shadows

- **Light Mode**: `shadow-brutalist` = `4px 4px 0px rgba(0,0,0,1)`
- **Dark Mode**: `shadow-brutalist-dark` = `4px 4px 0px #F8F8F8`
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
- `transition-all duration-150`
- `focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4`

### Modals

```tsx
bg-off-white dark:bg-brutal-gray
border-2 border-accent-black dark:border-off-white/50
rounded-[1.5rem]  /* Desktop only */
shadow-lg
modal-enter  /* Animation */
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

- **Duration**: `150ms` for interactions, `250ms` for layout
- **Timing**: `ease-in-out` for smooth, `linear` for harsh (brutalist)
- **Properties**: `transition-all` or specific properties

### Animations

- **Modal Enter**: `modal-enter` (150ms linear, scale + translate)
- **Toast**: `toast-enter` / `toast-exit` (200ms ease-out)
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

## Best Practices

1. **Consistency**: Use design tokens, not arbitrary values
2. **Contrast**: Ensure WCAG AA compliance (4.5:1 for text)
3. **Performance**: Use CSS transitions, not JavaScript animations
4. **Accessibility**: Always provide focus states and ARIA labels
5. **Responsive**: Test on multiple screen sizes
6. **Dark Mode**: Always provide dark mode variants

## Examples

### Button

```tsx
<button className='uppercase px-6 py-3 text-base font-mono font-normal border-2 border-accent-black bg-accent-black text-off-white hover:shadow-brutalist hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150'>
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
<h1 className='text-[clamp(1.65rem,3.25vw+0.9rem,2.9rem)] font-black uppercase tracking-wider text-accent-black dark:text-off-white'>
  Heading
</h1>
```
