// Foto de perfil redonda de un usuario. Si no tiene foto, o la URL no carga, muestra sus
// iniciales sobre un color de la marca. Es solo visual: el tamaño lo elige quien lo usa.
import { useState } from 'react';
import './_user-avatar.scss';

// Iniciales de nombre + apellido; si no hay, la primera letra del usuario.
const getInitials = ({ name, lastName, username }) =>
  `${name?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || username?.[0]?.toUpperCase() || '?';

// Recibe: user ({ avatarUrl (ya resuelta con resolveImageUrl), name, lastName, username })
// y size (lado en píxeles, 36 por defecto).
function UserAvatar({ user, size = 36 }) {
  // Se guarda QUÉ URL falló (no un true/false): si después llega otra foto, se vuelve a
  // intentar mostrarla sin tener que remontar el componente.
  const [brokenUrl, setBrokenUrl] = useState(null);
  const showImage = Boolean(user.avatarUrl) && brokenUrl !== user.avatarUrl;

  return (
    <span className="UserAvatar" style={{ '--user-avatar-size': `${size}px` }} aria-hidden="true">
      {showImage ? (
        <img className="UserAvatar-image" src={user.avatarUrl} alt="" onError={() => setBrokenUrl(user.avatarUrl)} />
      ) : (
        getInitials(user)
      )}
    </span>
  );
}

export default UserAvatar;
