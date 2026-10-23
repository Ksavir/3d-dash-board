import { useEffect, useState } from 'react'
import type { Route } from '../types'

const ROUTES: Route[] = ['overview', 'inventory', 'services', 'products']

function read(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '') as Route
  return ROUTES.includes(hash) ? hash : 'overview'
}

/** Navegación mínima basada en el hash (`#/inventory`), sin dependencias. */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(read)

  useEffect(() => {
    const onChange = () => setRoute(read())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
