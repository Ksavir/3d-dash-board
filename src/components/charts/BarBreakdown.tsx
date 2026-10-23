import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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
  /** `horizontal` = barras horizontales, útil para rankings con nombres largos. */
  orientation?: 'vertical' | 'horizontal'
  categoryKey?: string
  height?: number
  /** Ancho reservado para las etiquetas de categoría en modo horizontal. */
  labelWidth?: number
}

export function BarBreakdown({
  data,
  series,
  format,
  axisFormat = format,
  orientation = 'vertical',
  categoryKey = 'label',
  height = 260,
  labelWidth = 150,
}: Props) {
  const p = useChartPalette()
  const axis = axisProps(p)
  const horizontal = orientation === 'horizontal'
  // Extremo de datos redondeado (4px), anclado a la línea base.
  const radius: [number, number, number, number] = horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]

  return (
    <div>
      {series.length > 1 && (
        <Legend items={series.map((s, i) => ({ name: s.name, color: p.series[i] }))} />
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          barGap={2}
          barCategoryGap={horizontal ? '28%' : '24%'}
        >
          <CartesianGrid horizontal={!horizontal} vertical={horizontal} stroke={p.grid} />
          {horizontal ? (
            <>
              <XAxis type="number" {...axis} axisLine={false} tickFormatter={axisFormat} />
              <YAxis
                type="category"
                dataKey={categoryKey}
                {...axis}
                width={labelWidth}
                interval={0}
                tick={{ ...axis.tick, width: labelWidth - 8 }}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={categoryKey} {...axis} minTickGap={16} interval={data.length <= 8 ? 0 : 'preserveEnd'} />
              <YAxis {...axis} axisLine={false} width={56} tickFormatter={axisFormat} />
            </>
          )}
          <Tooltip cursor={{ fill: p.cursor }} content={(props) => <ChartTooltip {...props} format={format} />} />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={p.series[i]}
              radius={radius}
              maxBarSize={horizontal ? 16 : 22}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
