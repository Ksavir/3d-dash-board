import type { Period } from '../../types'

const PERIODS: { value: Period; label: string }[] = [
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '12m', label: '12 months' },
]

interface Props {
  title: string
  description: string
  period: Period
  onPeriodChange: (p: Period) => void
}

export function PageHeader({ title, description, period, onPeriodChange }: Props) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-desc">{description}</p>
      </div>
      <div className="segmented" role="radiogroup" aria-label="Time period">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            role="radio"
            aria-checked={period === p.value}
            onClick={() => onPeriodChange(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
