// Modelo de la feature Donation: mapea las respuestas crudas del backend a la forma que usan
// los componentes. Factory functions simples, sin clases.

// Convierte un monto fijo de GET /api/donations/tiers.
// Devuelve: { id, label, description, icon, amount }.
export const donationTierFromApi = (raw) => ({
  id: raw.id,
  label: raw.label,
  description: raw.description ?? '',
  icon: raw.icon || 'volunteer_activism',
  amount: Number(raw.amount) || 0,
});

// Convierte la donación de POST /api/donations/confirm.
// Devuelve: { transactionRef, amount, currency, status, tierLabel, grantee }, donde status es
// 'completed', 'pending' o 'rejected'.
export const donationFromApi = (raw) => ({
  transactionRef: raw.transactionRef,
  amount: Number(raw.amount) || 0,
  currency: raw.currency || 'ARS',
  status: raw.status || 'pending',
  tierLabel: raw.tierLabel ?? null,
  grantee: {
    id: raw.grantee?.id,
    username: raw.grantee?.username ?? '',
    name: raw.grantee?.name ?? '',
    lastName: raw.grantee?.lastName ?? '',
  },
});

// Recibe un monto y la moneda. Devuelve el monto con formato argentino, sin centavos
// (los montos fijos son redondos). Ej: formatDonationAmount(2500) → "$ 2.500".
export const formatDonationAmount = (amount, currency = 'ARS') =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
