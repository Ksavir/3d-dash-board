interface TooltipEntry {
  name?: string | number
  value?: unknown
  color?: string
  dataKey?: unknown
  payload?: unknown
}

interface Props {
  active?: boolean
  payload?: ReadonlyArray<TooltipEntry>
  label?: string | number
  format: (v: number) => string
  /** Muestra el total cuando hay varias series apiladas. */
  showTotal?: boolean
}

export function ChartTooltip({ active, payload, label, format, showTotal }: Props) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((acc, e) => acc + Number(e.value ?? 0), 0)
  return (
    <div className="chart-tooltip">
      {label !== undefined && <div className="chart-tooltip__label">{label}</div>}
      <ul>
        {payload.map((e) => (
          <li key={String(e.dataKey ?? e.name)}>
            {payload.length > 1 && <span className="swatch" style={{ background: e.color }} aria-hidden />}
            {payload.length > 1 && <span className="chart-tooltip__name">{e.name}</span>}
            <span className="chart-tooltip__value">{format(Number(e.value ?? 0))}</span>
          </li>
        ))}
      </ul>
      {showTotal && payload.length > 1 && (
        <div className="chart-tooltip__total">
          <span>Total</span>
          <span className="chart-tooltip__value">{format(total)}</span>
        </div>
      )}
    </div>
  )
}
