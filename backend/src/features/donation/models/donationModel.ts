// Tipos de dominio de la feature Donation (donaciones a creadores de recetas).
// Esta capa no tiene lógica: solo describe la forma de los datos y los montos fijos.
// El que dona es siempre el usuario del token; el que recibe (grantee) sale del body.

// Un monto fijo para donar, "estilo Chefcito": en vez de escribir un número, se le invita
// algo de comer al creador. El icono es el nombre de un Material Symbol (lo usa el frontend).
export interface DonationTier {
  id: string;
  label: string;
  description: string;
  icon: string;
  amount: number;
}

// Todas las donaciones son en pesos: los montos de abajo están pensados en ARS.
export const DONATION_CURRENCY = 'ARS';

// Los únicos montos aceptados. El frontend manda solo el id: el monto lo decide el backend,
// así nadie puede cambiar el precio desde el navegador.
export const DONATION_TIERS: DonationTier[] = [
  { id: 'cafecito', label: 'Un cafecito', description: 'Para agradecer una receta que te salvó el día.', icon: 'local_cafe', amount: 1000 },
  { id: 'medialunas', label: 'Café con medialunas', description: 'Un desayuno completo para seguir cocinando.', icon: 'bakery_dining', amount: 2500 },
  { id: 'pizza', label: 'Una pizza', description: 'Para compartir con quien te enseñó algo nuevo.', icon: 'local_pizza', amount: 5000 },
  { id: 'asado', label: 'Un asado', description: 'El mayor reconocimiento para tu cocinero favorito.', icon: 'outdoor_grill', amount: 10000 },
];

// Estado de una donación en la base:
//   pending   → se creó el pago en Mercado Pago pero todavía no se confirmó;
//   completed → Mercado Pago lo aprobó;
//   rejected  → Mercado Pago lo rechazó, se canceló o se devolvió;
//   expired   → pasó el plazo para pagar (DONATION_PAYMENT_WINDOW_MINUTES) y nadie pagó.
export type DonationStatus = 'pending' | 'completed' | 'rejected' | 'expired';

// Minutos que dura el link de pago de Mercado Pago. Pasado ese plazo, una donación que sigue
// pendiente y no tiene pago se marca como vencida.
export const DONATION_PAYMENT_WINDOW_MINUTES = 30;

// Donación tal como la devuelve la API después de confirmar el pago.
export interface DonationSummary {
  transactionRef: string;
  amount: number;
  currency: string;
  status: DonationStatus;
  // Nombre del monto fijo ("Un asado"), o null si el monto no coincide con ninguno.
  tierLabel: string | null;
  grantee: { id: number; username: string; name: string; lastName: string };
}

// Una fila del historial de donaciones (GET /api/donations). otherUser es la otra persona:
// a quién se le donó (en "realizadas") o quién donó (en "recibidas").
export interface DonationHistoryItem {
  transactionRef: string;
  amount: number;
  currency: string;
  status: DonationStatus;
  tierLabel: string | null;
  tierIcon: string | null;
  createdAt: Date | null;
  otherUser: { id: number; username: string; name: string; lastName: string; avatarUrl: string | null };
}

// Cuántas personas muestra el gráfico de "quiénes más donaron" / "a quiénes más donaste".
export const DONATION_TOP_USERS_LIMIT = 5;

// Una persona del top: cuánto sumaron sus donaciones completadas y cuántas fueron.
export interface DonationTopUser {
  user: DonationHistoryItem['otherUser'];
  totalAmount: number;
  count: number;
}

// Un lado del historial (recibidas o realizadas): las filas, los números del resumen y el
// top de personas. stats y topUsers cuentan solo las donaciones completadas (las
// pendientes, rechazadas o vencidas no movieron plata).
export interface DonationHistorySide {
  items: DonationHistoryItem[];
  stats: { totalAmount: number; count: number; averageAmount: number };
  topUsers: DonationTopUser[];
}

// Historial completo del usuario logueado (GET /api/donations).
export interface DonationHistory {
  received: DonationHistorySide;
  sent: DonationHistorySide;
}
