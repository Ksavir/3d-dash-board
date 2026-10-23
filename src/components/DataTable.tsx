import { ChevronDown, ChevronUp } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  /** Valor para ordenar; si falta, la columna no es ordenable. */
  sortValue?: (row: T) => number | string
  align?: 'left' | 'right'
  /** Oculta la columna en pantallas pequeñas. */
  hideOnMobile?: boolean
}

interface Props<T> {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  initialSort?: { key: string; dir: 'asc' | 'desc' }
  caption: string
  /** Máximo de filas visibles antes de mostrar "Ver todas". */
  pageSize?: number
}

export function DataTable<T>({ rows, columns, rowKey, initialSort, caption, pageSize = 10 }: Props<T>) {
  const [sort, setSort] = useState(initialSort)
  const [expanded, setExpanded] = useState(false)

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort?.key)
    if (!sort || !col?.sortValue) return rows
    const get = col.sortValue
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const va = get(a)
      const vb = get(b)
      return (typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'es')) * dir
    })
  }, [rows, columns, sort])

  const visible = expanded ? sorted : sorted.slice(0, pageSize)

  function toggleSort(key: string) {
    setSort((s) => (s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }))
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key
              const cls = [c.align === 'right' && 'num', c.hideOnMobile && 'hide-sm'].filter(Boolean).join(' ')
              return (
                <th
                  key={c.key}
                  className={cls}
                  scope="col"
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {c.sortValue ? (
                    <button type="button" className="th-sort" onClick={() => toggleSort(c.key)}>
                      {c.header}
                      {active &&
                        (sort.dir === 'asc' ? <ChevronUp size={14} aria-hidden /> : <ChevronDown size={14} aria-hidden />)}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td key={c.key} className={[c.align === 'right' && 'num', c.hideOnMobile && 'hide-sm'].filter(Boolean).join(' ')}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length > pageSize && (
        <button type="button" className="table-more" onClick={() => setExpanded((e) => !e)}>
          {expanded ? 'Show fewer' : `Show all ${sorted.length} rows`}
        </button>
      )}
    </div>
  )
}
