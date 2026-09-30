// Modal para editar el perfil: foto de perfil y portada (se suben como archivo), nombre,
// apellido, especialidad, ubicación, teléfono y biografía. Adapta a nuestro stack el diálogo "Edit profile" de shadcn: barra de
// título con cruz, portada + avatar superpuesto, formulario y pie con Cancelar / Guardar
// (sin Radix, Tailwind ni lucide: SASS, Material Symbols y un overlay propio).
// Lo usan el propio usuario (ProfilePage) y el admin (AdminUsersTable).
import { useEffect, useId, useState } from 'react';
import { updateUserService } from '../services/updateUserService.js';
import { uploadUserImageService, deleteUserImageService } from '../services/userImageService.js';
import { useImagePicker } from '../../../core/hooks/useImagePicker.js';
import { compressImage } from '../../../shared/utils/compressImage.js';
import EditProfileImages from './EditProfileImages.jsx';
import { PHONE_COUNTRY_PREFIX } from '../../auth/models/registerModel.js';
import ArgentinaFlag from '../../../core/components/ArgentinaFlag.jsx';
import RequiredMark from '../../../core/components/RequiredMark.jsx';
import RequiredFieldsNote from '../../../core/components/RequiredFieldsNote.jsx';
import FieldError from '../../../core/components/FieldError.jsx';
import { getFieldAriaProps, getFieldErrorId, hasFieldErrors } from '../../../shared/utils/fieldAria.js';
import '../styles/_edit-profile-modal.scss';

const BIO_MAX_LENGTH = 255;
// El backend acepta hasta 20 caracteres para todo el teléfono: se descuentan los que
// ocupa la característica fija ("+54 ").
const PHONE_NUMBER_MAX_LENGTH = 20 - `${PHONE_COUNTRY_PREFIX} `.length;

// Recibe: el teléfono guardado (ej. "+54 341 555-0101" o null). Devuelve solo la parte
// editable, sin la característica: el +54 va fijo en el campo y no se puede cambiar.
const stripCountryPrefix = (phone) => {
  const value = (phone ?? '').trim();
  return value.startsWith(PHONE_COUNTRY_PREFIX) ? value.slice(PHONE_COUNTRY_PREFIX.length).trim() : value;
};

