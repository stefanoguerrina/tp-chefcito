// Una fila de "Actividad reciente": la otra persona (con link a su perfil), qué se invitó,
// el monto y la fecha. En las realizadas muestra además el estado del pago.
import { Link } from 'react-router-dom';
import UserAvatar from '../../../core/components/UserAvatar.jsx';
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';
import {
  DONATION_STATUS_DISPLAY,
  formatDonationAmount,
  formatDonationDate,
  getDonationUserName,
} from '../models/donationModel.js';
import '../styles/_donation-activity.scss';

// Recibe: donation (ver donationHistoryFromApi) e isReceived (true en "Recibidas": el monto
// va en verde con "+"; en "Realizadas" va sin signo y con el estado, porque ahí puede haber
// pagos pendientes, rechazados o vencidos).
function DonationActivityItem({ donation, isReceived }) {
  const { otherUser } = donation;
  const status = DONATION_STATUS_DISPLAY[donation.status] ?? DONATION_STATUS_DISPLAY.pending;

  return (
    <li className="DonationActivityItem">
      <Link to={`/usuarios/${otherUser.id}`} className="DonationActivityItem-user">
        <UserAvatar user={{ ...otherUser, avatarUrl: resolveImageUrl(otherUser.avatarUrl) }} size={40} />
        <span className="DonationActivityItem-text">
          <span className="DonationActivityItem-name">{getDonationUserName(otherUser)}</span>
          <span className="DonationActivityItem-tier">
            <span className="material-symbols-outlined" aria-hidden="true">{donation.tierIcon}</span>
            {donation.tierLabel ?? 'Donación'}
          </span>
        </span>
      </Link>

      <span className="DonationActivityItem-side">
        <span className={`DonationActivityItem-amount${isReceived ? ' DonationActivityItem-amount--received' : ''}`}>
          {isReceived && '+ '}
          {formatDonationAmount(donation.amount, donation.currency)}
        </span>
        {!isReceived && (
          <span className={`DonationActivityItem-status DonationActivityItem-status--${donation.status}`}>
            <span className="material-symbols-outlined" aria-hidden="true">{status.icon}</span>
            {status.label}
          </span>
        )}
        <span className="DonationActivityItem-date">{formatDonationDate(donation.createdAt)}</span>
      </span>
    </li>
  );
}

export default DonationActivityItem;
