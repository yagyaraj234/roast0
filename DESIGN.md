# Design System — browserops.ai (from screenshots)

> Corrected version — pulled directly from actual screenshots of the live
> site. My earlier version guessed a dark theme; the real site is light.
> Values below are read off the screenshots, so treat hex codes as close
> approximations (±a shade), not exact color-picker values.

---

## 1. Brand Feel

Minimal, editorial, confident. Serif wordmark + heavy sans headline is an
unusual pairing for a dev-tool — it reads more "considered startup" than
"generic SaaS." Mostly black/white/gray with exactly one accent color used
sparingly (one word in the headline, one button, one UI element in the demo).

Keywords: **editorial, restrained, high-contrast, one accent only.**

---

## 2. Color

| Token                    | Value            | Usage                                                                                               |
| ------------------------ | ---------------- | --------------------------------------------------------------------------------------------------- |
| `--color-bg`             | `#ffffff`        | Page background — plain white, no off-white                                                         |
| `--color-text`           | `#0a0a0a`        | Headline / logo — near-black                                                                        |
| `--color-text-muted`     | `#7a7a7a`        | Subheadline copy                                                                                    |
| `--color-accent`         | `#4a7fd6` (blue) | Used ONLY on the last few letters of the headline ("...ly") and on UI accents in the product mockup |
| `--color-nav-cta-bg`     | `#0a0a0a`        | "Talk to a founder" pill — solid black                                                              |
| `--color-nav-cta-text`   | `#ffffff`        | Text on that pill                                                                                   |
| `--color-terminal-bg`    | `#0a0a0a`        | Install command block + demo terminal panel                                                         |
| `--color-terminal-text`  | `#ffffff`        | Command text (monospace)                                                                            |
| `--color-border`         | `#e5e5e5`        | Card/browser-mockup borders                                                                         |
| `--color-surface-alt`    | `#f4f4f5`        | Browser chrome bar, tab background                                                                  |
| `--color-accent-soft-bg` | `#e4eafc`        | Light blue panel inside the product demo (agent workspace)                                          |

Only **one** saturated color exists on the whole page. Everything else is
grayscale. That restraint is the actual design move here — don't add a
second accent color.

---

## 3. Typography

Two very different typefaces doing two very different jobs:

| Token          | Value                                                                                                                                        | Usage                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `--font-serif` | A classic serif (looks like a Times/Georgia-style serif)                                                                                     | Logo wordmark ("BrowserOps") only |
| `--font-sans`  | A rounded/geometric sans (looks like Inter or similar, but slightly friendlier/rounder — possibly a custom or "Sen"/"Poppins"-adjacent face) | Headline, nav, body, button text  |
| `--font-mono`  | Standard monospace (looks like a system mono / JetBrains Mono style)                                                                         | Install command only              |

**Scale (approx, from screenshot proportions):**

- H1 hero: **~72–90px**, weight 700–800, tight line-height (~1.05), spans two lines, center-aligned
- Subheadline: ~22–24px, weight 400, muted gray, two short lines, centered
- Nav links: ~16px, weight 400–500, gray, black on the CTA pill
- Install command: ~18–20px, monospace, white on black
- Button text ("Add to Chrome"): ~18px, weight 500, black text on white pill

**Headline color treatment:** the whole H1 is near-black, except the final
two characters of the last word ("**ly**" in "autonomously") which fade into
the blue accent — a small gradient/color-swap on just the last syllable, not
the whole line. This is a nice detail worth replicating: pick one word (or
part of one) in your headline to carry the accent color instead of coloring
the whole heading.

---

## 4. Layout

Confirmed structure, top to bottom:

1. **Nav** — serif logo left, 3 plain text links center-right (`Docs`,
   `Writings`, `Privacy`), solid black pill button far right (`Talk to a
founder`). Generous horizontal padding, everything vertically centered
   on one row.
