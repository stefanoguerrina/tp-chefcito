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
// 'completed', 'pending', 'rejected' o 'expired'.
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

// Cómo se muestra cada estado de una donación en el historial (texto e ícono).
export const DONATION_STATUS_DISPLAY = {
  completed: { label: 'Completada', icon: 'check_circle' },
  pending: { label: 'Pendiente', icon: 'hourglass_top' },
  rejected: { label: 'Rechazada', icon: 'error' },
  expired: { label: 'Vencida', icon: 'timer_off' },
};

// Convierte el usuario que viene en el historial. Devuelve: { id, username, name, lastName, avatarUrl }.
const donationUserFromApi = (raw) => ({
  id: raw?.id,
  username: raw?.username ?? '',
  name: raw?.name ?? '',
  lastName: raw?.lastName ?? '',
  avatarUrl: raw?.avatarUrl ?? null,
});

// Convierte una fila del historial de GET /api/donations. otherUser es la otra persona:
// a quién se le donó (realizadas) o quién donó (recibidas).
// Devuelve: { transactionRef, amount, currency, status, tierLabel, tierIcon, createdAt, otherUser }.
const donationHistoryItemFromApi = (raw) => ({
  transactionRef: raw.transactionRef,
  amount: Number(raw.amount) || 0,
  currency: raw.currency || 'ARS',
  status: raw.status || 'pending',
  tierLabel: raw.tierLabel ?? null,
  tierIcon: raw.tierIcon || 'volunteer_activism',
  createdAt: raw.createdAt ? new Date(raw.createdAt) : null,
  otherUser: donationUserFromApi(raw.otherUser),
});

// Convierte un lado del historial (recibidas o realizadas).
// Devuelve: { items, stats: { totalAmount, count, averageAmount }, topUsers: [{ user, totalAmount, count }] }.
const donationHistorySideFromApi = (raw) => ({
  items: (raw?.items ?? []).map(donationHistoryItemFromApi),
  stats: {
    totalAmount: Number(raw?.stats?.totalAmount) || 0,
    count: Number(raw?.stats?.count) || 0,
    averageAmount: Number(raw?.stats?.averageAmount) || 0,
  },
  topUsers: (raw?.topUsers ?? []).map((top) => ({
    user: donationUserFromApi(top.user),
    totalAmount: Number(top.totalAmount) || 0,
    count: Number(top.count) || 0,
  })),
});

// Convierte la respuesta de GET /api/donations. Devuelve: { received, sent } (ver arriba).
export const donationHistoryFromApi = (raw) => ({
  received: donationHistorySideFromApi(raw?.received),
  sent: donationHistorySideFromApi(raw?.sent),
});

// Recibe un usuario del historial. Devuelve "Nombre Apellido", o "@usuario" si no tiene nombre.
export const getDonationUserName = (user) => `${user.name} ${user.lastName}`.trim() || `@${user.username}`;

// Recibe una fecha (Date o null). Devuelve la fecha corta en formato argentino, ej. "7 oct 2026".
export const formatDonationDate = (date) =>
  date ? new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(date) : '';

// Recibe un monto y la moneda. Devuelve el monto con formato argentino, sin centavos
// (los montos fijos son redondos). Ej: formatDonationAmount(2500) → "$ 2.500".
export const formatDonationAmount = (amount, currency = 'ARS') =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
