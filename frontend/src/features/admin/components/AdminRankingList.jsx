// Lista de ranking con barra de progreso horizontal. Genérica: sirve tanto para
// "usuarios con más recetas" (prefijo "@") como para "ingredientes más usados" (sin prefijo).
// Recibe: items ([{ label, value }]), unitLabel (sustantivo en plural), unitLabelSingular
//         (opcional: se usa cuando value es 1, para no mostrar "1 recetas"), emptyMessage
//         (texto si todavía no hay datos) y prefix (opcional, '@' por defecto).
import '../styles/_admin-ranking-list.scss';

function AdminRankingList({ items, unitLabel, unitLabelSingular, emptyMessage, prefix = '@' }) {
  if (items.length === 0) {
    return <p className="AdminRankingList-empty">{emptyMessage}</p>;
  }

  // El primer puesto marca el 100% de la barra: el resto se dibuja en proporción a él.
  const maxValue = items[0].value;

  return (
    <ul className="AdminRankingList">
      {items.map((item) => (
        <li className="AdminRankingList-item" key={item.label}>
          <span className="AdminRankingList-name">{prefix}{item.label}</span>
          <span className="AdminRankingList-track">
            <span
              className="AdminRankingList-fill"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </span>
          <span className="AdminRankingList-value">
            {item.value} {item.value === 1 && unitLabelSingular ? unitLabelSingular : unitLabel}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default AdminRankingList;
