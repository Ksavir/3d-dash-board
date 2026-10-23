import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: ReactNode
  /** Controles opcionales a la derecha del título. */
  aside?: ReactNode
  className?: string
  children: ReactNode
}

export function ChartCard({ title, subtitle, aside, className = '', children }: Props) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel__header">
        <div>
          <h2 className="panel__title">{title}</h2>
          {subtitle && <p className="panel__subtitle">{subtitle}</p>}
        </div>
        {aside}
      </header>
      {children}
    </section>
  )
}
