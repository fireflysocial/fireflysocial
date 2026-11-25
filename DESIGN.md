---
name: Firefly
description: Keep meeting the same faces at the events you already go to in Vancouver.
colors:
  night: '#0E1424'
  glow: '#D9F84A'
  wing: '#313C62'
  wing-light: '#C9CFDE'
  paper: '#F5F6F0'
  ink: '#F4F5F9'
  muted: '#9AA3BF'
  night-raised: '#151C31'
  rule: 'rgb(201 207 222 / 0.18)'
  wing-hover: '#3B4875'
  glow-hover: '#E6FF7A'
  error: '#FF9A8A'
typography:
  display:
    fontFamily: 'Host Grotesk, system-ui, Segoe UI, Roboto, sans-serif'
    fontSize: 'clamp(2.75rem, 13vw, 6rem)'
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: '-0.04em'
  headline:
    fontFamily: 'Host Grotesk, system-ui, Segoe UI, Roboto, sans-serif'
    fontSize: 'clamp(2.25rem, 8.5vw, 4.5rem)'
    fontWeight: 400
    lineHeight: 1
    letterSpacing: '-0.035em'
  statement:
    fontFamily: 'Host Grotesk, system-ui, Segoe UI, Roboto, sans-serif'
    fontSize: 'clamp(1.875rem, 8.4vw, 3.5rem)'
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: '-0.03em'
  title:
    fontFamily: 'Host Grotesk, system-ui, Segoe UI, Roboto, sans-serif'
    fontSize: 'clamp(1.375rem, 3.4vw, 2rem)'
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: '-0.02em'
  lede:
    fontFamily: 'Host Grotesk, system-ui, Segoe UI, Roboto, sans-serif'
    fontSize: 'clamp(1.1875rem, 2.4vw, 1.5rem)'
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: 'Host Grotesk, system-ui, Segoe UI, Roboto, sans-serif'
    fontSize: '1.0625rem'
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: 'tnum'
  label:
    fontFamily: 'Host Grotesk, system-ui, Segoe UI, Roboto, sans-serif'
    fontSize: '0.9375rem'
    fontWeight: 400
    lineHeight: 1.3
  small:
    fontFamily: 'Host Grotesk, system-ui, Segoe UI, Roboto, sans-serif'
    fontSize: '0.8125rem'
    fontWeight: 400
    lineHeight: 1.4
rounded:
  none: '0'
  device: '40px'
  dot: '50%'
spacing:
  gutter: 'clamp(16px, 2.4vw, 32px)'
  section: 'clamp(96px, 16vw, 200px)'
  rows-top: 'clamp(48px, 8vw, 96px)'
  header: '56px'
  header-wide: '72px'
  target: '44px'
  control: '56px'
components:
  header-cell-invite:
    backgroundColor: '{colors.wing}'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    rounded: '{rounded.none}'
    padding: '0 clamp(16px, 2.4vw, 32px)'
    height: '{spacing.header}'
  header-cell-invite-hover:
    backgroundColor: '{colors.wing-hover}'
  button-submit:
    backgroundColor: '{colors.glow}'
    textColor: '{colors.night}'
    typography: '{typography.body}'
    rounded: '{rounded.none}'
    padding: '0 20px'
    height: '{spacing.control}'
  button-submit-hover:
    backgroundColor: '{colors.glow-hover}'
  button-submit-disabled:
    backgroundColor: '{colors.wing-light}'
    textColor: '{colors.night}'
  input-underline:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.none}'
    padding: '0 0 8px'
    height: '{spacing.control}'
  phone-preview:
    backgroundColor: '{colors.night-raised}'
    textColor: '{colors.ink}'
    rounded: '{rounded.device}'
    padding: '28px 20px 24px'
    width: '360px'
  person-initial:
    backgroundColor: '{colors.wing}'
    textColor: '{colors.ink}'
    rounded: '{rounded.dot}'
    size: '44px'
