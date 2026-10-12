// Gráfico de dona de la página "Donaciones": las (hasta) 5 personas que más donaron (o a
// las que más se donó). Al centro va la suma de esas 5 y abajo, el total de cada una.
// Es un SVG simple, sin librerías: cada porción es un círculo con el trazo cortado
// (stroke-dasharray) a la medida de su parte del total.
import { Link } from 'react-router-dom';
import { formatDonationAmount, getDonationUserName } from '../models/donationModel.js';
import '../styles/_donation-top-users-chart.scss';

const CENTER = 100;
const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// Espacio entre porciones (en la misma unidad que la circunferencia).
const SLICE_GAP = 3;

// Recibe: topUsers ([{ user, totalAmount, count }], ordenados de mayor a menor), title,
// description y emptyMessage (texto si todavía no hay ninguna donación completada).
function DonationTopUsersChart({ topUsers, title, description, emptyMessage }) {
  const topTotal = topUsers.reduce((sum, top) => sum + top.totalAmount, 0);

  // Largo de cada porción sobre el anillo, proporcional a lo que aportó esa persona.
  const lengths = topUsers.map((top) => (topTotal > 0 ? (top.totalAmount / topTotal) * CIRCUMFERENCE : 0));
  // Cada porción arranca donde terminaron las anteriores (offset = suma de sus largos).
  const slices = topUsers.map((top, index) => ({
    ...top,
    colorIndex: index + 1,
    length: lengths[index],
    offset: lengths.slice(0, index).reduce((sum, length) => sum + length, 0),
  }));
  // Con una sola porción no hace falta separación (sería un anillo con un corte).
  const gap = slices.length > 1 ? SLICE_GAP : 0;

  return (
    <section className="DonationTopUsersChart">
      <header className="DonationTopUsersChart-header">
        <h2 className="DonationTopUsersChart-title">{title}</h2>
        <p className="DonationTopUsersChart-description">{description}</p>
      </header>

      <div className="DonationTopUsersChart-donut">
        <svg viewBox="0 0 200 200" role="img" aria-label={`${title}: ${formatDonationAmount(topTotal)} en total`}>
          <circle className="DonationTopUsersChart-track" cx={CENTER} cy={CENTER} r={RADIUS} />
          {/* rotate(-90): que la primera porción arranque arriba (a las 12) y no a las 3. */}
          <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
            {slices.map((slice) => (
              <circle
                key={slice.user.id}
                className={`DonationTopUsersChart-slice DonationTopUsersChart-slice--${slice.colorIndex}`}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                strokeDasharray={`${Math.max(slice.length - gap, 0)} ${CIRCUMFERENCE}`}
                strokeDashoffset={-slice.offset}
              >
                <title>{`${getDonationUserName(slice.user)}: ${formatDonationAmount(slice.totalAmount)}`}</title>
              </circle>
            ))}
          </g>
        </svg>

        <div className="DonationTopUsersChart-center">
          <span className="DonationTopUsersChart-centerAmount">{formatDonationAmount(topTotal)}</span>
          <span className="DonationTopUsersChart-centerLabel">Top {topUsers.length || 5}</span>
        </div>
      </div>

      {slices.length === 0 ? (
        <p className="DonationTopUsersChart-empty">{emptyMessage}</p>
      ) : (
        <ul className="DonationTopUsersChart-legend">
          {slices.map((slice) => (
            <li key={slice.user.id} className="DonationTopUsersChart-legendItem">
              <Link to={`/usuarios/${slice.user.id}`} className="DonationTopUsersChart-legendName">
                <span
                  className={`DonationTopUsersChart-swatch DonationTopUsersChart-swatch--${slice.colorIndex}`}
                  aria-hidden="true"
                />
                {getDonationUserName(slice.user)}
              </Link>
              <span className="DonationTopUsersChart-legendAmount">{formatDonationAmount(slice.totalAmount)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default DonationTopUsersChart;
