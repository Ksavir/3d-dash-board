import { useId } from 'react'
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Point } from '../../types'
import { ChartTooltip } from './ChartTooltip'
import { Legend } from './Legend'
import { axisProps, useChartPalette } from './palette'

export interface SeriesDef {
  key: string
  name: string
}

interface Props {
  data: Point[]
  series: SeriesDef[]
  format: (v: number) => string
  axisFormat?: (v: number) => string
  height?: number
}

/**
 * Tendencia en el tiempo. Con una serie se dibuja como área suave; con varias, como líneas
 * con leyenda. Un solo eje Y: nunca mezclar magnitudes distintas en la misma gráfica.
 */
export function TrendLine({ data, series, format, axisFormat = format, height = 260 }: Props) {
  const p = useChartPalette()
  const gradientId = useId()
  const axis = axisProps(p)
  const single = series.length === 1
  const tooltip = (
    <Tooltip
      cursor={{ stroke: p.axis, strokeWidth: 1 }}
      content={(props) => <ChartTooltip {...props} format={format} />}
    />
  )
  const common = (
    <>
      <CartesianGrid vertical={false} stroke={p.grid} />
      <XAxis dataKey="label" {...axis} minTickGap={24} />
      <YAxis {...axis} axisLine={false} width={56} tickFormatter={axisFormat} />
      {tooltip}
    </>
  )

  return (
    <div>
      {!single && (
        <Legend items={series.map((s, i) => ({ name: s.name, color: p.series[i] }))} />
      )}
      <ResponsiveContainer width="100%" height={height}>
        {single ? (
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={p.series[0]} stopOpacity={0.18} />
                <stop offset="100%" stopColor={p.series[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            {common}
            <Area
              type="monotone"
              dataKey={series[0].key}
              name={series[0].name}
              stroke={p.series[0]}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 4, stroke: p.surface, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            {common}
            {series.map((s, i) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={p.series[i]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: p.surface, strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
