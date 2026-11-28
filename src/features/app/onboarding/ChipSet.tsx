import { toggle } from '../../../lib/onboarding.ts'
import { Chip } from '../ui/Chip.tsx'

interface ChipSetProps<T extends string> {
  /** Names the group for screen readers, and is shown above it unless `hideLabel`. */
  label: string
  hideLabel?: boolean
  options: readonly { id: T; label: string }[]
  picked: readonly T[]
  onChange: (picked: T[]) => void
}

/** Tap any: a group of toggle chips. */
export function ChipSet<T extends string>({
  label,
  hideLabel = false,
  options,
  picked,
  onChange,
}: ChipSetProps<T>) {
  return (
    <div className="a-chips" role="group" aria-label={label}>
      {!hideLabel && <h2 className="a-chips__label">{label}</h2>}
      {options.map((option) => (
        <Chip
          key={option.id}
          pressed={picked.includes(option.id)}
          onToggle={() => {
            onChange(toggle(picked, option.id))
          }}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  )
}
