// Cabecera del modal de edición de perfil: la portada con sus botones (cambiar / quitar) y
// el avatar superpuesto con los suyos. Solo muestra y dispara los selectores de archivo; el
// estado de cada foto vive en useImagePicker (EditProfileModal le pasa los dos).
// Estilos en _edit-profile-modal.scss.
import { useRef } from 'react';

// Botón redondo semitransparente que va encima de una foto.
// Recibe: icon (Material Symbols), label (texto accesible) y onClick.
function ImageActionButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      className="EditProfileModal-imageButton"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
}

// Recibe: cover y avatar (lo que devuelve useImagePicker para cada foto) e initials (se
// muestran en el avatar cuando no hay foto).
function EditProfileImages({ cover, avatar, initials }) {
  // Los <input type="file"> están ocultos: los botones los abren con .click().
  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  return (
    <>
      <div className="EditProfileModal-cover">
        {cover.previewUrl && <img src={cover.previewUrl} alt="Portada del perfil" />}
        <div className="EditProfileModal-imageActions">
          <ImageActionButton
            icon="add_photo_alternate"
            label={cover.previewUrl ? 'Cambiar portada' : 'Subir portada'}
            onClick={() => coverInputRef.current?.click()}
          />
          {cover.previewUrl && (
            <ImageActionButton icon="close" label="Quitar portada" onClick={cover.handleRemove} />
          )}
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="EditProfileModal-fileInput"
          onChange={cover.handleFileChange}
          aria-label="Elegir imagen de portada"
        />
      </div>

      <div className="EditProfileModal-avatarRow">
        <div className="EditProfileModal-avatar">
          {avatar.previewUrl ? (
            <img src={avatar.previewUrl} alt="Foto de perfil" />
          ) : (
            <span className="EditProfileModal-avatarInitials">{initials}</span>
          )}
          <div className="EditProfileModal-imageActions">
            <ImageActionButton
              icon="add_photo_alternate"
              label={avatar.previewUrl ? 'Cambiar foto de perfil' : 'Subir foto de perfil'}
              onClick={() => avatarInputRef.current?.click()}
            />
            {avatar.previewUrl && (
              <ImageActionButton icon="close" label="Quitar foto de perfil" onClick={avatar.handleRemove} />
            )}
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="EditProfileModal-fileInput"
            onChange={avatar.handleFileChange}
            aria-label="Elegir foto de perfil"
          />
        </div>
      </div>
    </>
  );
}

export default EditProfileImages;
