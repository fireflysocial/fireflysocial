/** "Free" for 0, otherwise the price in the event's currency: "$12", "$12.50", "€8". */
export function formatPrice(amount: number, currency: string, locale: string): string {
  if (amount <= 0) return 'Free'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
