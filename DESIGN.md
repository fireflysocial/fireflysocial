---
name: Firefly
description: Events across your city that fit you, and next, the people going too.
colors:
  black: '#050505'
  glow: '#D9F84A'
  glow-hover: '#E6FF7A'
  dusk: '#C3A0FF'
  ink: '#F2F2EE'
  ink-hover: '#FFFFFF'
  muted: '#9A9A92'
  placeholder: '#7F7F78'
  raised: '#111111'
  rule: 'rgb(242 242 238 / 0.13)'
  rule-strong: 'rgb(242 242 238 / 0.28)'
  ember: '#F2ECCE'
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
    backgroundColor: '{colors.dusk}'
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

Firefly's world is a dark city full of small lights, and one of them answers you. Soft black runs
edge to edge. The first screen is a civic poster in two halves (revised 2026-11-26): a night
meadow of line-drawn grass where yellow fireflies float and glow, and a giant "Firefly"
wordmark with the Firefly mark beside it. Further down, the story's
swarm is a deep field in three tones (Glow, Dusk violet and Ember warm white). Over it sits a civic, almost municipal grotesk layer: very large, tight Host Grotesk in
warm white, small two-line labels, hairline rules and solid square cells. Nothing is decorated.
Hierarchy comes from size and from the muted-over-ink pairing, not from weight, colour or
containers.

The interface has no blue (decided 2026-11-25). Black is the ground and the neutrals are warm.
Dusk is violet, not blue: it comes from the cloud and returns in the interface as a quiet second
accent for state and for "Coming next". Night and Wing survive only inside the logo files, and
the mark keeps its own colours wherever it appears as the mark itself, including the hero's
lockup beside the wordmark. The landing page (`src/features/landing/`) is
always dark regardless of the visitor's setting, a confirmed exception. App screens will follow
the system light/dark setting, but no light system has been built, so this file records no
light-mode tokens; the root stylesheet's light defaults are placeholders.

Motion is drawn from real fireflies, and kept quiet (revised 2026-11-26: quick flashes read as
"constant flashing"). Every light wanders its own slow loop round a fixed home, so nothing
streaks or bunches; fireflies glow and dim slowly, each on its own 6s to 11s rhythm. Brush: a
pointer or finger moving through the meadow bends the grass aside and eases the fireflies away,
and both spring back; every firefly it wakes falls into step with one shared 2.6s beat. Call and response: tap the meadow and the fireflies nearby glow back in a
ripple. Falling into step: on scroll, five strangers
gather, turn solid Glow and synchronise (Kuramoto coupling) while the cloud dims around them. Every motion has a still frame. There is no photography; example events and the
example pod are synthetic and say so, and features that have not launched carry a "Coming next"
label.

**Key Characteristics:**

- Soft black ground edge to edge; warm neutrals; no blue in the interface.
- One Glow highlight per screen in the interface, always solid. The cloud is atmosphere.
- Dusk violet as the quiet second accent: picked state, "Coming next", separators.
- Host Grotesk only, regular weight, tight negative tracking; size carries hierarchy.
- Two-line labels: a context line over the warm-white fact.
- Hairline rules and square cells instead of cards, shadows or gradients.
- Flat squares, dots and hairline grass; the only soft light is a firefly's halo as it glows.
- Phone first from 360px; everything readable with the motion switched off.

## Colors

Warm near-monochrome on soft black, with one chartreuse light, one quiet violet and a field of
three-tone motes.

### Primary

- **Glow** (glow): the light. In the interface, exactly one Glow highlight per screen: the
  best-fit dot in the feed demo, the pod in the story field, the invite submit block. Also the
  focus ring, the input focus underline, the text caret and text selection, which appear only on
  interaction. Its hover, Glow Hover (glow-hover), is used only on the submit block. In the cloud,
  Glow is one of three mote tones.

### Secondary

- **Dusk** (dusk): the cloud's violet, a quiet second accent (9.5:1 on black). Picked interest
  chips (a solid Dusk block with black text), the "Coming next" tag on the story HUD, and the
  marquee separators. In the cloud, the violet tone: 15% to 65% of the non-Ember motes depending
  on region, so some clumps lean violet and others yellow.

### Neutral

- **Soft Black** (black): every ground, the header bar, text on Ink, Dusk and Glow, the browser
  theme colour in dark mode.
