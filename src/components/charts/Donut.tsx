import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { fmt } from '../../lib/format'
import { ChartTooltip } from './ChartTooltip'
import { Legend } from './Legend'
import { useChartPalette } from './palette'

interface Props {
  data: { name: string; value: number }[]
  format: (v: number) => string
  /** Texto principal en el centro, normalmente el total. */
  centerValue: string
  centerLabel: string
  height?: number
}

/** Reparto de un total (máx. ~5 partes). La leyenda lleva valor y porcentaje para no depender del color. */
export function Donut({ data, format, centerValue, centerLabel, height = 220 }: Props) {
  const p = useChartPalette()
  const total = data.reduce((acc, d) => acc + d.value, 0)

  return (
    <div className="donut">
      <div className="donut__chart" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="96%"
              paddingAngle={1.5}
              stroke={p.surface}
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {data.map((d, i) => (
                <Cell key={d.name} fill={p.series[i % p.series.length]} />
              ))}
            </Pie>
            <Tooltip content={(props) => <ChartTooltip {...props} format={format} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut__center" aria-hidden>
          <span className="donut__value">{centerValue}</span>
          <span className="donut__label">{centerLabel}</span>
        </div>
      </div>
      <Legend
        items={data.map((d, i) => ({
          name: d.name,
          color: p.series[i % p.series.length],
          value: total ? `${format(d.value)} (${fmt.percent(d.value / total)})` : format(d.value),
        }))}
      />
    </div>
  )
}
