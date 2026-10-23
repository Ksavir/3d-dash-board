export type Period = '30d' | '90d' | '12m'

export type Route = 'overview' | 'inventory' | 'services' | 'products'

export type Theme = 'light' | 'dark'

export type Category = 'Filaments' | 'Resins' | 'Adhesives' | 'Spare parts'

export type ServiceType = 'On-demand printing' | 'Prototyping' | '3D scanning' | 'Consulting'

export type StockStatus = 'In stock' | 'Low' | 'Out of stock'

export type OrderStatus = 'Completed' | 'In progress' | 'Pending' | 'Cancelled'

/** Un artículo del catálogo. Cada SKU es a la vez un producto a la venta y una línea de inventario. */
export interface CatalogItem {
  sku: string
  name: string
  category: Category
  stock: number
  min: number
  unitCost: number
  price: number
  /** Unidades vendidas en un mes típico; las vistas lo escalan según el período. */
  monthlySales: number
  /** Fecha de alta en el catálogo (ISO). */
  createdAt: string
  active: boolean
}

export interface Order {
  id: string
  client: string
  service: ServiceType
  status: OrderStatus
  date: string
  amount: number
  /** Días entre la recepción y la entrega. */
  leadDays: number
}

/** Un punto de una serie temporal: etiqueta del eje X + una o más métricas. */
export type Point = { label: string } & Record<string, number | string>
