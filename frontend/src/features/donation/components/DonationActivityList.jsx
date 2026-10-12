// Tarjeta "Actividad reciente" de la página "Donaciones": todas las donaciones del lado
// elegido, de la más nueva a la más vieja (el backend ya las manda ordenadas).
import DonationActivityItem from './DonationActivityItem.jsx';
import '../styles/_donation-activity.scss';

// Recibe: items (filas del historial), isReceived (ver DonationActivityItem) y
// emptyMessage (texto si no hay ninguna).
function DonationActivityList({ items, isReceived, emptyMessage }) {
  return (
    <section className="DonationActivityList">
      <h2 className="DonationActivityList-title">Actividad reciente</h2>

      {items.length === 0 ? (
        <p className="DonationActivityList-empty">{emptyMessage}</p>
      ) : (
        <ul className="DonationActivityList-items">
          {items.map((donation) => (
            <DonationActivityItem key={donation.transactionRef} donation={donation} isReceived={isReceived} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default DonationActivityList;
