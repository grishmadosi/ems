---
description: Use SVGs instead of emojis or HTML character entities for all icons
---

# No Emojis Rule

Never use emoji characters, unicode symbols, or HTML character entities (like `&#10003;`, `&#9733;`, `&#128269;`) for icons or decorative elements in frontend code. They render inconsistently across operating systems, browsers, and font stacks.

## What to use instead

Use **inline SVGs** for all icons, symbols, and decorative elements.

### Example - Bad

```jsx
<span>&#10003;</span>
<span>&#9733;</span>
<div>&#9997;</div>
```

### Example - Good

```jsx
{/* Checkmark */}
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
  <polyline points="20 6 9 17 4 12" />
</svg>

{/* Star */}
<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
</svg>

{/* Search */}
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <circle cx="11" cy="11" r="8" />
  <line x1="21" y1="21" x2="16.65" y2="16.65" />
</svg>
```

## Guidelines

1. All SVGs should use `viewBox="0 0 24 24"` for consistency
2. Set explicit `width` and `height` attributes
3. Use `stroke="currentColor"` so icons inherit the text color from CSS
4. Use `fill="none"` for outline-style icons, `fill="currentColor"` for filled icons
5. Keep SVGs inline in JSX -- do not use external image files for small UI icons
6. For frequently reused icons, create a shared icon component or constants file
