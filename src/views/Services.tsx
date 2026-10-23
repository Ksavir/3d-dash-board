import { useMemo } from 'react'
import { Donut } from '../components/charts/Donut'
import { TrendLine } from '../components/charts/TrendLine'
import { ChartCard } from '../components/ChartCard'
import { DataTable, type Column } from '../components/DataTable'
import { KpiCard } from '../components/KpiCard'
import { StatusBadge } from '../components/StatusBadge'
import { SERVICE_TYPES, change, ordersIn, ordersSeries } from '../data/mock'
import { fmt } from '../lib/format'
import type { Order, Period } from '../types'

const columns: Column<Order>[] = [
  { key: 'id', header: 'Order', render: (r) => <code className="sku">{r.id}</code>, sortValue: (r) => r.id, hideOnMobile: true },
  { key: 'client', header: 'Client', render: (r) => r.client, sortValue: (r) => r.client },
  { key: 'service', header: 'Service', render: (r) => r.service, sortValue: (r) => r.service, hideOnMobile: true },
  { key: 'date', header: 'Date', render: (r) => fmt.date(r.date), sortValue: (r) => r.date, hideOnMobile: true },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} />, sortValue: (r) => r.status },
  { key: 'amount', header: 'Amount', render: (r) => fmt.currency(r.amount), sortValue: (r) => r.amount, align: 'right' },
]

function stats(list: Order[]) {
  const valid = list.filter((o) => o.status !== 'Cancelled')
  const done = list.filter((o) => o.status === 'Completed')
  return {
    orders: valid.length,
    revenue: valid.reduce((a, o) => a + o.amount, 0),
    lead: done.length ? done.reduce((a, o) => a + o.leadDays, 0) / done.length : 0,
    completion: list.length ? done.length / list.length : 0,
  }
}

export function Services({ period }: { period: Period }) {
  const data = useMemo(() => {
    const list = ordersIn(period)
    const cur = stats(list)
    const prev = stats(ordersIn(period, 1))
    const valid = list.filter((o) => o.status !== 'Cancelled')
    const mix = SERVICE_TYPES.map((s) => ({ name: s, value: valid.filter((o) => o.service === s).length }))
    return { list, cur, prev, mix, series: ordersSeries(period) }
  }, [period])

  const { cur, prev } = data

  return (
    <>
      <div className="kpi-strip">
        <KpiCard
          label="Orders"
          value={fmt.number(cur.orders)}
          delta={change(cur.orders, prev.orders)}
          hint="vs. previous period"
          trend={data.series.map((p) => Number(p.orders))}
        />
        <KpiCard
          label="Average lead time"
          value={`${cur.lead.toFixed(1)} days`}
          delta={change(cur.lead, prev.lead)}
          upIsGood={false}
          hint="completed orders"
        />
        <KpiCard
          label="Completion rate"
          value={fmt.percent(cur.completion)}
          delta={change(cur.completion, prev.completion)}
          hint="of all orders received"
        />
        <KpiCard
          label="Revenue"
          value={fmt.currency(cur.revenue)}
          delta={change(cur.revenue, prev.revenue)}
          hint="vs. previous period"
          trend={data.series.map((p) => Number(p.revenue))}
        />
      </div>

      <div className="chart-grid">
        <ChartCard title="Orders received" subtitle="Excludes cancelled orders" className="span-2">
          <TrendLine data={data.series} series={[{ key: 'orders', name: 'Orders' }]} format={fmt.number} />
        </ChartCard>
        <ChartCard title="Orders by service">
          <Donut data={data.mix} format={fmt.number} centerValue={fmt.number(cur.orders)} centerLabel="orders" />
        </ChartCard>
      </div>

      <ChartCard title="Orders this period" subtitle={`${fmt.number(data.list.length)} orders, newest first`}>
        <DataTable
          rows={data.list}
          columns={columns}
          rowKey={(r) => r.id}
          initialSort={{ key: 'date', dir: 'desc' }}
          caption="Service orders in the selected period"
        />
      </ChartCard>
    </>
  )
}
