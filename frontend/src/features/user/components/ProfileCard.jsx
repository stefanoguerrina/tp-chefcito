// Tarjeta principal del perfil: portada, avatar, nombre, @usuario, etiquetas, ubicación
// y fecha de alta, las acciones (perfil propio: editar y compartir, como íconos; perfil
// ajeno: seguir, donar y compartir) y, debajo del avatar, la biografía. Adapta a nuestro
// stack el bloque "ProfileCard" de referencia (sin TypeScript, CSS Modules ni íconos SVG
// propios: SASS y Material Symbols).
import { useState } from 'react';
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';
import '../styles/_profile-card.scss';

// Iniciales para el avatar de respaldo (nombre + apellido), por si no hay foto o la URL
// cargada por el usuario está rota.
const getInitials = (name, lastName) =>
  `${name?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';

// Recibe: createdAt del usuario (o null). Devuelve "Se unió en julio de 2026" o null.
const formatJoinedDate = (createdAt) =>
  createdAt
    ? `Se unió en ${new Date(createdAt).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`
    : null;

// Recibe: user, recipesCount (para el texto de compartir), isOwnProfile, onEditProfile
// (abre el modal de edición) y, del perfil ajeno, onFollow y onDonate.
function ProfileCard({ user, recipesCount, isOwnProfile, onEditProfile, onFollow, onDonate }) {
  const [shareFeedback, setShareFeedback] = useState('');
  // Se activa si la foto no llega a cargar: se cae al círculo con iniciales. ProfilePage
  // monta este componente con key={user.avatarUrl}, así que se reinicia al cambiar la foto.
  const [avatarBroken, setAvatarBroken] = useState(false);

  // Copia un resumen del perfil al portapapeles. No hay una página pública de perfil
  // todavía, así que "compartir" comparte el dato real (no un link falso).
  const handleShare = async () => {
    const plural = recipesCount !== 1 ? 's' : '';
    const summary = `${user.name} ${user.lastName} (@${user.username}) en Chefcito — ` +
      `${recipesCount} receta${plural} publicada${plural}.`;
    try {
      await navigator.clipboard.writeText(summary);
      setShareFeedback('¡Copiado al portapapeles!');
    } catch {
      setShareFeedback('No se pudo copiar. Copialo manualmente: ' + summary);
    }
    setTimeout(() => setShareFeedback(''), 3000);
  };

  const avatarImage = user.avatarUrl && !avatarBroken ? (
    <img
      className="ProfileCard-avatarImg"
      src={resolveImageUrl(user.avatarUrl)}
      alt={user.username}
      onError={() => setAvatarBroken(true)}
    />
  ) : (
    <span className="ProfileCard-avatarInitials">{getInitials(user.name, user.lastName)}</span>
  );

  const joinedDate = formatJoinedDate(user.createdAt);

  return (
    <article className="ProfileCard" aria-label={`Perfil de ${user.name} ${user.lastName}`}>
      {/* Portada: la foto que subió el usuario o, si no tiene, un degradé con los colores
          de la marca (el degradé queda de fondo detrás de la foto). */}
      <div className="ProfileCard-banner">
        {user.coverUrl && (
          <img className="ProfileCard-bannerImg" src={resolveImageUrl(user.coverUrl)} alt="" />
        )}
      </div>

      <div className="ProfileCard-body">
        <div className="ProfileCard-header">
          {/* En el perfil propio el avatar abre el modal de edición (ahí se cambia la
              foto); en uno ajeno es solo una imagen. */}
          {isOwnProfile ? (
            <button
              type="button"
              className="ProfileCard-avatar ProfileCard-avatar--editable"
              onClick={onEditProfile}
              aria-label="Cambiar foto de perfil"
              title="Cambiar foto de perfil"
            >
              {avatarImage}
              <span className="ProfileCard-avatarOverlay">
                <span className="material-symbols-outlined">photo_camera</span>
                Cambiar
              </span>
            </button>
          ) : (
            <div className="ProfileCard-avatar">{avatarImage}</div>
          )}

          <div className="ProfileCard-info">
            <h2 className="ProfileCard-name">{user.name} {user.lastName}</h2>

            {/* Línea debajo del nombre: @usuario y la especialidad (la que el usuario carga
                en "Editar"), en una sola fila para que el bloque de texto no quede más alto
                que el avatar. */}
            <div className="ProfileCard-headline">
              <span>@{user.username}</span>
              {user.specialty && (
                <span className="ProfileCard-badge ProfileCard-badge--specialty">{user.specialty}</span>
              )}
            </div>

            {(user.location || joinedDate) && (
              <div className="ProfileCard-meta">
                {user.location && (
                  <span className="ProfileCard-metaItem">
                    <span className="material-symbols-outlined">location_on</span>
                    {user.location}
                  </span>
                )}
                {joinedDate && (
                  <span className="ProfileCard-metaItem">
                    <span className="material-symbols-outlined">calendar_month</span>
                    {joinedDate}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="ProfileCard-actions">
            {isOwnProfile ? (
              <button
                type="button"
                className="ProfileCard-btn ProfileCard-btn--icon ProfileCard-btn--primary"
                onClick={onEditProfile}
                aria-label="Editar perfil"
                title="Editar perfil"
              >
                <span className="material-symbols-outlined" aria-hidden="true">edit</span>
              </button>
            ) : (
              <>
                <button type="button" className="ProfileCard-btn ProfileCard-btn--accent" onClick={onFollow}>
                  Seguir
                </button>
                <button type="button" className="ProfileCard-btn ProfileCard-btn--primary" onClick={onDonate}>
                  Donar
                </button>
              </>
            )}
            <button
              type="button"
              className="ProfileCard-btn ProfileCard-btn--icon ProfileCard-btn--outline"
              onClick={handleShare}
              aria-label="Compartir perfil"
              title="Compartir perfil"
            >
              <span className="material-symbols-outlined" aria-hidden="true">share</span>
            </button>
          </div>

          {/* La biografía va debajo del avatar y termina un poco antes de los botones
              (ver &-header en _profile-card.scss). Se edita solo desde "Editar". */}
          <p className="ProfileCard-bio">
            {user.bio || (isOwnProfile ? 'Todavía no agregaste una biografía.' : 'Todavía no agregó una biografía.')}
          </p>
        </div>

        {shareFeedback && <p className="ProfileCard-shareFeedback">{shareFeedback}</p>}
      </div>
    </article>
  );
}

export default ProfileCard;
