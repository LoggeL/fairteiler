export const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.09 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.86 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rate: 0.96 },
  // Add more as needed, for MVP static is fine
]

export function convert(amount: number, from: string, to: string): number {
  const fromRate = CURRENCIES.find(c => c.code === from)?.rate || 1
  const toRate = CURRENCIES.find(c => c.code === to)?.rate || 1
  
  return (amount / fromRate) * toRate
}
