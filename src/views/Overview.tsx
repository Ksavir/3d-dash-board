import { useMemo } from 'react'
import { BarBreakdown } from '../components/charts/BarBreakdown'
import { TrendLine } from '../components/charts/TrendLine'
import { ChartCard } from '../components/ChartCard'
import { DataTable, type Column } from '../components/DataTable'
import { KpiCard } from '../components/KpiCard'
import { StatusBadge } from '../components/StatusBadge'
import { StockMeter } from '../components/StockMeter'
import {
  CATEGORIES,
  addedIn,
  catalog,
  change,
  ordersIn,
  ordersSeries,
  stockStatus,
  syntheticSeries,
  unitsSold,
} from '../data/mock'
import { fmt } from '../lib/format'
import type { CatalogItem, Order, Period } from '../types'

const alertColumns: Column<CatalogItem>[] = [
  { key: 'name', header: 'Product', render: (r) => r.name, sortValue: (r) => r.name },
  { key: 'stock', header: 'Stock', render: (r) => <StockMeter stock={r.stock} min={r.min} />, sortValue: (r) => r.stock / r.min },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={stockStatus(r)} /> },
]

const orderColumns: Column<Order>[] = [
  {
    key: 'client',
    header: 'Client',
    render: (r) => (
      <div className="cell-stack">
        <span>{r.client}</span>
        <span className="cell-sub">{r.service}</span>
      </div>
    ),
  },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'amount', header: 'Amount', render: (r) => fmt.currency(r.amount), align: 'right' },
]

export function Overview({ period }: { period: Period }) {
  const data = useMemo(() => {
    const current = ordersIn(period)
    const previous = ordersIn(period, 1)
    const valid = (list: Order[]) => list.filter((o) => o.status !== 'Cancelled')
    const revenue = (list: Order[]) => valid(list).reduce((a, o) => a + o.amount, 0)
    const completed = (list: Order[]) => list.filter((o) => o.status === 'Completed').length

    const inventoryValue = catalog.reduce((a, i) => a + i.stock * i.unitCost, 0)
    const valueSeries = syntheticSeries(period, { value: { base: inventoryValue, growth: 0.012, noise: 0.03 } }, 7)
    const lastCur = Number(valueSeries.current.at(-1)?.value ?? 0)
    const lastPrev = Number(valueSeries.previous.at(-1)?.value ?? 0)

    const active = catalog.filter((i) => i.active)
    const series = ordersSeries(period)

    const byCategory = CATEGORIES.map((c) => ({
      label: c,
      units: catalog.filter((i) => i.category === c).reduce((a, i) => a + unitsSold(i, period), 0),
    }))

    return {
      revenue: revenue(current),
      revenueDelta: change(revenue(current), revenue(previous)),
      completed: completed(current),
      completedDelta: change(completed(current), completed(previous)),
      inventoryValue,
      inventoryDelta: change(lastCur, lastPrev),
      valueTrend: valueSeries.current.map((p) => Number(p.value)),
      activeCount: active.length,
      added: addedIn(active, period).length,
      series,
      byCategory,
      alerts: catalog.filter((i) => stockStatus(i) !== 'In stock'),
      recent: current.slice(0, 6),
    }
  }, [period])

  return (
    <>
      <div className="kpi-strip">
        <KpiCard
          label="Service revenue"
          value={fmt.currency(data.revenue)}
          delta={data.revenueDelta}
          hint="vs. previous period"
          trend={data.series.map((p) => Number(p.revenue))}
        />
        <KpiCard
          label="Services completed"
          value={fmt.number(data.completed)}
          delta={data.completedDelta}
          hint="vs. previous period"
          trend={data.series.map((p) => Number(p.orders))}
        />
        <KpiCard
          label="Inventory value"
          value={fmt.currency(data.inventoryValue)}
          delta={data.inventoryDelta}
          hint="at cost, today"
          trend={data.valueTrend}
        />
        <KpiCard
          label="Active products"
          value={fmt.number(data.activeCount)}
          hint={data.added ? `${data.added} added this period` : 'None added this period'}
        />
      </div>

      <div className="chart-grid">
        <ChartCard title="Service revenue" subtitle="Excludes cancelled orders" className="span-2">
          <TrendLine
            data={data.series}
            series={[{ key: 'revenue', name: 'Revenue' }]}
            format={fmt.currency}
            axisFormat={fmt.currencyCompact}
          />
        </ChartCard>
        <ChartCard title="Units sold by category" subtitle="Catalogue products">
          <BarBreakdown
            data={data.byCategory}
            series={[{ key: 'units', name: 'Units' }]}
            format={fmt.number}
            axisFormat={fmt.compact}
          />
        </ChartCard>
      </div>

      <div className="split-grid">
        <ChartCard title="Stock alerts" subtitle={`${data.alerts.length} products below minimum or out of stock`}>
          <DataTable
            rows={data.alerts}
            columns={alertColumns}
            rowKey={(r) => r.sku}
            initialSort={{ key: 'stock', dir: 'asc' }}
            caption="Products with low or no stock"
          />
        </ChartCard>
        <ChartCard title="Recent orders" aside={<a href="#/services" className="panel__link">View all</a>}>
          <DataTable rows={data.recent} columns={orderColumns} rowKey={(r) => r.id} caption="Most recent service orders" />
        </ChartCard>
      </div>
    </>
  )
}