2. **Hero headline** — large, centered, two lines, max-width constrained
   (doesn't span full viewport width even on wide screens).
3. **Subheadline** — centered, two short lines, muted gray, directly below
   headline with tight spacing.
4. **Install command** — black rounded rectangle, centered, monospace,
   copy icon on the right edge. Sits with clear spacing above the CTA
   button (not squeezed together).
5. **CTA button** — white pill, black border, Chrome favicon + "Add to
   Chrome" text, black text. Rounded/pill radius, not a square button.
6. **Product demo mockup** — a fake browser window (macOS-style traffic
   light dots, tab bar with 3 tabs: a doc, a localhost URL, and the active
   "BrowserOps Tab"). Inside: split into a light workspace panel (left,
   soft blue background, shows a "BrowserOps" chip/badge and content
   placeholders) and a dark terminal panel (right, shows "Running
   Browserops" status at the bottom with a loading dot).

Whitespace is heavy and deliberate — lots of vertical breathing room between
each of the 6 blocks above. Nothing touches; everything centered on a single
vertical axis.

---

## 5. Components

### Nav CTA (pill button, dark)

```css
.btn-nav-cta {
  background: #0a0a0a;
  color: #fff;
  padding: 10px 20px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 500;
}
```

### Install command block

```css
.install-cmd {
  background: #0a0a0a;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 19px;
  padding: 18px 28px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 16px;
}
.install-cmd .copy-icon {
  color: #ffffff;
  opacity: 0.7;
}
```

### Primary CTA (light pill button)

```css
.btn-primary {
  background: #ffffff;
  color: #0a0a0a;
  border: 1px solid #e5e5e5;
  padding: 12px 24px;
  border-radius: 999px;
  font-size: 18px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
```

### Browser mockup frame

```css
.browser-mockup {
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
}
.browser-mockup .chrome-bar {
  background: #f4f4f5;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.browser-mockup .traffic-lights span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
/* red #ff5f57, yellow #febc2e, green #28c840 */
```

### Terminal panel (inside demo)

```css
.terminal-panel {
  background: #0a0a0a;
  color: #fff;
  border-radius: 12px;
  font-family: var(--font-mono);
}
.terminal-panel .status-bar {
  background: #1f1f1f;
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-style: italic;
  font-size: 14px;
  color: #ccc;
}
```

### Soft accent panel (inside demo, left side)

```css
.agent-workspace {
  background: #e4eafc;
  border-radius: 10px;
  padding: 24px;
}
.agent-workspace .badge {
  background: #4a7fd6;
  color: #fff;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}
```

---

## 6. Motion

No visible motion in static screenshots, but the loading dot on the terminal
status bar ("Running Browserops •") implies a subtle pulse/spin animation.
Keep any motion minimal — this brand does not go for flashy transitions.

---

## 7. Voice / Copy Principles

1. Headline states the core mechanic in plain words: _"Your agent runs your
   real chrome, autonomously."_
2. Subheadline explains the _why_ in one breath: what it automates, and
   what makes it hard (workflows that "cross too many tools").
3. Then immediately: how to install (command), how to install even easier
   (button). No feature list before you've shown the product working.
4. Lowercase, no exclamation marks, no adjectives like "revolutionary" or
   "powerful."

---

## 8. Quick Tailwind Token Mapping

```js
// tailwind.config.js excerpt
colors: {
  ink: '#0a0a0a',
  muted: '#7a7a7a',
  accent: '#4a7fd6',
  accentSoft: '#e4eafc',
  border: '#e5e5e5',
  surfaceAlt: '#f4f4f5',
},
fontFamily: {
  serif: ['Georgia', 'Times New Roman', 'serif'],   // logo only
  sans: ['Inter', 'sans-serif'],                     // everything else
  mono: ['"JetBrains Mono"', 'monospace'],           // install command
},
borderRadius: {
  pill: '999px',
},
```

---

### TL;DR for building your own page in this style

White background, near-black text, exactly **one** blue accent used
sparingly (one word in the headline + one badge in the product shot). Serif
logo, rounded sans for everything else, monospace only for the terminal
command. One black pill CTA in the nav, one white pill CTA in the hero.
Finish with a realistic product screenshot inside a fake browser chrome —
that's what actually sells a dev tool, not a feature grid.
