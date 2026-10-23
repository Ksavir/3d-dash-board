/**
 * Datos simulados del MVP.
 *
 * Todo lo que muestra el panel sale de este archivo. Cuando existan datos reales,
 * basta con sustituir estas funciones por llamadas a la API manteniendo los mismos tipos.
 */
import type { CatalogItem, Category, Order, OrderStatus, Period, Point, ServiceType, StockStatus } from '../types'

export const CATEGORIES: Category[] = ['Filaments', 'Resins', 'Adhesives', 'Spare parts']
export const SERVICE_TYPES: ServiceType[] = ['On-demand printing', 'Prototyping', '3D scanning', 'Consulting']

/** Fecha de referencia: los datos se generan hacia atrás desde hoy. */
const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

/* ------------------------------------------------------------------ */
/* Generador pseudoaleatorio con semilla: mismos datos en cada recarga */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function daysAgo(n: number): string {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

/* ------------------------------------------------------------------ */
/* Catálogo / inventario                                               */
/* ------------------------------------------------------------------ */

type Seed = [sku: string, name: string, category: Category, stock: number, min: number, cost: number, price: number, sales: number, ageDays: number]

const CATALOG_SEED: Seed[] = [
  ['FIL-PLA-BK', 'PLA 1.75 mm black 1 kg', 'Filaments', 420, 120, 9.5, 21.9, 310, 620],
  ['FIL-PLA-WH', 'PLA 1.75 mm white 1 kg', 'Filaments', 365, 120, 9.5, 21.9, 270, 620],
  ['FIL-PETG-CL', 'PETG 1.75 mm clear 1 kg', 'Filaments', 88, 100, 11.2, 25.5, 190, 540],
  ['FIL-ABS-GY', 'ABS 1.75 mm grey 1 kg', 'Filaments', 140, 60, 10.1, 23.0, 95, 700],
  ['FIL-TPU-95', 'TPU 95A flexible 500 g', 'Filaments', 52, 40, 13.4, 29.9, 64, 300],
  ['FIL-PA12-NT', 'Nylon PA12 natural 750 g', 'Filaments', 0, 30, 24.0, 52.0, 38, 210],
  ['FIL-PLA-CF', 'PLA carbon fibre 1 kg', 'Filaments', 61, 35, 18.6, 39.9, 47, 45],
  ['RES-STD-GY', 'Standard resin grey 1 L', 'Resins', 132, 50, 16.0, 34.9, 120, 480],
  ['RES-TGH-BK', 'Tough resin black 1 L', 'Resins', 34, 40, 27.5, 59.0, 58, 360],
  ['RES-ABS-LK', 'ABS-like resin white 1 L', 'Resins', 77, 40, 21.0, 45.0, 66, 150],
  ['RES-WSH-CL', 'Water-washable resin 1 L', 'Resins', 12, 30, 19.5, 41.5, 41, 25],
  ['ADH-PLA-50', 'Bed adhesive for PLA 50 ml', 'Adhesives', 610, 200, 3.8, 14.9, 540, 900],
  ['ADH-PETG-50', 'Bed adhesive for PETG 50 ml', 'Adhesives', 280, 150, 4.1, 15.9, 260, 820],
  ['ADH-PA-50', 'Bed adhesive for nylon 50 ml', 'Adhesives', 95, 80, 4.6, 17.9, 110, 760],
  ['ADH-PP-50', 'Bed adhesive for PP 50 ml', 'Adhesives', 0, 60, 5.2, 19.9, 72, 400],
  ['ADH-HT-50', 'High-temp bed adhesive 50 ml', 'Adhesives', 158, 60, 5.9, 21.9, 85, 60],
  ['REP-NZ-04', 'Brass nozzle 0.4 mm', 'Spare parts', 900, 250, 0.6, 3.5, 420, 980],
  ['REP-NZ-HS06', 'Hardened steel nozzle 0.6 mm', 'Spare parts', 140, 60, 3.2, 11.9, 70, 500],
  ['REP-PEI-235', 'Flexible PEI plate 235 mm', 'Spare parts', 46, 50, 12.0, 32.0, 52, 450],
  ['REP-PTFE-1M', 'PTFE tube 1 m', 'Spare parts', 310, 100, 1.1, 5.9, 150, 850],
  ['REP-FEP-200', 'FEP film 200 × 140 mm', 'Spare parts', 74, 60, 2.4, 9.9, 90, 330],
  ['REP-GT2-2M', 'GT2 belt 2 m', 'Spare parts', 0, 40, 1.8, 7.5, 33, 680],
]

export const catalog: CatalogItem[] = CATALOG_SEED.map(
  ([sku, name, category, stock, min, unitCost, price, monthlySales, ageDays]) => ({
    sku,
    name,
    category,
    stock,
    min,
    unitCost,
    price,
    monthlySales,
    createdAt: daysAgo(ageDays),
    active: true,
  }),
)

export function stockStatus(item: Pick<CatalogItem, 'stock' | 'min'>): StockStatus {
  if (item.stock === 0) return 'Out of stock'
  if (item.stock < item.min) return 'Low'
  return 'In stock'
}

export const PERIOD_DAYS: Record<Period, number> = { '30d': 30, '90d': 90, '12m': 365 }

export const PERIOD_LABEL: Record<Period, string> = {
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '12m': 'Last 12 months',
}

/** Productos dados de alta dentro del período. */
export function addedIn<T extends Pick<CatalogItem, 'createdAt'>>(items: T[], period: Period): T[] {
  const cutoff = TODAY.getTime() - PERIOD_DAYS[period] * 86400000
  return items.filter((i) => new Date(i.createdAt + 'T00:00:00').getTime() >= cutoff)
}

/** Unidades vendidas de un producto en el período, con una pequeña variación estable. */
export function unitsSold(item: CatalogItem, period: Period): number {
  const rand = mulberry32(hash(item.sku + period))
  const months = PERIOD_DAYS[period] / 30
  return Math.round(item.monthlySales * months * (0.88 + rand() * 0.24))
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/* ------------------------------------------------------------------ */
/* Órdenes de servicio                                                 */
/* ------------------------------------------------------------------ */

const CLIENTS = [
  'Alameda Engineering', 'North Workshop', 'Bright Dental', 'Forma Studio', 'Valletta University',
  'Andes Robotics', 'MedTech Lab', 'Flatline Architects', 'Kiwi Toys', 'Rivers Auto Parts',
  'Clear Optics', 'Makers Hub',
]

const SERVICE_PROFILE: Record<ServiceType, { weight: number; ticket: number; lead: number }> = {
  'On-demand printing': { weight: 0.46, ticket: 180, lead: 3 },
  Prototyping: { weight: 0.28, ticket: 620, lead: 6 },
  '3D scanning': { weight: 0.16, ticket: 340, lead: 2 },
  Consulting: { weight: 0.1, ticket: 950, lead: 8 },
}

function pickService(r: number): ServiceType {
  let acc = 0
  for (const s of SERVICE_TYPES) {
    acc += SERVICE_PROFILE[s].weight
    if (r <= acc) return s
  }
  return SERVICE_TYPES[0]
}

/** Dos años de órdenes, con volumen creciente, para poder comparar cualquier período con el anterior. */
export const orders: Order[] = (() => {
  const rand = mulberry32(42)
  const list: Order[] = []
  let n = 0
  for (let day = 730; day >= 0; day--) {
    // Crece ~35 % al año y baja un poco en fin de semana.
    const date = new Date(TODAY)
    date.setDate(date.getDate() - day)
    const weekend = date.getDay() === 0 || date.getDay() === 6
    // Estacionalidad suave (~4 meses) + ruido diario para que la serie no salga plana.
    const season = 1 + 0.18 * Math.sin((day / 120) * Math.PI * 2)
    const expected = (2.2 + (730 - day) * 0.0022) * season * (weekend ? 0.45 : 1) * (0.55 + rand() * 0.9)
    const count = Math.floor(expected + rand())
    for (let i = 0; i < count; i++) {
      const service = pickService(rand())
      const p = SERVICE_PROFILE[service]
      const statusRoll = rand()
      // Las órdenes recientes todavía pueden estar abiertas.
      let status: OrderStatus = 'Completed'
      if (statusRoll < 0.05) status = 'Cancelled'
      else if (day < 10 && statusRoll < 0.45) status = statusRoll < 0.25 ? 'In progress' : 'Pending'
      list.push({
        id: `OS-${(10000 + n++).toString()}`,
        client: CLIENTS[Math.floor(rand() * CLIENTS.length)],
        service,
        status,
        date: date.toISOString().slice(0, 10),
        amount: Math.round(p.ticket * (0.6 + rand() * 0.9)),
        leadDays: Math.max(1, Math.round(p.lead * (0.7 + rand() * 0.6) - (730 - day) * 0.0012)),
      })
    }
  }
  return list.reverse() // más recientes primero
})()

/** Órdenes dentro del período actual (offset 0) o del período anterior (offset 1). */
export function ordersIn(period: Period, offset = 0): Order[] {
  const days = PERIOD_DAYS[period]
  const end = days * offset
  const start = days * (offset + 1)
  return orders.filter((o) => {
    const age = (TODAY.getTime() - new Date(o.date + 'T00:00:00').getTime()) / 86400000
    return age >= end && age < start
  })
}

/* ------------------------------------------------------------------ */
/* Series temporales                                                   */
/* ------------------------------------------------------------------ */

type Bucket = 'day' | 'week' | 'month'

const BUCKET: Record<Period, { unit: Bucket; count: number }> = {
  '30d': { unit: 'day', count: 30 },
  '90d': { unit: 'week', count: 13 },
  '12m': { unit: 'month', count: 12 },
}

const dayFmt = new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'short' })
const monthFmt = new Intl.DateTimeFormat('en-IE', { month: 'short' })

