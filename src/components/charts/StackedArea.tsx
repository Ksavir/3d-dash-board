import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Point } from '../../types'
import { ChartTooltip } from './ChartTooltip'
import { Legend } from './Legend'
import type { SeriesDef } from './TrendLine'
import { axisProps, useChartPalette } from './palette'

interface Props {
  data: Point[]
  series: SeriesDef[]
  format: (v: number) => string
  axisFormat?: (v: number) => string
  height?: number
}

/** Composición en el tiempo: cada banda es una categoría y la altura total es la suma. */
export function StackedArea({ data, series, format, axisFormat = format, height = 260 }: Props) {
  const p = useChartPalette()
  const axis = axisProps(p)

  return (
    <div>
      <Legend items={series.map((s, i) => ({ name: s.name, color: p.series[i] }))} />
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={p.grid} />
          <XAxis dataKey="label" {...axis} minTickGap={24} />
          <YAxis {...axis} axisLine={false} width={56} tickFormatter={axisFormat} />
          <Tooltip
            cursor={{ stroke: p.axis, strokeWidth: 1 }}
            content={(props) => <ChartTooltip {...props} format={format} showTotal />}
          />
          {series.map((s, i) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stackId="1"
              // El trazo del color de la superficie crea la separación de 2px entre bandas.
              stroke={p.surface}
              strokeWidth={2}
              fill={p.series[i]}
              fillOpacity={0.85}
              activeDot={false}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
