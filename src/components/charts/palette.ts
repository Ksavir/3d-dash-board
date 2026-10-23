import { useTheme } from '../../hooks/useTheme'

/**
 * Colores de las gráficas por tema. Recharts necesita valores concretos para SVG,
 * así que viven aquí en lugar de en CSS. Orden categórico fijo y validado
 * para daltonismo (azul, naranja, aguamarina, amarillo) en ambos modos.
 */
const PALETTE = {
  light: {
    series: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100'],
    surface: '#ffffff',
    grid: '#eceeeb',
    axis: '#cdd1cd',
    tick: '#6b7176',
    cursor: 'rgba(21, 25, 28, 0.05)',
  },
  dark: {
    series: ['#3987e5', '#d95926', '#199e70', '#c98500'],
    surface: '#17191b',
    grid: '#24282a',
    axis: '#3a3f42',
    tick: '#8c9290',
    cursor: 'rgba(242, 244, 243, 0.06)',
  },
}

export type ChartPalette = (typeof PALETTE)['light']

export function useChartPalette(): ChartPalette {
  return PALETTE[useTheme()]
}

/** Props comunes de los ejes para mantener un estilo discreto en todas las gráficas. */
export function axisProps(p: ChartPalette) {
  return {
    tickLine: false,
    axisLine: { stroke: p.axis },
    tick: { fill: p.tick, fontSize: 12 },
    tickMargin: 8,
  } as const
}
