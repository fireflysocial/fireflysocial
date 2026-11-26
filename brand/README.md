# Brand

![Firefly logo](firefly-logo-512.png)

## The mark

A firefly at rest, seen from above: two folded wings and a glowing tail.

The wings are muted and the glow is the only bright thing in the frame. That's the product in one image: in a dark, quiet room (the "Vancouver Freeze"), Firefly makes one signal visible: *I'm here, and I'm open to meeting people.* Fireflies light up so others like them can find them. The upward chevron of the wings also reads as rising, moving forward.

## Colors

| Name  | Hex       | Use |
|-------|-----------|-----|
| Black | `#050505` | Interface ground on dark surfaces (from 2026-11-25). Warm neutrals sit on it: ink `#F2F2EE`, muted `#9A9A92`, the cloud's warm white Ember `#F2ECCE` |
| Night | `#0E1424` | Inside the logo files, and text on light. No longer an interface colour: the interface has no blue |
| Glow  | `#D9F84A` | The light. In the interface, one Glow highlight per composition. In the firefly cloud it is one of three tones |
| Dusk  | `#C3A0FF` | The cloud's violet (from 2026-11-25). In the interface, a quiet second accent: picked states, "Coming next", separators. 9.5:1 on black. Not blue |
| Wing  | `#313C62` | The mark's wings only, not interface fills |

On light backgrounds, the glow becomes Night and the wings become `#C9CFDE` (see `firefly-mark-light.svg`, which includes an opaque `#F5F6F0` background). Glow on white has too little contrast for text or an essential interface indicator.

## Files

| File | Use |
|------|-----|
| `firefly-logo.svg` / `firefly-logo-512.png` / `firefly-logo-1024.png` | Primary. GitHub org avatar, social profiles, app icon |
| `firefly-mark-transparent.svg` | Mark only, for dark surfaces |
| `firefly-mark-light.svg` | For light surfaces |
| `firefly-mark-mono.svg` | Single-color (Night), for print or embossing |

## Rules

- Don't add gradients, glows, or outer shadows. The flat dot *is* the light.
- Keep the primary glow chartreuse; the supplied light and monochrome variants are the exceptions.
- Keep clear space of at least the glow's radius around the mark.

## Typeface

**Host Grotesk** (SIL Open Font License; licence in `src/assets/fonts/OFL.txt`), a clean neo-grotesk used for everything from display to small labels. It is self-hosted, never loaded from a font CDN. Display type is set large and tight (about -0.04em tracking) in regular weight; size, not boldness, carries hierarchy. Adopted 2026-11-25 with the landing page; [DESIGN.md](../DESIGN.md) holds the full type scale.

## The motif: fireflies in step

Some firefly species flash at random when apart and gradually flash in unison when they stay together. Firefly uses that as its visual story: a dark field of faint, independently blinking dots (strangers), five of which gather into a pod, turn Glow and fall into step week by week. It's the brand promise, repetition becoming connection, made visible. On the landing page it is modelled with the Kuramoto synchrony model (`src/lib/fireflies/`).

- **The cloud** (from 2026-11-25, after the Lugano Living Lab reference): thousands of tiny flat squares in Glow, Dusk and Ember (`#F2ECCE`, warm white), placed in clumps and dark voids by noise and drifting like smoke along a curl-noise flow. It thins to near-black behind text. When the pod gathers, the cloud dims so the five solid-Glow pod-mates stand out.
- **Stir:** a pointer or finger moving through the dark parts the cloud and makes it eddy.
- **Call and response:** tapping the dark makes nearby fireflies flash back in a ripple, as real fireflies answer a signal. A single hairline ring marks the tap.
- Dots are flat circles. A flash is shown by size and opacity, never by blur or bloom.
- With reduced motion, show the end state: the pod gathered, lit and in step.
