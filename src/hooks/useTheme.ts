import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Theme } from '../types'

const STORAGE_KEY = 't3d-theme'

function initialTheme(): Theme {
  // index.html ya fijó data-theme antes del primer render.
  const attr = document.documentElement.dataset.theme
  if (attr === 'light' || attr === 'dark') return attr
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useThemeState(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* almacenamiento no disponible: el tema solo dura esta sesión */
      }
      return next
    })
  }, [])

  return [theme, toggle]
}

export const ThemeContext = createContext<Theme>('light')

export const useTheme = () => useContext(ThemeContext)