- **Raised** (raised): the one raised surface, the drawn phone's screen. Depth by tone, never by
  shadow.
- **Ink** (ink): warm-white primary text, the fact line of every two-line label, and the solid
  fill of the header invite cell and the skip link. Its hover is pure white (ink-hover), used only
  on the invite cell.
- **Muted** (muted): context lines, ledes, row bodies, sources, captions, the input underline at
  rest, the disabled submit block, and the pod's names and ring in the field.
- **Placeholder** (placeholder): input placeholder text only; dimmer than Muted so it reads as a
  hint.
- **Rule** (rule): Ink at 13%; every hairline (header bottom, mark-cell divider, row separators,
  strip borders, feed separators, footer top).
- **Rule Strong** (rule-strong): Ink at 28%; edges that frame a control or object (unpicked chip
  border, the phone screen's edge).
- **Ember** (ember): the cloud's warm white, 16% of its motes; the colour a pod-mate has before
  it lights; and the tap ring, drawn at 14%. Canvas only.
- **Device Bezel / Device Island** (device-bezel, device-island): the drawn phone's frame and
  camera island; nowhere else.
- **Error Coral** (error): an invalid email's message and input underline.
- **Mark Wing** (mark-wing): the wings of the Firefly mark only. Never an interface fill, text or
  rule.

### Named Rules

**The One Light Rule.** Each screen of interface has exactly one Glow highlight: in the feed demo
the best-fit dot, in the story the pod, in the invite section the submit block. The hero has no
Glow interface element; its light is the cloud. Glow motes in the cloud are atmosphere and do
not count, but no interface element other than the one highlight may be Glow.

**The Quiet Dusk Rule.** Dusk marks state and what is coming; it never competes with Glow. It is
never the call to action, never the best-fit signal, never the pod. If a reader's eye goes to
Dusk before Glow, Dusk is doing too much.

**The No Blue Rule.** The interface has no blue. Grounds are black, neutrals are warm, Dusk is
violet. Night and Wing exist only inside the mark, which keeps its own colours.

**The Solid Glow Rule.** Glow as a highlight is drawn at full opacity; dimmed Glow turns olive.
Lit pod dots flash by swelling, not fading. (Cloud motes step through brightness; they are not a
highlight.)

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

The phone's one-line heading ("For you this week") sits between Item and Title at 1.5rem, 1.2
line height, -0.02em. The only weight above 400 is 500: the header invite cell, the submit block,
the phone status bar and the field's canvas name labels.

### Named Rules

**The Size Not Weight Rule.** Hierarchy is carried by size and by the muted/ink pairing. Display
and headline stay at 400; nothing on the page is bold.

**The Tight Display Rule.** Tracking tightens as size grows: -0.01em at item and input, -0.02em
at title, -0.03em at statement, -0.035em at headline, -0.04em at display.

## Layout

Phone first at 360px, then 600px (form field and button side by side), 720px (the field's wide
layout) and 900px (header grows from 56px to 72px, header nav appears, rows, the feed demo and
the invite body split into two equal columns). Side gutters are a fluid `clamp(16px, 2.4vw,
32px)` plus the safe-area insets; sections are separated by a fluid 96px to 200px. Edge-to-edge
bands (header, strip, footer) run full width with hairlines; content columns are not boxed.

The page opens on a full-height (`100dvh`) hero in two halves, after the Lugano Living Lab poster
grammar (revised 2026-11-26). Phones and tablets below 900px stack it: the meadow edge to edge on
top (at least `clamp(240px, 40dvh, 420px)`, growing to take any spare height so a tall tablet has
no dead gap), a hairline, a row of three words spread across the width ("Events", "People",
"Your city"), then the wordmark lockup, the H1 at statement size, the muted intro and the scroll
cue. From 900px the meadow takes the right half (1.08fr), full height and edge to edge on the
right, behind a hairline; the left half sets the three words at the top and the lockup, H1,
intro and cue at the foot. The wordmark is sized to its column (`26cqi` stacked, `24cqi` wide,
capped at 10.5rem), Host Grotesk 400 at -0.055em, with the mark's slot (0.72em tall, at the
mark's proportions) beside it. The feed demo puts heading, lede and chips left and the drawn
phone right, top-aligned so the chips never move under the pointer as the feed changes height.
The "Coming next" story is a sticky full-height stage with five full-screen chapters scrolling
over it; chapter text sits low (phones) or low-left (wide), and the pod sits centred in the upper
third on phones or right of centre on wide screens. A HUD across the top of the stage keeps the
"Coming next" label visible through every chapter and fades in the week counter. Each caption sits on
a small solid black plate (6px by 10px padding), so the cloud never runs through its letters.

The field keeps text legible by placement, not by panels. The cloud spends its motes in the open
band above the text and thins behind it: brightness falls to 6% from 42% of the field's height on
phones (50% on wide screens), and the bottom 8% fades to nothing so the field has no hard lower
edge.

Rows are the main content grid: on phones `when | title` with the body below; on wide screens
`when | title | body` in 0.35 / 0.65 / 1 fractions so bodies line up with the right column of
the other sections.

Everything fixed to an edge uses `--safe-*`; full-height layouts use `dvh`; touch targets are at
least 44px and form controls 56px.

## Elevation & Depth

Flat. There are no shadows, blurs or gradients anywhere in the build. Depth comes from tone (the
phone's Raised screen inside its Device Bezel, drawn as a solid 8px outline, not a shadow), from
hairlines, and from the field itself: a canvas of motes behind the text, dimming where text sits.

### Named Rules

**The Flat Light Rule.** Every light is flat, with one exception. Dust motes and the mark are
solid squares; the pod, the best-fit dot and the marquee separators are solid circles; a flash on
any of them is shown by size and brightness. The exception (approved 2026-11-26, "soft halo,
flashes only"): a firefly in the field glows with a soft radial halo while it flashes, drawn
under its flat core. Nothing else in the system gets blur, bloom or glow.

## Shapes

Square by default: header cells, chips, the submit block, the input and the skip link have no
radius, and the cloud's motes are tiny squares, so the field shares the interface's square
geometry. The circle carries meaning: a dot is a signal or a person (the pod, the best-fit dot,
separators, the pod's hairline ring, the tap ring). Rounded rectangles belong only to the drawn
phone: the screen (48px), the camera island (13px), the battery and home indicator (3px). Lines
are 1px hairlines; the focused input underline thickens to 2px. Arrows are thin line icons (1.5
stroke, square caps) drawn to match the hairlines.

## Components

### Block header

Square cells on a black bar with a hairline bottom, fixed to the top under the safe area. A mark
cell (header-height square, hairline right), the name ("Firefly"),
two-line nav links on wide screens (muted context over the link, underline on hover), and a
solid warm-white invite cell flush right with black 500 text and an arrow. The invite cell lifts
to pure white over 200ms ease-out; its focus ring is black, inset 4px, so it shows on Ink.

### Two-line label

The world's signature text unit: a context line stacked over the ink fact ("Thu · 7 pm · Free"
over the event title, "Built in" over "Safety", "Week" over the number). The context line is
Muted; on the story HUD the "Coming next" context line is Dusk, marking something not yet
launched. Used in the header, nav, feed items, story HUD and footer line.

### Hairline rows

An ordered or plain list between hairlines (top on each row, bottom on the list). Timed rows
lead with a muted `when` column; promise rows are `title | body`. No cards, icons or numbers. A
row describing something unlaunched uses "Coming next" as its `when`.

### Chips

- **Style:** square toggle buttons, 44px tall, 16px side padding, Body size, transparent with a
  Rule Strong border and Ink text.
- **State:** `aria-pressed`; picked is a solid Dusk block with black text. Hover sharpens the
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
at 55% Ink. Inside, a one-line heading ("For you this week") and a short ranked list (four
events) separated by hairlines: muted "when · price" over an Item-size title, a small muted
place, and a one-line reason. Only the top event's reason carries the 8px Glow dot. Reordering
glides through view transitions (420ms, `cubic-bezier(0.16, 1, 0.3, 1)`) where supported, and
not under reduced motion; a visually hidden status line announces the top pick. Always captioned
as example events. The only rounded object in the system.

### Night meadow (hero, signature)

A canvas over the whole hero, drawing only inside the `.hero__meadow` frame (clipped to it),
re-measured whenever the frame resizes.

- **Grass:** `width / 3.5` plants (80 to 320), in three layers back to front (40%, 35%, 25%),
  filled in Muted at 16%, 24% and 36% alpha. Blades are tapered quadratic curves 1.6px to 4px at
  the base, 16% to 46% of the meadow's height (the back layer grows to 55% of that, the middle to
  75%); about one in eight is a hairline seed stem (42% to 72%) with five to eight 1.3px seed
  dots at its tip. One wind swell crosses the meadow every 9s, 1.4 swells wide, swaying each plant
  3% to 7% of its height round its own lean. The back and middle layers are drawn under the
  fireflies' light and the front layer over it.
- **Fireflies:** all Glow. `area / 5000` (30 to 90) round flat cores in the meadow, floating
  mostly round the grass tips (none in the top 8% or the roots), and `area / 1500` (60 to 380)
  specks of faint, flat, distant dust. A firefly rests at 14% and glows to full over about a
  second and a half, then fades more slowly (`fireflyGlow`: rise over 16% of its cycle, fade with
  a 15% time constant), every 6s to 11s, with a soft halo (radius 9px to 28px by depth, drawn
  additively at 80%). Lights fade out over the last 28px of the meadow's frame.
- **Brush:** a hand's whole path since the last frame is sampled every 12px; each plant whose
  upper part the path passes within 90px of bends away from the nearest point, up to 50% of its
  height, and springs back upright (stiffness 18/s², damping 3.2/s, a little sway as it
  settles). The fireflies are stirred as in the story's swarm, more gently (80px reach, 110px/s
  push), and tapping the meadow makes the fireflies within 180px glow back, rippling at 260px/s.
  `.hero__meadow` sets `touch-action: pan-y pinch-zoom`; only the meadow listens, never the text.
- **Logo:** the real mark (`FireflyMark cropped`: Wing wings, a Glow tail, flat) stands beside
  the wordmark from the first frame, with no animation (revised 2026-11-26: the user preferred
  the plain logo to lights gathering into it). The cropped viewBox (`125.7 95 260.6 326`) is the
  mark's true extent (the outer wing arcs bulge to x 126.7 and 385.3; the tail's foot is at y 420) plus one unit of clear space. Its slot (0.72em tall, aspect 260.6 / 326) stands on the
  wordmark's baseline, so the tail's foot sits on it and the wing tips meet the cap height.
