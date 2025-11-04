# Style Guide

Design system and coding conventions for STUFF.MD.

## Design Principles

- **Function Over Form**: Every element serves a purpose
- **Sharp Edges**: No border radius (except code blocks)
- **High Contrast**: Bold borders and clear typography
- **Immediate Feedback**: Interactive elements respond instantly
- **Accessibility First**: Keyboard-navigable and screen-reader friendly

## Design Tokens

### Colors

| Color             | Hex       | Usage                |
| ----------------- | --------- | -------------------- |
| `off-white`       | `#F8F8F8` | Light background     |
| `off-black`       | `#1A1A1A` | Text (light mode)    |
| `light-gray`      | `#CCCCCC` | Secondary text       |
| `accent-black`    | `#000000` | Borders, buttons     |
| `destructive-red` | `#FF0000` | Error states         |
| `brutal-gray`     | `#222222` | Dark mode background |

### Typography

- **Font**: IBM Plex Mono (monospace)
- **Weights**: 400 (normal), 700 (bold), 900 (black)
- **Sizes**: Tailwind scale (`text-xs` through `text-7xl`)
- **Uppercase**: Buttons, labels, headers, note titles

### Spacing

- Use Tailwind spacing scale (`p-1` through `p-8+`)
- Responsive: `p-2 sm:p-3 md:p-4` (compact) or `p-4 sm:p-6 md:p-8` (standard)
- Gaps: `gap-2 sm:gap-3 md:gap-4` for flex/grid layouts

### Borders & Shadows

- **Border**: `2px solid` (`border-2`)
- **Hover**: `5px` (`border-5`)
- **Colors**: Light mode `border-accent-black`, dark mode `border-off-white/20` or `/50`
- **Shadows**: Only on button hover (`shadow-brutalist`, `shadow-brutalist-dark`)
- **Radius**: None (except code blocks: 2-3px)

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Components

### Buttons

**Base**: `uppercase px-6 py-3 text-base font-mono font-normal border-2`

**Fill variant**:

```tsx
<Button variant='fill'>SAVE</Button>
// bg-accent-black text-off-white (light)
// bg-off-white text-off-black (dark)
// hover:shadow-brutalist hover:-translate-x-1 hover:-translate-y-1
```

**Default variant**:

```tsx
<Button variant='default'>CANCEL</Button>
// hover:border-5
```

**Focus**: `focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-accent-black`

### Footer Controls

**Base classes**: `uppercase font-bold text-xs sm:text-sm md:text-base text-light-gray hover:text-accent-black dark:text-gray-500 dark:hover:text-off-white`

Always wrapped in `BrutalistTooltip`:

```tsx
<BrutalistTooltip text='Tooltip' position='top'>
  <button className='footer-control-button-classes'>[LABEL]</button>
</BrutalistTooltip>
```

### Modals

**Backdrop**: `fixed inset-0 bg-off-black/30 dark:bg-off-black/50 backdrop-blur-sm z-50`

**Content**: `bg-off-white dark:bg-brutal-gray p-8 border-2 border-accent-black dark:border-off-white/50`

### Dropdowns/Menus

**Animation**: `opacity-0 translate-y-2` → `opacity-100 translate-y-0` (`duration-150`)

**Hover**: `hover:bg-off-black/5 dark:hover:bg-off-white/10`

**Interaction**: Click outside, Escape to close, auto-close after action

### Expandable Components

**Toggle button**: `uppercase text-xs font-bold text-light-gray hover:text-accent-black dark:text-gray-500 dark:hover:text-off-white`

**ARIA**: `aria-expanded`, `aria-controls`, keyboard: Enter/Space to toggle, Escape to collapse

### Toasts

**Position**: `fixed bottom-6 left-1/2 -translate-x-1/2 z-50`

**Container**: `bg-off-white dark:bg-brutal-gray border-2 border-accent-black dark:border-off-white rounded-sm font-mono font-bold px-4 py-3`

**ARIA**: `role="status" aria-live="polite" aria-atomic="true"`

## Dark Mode

Toggle via `class="dark"` on `<html>` element.

**Inversions**:

- Background: `off-white` → `off-black`
- Text: `off-black` → `off-white`
- Borders: Use opacity variants (`/20`, `/50`, `/80`)
- Dropdowns/Modals: `dark:bg-brutal-gray`
- Hover: `dark:hover:bg-off-white/10`

## Accessibility

### ARIA Patterns

- **Radiogroups**: `role="radiogroup"`, `role="radio"`, `aria-pressed`
- **Menus**: `role="menu"`, `role="menuitem"`
- **Expandable**: `aria-expanded`, `aria-controls`
- **Labels**: Always provide `aria-label` or visible labels

### Keyboard Navigation

- **Tab**: Navigate between elements
- **Arrow keys**: Navigate within groups (← → toggles, ↑ ↓ menus)
- **Enter/Space**: Activate buttons, toggle expandable
- **Escape**: Close dropdowns, collapse expandable
- **Focus trap**: Keep focus within open dropdowns/menus

### Focus Rings

- **Standard**: `focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-accent-black dark:focus-visible:ring-off-white`
- **Compact**: `focus-visible:ring-offset-2` (sidebar, toggles)

### Screen Readers

- Descriptive ARIA labels on all interactive elements
- State changes announced (`aria-expanded`, `aria-pressed`)
- Semantic HTML preferred (`<button>`, `<nav>`, etc.)

## Performance

- **Lazy loading**: Modals and heavy components with `React.lazy()`
- **Memoization**: `React.memo()` for expensive components
- **Optimistic updates**: UI updates immediately, syncs in background
- **Debouncing**: Search queries (300ms default)
- **Request cancellation**: AbortController for in-flight requests
- **Concurrency**: Max 5 concurrent API requests

## State Management

- **Local Storage**: UI preferences (dark mode, sidebar, view mode)
- **Optimistic State**: Notes added/updated/deleted immediately
- **Error Rollback**: Optimistic updates rolled back on error
- **Controlled components**: Receive state as props
- **Internal state**: UI-only state (expand/collapse, dropdowns)

## Validation Checklist

- [ ] Colors match hex values
- [ ] Font is IBM Plex Mono
- [ ] Borders are 2px (5px on hover)
- [ ] No border-radius (except code blocks)
- [ ] Buttons use uppercase
- [ ] Dark mode inverts correctly
- [ ] Shadows only on button hover
- [ ] Focus states visible
- [ ] ARIA attributes present
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