---

# Design System: Firefly

## Overview

**Creative North Star: "Fireflies in Step"**

Firefly's world is a dark, quiet room with one signal in it. Night runs edge to edge; strangers
are faint Wing-light dots; the only bright thing on a screen is Glow, and it belongs to the pod.
Over it sits a civic, almost municipal grotesk layer: very large, tight Host Grotesk in white,
small two-line labels, hairline rules and solid block cells. Nothing is decorated. Hierarchy
comes from size and from the muted-over-white pairing, not from weight, colour or containers.

The world was established by the landing page (`src/features/landing/`, built 2026-11-25). That
page is always Night regardless of the visitor's light/dark setting, a confirmed exception. App
screens are not built yet; they will follow the system light/dark setting, and the light variant
of the brand (Night on Paper, Wing-light wings) exists in `brand/` but has no built screens, so
this file records no light-mode tokens. The root stylesheet's light defaults (Wing text on white)
are placeholders, not a designed light system.

Motion is one idea: repetition made visible. The scroll-driven field shows a crowd blinking at
random while five dots gather, light up and fall into step (Kuramoto synchrony). Everything else
is near-still. There is no photography; people are represented by initials and the example pod
is labelled as made up.

**Key Characteristics:**

- Night ground edge to edge; one Glow per composition.
- Host Grotesk only, regular weight for display, tight negative tracking; size carries hierarchy.
- Two-line labels: muted context line over the white fact.
- Hairline rules and square block cells instead of cards, shadows or gradients.
- Flat dots: a flash is size and opacity, never blur or bloom.
- Phone first from 360px; everything readable with the motion switched off.

## Colors

A near-monochrome Night palette with one chartreuse light; every colour except Glow is a shade of
the night itself.

### Primary

- **Glow** (glow): the light. The pod's dots in the field, the dot beside "Pod chat opens", the
  invite submit block, focus rings, text selection. One per composition. Its hover is a paler
  Glow (glow-hover), used only on the submit block.

### Secondary

- **Wing** (wing): the mark's wings, the header's invite cell, the pod-mates' initial discs, and
  the scrollbar thumb. Lifts to wing-hover on the invite cell's hover. Carries white text at
  9.9:1.
- **Wing Light** (wing-light): strangers in the field (drawn at 14% to 94% opacity as they
  blink), the hue of every hairline rule (at 18%), and the disabled submit block.

### Neutral

- **Night** (night): every ground on the landing page, the header bar, text on Glow and on
  Wing Light, and the mobile browser toolbar colour while the page is open.
- **Night Raised** (night-raised): the one raised surface, the phone-preview screen. Depth by
  tone, never by shadow.
- **Ink** (ink): primary text on Night (16.9:1). The second line of every two-line label.
- **Muted** (muted): context lines, body copy in rows, ledes, sources, the input underline at
  rest, pod name labels in the field (7.3:1 on Night).
- **Rule** (rule): Wing Light at 18% alpha; all hairlines (header bottom, mark cell divider, row
  separators, strip borders, phone dividers, footer top).
- **Paper** (paper): the light-surface brand ground from `brand/firefly-mark-light.svg`. Reserved
  for the future light mode; unused in the build.
- **Error** (error): coral for an invalid email (text and the input underline), 9.0:1 on Night.
- **Placeholder** (`--placeholder`, `#7D87A6`): input placeholder text only. Dimmer than Muted so it
  reads as a hint, still 5.15:1 on Night.

### Named Rules

**The One Light Rule.** Each composition has exactly one Glow element. On the story stage it is
the pod; in the pod preview it is the chat dot; in the invite section it is the submit block.
If a second Glow appears on screen, one of them is wrong.

**The No Glow on Paper Rule.** Glow never carries text or an essential indicator on a light
surface; on light, the glow becomes Night (brand/README.md).

**The Solid Glow Rule.** Glow over Night is drawn at full opacity; dimmed Glow turns olive. Lit
pod dots flash by swelling, not fading.

