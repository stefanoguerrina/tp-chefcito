// Utilidad para mostrar hace cuánto pasó algo ("hace 45 minutos", "ayer", "hace 3 días"),
// como en las publicaciones y reseñas de la home.

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// Arma "hace N unidad(es)" con el plural correcto (ej. "hace 1 hora", "hace 2 horas").
const ago = (amount, singular, plural) => `hace ${amount} ${amount === 1 ? singular : plural}`;

// Recibe: una fecha ISO (o null). Devuelve el texto relativo, o '' si no hay fecha.
// Pasado un mes se muestra la fecha (ej. "12/5/2026"): "hace 7 semanas" ya no ayuda.
export const formatRelativeTime = (isoDate) => {
  if (!isoDate) return '';
  // Math.max: si el reloj de la compu está un poco atrasado respecto del servidor, la
  // diferencia puede dar negativa; se muestra "recién" en vez de "hace -2 minutos".
  const elapsed = Math.max(0, Date.now() - new Date(isoDate).getTime());

  if (elapsed < MINUTE_MS) return 'recién';
  if (elapsed < HOUR_MS) return ago(Math.floor(elapsed / MINUTE_MS), 'minuto', 'minutos');
  if (elapsed < DAY_MS) return ago(Math.floor(elapsed / HOUR_MS), 'hora', 'horas');

  const days = Math.floor(elapsed / DAY_MS);
  if (days === 1) return 'ayer';
  if (days < 7) return ago(days, 'día', 'días');
  if (days < 30) return ago(Math.floor(days / 7), 'semana', 'semanas');
  return new Date(isoDate).toLocaleDateString('es-AR');
};
