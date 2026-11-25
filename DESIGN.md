---
name: Firefly
description: Events across Vancouver that fit you, and next, the people going too.
colors:
  black: '#050505'
  glow: '#D9F84A'
  glow-hover: '#E6FF7A'
  ink: '#F2F2EE'
  ink-hover: '#FFFFFF'
  muted: '#9A9A92'
  placeholder: '#7F7F78'
  raised: '#111111'
  rule: 'rgb(242 242 238 / 0.13)'
  rule-strong: 'rgb(242 242 238 / 0.28)'
  firefly-white: '#E9E6CF'
  device-bezel: '#1C1C1A'
  device-island: '#000000'
  error: '#FF9A8A'
  mark-wing: '#313C62'
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
  input:
    fontFamily: 'Host Grotesk, system-ui, Segoe UI, Roboto, sans-serif'
    fontSize: 'clamp(1.25rem, 4vw, 1.75rem)'
    fontWeight: 400
    letterSpacing: '-0.01em'
  item:
    fontFamily: 'Host Grotesk, system-ui, Segoe UI, Roboto, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 400
    letterSpacing: '-0.01em'
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
  device: '48px'
  island: '13px'
  device-detail: '3px'
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
    backgroundColor: '{colors.ink}'
    textColor: '{colors.black}'
    typography: '{typography.label}'
    rounded: '{rounded.none}'
    padding: '0 clamp(16px, 2.4vw, 32px)'
    height: '{spacing.header}'
  header-cell-invite-hover:
    backgroundColor: '{colors.ink-hover}'
  button-submit:
    backgroundColor: '{colors.glow}'
    textColor: '{colors.black}'
    typography: '{typography.body}'
    rounded: '{rounded.none}'
    padding: '0 20px'
    height: '{spacing.control}'
  button-submit-hover:
    backgroundColor: '{colors.glow-hover}'
  button-submit-disabled:
    backgroundColor: '{colors.muted}'
    textColor: '{colors.black}'
  chip:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.none}'
    padding: '0 16px'
    height: '{spacing.target}'
  chip-picked:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.black}'
  input-underline:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    typography: '{typography.input}'
    rounded: '{rounded.none}'
    padding: '0 0 8px'
    height: '{spacing.control}'
  device-phone:
    backgroundColor: '{colors.raised}'
    textColor: '{colors.ink}'
    rounded: '{rounded.device}'
    padding: '14px 22px 40px'
    width: '360px'
  device-island:
    backgroundColor: '{colors.device-island}'
    rounded: '{rounded.island}'
    width: '92px'
    height: '26px'
  feed-best-fit-dot:
    backgroundColor: '{colors.glow}'
    rounded: '{rounded.dot}'
    size: '8px'
---

# Design System: Firefly

## Overview

**Creative North Star: "Fireflies in Step"**

Firefly's world is a dark city with one light that answers you. Soft black runs edge to edge;
strangers are warm firefly-white dots drifting and blinking on their own; the only bright thing in
any composition is Glow. Over it sits a civic, almost municipal grotesk layer: very large, tight
Host Grotesk in warm white, small two-line labels, hairline rules and solid square cells. Nothing
is decorated. Hierarchy comes from size and from the muted-over-ink pairing, not from weight,
colour or containers.

The interface has no blue (decided 2026-11-25). Black is the ground; every neutral is warm (ink,
muted, rules and the crowd all sit near hue 105). Night and Wing survive only inside the logo
files, and the mark keeps its own colours wherever it appears. The landing page
(`src/features/landing/`) is always dark regardless of the visitor's setting, a confirmed
exception. App screens will follow the system light/dark setting, but no light system has been
built, so this file records no light-mode tokens; the root stylesheet's light defaults are
placeholders.

Motion is two ideas, both drawn from real fireflies. Call and response: tap the dark and the
nearby crowd flashes back in a ripple. Falling into step: on scroll, five strangers gather, turn
Glow and synchronise (Kuramoto coupling). Everything else is near-still, and every motion has a
still frame. There is no photography; example events and the example pod are synthetic and say
so, and features that have not launched carry a "Coming next" label.

**Key Characteristics:**

