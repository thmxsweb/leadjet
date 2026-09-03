/** Format integer minor units (cents) as a currency string. */
export function formatMoney(cents: number, currency = 'EUR', locale = 'fr-FR'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
}

export function formatDate(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}
