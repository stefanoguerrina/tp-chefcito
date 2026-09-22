// Modal para editar los datos propios del perfil (nombre, apellido, teléfono, avatar, bio, especialidad, ubicación).
// Reutiliza el mismo servicio (updateUserService) que ya usa el panel de admin para
// editar usuarios, pero acá lo dispara el propio usuario sobre su cuenta.
import { useState } from 'react';
import { updateUserService } from '../services/updateUserService.js';
import '../styles/_edit-profile-modal.scss';

// Recibe: user (datos actuales), onClose y onSaved(updatedUser).
function EditProfileModal({ user, onClose, onSaved }) {
  const [name, setName] = useState(user.name ?? '');
  const [lastName, setLastName] = useState(user.lastName ?? '');
  const [phone, setPhone] = useState(user.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '');
  const [bio, setBio] = useState(user.bio ?? '');
  const [specialty, setSpecialty] = useState(user.specialty ?? '');
  const [location, setLocation] = useState(user.location ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const updated = await updateUserService(user.id, {
        name: name.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        bio: bio.trim() || null,
        specialty: specialty.trim() || null,
        location: location.trim() || null,
      });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="EditProfileModal-overlay" onClick={onClose}>
      <div
        className="EditProfileModal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="EditProfileModal-title" id="edit-profile-modal-title">Editar perfil</h3>

        <form onSubmit={handleSubmit} className="EditProfileModal-form" noValidate>
          <div className="EditProfileModal-field">
            <label htmlFor="edit-profile-name">Nombre</label>
            <input
              id="edit-profile-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              maxLength={100}
              required
            />
          </div>

          <div className="EditProfileModal-field">
            <label htmlFor="edit-profile-lastName">Apellido</label>
            <input
              id="edit-profile-lastName"
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              minLength={2}
              maxLength={100}
              required
            />
          </div>

          <div className="EditProfileModal-field">
            <label htmlFor="edit-profile-phone">Teléfono (opcional)</label>
            <input
              id="edit-profile-phone"
              type="text"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              maxLength={20}
              placeholder="Ej: +54 9 11 1234-5678"
            />
          </div>

          <div className="EditProfileModal-field">
            <label htmlFor="edit-profile-avatar">URL de tu foto de perfil (opcional)</label>
            <input
              id="edit-profile-avatar"
              type="url"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="EditProfileModal-field">
            <label htmlFor="edit-profile-specialty">Especialidad (opcional)</label>
            <input
              id="edit-profile-specialty"
              type="text"
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
              maxLength={60}
              placeholder="Ej: Pastas & Masas"
            />
          </div>

          <div className="EditProfileModal-field">
            <label htmlFor="edit-profile-location">Ubicación (opcional)</label>
            <input
              id="edit-profile-location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={100}
              placeholder="Ej: Rosario, Santa Fe"
            />
          </div>

          <div className="EditProfileModal-field">
            <label htmlFor="edit-profile-bio">Biografía (opcional)</label>
            <textarea
              id="edit-profile-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={255}
              rows={3}
              placeholder="Contá brevemente qué te gusta cocinar..."
            />
            <span className="EditProfileModal-charCount">{bio.length}/255</span>
          </div>

          {error && <div className="EditProfileModal-alert">⚠ {error}</div>}

          <div className="EditProfileModal-actions">
            <button
              type="button"
              className="EditProfileModal-button EditProfileModal-button--cancel"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="EditProfileModal-button EditProfileModal-button--confirm"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