- **Reduced motion:** one still frame of the meadow, no hint, no listening.

### Firefly swarm (story)

The "Coming next" story's canvas swarm on black, rebuilt 2026-11-26 after the earlier curl-noise
drift slowly combed the cloud into long filaments. Nothing follows a shared current: every light
has a fixed home and wanders its own slow loop round it (two sine terms per axis), so the swarm
keeps its shape for as long as the page is open.

- **Dust** (area / 240, 1,200 to 5,200): tiny flat squares (side 1.1px to 2.5px), mostly far
  (depth skewed low), looping 4px to 16px over 28s to 60s. Brightness scales with depth (35% to
  85%) under a gentle shimmer plus a brief spark. Tones: 16% Ember; of the rest, Dusk takes 15% to
  65% by region and Glow the remainder.
- **Fireflies** (area / 1,700, 140 to 560): round flat cores (radius 0.8px to 1.7px by depth),
  looping 16px to 62px over 16s to 40s. 70% Glow, 20% Ember, 10% Dusk. They glow slowly, as in
  the meadow, resting at 10%, with a soft radial halo (radius 7px to 24px by depth, peak alpha
  0.5) drawn additively under the cores, so overlapping lights pool.
- **Placement:** seeded fractal Perlin noise places homes in soft groves with open dark between
  them (a 12% floor for dust and 30% for fireflies keeps a scatter in the voids), weighted towards
  the open band above the text. Once the pod forms, the swarm clears inside the pod's ring (to
  8%, with a soft edge), so the five names sit on clean black.