- Soft black ground edge to edge; warm neutrals only; no blue in the interface.
- One Glow per composition, always solid.
- Host Grotesk only, regular weight, tight negative tracking; size carries hierarchy.
- Two-line labels: muted context line over the warm-white fact.
- Hairline rules and square cells instead of cards, shadows or gradients.
- Flat dots: a flash is size and opacity, never blur or bloom.
- Phone first from 360px; everything readable with the motion switched off.

## Colors

Warm near-monochrome on soft black, with one chartreuse light; every colour except Glow is a
shade of warm white at some strength.

### Primary

- **Glow** (glow): the light. Exactly one per composition: the best-fit dot in the feed demo, the
  pod in the story field, the invite submit block. Also the focus ring, the input focus underline,
  the text caret and text selection, which appear only on interaction. Its hover, Glow Hover
  (glow-hover), is used only on the submit block.

### Neutral

- **Soft Black** (black): every ground, the header bar, text on Ink and on Glow, the browser
  theme colour in dark mode.
- **Raised** (raised): the one raised surface, the drawn phone's screen. Depth by tone, never by
  shadow.
- **Ink** (ink): warm-white primary text, the second line of every two-line label, and the solid
  fill of the header invite cell and picked chips. Its hover is pure white (ink-hover), used only
  on the invite cell.
- **Muted** (muted): context lines, ledes, row bodies, sources, captions, the input underline at
  rest, the disabled submit block, the marquee separators and the pod's names and ring in the
  field.
- **Placeholder** (placeholder): input placeholder text only; dimmer than Muted so it reads as a
  hint.
- **Rule** (rule): Ink at 13%; every hairline (header bottom, mark-cell divider, row separators,
  strip borders, feed separators, footer top).
