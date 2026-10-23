import { CircleAlert, CircleCheck, CircleDashed, CircleX, Clock } from 'lucide-react'
import type { OrderStatus, StockStatus } from '../types'

type Status = StockStatus | OrderStatus

const STYLE: Record<Status, { tone: string; Icon: typeof CircleCheck }> = {
  'In stock': { tone: 'good', Icon: CircleCheck },
  Low: { tone: 'warning', Icon: CircleAlert },
  'Out of stock': { tone: 'critical', Icon: CircleX },
  Completed: { tone: 'good', Icon: CircleCheck },
  'In progress': { tone: 'info', Icon: CircleDashed },
  Pending: { tone: 'warning', Icon: Clock },
  Cancelled: { tone: 'muted', Icon: CircleX },
}

/** El estado siempre va con icono + texto; el color nunca es la única señal. */
export function StatusBadge({ status }: { status: Status }) {
  const { tone, Icon } = STYLE[status]
  return (
    <span className={`badge badge--${tone}`}>
      <Icon size={13} strokeWidth={2.25} aria-hidden />
      {status}
    </span>
  )
}
