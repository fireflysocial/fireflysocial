interface FireflyMarkProps {
  className?: string
  /** Accessible name. Leave empty when the mark sits next to the word "Firefly". */
  title?: string
  /**
   * Crop to the mark's own extent (wing tips to the tail's foot) instead of its square canvas,
   * for a lockup where the mark sits flush beside the word. Its proportions are then 260.6 by 326,
   * with one unit of clear space round the outer wing arcs and the tail (see BOUNDS in mark.ts).
   */
  cropped?: boolean
}

/** The square canvas of the mark files, and the mark's own extent within it. */
const SQUARE = '0 0 512 512'
const CROPPED = '125.7 95 260.6 326'

/**
 * The Firefly mark (brand/firefly-mark-transparent.svg): two folded Wing-coloured wings and a
 * flat Glow tail. For dark surfaces. Never add gradients, glows or shadows to it.
 */
export function FireflyMark({ className, title, cropped = false }: FireflyMarkProps) {
  const labelled = title !== undefined && title !== ''
  return (
    <svg
      className={className}
      viewBox={cropped ? CROPPED : SQUARE}
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? title : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
    >
      <path d="M249,96 A200,200 0 0 1 132,326 A200,200 0 0 1 249,96 Z" fill="#313C62" />
      <path d="M380,326 A200,200 0 0 1 263,96 A200,200 0 0 1 380,326 Z" fill="#313C62" />
      <circle cx="256" cy="348" r="72" fill="#D9F84A" />
    </svg>
  )
}
