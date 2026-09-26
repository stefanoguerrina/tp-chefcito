// Cabecera del perfil: banner con nombre y badges, avatar, biografía, ubicación y las
// acciones principales (editar perfil o donar, y compartir).
import { useState } from 'react';

// Iniciales para el avatar de respaldo (nombre + apellido). No depende de ningún
// servicio externo de imágenes, así que siempre se ve algo aunque no haya foto
// o la URL cargada por el usuario esté rota.
const getInitials = (name, lastName) =>
  `${name?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';

// Recibe: user, recipesCount, isOwnProfile, onEditProfile (abre el modal de edición) y
// onDonate (perfil ajeno: muestra el aviso "Próximamente").
function ProfileHeader({ user, recipesCount, isOwnProfile, onEditProfile, onDonate }) {
  const [shareFeedback, setShareFeedback] = useState('');
  // Se activa si la URL de avatar cargada por el usuario no llega a cargar (rota,
  // sin conexión, etc.); en ese caso se cae al círculo con iniciales. ProfilePage monta
  // este componente con key={user.avatarUrl}, así que se reinicia al cambiar la foto.
  const [avatarBroken, setAvatarBroken] = useState(false);

  // Copia un resumen del perfil al portapapeles. No hay una página pública de
  // perfil todavía, así que "compartir" comparte el dato real (no un link falso).
  const handleShare = async () => {
    const summary = `${user.name} ${user.lastName} (@${user.username}) en Chefcito — ` +
      `${recipesCount} receta${recipesCount !== 1 ? 's' : ''} publicada${recipesCount !== 1 ? 's' : ''}.`;
    try {
      await navigator.clipboard.writeText(summary);
      setShareFeedback('¡Copiado al portapapeles!');
    } catch {
      setShareFeedback('No se pudo copiar. Copialo manualmente: ' + summary);
    }
    setTimeout(() => setShareFeedback(''), 3000);
  };

  return (
    <section className="ProfilePage-header">
      <div className="ProfilePage-banner">
        {/* Todavía no existe un campo de imagen de portada en el usuario: el botón
            queda visible para respetar el diseño, pero deshabilitado (mismo criterio
            que las tabs de abajo) en vez de prometer una acción que no pasa nada.
            En un perfil ajeno directamente no se muestra: no hay nada para editar. */}
        {isOwnProfile && (
          <button
            type="button"
            className="ProfilePage-coverButton"
            disabled
            title="Todavía no disponible"
          >
            <span className="material-symbols-outlined">photo_camera</span>
            Editar portada
          </button>
        )}

        <div className="ProfilePage-bannerRow">
          <div className="ProfilePage-bannerIdentity">
            {/* Las etiquetas van en la misma fila que el nombre, no sueltas al
                costado del bloque, para que queden a su misma altura. */}
            <div className="ProfilePage-bannerNameRow">
              <h2 className="ProfilePage-bannerName">{user.name} {user.lastName}</h2>

              <div className="ProfilePage-bannerBadges">
                {/* "Chef creador" no es un rol del backend: se muestra cuando el usuario
                    ya publicó al menos una receta, así el badge refleja un dato real. */}
                {recipesCount > 0 && (
                  <span className="ProfilePage-creatorBadge">
                    <span className="material-symbols-outlined">verified</span>
                    Chef Creador
                  </span>
                )}
                {user.specialty && (
                  <span className="ProfilePage-specialtyBadge">
                    <span className="material-symbols-outlined">restaurant_menu</span>
                    {user.specialty}
                  </span>
                )}
              </div>
            </div>

            <span className="ProfilePage-bannerUsername">@{user.username}</span>
          </div>
        </div>
      </div>

      {/* En el perfil propio, el avatar entero es el disparador de "cambiar foto"
          (abre el mismo modal de edición, donde está el campo de URL de la
          imagen). En uno ajeno es solo una imagen, sin overlay ni acción. */}
      {isOwnProfile ? (
        <button
          type="button"
          className="ProfilePage-avatarWrapper"
          onClick={onEditProfile}
          aria-label="Cambiar foto de perfil"
          title="Cambiar foto de perfil"
        >
          {user.avatarUrl && !avatarBroken ? (
            <img
              className="ProfilePage-avatar"
              src={user.avatarUrl}
              alt={user.username}
              onError={() => setAvatarBroken(true)}
            />
          ) : (
            <div className="ProfilePage-avatar ProfilePage-avatar--initials">
              {getInitials(user.name, user.lastName)}
            </div>
          )}

          <span className="ProfilePage-avatarOverlay">
            <span className="material-symbols-outlined">photo_camera</span>
            <span className="ProfilePage-avatarOverlayLabel">Cambiar</span>
          </span>
        </button>
      ) : (
        <div className="ProfilePage-avatarWrapper">
          {user.avatarUrl && !avatarBroken ? (
            <img
              className="ProfilePage-avatar"
              src={user.avatarUrl}
              alt={user.username}
              onError={() => setAvatarBroken(true)}
            />
          ) : (
            <div className="ProfilePage-avatar ProfilePage-avatar--initials">
              {getInitials(user.name, user.lastName)}
            </div>
          )}
        </div>
      )}

      <div className="ProfilePage-identityCard">
        <div className="ProfilePage-identityRow">
          <div className="ProfilePage-identityText">
            <div className="ProfilePage-bioRow">
              <p className="ProfilePage-bio">
                {user.bio || (isOwnProfile ? 'Todavía no agregaste una biografía.' : 'Todavía no agregó una biografía.')}
              </p>
              {isOwnProfile && (
                <button
                  type="button"
                  className="ProfilePage-bioEditButton"
                  onClick={onEditProfile}
                  aria-label="Editar biografía"
                  title="Editar biografía"
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
              )}
            </div>

            {user.location && (
              <p className="ProfilePage-location">
                <span className="material-symbols-outlined">location_on</span>
                {user.location}
              </p>
            )}
          </div>

          <div className="ProfilePage-actions">
            {isOwnProfile ? (
              <button
                type="button"
                className="ProfilePage-button ProfilePage-button--primary"
                onClick={onEditProfile}
              >
                <span className="material-symbols-outlined">edit</span>
                Editar perfil
              </button>
            ) : (
              <button
                type="button"
                className="ProfilePage-button ProfilePage-button--primary"
                onClick={onDonate}
              >
                <span className="material-symbols-outlined">volunteer_activism</span>
                Donar
              </button>
            )}
            <button
              type="button"
              className="ProfilePage-button ProfilePage-button--outline"
              onClick={handleShare}
            >
              <span className="material-symbols-outlined">share</span>
              Compartir
            </button>
          </div>
        </div>

        {shareFeedback && <p className="ProfilePage-shareFeedback">{shareFeedback}</p>}
      </div>
    </section>
  );
}

export default ProfileHeader;
