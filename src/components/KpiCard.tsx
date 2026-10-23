import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { fmt } from '../lib/format'

interface Props {
  label: string
  value: string
  /** Variación relativa contra el período anterior (0.12 = +12 %). */
  delta?: number | null
  /** Si subir es bueno (ingresos) o malo (artículos agotados). */
  upIsGood?: boolean
  /** Contexto corto bajo la cifra, p. ej. "vs. 30 días anteriores". */
  hint?: string
  trend?: number[]
}

export function KpiCard({ label, value, delta, upIsGood = true, hint, trend }: Props) {
  const hasDelta = delta !== undefined && delta !== null
  const flat = hasDelta && Math.abs(delta) < 0.0005
  const up = hasDelta && delta > 0
  const tone = !hasDelta || flat ? 'neutral' : up === upIsGood ? 'good' : 'bad'
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight

  return (
    <article className="kpi">
      <h3 className="kpi__label">{label}</h3>
      <div className="kpi__row">
        <p className="kpi__value">{value}</p>
        {trend && trend.length > 1 && <Sparkline values={trend} />}
      </div>
      <p className="kpi__meta">
        {hasDelta && (
          <span className={`delta delta--${tone}`}>
            <Icon size={14} strokeWidth={2.25} aria-hidden />
            {fmt.signedPercent(delta)}
          </span>
        )}
        {hint && <span className="kpi__hint">{hint}</span>}
      </p>
    </article>
  )
}

/** Mini tendencia sin ejes: solo la forma, la cifra principal ya da el valor. */
function Sparkline({ values }: { values: number[] }) {
  const w = 88
  const h = 32
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 3 - ((v - min) / span) * (h - 6)])
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
