import { useState, type ReactElement } from 'react'
import { PageHeader } from './components/layout/PageHeader'
import { TopNav } from './components/layout/TopNav'
import { PERIOD_LABEL } from './data/mock'
import { useHashRoute } from './hooks/useHashRoute'
import { ThemeContext, useThemeState } from './hooks/useTheme'
import type { Period, Route } from './types'
import { Inventory } from './views/Inventory'
import { Overview } from './views/Overview'
import { Products } from './views/Products'
import { Services } from './views/Services'

const PAGES: Record<Route, { title: string; description: string; View: (p: { period: Period }) => ReactElement }> = {
  overview: { title: 'Overview', description: 'Inventory, services and sales at a glance', View: Overview },
  inventory: { title: 'Inventory', description: 'Stock levels, minimums and movement by category', View: Inventory },
  services: { title: 'Services', description: 'Printing, prototyping, scanning and consulting orders', View: Services },
  products: { title: 'Products', description: 'Catalogue, new products and best sellers', View: Products },
}

export default function App() {
  const route = useHashRoute()
  const [theme, toggleTheme] = useThemeState()
  const [period, setPeriod] = useState<Period>('90d')
  const { title, description, View } = PAGES[route]

  return (
    <ThemeContext.Provider value={theme}>
      <TopNav route={route} theme={theme} onToggleTheme={toggleTheme} />
      <main className="main">
        <PageHeader
          title={title}
          description={`${description}. ${PERIOD_LABEL[period]}.`}
          period={period}
          onPeriodChange={setPeriod}
        />
        <div className="content" key={route}>
          <View period={period} />
        </div>
      </main>
    </ThemeContext.Provider>
  )
}