/** Inicio de cada intervalo, del más antiguo al más reciente. `offset` desplaza un período completo hacia atrás. */
function bucketStarts(period: Period, offset = 0): Date[] {
  const { unit, count } = BUCKET[period]
  const out: Date[] = []
  for (let i = count * (offset + 1) - 1; i >= count * offset; i--) {
    const d = new Date(TODAY)
    if (unit === 'day') d.setDate(d.getDate() - i)
    else if (unit === 'week') d.setDate(d.getDate() - i * 7 - 6)
    else {
      d.setDate(1)
      d.setMonth(d.getMonth() - i)
    }
    out.push(d)
  }
  return out
}

function bucketLabel(d: Date, unit: Bucket): string {
  return (unit === 'month' ? monthFmt : dayFmt).format(d)
}

function bucketEnd(start: Date, unit: Bucket): Date {
  const d = new Date(start)
  if (unit === 'day') d.setDate(d.getDate() + 1)
  else if (unit === 'week') d.setDate(d.getDate() + 7)
  else d.setMonth(d.getMonth() + 1)
  return d
}

/** Agrupa las órdenes del período por intervalo: número de órdenes e ingresos. */
export function ordersSeries(period: Period): Point[] {
  const { unit } = BUCKET[period]
  return bucketStarts(period).map((start) => {
    const end = bucketEnd(start, unit)
    let count = 0
    let revenue = 0
    for (const o of orders) {
      const d = new Date(o.date + 'T00:00:00')
      if (d >= start && d < end && o.status !== 'Cancelled') {
        count++
        revenue += o.amount
      }
    }
    return { label: bucketLabel(start, unit), orders: count, revenue }
  })
}

