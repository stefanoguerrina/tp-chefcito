// Tarjeta de métrica del dashboard: cifra principal (opcional: si no se pasa value, la
// tarjeta arranca directo en el pie, ej. "Top ingredientes más usados") y, si hay
// footerTitle y/o children, un pie con contenido libre (gráfico, ranking, etc.).
// Recibe: label (título), value (cifra, opcional), unit (opcional, al lado de la cifra),
//         hint (texto bajo la cifra), badge (texto del chip superior derecho), footerTitle
//         (opcional), footerHint, variant ('primary' | 'secondary') y children.
import '../styles/_admin-metric-card.scss';

function AdminMetricCard({
  label,
  value,
  unit,
  hint,
  badge,
  footerTitle,
  footerHint,
  variant = 'primary',
  children,
}) {
  const hasValue = value !== undefined && value !== null;
  const hasFooter = Boolean(footerTitle) || Boolean(children);

  return (
    <article className={`AdminMetricCard AdminMetricCard--${variant}`}>
      <header className="AdminMetricCard-header">
        <span className="AdminMetricCard-label">{label}</span>
        {badge && <span className="AdminMetricCard-badge">{badge}</span>}
      </header>

      {hasValue && (
        <div className="AdminMetricCard-figure">
          <span className="AdminMetricCard-value">{value}</span>
          {unit && <span className="AdminMetricCard-unit">{unit}</span>}
        </div>
      )}
      {hint && <p className="AdminMetricCard-hint">{hint}</p>}

      {hasFooter && (
        <div className={`AdminMetricCard-footer${hasValue ? '' : ' AdminMetricCard-footer--tight'}`}>
          {footerTitle && (
            <div className="AdminMetricCard-footerHeader">
              <span>{footerTitle}</span>
              {footerHint && <span>{footerHint}</span>}
            </div>
          )}
          {children}
        </div>
      )}
    </article>
  );
}

export default AdminMetricCard;
