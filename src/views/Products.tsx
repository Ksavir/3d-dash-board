import { useMemo } from 'react'
import { BarBreakdown } from '../components/charts/BarBreakdown'
import { TrendLine } from '../components/charts/TrendLine'
import { ChartCard } from '../components/ChartCard'
import { DataTable, type Column } from '../components/DataTable'
import { KpiCard } from '../components/KpiCard'
import { CATEGORIES, addedIn, catalog, change, sum, syntheticSeries, unitsSold } from '../data/mock'
import { fmt } from '../lib/format'
import type { CatalogItem, Period } from '../types'

type Row = CatalogItem & { sold: number }

const columns: Column<Row>[] = [
  { key: 'sku', header: 'SKU', render: (r) => <code className="sku">{r.sku}</code>, sortValue: (r) => r.sku, hideOnMobile: true },
  { key: 'name', header: 'Product', render: (r) => r.name, sortValue: (r) => r.name },
  { key: 'category', header: 'Category', render: (r) => r.category, sortValue: (r) => r.category, hideOnMobile: true },
  { key: 'price', header: 'Price', render: (r) => fmt.currency(r.price), sortValue: (r) => r.price, align: 'right', hideOnMobile: true },
  {
    key: 'margin',
    header: 'Margin',
    render: (r) => fmt.percent((r.price - r.unitCost) / r.price),
    sortValue: (r) => (r.price - r.unitCost) / r.price,
    align: 'right',
    hideOnMobile: true,
  },
  { key: 'sold', header: 'Units sold', render: (r) => fmt.number(r.sold), sortValue: (r) => r.sold, align: 'right' },
  { key: 'created', header: 'Added', render: (r) => fmt.date(r.createdAt), sortValue: (r) => r.createdAt, hideOnMobile: true },
]

export function Products({ period }: { period: Period }) {
  const data = useMemo(() => {
    const rows: Row[] = catalog.map((i) => ({ ...i, sold: unitsSold(i, period) }))
    const top = [...rows].sort((a, b) => b.sold - a.sold)

    const sales = syntheticSeries(
      period,
      Object.fromEntries(
        CATEGORIES.map((c) => [
          c,
          { base: catalog.filter((i) => i.category === c).reduce((a, i) => a + i.monthlySales, 0), growth: 0.025, noise: 0.12, flow: true },
        ]),
      ),
      31,
    )
    const totalOf = (pts: typeof sales.current) => CATEGORIES.reduce((a, c) => a + sum(pts, c), 0)

    return {
      rows,
      top10: top.slice(0, 10).map((r) => ({ label: r.name, units: r.sold })),
      best: top[0],
      added: addedIn(rows, period),
      sales: sales.current,
      soldTotal: totalOf(sales.current),
      soldDelta: change(totalOf(sales.current), totalOf(sales.previous)),
    }
  }, [period])

  return (
    <>
      <div className="kpi-strip">
        <KpiCard label="Products in catalogue" value={fmt.number(data.rows.length)} hint={`${CATEGORIES.length} categories`} />
        <KpiCard
          label="Added this period"
          value={fmt.number(data.added.length)}
          hint={data.added.length ? data.added.map((a) => a.name).join(', ') : 'No new products'}
        />
        <KpiCard
          label="Units sold"
          value={fmt.number(data.soldTotal)}
          delta={data.soldDelta}
          hint="vs. previous period"
          trend={data.sales.map((p) => CATEGORIES.reduce((a, c) => a + Number(p[c]), 0))}
        />
        <KpiCard label="Best seller" value={fmt.number(data.best.sold)} hint={data.best.name} />
      </div>

      <div className="chart-grid">
        <ChartCard title="Units sold by category" subtitle="Trend over the selected period" className="span-2">
          <TrendLine
            data={data.sales}
            series={CATEGORIES.map((c) => ({ key: c, name: c }))}
            format={fmt.number}
            axisFormat={fmt.compact}
          />
        </ChartCard>
        <ChartCard title="Top 10 best sellers" subtitle="Units sold in the period">
          <BarBreakdown
            data={data.top10}
            series={[{ key: 'units', name: 'Units' }]}
            orientation="horizontal"
            format={fmt.number}
            axisFormat={fmt.compact}
            height={360}
            labelWidth={170}
          />
        </ChartCard>
      </div>

      <ChartCard title="Catalogue" subtitle="Selling price and margin over cost">
        <DataTable
          rows={data.rows}
          columns={columns}
          rowKey={(r) => r.sku}
          initialSort={{ key: 'sold', dir: 'desc' }}
          caption="Product catalogue"
          pageSize={12}
        />
      </ChartCard>
    </>
  )
}
