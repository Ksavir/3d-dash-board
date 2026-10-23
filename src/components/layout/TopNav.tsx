import { Moon, Sun } from 'lucide-react'
import type { Route, Theme } from '../../types'

const NAV: { route: Route; label: string }[] = [
  { route: 'overview', label: 'Overview' },
  { route: 'inventory', label: 'Inventory' },
  { route: 'services', label: 'Services' },
  { route: 'products', label: 'Products' },
]

interface Props {
  route: Route
  theme: Theme
  onToggleTheme: () => void
}

/**
 * Barra superior grafito. La pestaña activa es una "placa" del color de la página
 * que se funde con el contenido, como una pieza que sale de la cama de impresión.
 */
export function TopNav({ route, theme, onToggleTheme }: Props) {
  return (
    <header className="topnav">
      <div className="topnav__inner">
        <a href="#/overview" className="brand" aria-label="Dashboard 3D, go to overview">
          <LayerMark />
          <span className="brand__name">Dashboard 3D</span>
        </a>
        <nav className="tabs" aria-label="Sections">
          {NAV.map(({ route: r, label }) => (
            <a key={r} href={`#/${r}`} className="tab" aria-current={route === r ? 'page' : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <div className="topnav__end">
          <span className="demo-tag">Demo data</span>
          <button
            type="button"
            className="topnav__icon"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  )
}

/** Marca: tres capas apiladas, como una pieza impresa capa por capa. */
function LayerMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
      <rect x="5" y="20" width="22" height="4.5" rx="2.25" fill="#3987e5" />
      <rect x="8" y="13.75" width="16" height="4.5" rx="2.25" fill="#6da7ec" />
      <rect x="11" y="7.5" width="10" height="4.5" rx="2.25" fill="#cde2fb" />
    </svg>
  )
}
