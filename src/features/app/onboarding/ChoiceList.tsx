export interface Choice<T extends string> {
  id: T
  label: string
  hint?: string
}

interface ChoiceListProps<T extends string> {
  /** Radio group name, unique on the page. */
  name: string
  choices: readonly Choice<T>[]
  value: T | null
  onChange: (value: T) => void
  /** The id of the element that names the group; the step's question by default. */
  labelledBy?: string
}

/** Pick one: square radio rows (DESIGN.md "Checks"), each with an optional quiet hint. */
export function ChoiceList<T extends string>({
  name,
  choices,
  value,
  onChange,
  labelledBy = 'step-title',
}: ChoiceListProps<T>) {
  return (
    <fieldset className="checks choices" aria-labelledby={labelledBy}>
      {choices.map((choice) => (
        <label key={choice.id} className="check">
          <input
            type="radio"
            name={name}
            value={choice.id}
            checked={value === choice.id}
            onChange={() => {
              onChange(choice.id)
            }}
          />
          <span className="choice">
            <span>{choice.label}</span>
            {choice.hint && <span className="small small--muted">{choice.hint}</span>}
          </span>
        </label>
      ))}
    </fieldset>
  )
}