// Iniciales para el avatar de respaldo (sin foto).
const getInitials = (name, lastName) =>
  `${name?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';

// Sube la foto nueva o quita la que había, según lo que se eligió en el modal. Si no se
// tocó nada, no llama al backend. Recibe: userId, kind ('avatar' | 'cover'), picker (lo de
// useImagePicker) y hadImage (si el usuario ya tenía esa foto). Devuelve: el usuario
// actualizado, o null si no hubo cambios.
const saveImageChange = async (userId, kind, picker, hadImage) => {
  if (picker.file) {
    // Se comprime antes de subir (WebP, máx. 1280px), igual que las fotos de recetas.
    return await uploadUserImageService(userId, kind, await compressImage(picker.file));
  }
  if (picker.isRemoved && hadImage) {
    return await deleteUserImageService(userId, kind);
  }
  return null;
};

// Un campo del formulario: label arriba (con * si es obligatorio), el control y, si está
// vacío o el backend lo rechazó, su error debajo. Recibe: id, label, isRequired, error
// (texto o undefined) y children (el input/textarea).
function Field({ id, label, isRequired = false, error, children }) {
  return (
    <div className="EditProfileModal-field">
      <label className="EditProfileModal-label" htmlFor={id}>
        {label}
        {isRequired && <RequiredMark />}
      </label>
      {children}
      <FieldError id={getFieldErrorId(id)} message={error} />
    </div>
  );
}

// Recibe: user (datos actuales), onClose y onSaved(updatedUser).
function EditProfileModal({ user, onClose, onSaved }) {
  const id = useId();
  const avatar = useImagePicker(user.avatarUrl);
  const cover = useImagePicker(user.coverUrl);

  const [name, setName] = useState(user.name ?? '');
  const [lastName, setLastName] = useState(user.lastName ?? '');
  // Solo el número, sin el +54 (se vuelve a agregar al guardar, ver handleSubmit).
  const [phone, setPhone] = useState(stripCountryPrefix(user.phone));
  const [bio, setBio] = useState(user.bio ?? '');
  const [specialty, setSpecialty] = useState(user.specialty ?? '');
  const [location, setLocation] = useState(user.location ?? '');
  const [isSaving, setIsSaving] = useState(false);
  // Errores que devolvió el backend: por campo ({ name: '...' }) o uno general.
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');

  // Escape cierra el modal (salvo mientras se guarda), como cualquier diálogo.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, onClose]);

  // Al escribir en un campo se borra solo SU error.
  const clearFieldError = (field) => setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Nombre y apellido son obligatorios (el backend los rechaza vacíos): se avisa debajo
    // de cada uno sin llamar al backend.
    const requiredErrors = {};
    if (!name.trim()) requiredErrors.name = 'Ingresá tu nombre.';
    if (!lastName.trim()) requiredErrors.lastName = 'Ingresá tu apellido.';
    if (Object.keys(requiredErrors).length > 0) {
      setFieldErrors(requiredErrors);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    try {
      // Primero los datos y después cada foto: cada pedido devuelve el usuario actualizado,
      // y el último es el que se le pasa a onSaved.
      let updated = await updateUserService(user.id, {
        name: name.trim(),
        lastName: lastName.trim(),
        // Mismo formato que al registrarse (registerService): "+54 <número>".
        phone: phone.trim() ? `${PHONE_COUNTRY_PREFIX} ${phone.trim()}` : null,
        bio: bio.trim() || null,
        specialty: specialty.trim() || null,
        location: location.trim() || null,
      });
      updated = (await saveImageChange(user.id, 'avatar', avatar, Boolean(user.avatarUrl))) ?? updated;
      updated = (await saveImageChange(user.id, 'cover', cover, Boolean(user.coverUrl))) ?? updated;
      onSaved(updated);
    } catch (err) {
      // Si el backend marcó campos del formulario, cada error va debajo de su campo; si no
      // (ej. una foto rechazada), se muestra el mensaje general arriba del pie.
      const hasFormFieldErrors = err.fieldErrors?.some(({ campo }) => campo !== 'image');
      if (hasFormFieldErrors) {
        setFieldErrors(Object.fromEntries(err.fieldErrors.map(({ campo, mensaje }) => [campo, mensaje])));
      } else {
        setError(err.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="EditProfileModal-overlay" onClick={isSaving ? undefined : onClose}>
      <div
        className="EditProfileModal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="EditProfileModal-title" id={`${id}-title`}>Editar perfil</h2>
        <button
          type="button"
          className="EditProfileModal-close"
          onClick={onClose}
          disabled={isSaving}
          aria-label="Cerrar"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="EditProfileModal-scroll">
          <EditProfileImages cover={cover} avatar={avatar} initials={getInitials(name, lastName)} />

          <form id={`${id}-form`} className="EditProfileModal-form" onSubmit={handleSubmit} noValidate>
            <RequiredFieldsNote isVisible={hasFieldErrors(fieldErrors)} />

            <div className="EditProfileModal-row">
              <Field id={`${id}-name`} label="Nombre" isRequired error={fieldErrors.name}>
                <input
                  id={`${id}-name`}
                  className="EditProfileModal-input"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    clearFieldError('name');
                  }}
                  placeholder="Juan"
                  maxLength={100}
                  {...getFieldAriaProps(`${id}-name`, { error: fieldErrors.name, isRequired: true })}
                />
              </Field>
              <Field id={`${id}-lastName`} label="Apellido" isRequired error={fieldErrors.lastName}>
                <input
                  id={`${id}-lastName`}
                  className="EditProfileModal-input"
                  type="text"
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value);
                    clearFieldError('lastName');
                  }}
                  placeholder="Pérez"
                  maxLength={100}
                  {...getFieldAriaProps(`${id}-lastName`, { error: fieldErrors.lastName, isRequired: true })}
                />
              </Field>
            </div>

            {/* El nombre de usuario no se puede cambiar (el backend no lo permite): se
                muestra solo como referencia, con un candado. */}
            {user.username && (
              <Field id={`${id}-username`} label="Nombre de usuario">
                <div className="EditProfileModal-inputWrapper">
                  <input
                    id={`${id}-username`}
                    className="EditProfileModal-input EditProfileModal-input--withIcon"
                    type="text"
                    value={user.username}
                    disabled
                  />
                  <span className="EditProfileModal-inputIcon material-symbols-outlined" title="No se puede cambiar">
                    lock
                  </span>
                </div>
              </Field>
            )}

            <div className="EditProfileModal-row">
              <Field id={`${id}-specialty`} label="Especialidad" error={fieldErrors.specialty}>
                <input
                  id={`${id}-specialty`}
                  {...getFieldAriaProps(`${id}-specialty`, { error: fieldErrors.specialty })}
                  className="EditProfileModal-input"
                  type="text"
                  value={specialty}
                  onChange={(event) => setSpecialty(event.target.value)}
                  placeholder="Ej: Pastas & Masas"
                  maxLength={60}
                />
              </Field>
              <Field id={`${id}-location`} label="Ubicación" error={fieldErrors.location}>
                <input
                  id={`${id}-location`}
                  {...getFieldAriaProps(`${id}-location`, { error: fieldErrors.location })}
                  className="EditProfileModal-input"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Ej: Rosario, Santa Fe"
                  maxLength={100}
                />
              </Field>
            </div>

            {/* La característica de Argentina va fija a la izquierda (no se edita): solo
                se escribe el resto del número. */}
            <Field id={`${id}-phone`} label="Teléfono" error={fieldErrors.phone}>
              <div className="EditProfileModal-addonGroup">
                <span className="EditProfileModal-addon" title="Argentina">
                  <ArgentinaFlag className="EditProfileModal-flag" />
                  {PHONE_COUNTRY_PREFIX}
                </span>
                <input
                  id={`${id}-phone`}
                  {...getFieldAriaProps(`${id}-phone`, { error: fieldErrors.phone })}
                  className="EditProfileModal-input EditProfileModal-input--addon"
                  type="tel"
                  autoComplete="tel-national"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Ej: 9 11 1234-5678"
                  maxLength={PHONE_NUMBER_MAX_LENGTH}
                />
              </div>
            </Field>

            <Field id={`${id}-bio`} label="Biografía" error={fieldErrors.bio}>
              <textarea
                id={`${id}-bio`}
                {...getFieldAriaProps(`${id}-bio`, { error: fieldErrors.bio })}
                className="EditProfileModal-input EditProfileModal-textarea"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Contá en pocas palabras qué te gusta cocinar"
                maxLength={BIO_MAX_LENGTH}
                aria-describedby={`${id}-bio-count`}
              />
              <p id={`${id}-bio-count`} className="EditProfileModal-charCount" role="status" aria-live="polite">
                {BIO_MAX_LENGTH - bio.length} caracteres restantes
              </p>
            </Field>

            {error && <p className="EditProfileModal-error">{error}</p>}
          </form>
        </div>

        {/* Los botones viven fuera del <form> (en el pie fijo): form="..." los conecta. */}
        <div className="EditProfileModal-footer">
          <button
            type="button"
            className="EditProfileModal-button EditProfileModal-button--outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form={`${id}-form`}
            className="EditProfileModal-button EditProfileModal-button--primary"
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