## Typography

**Display Font:** Host Grotesk variable, 300 to 800, self-hosted (latin and latin-ext woff2,
`font-display: swap`), falling back to system-ui, Segoe UI, Roboto, sans-serif.
**Body Font:** the same family.

**Character:** one clean neo-grotesk from 6rem display to 13px labels, set like civic signage:
big, tight, regular weight, white on Night. Tabular figures are on across the page.

### Hierarchy

- **Display** (400, 2.75rem to 6rem by 13vw, 0.94, -0.04em): the H1, the invite H2, and the
  footer wordmark (at 0.9 line height and -0.045em). Balanced wrapping.
- **Headline** (400, 2.25rem to 4.5rem, 1, -0.035em): section H2s and the marquee line.
- **Statement** (400, 1.875rem to 3.5rem, 1.06, -0.03em, max 20ch): each story chapter's single
  sentence, and the week number in the field caption.
- **Title** (400, 1.375rem to 2rem, 1.15, -0.02em): row titles (H3).
- **Lede** (400, 1.1875rem to 1.5rem, 1.4, 34 to 38ch): chapter notes, section ledes, the
  footer line. Usually Muted.
- **Body** (400, 1.0625rem, 1.5; 1.125rem in wide rows, 52ch): row bodies, names.
- **Label** (400, 0.9375rem, 1.2 to 1.3): two-line labels, header and nav, form label and
  messages, the scroll cue.
- **Small** (400, 0.8125rem, 1.4): sources, captions, interests, footer meta.

The only weight above 400 is 500, on the submit block's text and the field's canvas name labels.

### Named Rules

**The Size Not Weight Rule.** Hierarchy is carried by size and by the muted/white pairing.
Display and headline stay at 400; nothing on the page is bold.

**The Tight Display Rule.** Tracking tightens as size grows: -0.02em at title, -0.03em at
statement, -0.035em at headline, -0.04em at display.

## Layout

Phone first at 360px, then 600px (form field and button go side by side) and 900px (header
grows from 56px to 72px, header nav appears, rows and sections split into two equal columns).
Side gutters are a fluid `clamp(16px, 2.4vw, 32px)` plus the device safe-area insets; sections
are separated by a fluid 96px to 200px. Edge-to-edge bands (header, strip, footer) run full
width with hairlines; content columns are not boxed.

The opening is a sticky full-height (`100dvh`) stage holding the field, with five full-screen
chapters scrolling over it. Chapter text sits at the bottom (phones) or bottom-left (wide); the
field dims its crowd to 25% under that area so copy sits on clean Night, and places the pod
centred in the upper third on phones and right of centre on wide screens (field breakpoint
720px). Rows are the main content grid: on phones `when | title` with the body below; on wide
screens `when | title | body` in 0.35 / 0.65 / 1 fractions so bodies line up with the right
column of the other sections.

Everything fixed to an edge uses `--safe-*`; full-height layouts use `dvh`; touch targets are at
least 44px and form controls 56px.

## Elevation & Depth

Flat. There are no shadows, blurs or gradients anywhere in the build. Depth comes from tone (the
phone preview's Night Raised screen), from hairlines, and from the field itself: a sticky canvas
behind scrolling text.

### Named Rules

**The Flat Dot Rule.** The flat dot is the light. Field dots, the chat dot, separators and the
mark are solid circles; a flash is shown by size and opacity, never by blur, bloom or glow.

## Shapes

Square by default: header cells, the submit block, the input and the skip link have no radius.
Two exceptions carry meaning: the circle (dots, initial discs, marquee separators, the pod's
hairline ring in the field) is a firefly or a person, and the 40px device radius belongs only to
the phone-preview frame. Lines are 1px hairlines; the focused input underline thickens to 2px.
Arrows are thin line icons (1.5 stroke, square caps) drawn to match the hairlines.

## Components

### Block header

Square cells on a Night bar with a hairline bottom, fixed to the top under the safe area. A mark
cell (header-height square, hairline right), a two-line name ("Firefly" over muted
"Vancouver"), two-line nav links on wide screens (muted context over the link, underline on
hover), and a solid Wing invite cell flush right with label and arrow. The invite cell lifts to
wing-hover over 200ms ease-out.

### Two-line label

The world's signature text unit: a muted context line stacked over the white fact (time over
event, "Built in" over "Safety", "Week" over the number). Used in the header, nav, field
caption, phone preview and footer line.