interface SeriesSpec {
  /** Valor actual (hoy) para niveles de stock, o valor mensual para flujos. */
  base: number
  /** Crecimiento mensual, p. ej. 0.02 = 2 % al mes. */
  growth: number
  noise: number
  /** Los flujos (entradas, ventas…) se escalan al tamaño del intervalo; los niveles no. */
  flow?: boolean
}

const BUCKET_DAYS: Record<Bucket, number> = { day: 1, week: 7, month: 30.4 }

/**
 * Serie sintética para métricas que no se derivan de las órdenes (stock por categoría,
 * entradas/salidas…). Devuelve el período actual y el anterior para calcular variaciones.
 */
export function syntheticSeries(
  period: Period,
  specs: Record<string, SeriesSpec>,
  seed: number,
): { current: Point[]; previous: Point[] } {
  const { unit, count } = BUCKET[period]
  const rand = mulberry32(seed + count)
  const build = (offset: number) =>
    bucketStarts(period, offset).map((start, idx) => {
      // Meses transcurridos hasta hoy (negativo hacia el pasado).
      const monthsFromNow = -((count * (offset + 1) - 1 - idx) * BUCKET_DAYS[unit]) / 30.4
      const p: Point = { label: bucketLabel(start, unit) }
      for (const [key, s] of Object.entries(specs)) {
        const trend = s.base * Math.pow(1 + s.growth, monthsFromNow)
        const scale = s.flow ? BUCKET_DAYS[unit] / 30.4 : 1
        p[key] = Math.max(0, Math.round(trend * scale * (1 + s.noise * (rand() * 2 - 1))))
      }
      return p
    })
  const previous = build(1)
  const current = build(0)
  return { current, previous }
}

/** Suma de una métrica a lo largo de una serie. */
export function sum(points: Point[], key: string): number {
  return points.reduce((acc, p) => acc + Number(p[key] ?? 0), 0)
}

/** Variación relativa; `null` cuando no hay base de comparación. */
export function change(current: number, previous: number): number | null {
  if (!previous) return null
  return (current - previous) / previous
}
