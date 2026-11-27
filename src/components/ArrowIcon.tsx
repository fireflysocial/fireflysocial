interface ArrowIconProps {
  /** `up-right` for "go somewhere", `down` for "keep scrolling". */
  direction?: 'up-right' | 'down' | 'right' | 'left'
}

const PATHS = {
  'up-right': 'M6 18 18 6M8 6h10v10',
  down: 'M12 4v16M5 13l7 7 7-7',
  right: 'M4 12h16M13 5l7 7-7 7',
  left: 'M20 12H4M11 5l-7 7 7 7',
} as const

/** Thin line arrow, drawn to match the page's hairlines. Decorative: the link text says where it goes. */
export function ArrowIcon({ direction = 'up-right' }: ArrowIconProps) {
  return (
    <svg
      className="arrow"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[direction]} />
    </svg>
  )
}