- **Drawing:** 12 brightness steps batched by tone and shape; nothing under 1/16 brightness is
  drawn, so the ground behind text and at the field's edge stays clean black. Pixel ratio is
  capped at 2, the loop pauses off-screen and on tab hide, and the canvas is decorative and
  hidden from assistive technology: every idea is also in the text.
- **Home and offset:** every mote has a fixed home, its wander round it, and a pixel offset
  from it. Interaction only moves the offset; a damped spring (stiffness 11/s², damping 4.6/s,
  damping ratio about 0.7, so it heals in about 2s with no visible bounce) pulls it back, so the
  cloud parts and heals and is never scarred by a pass. There is no hard limit on the offset,
  which would pile motes into a visible ridge.
- **Stir:** a hand moving through the dark sweeps every mote within 90px of its whole path since
  the last frame (every pointer event, up to 12), not just its end point, so a fast move leaves
  one smooth wake rather than a row of holes. Each mote eases (quadratic falloff, the same at any
  frame rate) towards moving with the hand at 20% of its speed (capped at 1,600px/s) plus up to
  160px/s out of its way. The outward push scales with hand speed (full at 600px/s) and fades as
  a mote gets further from home, so a slow, jittering or circling hand leaves a soft eddy rather
  than digging a ringed hole. Motes right on the path part to alternate sides. A pointer that
  has stopped, or only just arrived, does not stir. A cancelled
  pointer (the browser taking a touch to scroll) ends the path. (The story's sticky stage is
  scrolled through, so there a hand stirs only as it moves.)
