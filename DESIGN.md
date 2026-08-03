---
name: Living Book
description: A walnut cabinet of concepts — drawers of chapters over one ivory reading table, brass fittings, baize linings.
colors:
  cab: "#221a13"
  cab-deep: "#17110c"
  cab-face-1: "#33281d"
  cab-face-2: "#292017"
  cab-edge: "#4a3a29"
  reveal: "#0f0b07"
  baize: "#2f4c3c"
  baize-lit: "#3f6853"
  brass: "#c9962f"
  brass-lit: "#edc264"
  brass-dim: "#8a6a2a"
  brass-label: "#bd9445"
  ivory: "#f4ece0"
  ivory-2: "#e9dece"
  ivory-3: "#dbcdb7"
  ink: "#241d14"
  ink-2: "#5f5445"
  ink-3: "#6f6555"
  on-cab: "#ece0cb"
  on-cab-2: "#b3a08a"
  on-cab-3: "#a5947d"
  a-tech: "#c8402f"
  a-tech-t: "#8f2a1d"
  a-comm: "#d98a1f"
  a-comm-t: "#8a5507"
  a-learn: "#2e8f74"
  a-learn-t: "#1d6151"
  a-mem: "#3f74c8"
  a-mem-t: "#2b4f8c"
  a-think: "#8455c9"
  a-think-t: "#5b3691"
typography:
  display:
    fontFamily: "\"Bricolage Grotesque\", \"Trebuchet MS\", system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 5vw, 3.9rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.035em"
    fontVariation: "\"wdth\" 84, \"opsz\" 72"
  headline:
    fontFamily: "\"Bricolage Grotesque\", \"Trebuchet MS\", system-ui, sans-serif"
    fontSize: "clamp(1.95rem, 3.6vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.035em"
    fontVariation: "\"wdth\" 86, \"opsz\" 60"
  title:
    fontFamily: "\"Bricolage Grotesque\", \"Trebuchet MS\", system-ui, sans-serif"
    fontSize: "clamp(1.22rem, 1.6vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.022em"
    fontVariation: "\"wdth\" 92"
  body:
    fontFamily: "\"Literata\", Georgia, \"Times New Roman\", serif"
    fontSize: "clamp(1.06rem, 0.38vw + 0.99rem, 1.2rem)"
    fontWeight: 400
    lineHeight: 1.63
    letterSpacing: "normal"
    fontVariation: "\"opsz\" 16"
  label:
    fontFamily: "\"Azeret Mono\", ui-monospace, \"Cascadia Mono\", Consolas, monospace"
    fontSize: "0.66rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.2em"
rounded:
  xs: "2px"
  sm: "3px"
  md: "4px"
  pill: "999px"
spacing:
  pad: "clamp(1rem, 3.4vw, 2.75rem)"
  measure: "66ch"
  container: "1320px"
components:
  drawer:
    backgroundColor: "{colors.cab-face-1}"
    textColor: "{colors.on-cab}"
    rounded: "{rounded.sm}"
    padding: "clamp(0.85rem, 1.5vw, 1.15rem) clamp(0.9rem, 1.6vw, 1.2rem)"
  button-primary:
    backgroundColor: "{colors.brass}"
    textColor: "#1e1608"
    rounded: "{rounded.sm}"
    padding: "0.48rem 0.85rem"
    typography: "{typography.label}"
  button-secondary:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.48rem 0.85rem"
  chip:
    backgroundColor: "rgba(255,240,214,0.045)"
    textColor: "{colors.on-cab-2}"
    rounded: "{rounded.pill}"
    padding: "0.34rem 0.62rem"
  chip-pressed:
    backgroundColor: "rgba(255,240,214,0.11)"
    textColor: "{colors.on-cab}"
    rounded: "{rounded.pill}"
    padding: "0.34rem 0.62rem"
  card:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xs}"
    padding: "0.7rem 0.85rem 0.75rem"
  tool:
    backgroundColor: "rgba(201,150,47,0.11)"
    textColor: "{colors.brass-lit}"
    rounded: "{rounded.sm}"
    padding: "0.44rem 0.72rem"
  tool-pressed:
    backgroundColor: "{colors.brass}"
    textColor: "#1e1608"
    rounded: "{rounded.sm}"
    padding: "0.44rem 0.72rem"
