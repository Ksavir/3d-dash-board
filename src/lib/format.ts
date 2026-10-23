const LOCALE = 'en-IE'
/** Moneda y formato regional de todo el panel. */
const CURRENCY = 'EUR'

const currency = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 })
const currencyCompact = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  currencyDisplay: 'narrowSymbol',
  notation: 'compact',
  maximumFractionDigits: 1,
})
const number = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 })
const compact = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 })
const percent = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 1 })
const signedPercent = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' })
const date = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })

export const fmt = {
  currency: (v: number) => currency.format(v),
  currencyCompact: (v: number) => currencyCompact.format(v),
  number: (v: number) => number.format(v),
  compact: (v: number) => compact.format(v),
  percent: (v: number) => percent.format(v),
  signedPercent: (v: number) => signedPercent.format(v),
  date: (iso: string) => date.format(new Date(iso + 'T00:00:00')),
}
