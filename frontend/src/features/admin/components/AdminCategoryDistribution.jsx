// Barra segmentada + leyenda con la distribución del catálogo de ingredientes por
// categoría (principal de cada ingrediente). Recibe: distribution
// ([{ id, name, count, percent }], ver adminIngredientsModel.buildCategoryDistribution).
import '../styles/_admin-category-distribution.scss';

function AdminCategoryDistribution({ distribution }) {
  if (distribution.length === 0) {
    return <p className="AdminCategoryDistribution-empty">Todavía no hay ingredientes cargados.</p>;
  }

  return (
    <div className="AdminCategoryDistribution">
      <div className="AdminCategoryDistribution-bar">
        {distribution.map((segment, index) => (
          <div
            key={segment.id}
            className={`AdminCategoryDistribution-segment AdminCategoryDistribution-segment--${index}`}
            style={{ width: `${segment.percent}%` }}
            title={`${segment.name} — ${segment.percent}%`}
          />
        ))}
      </div>

      <ul className="AdminCategoryDistribution-legend">
        {distribution.map((segment, index) => (
          <li className="AdminCategoryDistribution-legendItem" key={segment.id}>
            <span className={`AdminCategoryDistribution-dot AdminCategoryDistribution-dot--${index}`} />
            {segment.name}
            <span className="AdminCategoryDistribution-count">({segment.count})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminCategoryDistribution;