---

# Design System: Living Book

## Overview

**Creative North Star: "The Cabinet of Curiosities"**

Living Book is a private collection housed in a piece of furniture, not a reading app. The room and its cabinet are dark walnut; drawers of unequal depth sit flush in a wall, each fitted with a brass hairline pull. Pulling a drawer brings its chapter to rest on the single warm ivory reading table — the only light surface in the entire room. Baize-green linings only flash into view along the edge of a drawer that stands half-open. The pleasure is spatial and tactile: you find queueing theory filed beside memory research because they happen to share a wall, and you refuse the left-rail-contents-beside-a-cream-column arrangement of every other reading tool.

The mood is museum-quiet, warm, and slightly analog — lamplight, brass, wood grain, and dotted rule lines instead of chrome and cards. Density is deliberate but never cramped: the vitrine and cabinet breathe at wide measure (up to 1320px), while reading prose is held to a strict 66ch. Motion is furniture motion — a drawer glides, a text block rises, a catalogue slip slides in from the right — one authored gesture per surface, nothing decorative. The system commits hard to two textures and refuses a third: there is exactly one light surface (the table), and everything else lives on walnut.

The five growth areas — Technical (primary), Communication, Learning, Memory, Thinking — each get an authored specimen plate (a hand-drawn SVG "insect" pinned in the drawer) and a two-tone area ink. Importance is not decoration here: a concept's weight is computed at load and made visible four different ways, because the system asserts there is no single correct way to make importance legible.

**Key Characteristics:**
- Two surfaces only: dark walnut room/cabinet, one ivory reading table.
- Nearly square corners (2–4px) with brass hairline (1px) fittings.
- Three type roles: Bricolage Grotesque (display/UI), Literata (reading), Azeret Mono (data/labels).
- Five area inks, each in a graphic and a text-on-ivory variant.
- One authored gesture per surface; a full `prefers-reduced-motion` reset.
- Importance is a real, computed, four-way-encoded mechanism.

## Colors

The palette is a warm, low-key room lit by brass: deep walnut browns almost everywhere, a single ivory reading surface, brass as the only metal, baize green as a lining that mostly hides, and five saturated area inks that appear only as small marks.