- **Rule Strong** (rule-strong): Ink at 28%; edges that frame a control or object (unpicked chip
  border, the phone screen's edge).
- **Firefly White** (firefly-white): the crowd in the field, drawn at 12% to 94% opacity as it
  blinks, and the tap ring at 12%.
- **Device Bezel / Device Island** (device-bezel, device-island): the drawn phone's frame and
  camera island; nowhere else.
- **Error Coral** (error): an invalid email's message and input underline.
- **Mark Wing** (mark-wing): the wings of the Firefly mark only. Never an interface fill, text or
  rule.

### Named Rules

**The One Light Rule.** Each composition has exactly one Glow element. In the feed demo it is the
best-fit dot; in the story it is the pod; in the invite section it is the submit block. The hero
has none: it is the crowd alone. If a second Glow appears on screen, one of them is wrong.

**The No Blue Rule.** The interface has no blue. Grounds are black, neutrals are warm. Night and
Wing exist only inside the mark, which keeps its own colours.

**The Solid Glow Rule.** Glow over black is drawn at full opacity; dimmed Glow turns olive. Lit
pod dots flash by swelling, not fading.

**The No Glow on Paper Rule.** Glow never carries text or an essential indicator on a light
surface; on light, the glow becomes Night (brand/README.md).

## Typography

**Display Font:** Host Grotesk variable, 300 to 800, self-hosted (latin and latin-ext woff2,
`font-display: swap`), falling back to system-ui, Segoe UI, Roboto, sans-serif.
**Body Font:** the same family.

**Character:** one clean neo-grotesk from 6rem display to 13px labels, set like civic signage:
big, tight, regular weight, warm white on black. Tabular figures are on across the page.

### Hierarchy

- **Display** (400, 2.75rem to 6rem by 13vw, 0.94, -0.04em): the H1 (max 13ch), the invite H2,
  and the footer wordmark (at 0.9 line height and -0.045em). Balanced wrapping.
- **Headline** (400, 2.25rem to 4.5rem, 1, -0.035em): section H2s and the marquee line.
- **Statement** (400, 1.875rem to 3.5rem, 1.06, -0.03em, max 20ch): each story chapter's single
  sentence, and the week number on the story HUD.
- **Title** (400, 1.375rem to 2rem, 1.15, -0.02em): row titles (H3).
- **Lede** (400, 1.1875rem to 1.5rem, 1.4, 34 to 38ch): the hero intro, chapter notes, section
  ledes, the footer line. Muted except the hero intro.
- **Input** (400, 1.25rem to 1.75rem, -0.01em): the email field; always 16px or more so iOS
  Safari does not zoom.
- **Item** (400, 1.125rem, -0.01em): feed event titles, and row bodies on wide screens.
- **Body** (400, 1.0625rem, 1.5; 52ch in rows): row bodies, chips, the submit label.
- **Label** (400, 0.9375rem, 1.2 to 1.3): two-line labels, header and nav, form label and
  messages, the scroll cue.
- **Small** (400, 0.8125rem, 1.4): sources, captions, feed places and reasons, the phone status
  bar, footer meta.

The only weight above 400 is 500: the header invite cell, the submit block, the phone status bar
and the field's canvas name labels.

### Named Rules

**The Size Not Weight Rule.** Hierarchy is carried by size and by the muted/ink pairing. Display
and headline stay at 400; nothing on the page is bold.

**The Tight Display Rule.** Tracking tightens as size grows: -0.01em at item and input, -0.02em
at title, -0.03em at statement, -0.035em at headline, -0.04em at display.

## Layout

Phone first at 360px, then 600px (form field and button side by side) and 900px (header grows
from 56px to 72px, header nav appears, rows, the feed demo and the invite body split into two
equal columns). Side gutters are a fluid `clamp(16px, 2.4vw, 32px)` plus the safe-area insets;
sections are separated by a fluid 96px to 200px. Edge-to-edge bands (header, strip, footer) run
full width with hairlines; content columns are not boxed.

The page opens on a full-height (`100dvh`) hero: the field behind, the H1 and intro low, and a
foot row with a small muted tap hint left and the scroll cue right. On wide screens the intro sits
beside the H1 in a 22rem column. The feed demo puts heading, lede and chips left and the drawn
phone right, top-aligned so the chips never move under the pointer as the feed changes height.
The "Coming next" story is a sticky full-height stage with five full-screen chapters scrolling
over it; chapter text sits low (phones) or low-left (wide), the field dims the crowd to 25% under
that area, and the pod sits centred in the upper third on phones or right of centre on wide
screens (field breakpoint 720px). A HUD across the top of the stage keeps the two-line "Coming
next" label visible through every chapter and fades in the week counter.

Rows are the main content grid: on phones `when | title` with the body below; on wide screens
`when | title | body` in 0.35 / 0.65 / 1 fractions so bodies line up with the right column of
the other sections.

Everything fixed to an edge uses `--safe-*`; full-height layouts use `dvh`; touch targets are at
least 44px and form controls 56px.

## Elevation & Depth

Flat. There are no shadows, blurs or gradients anywhere in the build. Depth comes from tone (the
phone's Raised screen inside its Device Bezel, drawn as a solid 8px outline, not a shadow), from
hairlines, and from the field itself: a canvas behind the text.

### Named Rules

**The Flat Dot Rule.** The flat dot is the light. Field dots, the best-fit dot, marquee
separators and the mark are solid circles; a flash is shown by size and opacity, never by blur,
bloom or glow.

## Shapes

Square by default: header cells, chips, the submit block, the input and the skip link have no
radius. The circle carries meaning: a dot is a firefly or a signal (field dots, the best-fit dot,
separators, the pod's hairline ring, the tap ring). Rounded rectangles belong only to the drawn
phone: the screen (48px), the camera island (13px), the battery and home indicator (3px). Lines
are 1px hairlines; the focused input underline thickens to 2px. Arrows are thin line icons (1.5
stroke, square caps) drawn to match the hairlines.

## Components

### Block header

Square cells on a black bar with a hairline bottom, fixed to the top under the safe area. A mark
cell (header-height square, hairline right), a two-line name ("Firefly" over muted "Vancouver"),
two-line nav links on wide screens (muted context over the link, underline on hover), and a
solid warm-white invite cell flush right with black 500 text and an arrow. The invite cell lifts
to pure white over 200ms ease-out; its focus ring is black, inset 4px, so it shows on Ink.

### Two-line label

The world's signature text unit: a muted context line stacked over the ink fact ("This week" over
"For you", "Coming next" over the example, "Built in" over "Safety", "Week" over the number).
Used in the header, nav, feed items, story HUD and footer line.

### Hairline rows

An ordered or plain list between hairlines (top on each row, bottom on the list). Timed rows
lead with a muted `when` column; promise rows are `title | body`. No cards, icons or numbers. A
row describing something unlaunched uses "Coming next" as its `when`.

### Chips

- **Style:** square toggle buttons, 44px tall, 16px side padding, Body size, transparent with a
  Rule Strong border and Ink text.
- **State:** `aria-pressed`; picked is a solid Ink block with black text. Hover sharpens the
  border to Ink; press scales to 0.97. Colour changes run 180ms ease-out.

### Inputs / Fields

- **Style:** an underline field: transparent, no radius, 1px Muted underline, 56px tall, Input
  size, Glow caret.
- **Focus:** the underline turns 2px Glow; no outline.
- **Error:** the underline and the message turn Error Coral; a one-line message slot is reserved
  so the layout does not jump.

### Buttons

- **Shape:** square block (0 radius), 56px tall, 20px side padding, label and arrow spread apart.
- **Primary (submit):** Glow block, black text at 500. This is the section's one Glow.
- **Hover / Focus:** Glow Hover over 200ms ease-out; focus ring switches to Ink so it shows
  against Glow.
- **Disabled (sending):** Muted block, progress cursor.
- **Secondary:** the header invite cell (above). Elsewhere, links are plain text with an arrow,
  like the scroll cue.

### Drawn phone with ranked feed (signature)

A phone drawn in code, max 360px wide: a Raised screen with a Rule Strong edge and 48px radius,
an 8px Device Bezel outline, a status bar (time, camera island, battery), and a home indicator
at 55% Ink. Inside, a two-line heading and a short ranked list (four events) separated by
hairlines: muted "when · price" over an Item-size title, a small muted place, and a one-line
reason. Only the top event's reason carries the 8px Glow dot. Reordering glides through view
transitions (420ms, `cubic-bezier(0.16, 1, 0.3, 1)`) where supported, and not under reduced
motion; a visually hidden status line announces the top pick. Always captioned as example
events. The only rounded object in the system.

### Firefly field (signature)

A canvas of warm firefly-white dots on black, drifting and blinking independently; crowd size
scales with area (90 to 380). Pixel ratio is capped at 2, the loop pauses off-screen and on tab
hide, and it is decorative and hidden from assistive technology: every idea is also in the text.

- **Call and response:** tapping the dark (not a link or control) makes crowd dots within 200px
  answer, nearest first, rippling at 320px/s. Each answering dot swells up to 2.6x and brightens
  for 0.55s either side of its peak. One hairline ring in Firefly White at 12% marks the call and
  fades as it reaches its edge. Off under reduced motion.
- **Falling into step (story):** five crowd dots gather into a pentagon, cross-fade to solid
  Glow, gain a 35% Muted hairline ring and muted 500 name labels, and synchronise as coupling
  rises with scroll. The crowd dims by 40% as the pod lights. Lit pod dots flash by swelling.
- **Reduced motion:** still frames. The hero shows the crowd only; the story shows its end state,
  the pod gathered, lit and in step.

### Story HUD

Top of the sticky stage: the two-line "Coming next" label, always shown, and a right-aligned
"Week" counter at Statement size. Items fade in with a 500ms exponential ease-out and an 8px
rise.

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
- **Do** keep the interface blue-free: black grounds and warm neutrals; Night and Wing only
  inside the mark.
- **Do** set display type in Host Grotesk 400 with negative tracking (-0.04em at display).
- **Do** pair a Muted context line over an Ink fact for labels.
- **Do** separate content with 1px hairlines at Ink 13%, and frame controls with Ink 28%.
- **Do** keep header cells, chips, buttons and inputs square (0 radius).
- **Do** give every motion a still version under reduced motion, and pause canvas loops when
  off-screen or the tab is hidden.
- **Do** label example events and the example pod as made up, and unlaunched features as
  "Coming next".

### Don't:

- **Don't** add shadows, gradients, blur, bloom or glows to dots, the mark or surfaces.
- **Don't** use bold weights for hierarchy; use size.
- **Don't** wrap content in cards; the drawn phone is the one framed object.
- **Don't** use Night, Wing or any blue as an interface fill, text or rule colour.
- **Don't** put Glow text or essential Glow indicators on a light surface.
- **Don't** load fonts from a CDN; Host Grotesk is self-hosted.
- **Don't** invent light-mode tokens from the landing page; the light system is unbuilt.