- **Waking into step:** a stirred mote wakes (fully across most of the reach, fading only at its
  edge; decaying with a 4s time constant, about two beats) and is pulled into step with one
  shared beat (2.6s per flash, Kuramoto coupling 9/s scaled by how awake it is). On the beat a
  woken mote brightens by up to 0.35 over its own resting light and grows up to 1.25x, then
  drifts back to its own rhythm as it falls asleep. The wake lifts only motes that are already
  showing: it never reveals one the text clearance hides, and answers to a call are limited by
  the same clearance, so nothing ever flashes behind text. The beat is the mark's tail: what a hand passes through
  falls into step with Firefly.
- **Call and response:** tapping the dark (not a link or control) makes motes within 220px
  answer, nearest first, rippling at 340px/s. Each answering mote brightens and swells up to 1.4x
  for 0.5s either side of its peak. One 1px Ember ring at 14% marks the call and fades as it
  reaches its edge.
- **Falling into step (story):** five pod-mates gather into a pentagon, cross-fade from Ember to
  solid Glow, gain a Muted hairline ring at 40% and muted 500 name labels, and synchronise as
  coupling rises with scroll. The cloud dims by 55% while the pod is lit. Lit pod dots flash by
  swelling.
- **Reduced motion:** a still frame, with no stir or call: the story's end state, the pod
  gathered, lit and in step.

### Story HUD

Top of the sticky stage: the two-line label with a Dusk "Coming next" tag, always shown, and a
right-aligned "Week" counter at Statement size. Items fade in with a 500ms exponential ease-out
and an 8px rise.

### Marquee strip

One slow line of headline-size event kinds between hairlines, separated by small Dusk dots,
looping over 60s linear. A visually hidden list carries the content once; the animation is off
under reduced motion.

### Footer wordmark

A two-line footer line at lede size, then the mark and "Firefly" at display size with meta
(place, copyright) set small and right-aligned.

## Do's and Don'ts

### Do:

- **Do** keep one Glow highlight per screen in the interface, at full opacity.
- **Do** use Dusk only as a quiet second accent: picked state, "Coming next", separators.
- **Do** keep the interface blue-free: black grounds and warm neutrals; Night and Wing only
  inside the mark.
- **Do** set display type in Host Grotesk 400 with negative tracking (-0.04em at display).
- **Do** pair a context line over an Ink fact for labels.
- **Do** separate content with 1px hairlines at Ink 13%, and frame controls with Ink 28%.
- **Do** keep header cells, chips, buttons and inputs square (0 radius).
- **Do** thin the field behind text instead of putting text on a panel.
- **Do** give every motion a still version under reduced motion, and pause canvas loops when
  off-screen or the tab is hidden.
- **Do** label example events and the example pod as made up, and unlaunched features as
  "Coming next".

### Don't:

- **Don't** add shadows, gradients, blur, bloom or glows to dust, dots, the mark or surfaces (a flashing firefly's halo is the one exception).
- **Don't** make Dusk a call to action or a highlight that competes with Glow.
- **Don't** use bold weights for hierarchy; use size.
- **Don't** wrap content in cards; the drawn phone is the one framed object.
- **Don't** use Night, Wing or any blue as an interface fill, text or rule colour.
- **Don't** put Glow text or essential Glow indicators on a light surface.
- **Don't** load fonts from a CDN; Host Grotesk is self-hosted.
- **Don't** invent light-mode tokens from the landing page; the light system is unbuilt.