### Primary
- **Signal Brass** (`{colors.brass}` #c9962f): The one metal of the world — pulls, rails, the active reading-progress bar, the primary button, dial thumb, and every "active/current" affordance. Rare and load-bearing; it marks what you can act on.
- **Lit Brass** (`{colors.brass-lit}` #edc264): The lamplit highlight of brass — hovered/active titles, focus outlines, big numeric readouts on dark surfaces.
- **Dim Brass** (`{colors.brass-dim}` #8a6a2a): Gradient-only shadow brass, the dark stop under a pull or dial thumb. Not for text.
- **Label Brass** (`{colors.brass-label}` #bd9445): The contrast-safe text brass, added specifically so brass-colored micro-labels and accession lines stay legible on walnut where `brass-dim` would fail. Use this, not `brass-dim`, whenever brass has to be *read*.

### Secondary — Area Inks
Five two-tone inks, one per growth area. The `-t` variant is darkened for text-on-ivory (catalogue cards, label cards, inline terms); the plain variant is for graphic marks (specimen strokes, register bars, dots) on dark walnut.
- **Technical Red** (`{colors.a-tech}` #c8402f / text `{colors.a-tech-t}` #8f2a1d): The primary area; also the default count badge.
- **Communication Amber** (`{colors.a-comm}` #d98a1f / #8a5507).
- **Learning Green** (`{colors.a-learn}` #2e8f74 / #1d6151).
- **Memory Blue** (`{colors.a-mem}` #3f74c8 / #2b4f8c): Also the link color on the ivory table (`a-mem-t`).
- **Thinking Violet** (`{colors.a-think}` #8455c9 / #5b3691).

### Tertiary — Baize
- **Baize Green** (`{colors.baize}` #2f4c3c) / **Lit Baize** (`{colors.baize-lit}` #3f6853): The drawer lining. It is invisible at rest and shows only as an inset edge-light when a drawer is `open-ajar`, plus a faint wash inside the vitrine glass.

### Neutral — Walnut carcass (dark surface)
- **Cabinet** (`{colors.cab}` #221a13) / **Cabinet Deep** (`{colors.cab-deep}` #17110c): Room and page background; the darkest, `reveal` (#0f0b07), is the void behind drawers and the stack backing.
- **Drawer Faces** (`{colors.cab-face-1}` #33281d → `{colors.cab-face-2}` #292017): The wood face gradient of a closed drawer; `{colors.cab-edge}` #4a3a29 is the hairline seam between stacked drawers.
- **On-Cabinet Ramp** (`{colors.on-cab}` #ece0cb / `{colors.on-cab-2}` #b3a08a / `{colors.on-cab-3}` #a5947d): The three text weights *on walnut* — primary / secondary / faint-mono.

### Neutral — Ivory table (light surface)
- **Ivory Ramp** (`{colors.ivory}` #f4ece0 / `{colors.ivory-2}` #e9dece / `{colors.ivory-3}` #dbcdb7): The reading table gradient and its hairline borders/dividers. `ivory-3` is the standard divider on light.
- **Ink Ramp** (`{colors.ink}` #241d14 / `{colors.ink-2}` #5f5445 / `{colors.ink-3}` #6f6555): The three text weights *on ivory* — primary / secondary / faint-mono. Long-form prose actually renders at #2b2317, a hair warmer than `ink`.

### Named Rules
**The Two-Surface Rule.** There are exactly two material surfaces. The room, rail, cabinet wall, drawers, vitrine, catalogue controls, rounds thread, register, slip, loupe, and toast all live on **walnut** and use the **on-cab** text ramp. The reading table, label card, extent dial, figures, catalogue cards, round cards, and slip cards live on **ivory** and use the **ink** ramp. A component picks one surface and never mixes the two ramps.

**The One-Metal Rule.** Brass is the only metallic accent and it means "actionable / current." Never introduce a second metal or spend brass on inert decoration; its scarcity is what makes a pull read as a pull.

**The Read-Brass Rule.** Brass that must be *read* uses `brass-label` (or `brass-lit` on dark); `brass-dim` is gradient-shadow only and never carries text.

## Typography

**Display / UI Font:** Bricolage Grotesque (variable `wght` 300–800, `wdth` 75–100%), with Trebuchet MS / system-ui fallback.
**Reading Font:** Literata (variable, roman `wght` 300–700 + true italic 400–600), with Georgia fallback.
**Label / Data Font:** Azeret Mono (300 / 400 / 500 / 700), with ui-monospace fallback.

All three are self-hosted (`fonts/fonts.css`, Latin subset, SIL OFL 1.1) so the world keeps its lettering offline and over `file://`.

**Character:** A condensed, tightly-tracked grotesque for structure and voice; a warm optical-serif for everything you actually read; a wide-tracked mono for measurements, labels, and provenance. The three roles never trade jobs — you always know whether you are looking at a title, a passage, or a datum by its typeface alone.

### Hierarchy
- **Display** (Bricolage 600, `clamp(2.1rem, 5vw, 3.9rem)`, `wdth` 84 / `opsz` 72, tracking -0.035em): Room titles at the head of each view; an `<em>` inside is recolored to `brass-lit`, not italicized.
- **Headline** (Bricolage 600, `clamp(1.95rem, 3.6vw, 3rem)`, `wdth` 86 / `opsz` 60, -0.035em): The chapter `h1` on the reading table.
- **Title** (Bricolage 600, `clamp(1.22rem, 1.6vw, 1.5rem)`, `wdth` 92, -0.022em): Section `h2`, drawer titles, bay headings, card and slip titles. Drawer titles carry a two-way `text-shadow` to sit engraved in the wood.
- **Body** (Literata 400, `clamp(1.06rem, …, 1.2rem)` / 1.63, `opsz` 16): Reading passages, held to **66ch**. The summary lede runs slightly larger (up to 1.18rem); asides are true italic.
- **Label** (Azeret Mono 500, ~0.6–0.72rem, tracking 0.1–0.2em, UPPERCASE): The `.eng` micro-labels ("engraved" caps), meta rows, tallies, log times, area names, figure readouts — every datum and section marker.

### Named Rules
**The 66ch Rule.** Reading prose (`h1/h2/p/ul/aside/pre/prompt` on the table) is capped at `max-width: 66ch`; specimens and figures are allowed the full table width (`min(100%, 62rem)`). The measure is achieved per-element inside a wide table, not by narrowing the whole surface.

**The Three-Role Rule.** Sans for display and UI, serif for reading, mono for data and labels. Never set a passage in the grotesque or a label in the serif; the typeface *is* the signal of what kind of text this is.

**The Engraved-Label Rule.** Uppercase mono micro-labels always carry wide tracking (0.1em on meta, 0.13–0.2em on `.eng`/section markers). Tracked, uppercased mono reads as an engraved plate; tight or lowercase mono reads as a value.

## Layout

A centered single-column stack, max content width **1320px**, with a horizontal page inset of `--pad` = `clamp(1rem, 3.4vw, 2.75rem)`. The head is a `sticky` brass rail (60px, 54px under 760px) with backdrop blur.

The first viewport is deliberate: brass rail across the head; a **glass vitrine of three unequal bays** (`grid-template-columns: 1.25fr 1fr 1fr`) holding rounds-due / latest-accession / where-you-stopped; beneath it the **cabinet wall** — a `repeat(3, 1fr)` grid of drawer stacks with 0 row-gap so drawers read as one continuous carcass. Drawers come in three depths (`.deep`, default, `.shallow`) via `padding-block`, so the wall is intentionally uneven.

The **reading table** is a two-column grid: a 268px sticky label card (specimen plate, meta rows, extent dial) beside a `minmax(0, 1fr)` reading column. Spacing rhythm is `clamp`-driven throughout rather than a fixed numeric scale; vertical section breaks on the table run ~2.9rem above an `h2`.

### Responsive behavior (exact breakpoints)
- **≤1180px:** cabinet wall drops from 3 to **2 columns**.
- **≤980px:** reading table collapses to a **single column**; the label card un-sticks (`position: static`), its top becomes a 48px-plate + info grid, and the extent dial/detents reflow into a 2-up grid.
- **≤760px:** rail wraps (cases drop to their own full-width row, tool labels hide to icons); vitrine and cabinet wall both go **1 column**; detents, register bars, and log rows all stack; the slip goes full-width; `--rail-h` shrinks to 54px.
- **`@media (hover: none)`:** drawer and card hover transforms are disabled (no ghost lift on touch).
- **`@media (pointer: coarse)`:** a **44px minimum touch target** floor is applied to chips, minis, segmented buttons, detents, tools, back/close buttons, and loupe buttons.

## Elevation & Depth

Depth is conveyed by **layered warm shadows plus inset light-catches**, not by a flat tonal system — this is a physical room, so things cast real shadows and catch a top edge of lamplight. Shadows are large, soft, and heavily negative-spread (they pool under furniture) and are almost always paired with a 1px inset highlight (`inset 0 1px 0 rgba(255,…, .06–.13)`) that reads as the lit top edge of wood or glass. The room background itself carries a fixed radial "lamp" glow at the top whose intensity is driven by the `--lamp` custom property (0→1, toggled by the rail lamp button).

### Shadow Vocabulary
- **Seated furniture** (`box-shadow: 0 30px 54px -34px rgba(0,0,0,1), inset 0 1px 0 rgba(255,228,180,.07)`): Drawer stacks and the vitrine — deep pooled shadow + lit top edge.
- **Table on the floor** (`0 42px 80px -44px rgba(0,0,0,1), 0 3px 0 rgba(120,96,64,.28)`): The ivory reading table, lifted highest with a warm 3px "front edge."
- **Pulled drawer** (`-14px 0 22px -14px rgba(0,0,0,.95)` on hover; `-18px 0 26px -16px …, inset 1px 0 0 baize-lit` when ajar): Sideways shadow as a drawer slides out, and the baize edge-light appears only when open.
- **Lifted paper** (`0 10px 20px -16px` → `0 20px 30px -18px` on hover): Catalogue cards and cross-reference slips — small paper shadows that deepen on lift.
- **Overlay** (slip `-34px 0 62px -30px rgba(0,0,0,1)`; loupe/toast `0 14–20px 28–34px …`): Right-hand slip drawer, floating loupe, and toast sit clearly above the room.

### Named Rules
**The Lit-Edge Rule.** Every seated surface (drawer, vitrine, table, round card) pairs its pooled drop shadow with a 1px inset top highlight. Shadow alone reads as a flat cutout; the lit edge is what makes it wood or glass.

**The Baize-Only-When-Open Rule.** The baize-green lining (`baize-lit`) is depth information, not color: it appears solely as an inset edge on a half-open drawer. Never paint baize on a closed or flat surface.

## Shapes

The world is **nearly square-cornered by intent**. The radius language is a tight four-step scale and should be read as "hard, cabinetmaker's corners," not soft cards:
- **2px (`{rounded.xs}`):** The default — inner chips of state, label cards, catalogue cards, slips, prompts, terms, register bars, days.
- **3px (`{rounded.sm}`):** Panels and controls — drawer stacks, vitrine, tools, standard buttons, segmented controls, `pre` blocks, the loupe/toast.
- **4px (`{rounded.md}`):** The largest radius in the system — the reading table, round cards, loupe housing.
- **999px (`{rounded.pill}`):** Reserved for two truly round things only: filter chips and the small count badge.

Borders are **hairlines**: 1px is the near-universal stroke, drawn in translucent brass (`rgba(201,150,47,.22–.36)`) on walnut and in `ivory-3` on the table. Dotted 1px rules (`ivory-3`) separate meta rows and answers on paper; dashed borders mark empty/placeholder states. The recurring geometry beyond rectangles is the **45°-rotated 1px square**: it is the list bullet in prose and the "pin" motif, echoing an entomologist's mounting pin.

### Named Rules
**The Hard-Corner Rule.** Nothing in the interior exceeds a 4px radius except the two pill exceptions (chips, count badge). If a new surface wants a soft, rounded-card look, it is wrong for this world — go to 2–3px.

**The Hairline Rule.** Structural separation is a 1px hairline, never a heavy divider or a filled bar. On walnut it is translucent brass; on ivory it is `ivory-3`, dotted when it separates rows of the same object.

## Components

### Drawers (signature component)
- **Character:** A flush wood drawer in the cabinet wall — the primary navigation unit; clicking one routes to its chapter on the table.
- **Shape / surface:** 3px radius stack; each drawer is a `cab-face-1 → cab-face-2` vertical gradient with a `::before` grain overlay and a `::after` top light-catch; a 1px `reveal` seam between drawers.
- **Layout:** `44px | 1fr | auto` grid — specimen plate, title + meta, brass pull. Depth variants `.deep` / `.shallow` change `padding-block` so the wall is uneven.
- **State chips:** `st-new` (green), `st-evolving` (brass), `st-retiring` (rose, title struck through, desaturated), `st-live` (borderless faint mono). `open-ajar` slides the drawer +12px and lights its baize inset edge.
- **Hover/focus:** slides +6px on X, brightens 1.1, casts a left shadow, and the brass pull's inset highlight brightens. A bottom `.drawer-read` bar (2px brass) scales to reading progress.

### Buttons
- **Shape:** 3px radius (`{rounded.sm}`); square, not pill.
- **Primary (`.btn.brass`):** Brass gradient (`brass-lit → brass → brass-dim`), ink text (#1e1608), `#7d5f22` border, inset top highlight — the committing action (Keep / file / next round).
- **Secondary (`.btn`):** Warm ivory gradient (`#fdfaf4 → #eee3d1`), ink text, translucent-brown border — table-surface default.
- **Hover / active:** background lightens; `:active` nudges down 1px (`translateY(1px)`). Disabled drops to 0.45 opacity.
- **Tools (rail):** Translucent-brass fill, `brass-lit` text; `aria-pressed="true"` flips to a solid brass gradient with ink text. On ≤760px the label hides and only the icon remains.

### Chips (filters)
- **Style:** Pill (`{rounded.pill}`), faint ivory-wash fill on walnut, `on-cab-2` text, translucent-brass 1px border, a small `currentColor` dot.
- **State:** `aria-pressed="true"` brightens text to `on-cab` and sets the border to `currentColor`. Segmented controls (`.seg`) are the square sibling: pressed segment fills with the brass gradient.

### Cards (catalogue)
- **Corner Style:** 2px (`{rounded.xs}`) — hard paper.
- **Background:** Ivory tinted with the concept's area ink via `color-mix` (~4–7% ink into ivory); border is ~24% ink into `#c9b99d`.
- **Shadow:** Lifted-paper (`0 10px 20px -16px`), deepening and rotating -0.35° on hover.
- **Weight encodings:** `.cards.enc-size` scales the term font by `--mag`; `.enc-lamp` warms the card background/glow by `--warm`; `.enc-engrave` thickens weight, width axis, border, and emboss by `--mag`. (Threads renders as an SVG map instead.)

### Inputs / Fields
- **Extent dial (`.dial`):** A custom `range` styled as a brass-knurled slider on a `cbbca4 → e6dcca` recessed track; the 22px thumb is a brass gradient with a knurl texture and inset highlight. Backed by four labeled **detents** (Spine / Working / Full / Source) that highlight the current step in brass-wash.
- **Figure sliders:** Native `range` with `accent-color: brass-dim`.
- **Focus (global):** 2px `brass-lit` outline, 2px offset, 2px radius — the single focus treatment everywhere.

### Navigation (rail cases)
- **Style:** Text plates (`.plate`) in `on-cab-2`, wide-ish tracking; the active plate is `brass-lit` with an animated 2px brass underline that scales in from the left (`aria-current="true"`). A brass count badge rides the "Rounds" plate.

### Catalogue slip (signature overlay)
- **Character:** A right-hand drawer (`min(430px, 100%)`) that slides in over a blurred veil to show a concept's full catalogue entry — the concept-drilldown surface.
- **Behavior:** `role="dialog"` + `aria-modal="true"`, an entrance `slipIn` from the right, focus moved to the close button, a **focus trap**, `Esc` to close, and focus **restored** to the opening element. The principal-fundamental section is emphasized with a brass-wash bleed to the panel edges.

### Loupe (signature selection tool)
- **Character:** A small brass-framed toolbar that appears at a text selection in the reading column with two actions — "Drill down" (open the catalogue slip) and "Add to rounds" (file it for spaced review).

## Do's and Don'ts

### Do:
- **Do** keep every component on exactly one surface: walnut with the **on-cab** ramp, or ivory with the **ink** ramp (The Two-Surface Rule).
- **Do** spend brass only on actionable or current elements, and pull *readable* brass from `brass-label`/`brass-lit`, never `brass-dim`.
- **Do** hold reading prose to **66ch** while letting specimens and figures use the full table width.
- **Do** keep corners hard — 2px inner, 3px panels/controls, 4px only for the table/round cards/loupe; pills only for chips and the count badge.
- **Do** separate with 1px hairlines (translucent brass on walnut, `ivory-3` — dotted for same-object rows — on ivory) and pair every seated surface with a 1px inset lit edge.
- **Do** keep type in its role: Bricolage for display/UI, Literata for reading, Azeret Mono (tracked, uppercased) for labels and data.
- **Do** give motion one authored gesture per surface (drawer glides, block rises, slip slides) and honor the full `prefers-reduced-motion` reset.
- **Do** encode concept importance with the real `--mag` / `--warm` mechanism (size / lamplight / engraving / threads), not ad-hoc emphasis.

### Don't:
- **Don't** introduce a second light surface or a second metal — the ivory table and brass are each singular.
- **Don't** show baize green anywhere except as the inset edge of a half-open drawer.
- **Don't** use rounded-card radii (≥6px), drop shadows without a lit edge, or heavy/filled dividers.
- **Don't** set a passage in the grotesque or a label in the serif; don't leave uppercase mono labels untracked.
- **Don't** put a left-rail contents list beside a cream essay column — that reading-app arrangement is the explicit anti-reference.
- **Don't** hard-code area-ink hex in new code paths; the `--a-*` tokens are the source of truth. (Known duplication: `app.js` carries an `INK` map that restates the `--a-tech/comm/learn/mem/think` graphic and `-t` text values, and `content.js` `areas[].ink` holds a third, slightly different set used only in the content model — reconcile to the CSS tokens rather than adding a fourth.)
