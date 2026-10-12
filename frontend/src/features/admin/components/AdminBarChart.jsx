// Gráfico de barras verticales simple (sin librerías): dibuja una barra por elemento de
// la serie, con la altura proporcional al valor más alto.
// Recibe: data ([{ label, value, isHighlighted }]) y emptyMessage (texto si no hay datos).
import '../styles/_admin-bar-chart.scss';

// Altura mínima en % para que una barra en cero siga siendo visible como base del gráfico.
const MIN_BAR_HEIGHT = 4;

function AdminBarChart({ data, emptyMessage }) {
  // El máximo define la escala; si todos los valores son 0 no hay nada que graficar.
  const maxValue = Math.max(...data.map((item) => item.value), 0);

  if (maxValue === 0) {
    return <p className="AdminBarChart-empty">{emptyMessage}</p>;
  }

  return (
    <div className="AdminBarChart">
      {data.map((item) => (
        <div className="AdminBarChart-column" key={item.label}>
          <span className="AdminBarChart-value">{item.value}</span>
          <div
            className={`AdminBarChart-bar${item.isHighlighted ? ' AdminBarChart-bar--highlighted' : ''}`}
            style={{ height: `${Math.max((item.value / maxValue) * 100, MIN_BAR_HEIGHT)}%` }}
            title={`${item.label}: ${item.value}`}
          />
          <span className="AdminBarChart-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default AdminBarChart;
