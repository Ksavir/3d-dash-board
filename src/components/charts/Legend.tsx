interface Props {
  items: { name: string; color: string; value?: string }[]
}

/** Leyenda en HTML: siempre visible cuando hay dos o más series. */
export function Legend({ items }: Props) {
  return (
    <ul className="legend">
      {items.map((i) => (
        <li key={i.name}>
          <span className="swatch" style={{ background: i.color }} aria-hidden />
          <span>{i.name}</span>
          {i.value && <span className="legend__value">{i.value}</span>}
        </li>
      ))}
    </ul>
  )
}
