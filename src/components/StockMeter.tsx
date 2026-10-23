import { stockStatus } from '../data/mock'
import { fmt } from '../lib/format'

interface Props {
  stock: number
  min: number
}

/**
 * Nivel de stock contra su mínimo. La escala llega hasta 3× el mínimo, así la marca
 * del mínimo queda siempre en el mismo sitio y se compara de un vistazo entre filas.
 */
export function StockMeter({ stock, min }: Props) {
  const scale = min * 3
  const fill = Math.min(stock / scale, 1)
  const status = stockStatus({ stock, min })
  return (
    <div className="meter" title={`${fmt.number(stock)} in stock, minimum ${fmt.number(min)}`}>
      <span className="meter__value">{fmt.number(stock)}</span>
      <span className={`meter__track meter__track--${status.replace(/ /g, '-').toLowerCase()}`} aria-hidden>
        <span className="meter__fill" style={{ width: `${fill * 100}%` }} />
        <span className="meter__min" style={{ left: `${100 / 3}%` }} />
      </span>
    </div>
  )
}
