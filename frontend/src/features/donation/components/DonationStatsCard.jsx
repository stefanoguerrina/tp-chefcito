// Tarjeta de resumen de la página "Donaciones": el monto total (recibido o donado), el
// promedio por donación y la cantidad. Solo cuentan las donaciones completadas (lo calcula
// el backend).
import { formatDonationAmount } from '../models/donationModel.js';
import '../styles/_donation-stats-card.scss';

// Recibe: title (ej. "Total recibido"), stats ({ totalAmount, count, averageAmount }) y
// countLabel (ej. "Donaciones recibidas").
function DonationStatsCard({ title, stats, countLabel }) {
  return (
    <section className="DonationStatsCard">
      <h2 className="DonationStatsCard-title">
        <span className="DonationStatsCard-titleIcon material-symbols-outlined" aria-hidden="true">bar_chart</span>
        {title}
      </h2>

      <p className="DonationStatsCard-total">
        <span className="DonationStatsCard-amount">{formatDonationAmount(stats.totalAmount)}</span>
        <span className="DonationStatsCard-currency">ARS</span>
      </p>

      <dl className="DonationStatsCard-rows">
        <div className="DonationStatsCard-row">
          <dt>Donación promedio:</dt>
          <dd>{formatDonationAmount(stats.averageAmount)}</dd>
        </div>
        <div className="DonationStatsCard-row">
          <dt>{countLabel}:</dt>
          <dd>{stats.count}</dd>
        </div>
      </dl>
    </section>
  );
}

export default DonationStatsCard;