### Hairline rows

An ordered or plain list between hairlines (top on each row, bottom on the list). Timed rows
lead with a muted `when` column; promise rows are `title | body`. No cards, icons or numbers.

### Inputs / Fields

- **Style:** an underline field: transparent, no radius, 1px Muted underline, 56px tall, text at
  1.25rem to 1.75rem (always 16px or more so iOS Safari does not zoom).
- **Focus:** the underline turns 2px Glow; no outline.
- **Error:** the underline and the message turn Error; a one-line message slot is reserved so
  the layout does not jump.

### Buttons

- **Shape:** square block (0 radius), 56px tall, 20px side padding, label and arrow spread apart.
- **Primary (submit):** Glow block, Night text at 500. This is the section's one Glow.
- **Hover / Focus:** glow-hover over 200ms ease-out; focus ring switches to Ink so it shows
  against Glow.
- **Disabled (sending):** Wing Light block, progress cursor.
- **Secondary:** the header invite cell (above). Elsewhere, links are plain text with an arrow.

### Phone preview

A 360px-wide figure: Night Raised screen, hairline border, 40px radius, inner sections divided by
hairlines (event label, pod list of initial discs with name and interests, one prompt, the Glow
chat dot). Always captioned as an example with made-up names. The only rounded rectangle in the
system.

### Fireflies in step (signature)

A canvas field on the sticky story stage: a seeded crowd of Wing Light dots drifting and
blinking independently, and five pod dots that gather into a pentagon, cross-fade from Wing Light
to solid Glow, gain a Muted hairline ring and name labels, and synchronise their flashes as the
coupling rises with scroll. A field caption (two-line event label and a week counter) fades in by
chapter with a 500ms exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`) and an 8px rise.
Pixel ratio is capped at 2; the loop pauses when the canvas is off-screen and resyncs when the
tab returns. With reduced motion, a single still frame shows the pod gathered, lit and in step.
Decorative and hidden from assistive technology: every idea is also in the text.

### Marquee strip

One slow line of headline-size event kinds between hairlines, separated by small Muted dots,
looping over 60s linear. A visually hidden list carries the content once; the animation is off
under reduced motion.

### Footer wordmark

A two-line footer line at lede size, then the mark and "Firefly" at display size with meta
(place, copyright) set small and right-aligned.

## Do's and Don'ts

### Do:

- **Do** keep one Glow element per composition, at full opacity.
- **Do** set display type in Host Grotesk 400 with negative tracking (-0.04em at display).
- **Do** pair a Muted context line over an Ink fact for labels.
- **Do** separate content with 1px hairlines at Wing Light 18%.
- **Do** keep header cells, buttons and inputs square (0 radius).
- **Do** give every motion a still, end-state version under reduced motion, and pause canvas
  loops when off-screen or the tab is hidden.
- **Do** use initials and clearly labelled made-up examples until consenting photography exists.

### Don't:

- **Don't** add shadows, gradients, blur, bloom or glows to dots, the mark or surfaces.
- **Don't** use bold weights for hierarchy; use size.
- **Don't** wrap content in cards; the phone preview is the one framed object.
- **Don't** put Glow text or essential Glow indicators on a light surface.
- **Don't** load fonts from a CDN; Host Grotesk is self-hosted.
- **Don't** invent light-mode tokens from the landing page; the light system is unbuilt.
