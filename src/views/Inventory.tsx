import { useMemo } from 'react'
import { BarBreakdown } from '../components/charts/BarBreakdown'
import { StackedArea } from '../components/charts/StackedArea'
import { ChartCard } from '../components/ChartCard'
import { DataTable, type Column } from '../components/DataTable'
import { KpiCard } from '../components/KpiCard'
import { StatusBadge } from '../components/StatusBadge'
import { StockMeter } from '../components/StockMeter'
import { CATEGORIES, catalog, change, stockStatus, sum, syntheticSeries } from '../data/mock'
import { fmt } from '../lib/format'
import type { CatalogItem, Period, StockStatus } from '../types'

const STATUS_ORDER: Record<StockStatus, number> = { 'Out of stock': 0, Low: 1, 'In stock': 2 }

const columns: Column<CatalogItem>[] = [
  { key: 'sku', header: 'SKU', render: (r) => <code className="sku">{r.sku}</code>, sortValue: (r) => r.sku, hideOnMobile: true },
  { key: 'name', header: 'Product', render: (r) => r.name, sortValue: (r) => r.name },
  { key: 'category', header: 'Category', render: (r) => r.category, sortValue: (r) => r.category, hideOnMobile: true },
  { key: 'stock', header: 'Stock', render: (r) => <StockMeter stock={r.stock} min={r.min} />, sortValue: (r) => r.stock },
  { key: 'min', header: 'Minimum', render: (r) => fmt.number(r.min), sortValue: (r) => r.min, align: 'right', hideOnMobile: true },
  { key: 'value', header: 'Value', render: (r) => fmt.currency(r.stock * r.unitCost), sortValue: (r) => r.stock * r.unitCost, align: 'right', hideOnMobile: true },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={stockStatus(r)} />, sortValue: (r) => STATUS_ORDER[stockStatus(r)] },
]

export function Inventory({ period }: { period: Period }) {
  const data = useMemo(() => {
    const units = catalog.reduce((a, i) => a + i.stock, 0)
    const low = catalog.filter((i) => stockStatus(i) !== 'In stock')
    const out = low.filter((i) => i.stock === 0).length
    const dailySales = catalog.reduce((a, i) => a + i.monthlySales, 0) / 30

    // Nivel de stock por categoría (unidades), anclado al stock real de hoy.
    const stockSpecs = Object.fromEntries(
      CATEGORIES.map((c) => [
        c,
        { base: catalog.filter((i) => i.category === c).reduce((a, i) => a + i.stock, 0), growth: 0.01, noise: 0.05 },
      ]),
    )
    const stock = syntheticSeries(period, stockSpecs, 11)
    const totalAt = (p?: Record<string, unknown>) => CATEGORIES.reduce((a, c) => a + Number(p?.[c] ?? 0), 0)

    const monthlyOut = catalog.reduce((a, i) => a + i.monthlySales, 0)
    const flows = syntheticSeries(
      period,
      {
        incoming: { base: monthlyOut * 1.04, growth: 0.02, noise: 0.18, flow: true },
        outgoing: { base: monthlyOut, growth: 0.02, noise: 0.1, flow: true },
      },
      23,
    )

    return {
      skus: catalog.length,
      units,
      unitsDelta: change(totalAt(stock.current.at(-1)), totalAt(stock.previous.at(-1))),
      unitsTrend: stock.current.map(totalAt),
      low: low.length,
      out,
      coverage: Math.round(units / dailySales),
      stock: stock.current,
      flows: flows.current,
      inTotal: sum(flows.current, 'incoming'),
      outTotal: sum(flows.current, 'outgoing'),
    }
  }, [period])

  return (
    <>
      <div className="kpi-strip">
        <KpiCard label="SKUs in catalogue" value={fmt.number(data.skus)} hint={`${CATEGORIES.length} categories`} />
        <KpiCard
          label="Units in stock"
          value={fmt.number(data.units)}
          delta={data.unitsDelta}
          hint="vs. previous period"
          trend={data.unitsTrend}
        />
        <KpiCard label="Below minimum" value={fmt.number(data.low)} hint={`${data.out} out of stock`} />
        <KpiCard label="Stock coverage" value={`${data.coverage} days`} hint="at the current sales rate" />
      </div>

      <div className="chart-grid">
        <ChartCard title="Stock by category" subtitle="Units at the end of each interval" className="span-2">
          <StackedArea
            data={data.stock}
            series={CATEGORIES.map((c) => ({ key: c, name: c }))}
            format={fmt.number}
            axisFormat={fmt.compact}
          />
        </ChartCard>
        <ChartCard
          title="Incoming and outgoing"
          subtitle={`${fmt.number(data.inTotal)} in, ${fmt.number(data.outTotal)} out`}
        >
          <BarBreakdown
            data={data.flows}
            series={[
              { key: 'incoming', name: 'Incoming' },
              { key: 'outgoing', name: 'Outgoing' },
            ]}
            format={fmt.number}
            axisFormat={fmt.compact}
          />
        </ChartCard>
      </div>

      <ChartCard title="Stock by SKU" subtitle="The vertical tick marks each product's minimum stock">
        <DataTable
          rows={catalog}
          columns={columns}
          rowKey={(r) => r.sku}
          initialSort={{ key: 'status', dir: 'asc' }}
          caption="Stock by SKU"
          pageSize={12}
        />
      </ChartCard>
    </>
  )
}
