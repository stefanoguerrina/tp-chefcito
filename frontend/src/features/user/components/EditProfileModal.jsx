// Modal para editar el perfil: foto de perfil y portada (se suben como archivo), nombre,
// apellido, especialidad, ubicación, teléfono y biografía. Adapta a nuestro stack el diálogo "Edit profile" de shadcn: barra de
// título con cruz, portada + avatar superpuesto, formulario y pie con Cancelar / Guardar
// (sin Radix, Tailwind ni lucide: SASS, Material Symbols y un overlay propio).
// Lo usan el propio usuario (ProfilePage) y el admin (AdminUsersTable). El estado del
// formulario y el guardado viven en useEditProfileForm.
import { useEffect, useId, useState } from 'react';
import EditProfileImages from './EditProfileImages.jsx';
import EditProfileField from './EditProfileField.jsx';
import ChangePasswordModal from './ChangePasswordModal.jsx';
import EditProfilePhoneField from './EditProfilePhoneField.jsx';
import { useEditProfileForm } from '../hooks/useEditProfileForm.js';
import { getUserInitials } from '../models/userModel.js';
import AlertModal from '../../../core/components/AlertModal.jsx';
import RequiredFieldsNote from '../../../core/components/RequiredFieldsNote.jsx';
import { useOverlayClose } from '../../../core/hooks/useOverlayClose.js';
import { getFieldAriaProps, hasFieldErrors } from '../../../shared/utils/fieldAria.js';
import '../styles/_edit-profile-modal.scss';

const BIO_MAX_LENGTH = 255;

// Recibe: user (datos actuales), onClose, onSaved(updatedUser) y canChangePassword (si se
// muestra "Cambiar contraseña": solo para la cuenta propia, porque el backend pide la
// contraseña actual, que un admin no conoce).
function EditProfileModal({ user, onClose, onSaved, canChangePassword = false }) {
  const id = useId();
  const { form, avatar, cover, fieldErrors, error, isSaving, updateField, handleSubmit } =
    useEditProfileForm(user, onSaved);
  // Si está abierto el modal de cambiar contraseña, y si hay que avisar que se cambió.
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const overlayCloseProps = useOverlayClose(isSaving ? undefined : onClose);

  // Escape cierra el modal (salvo mientras se guarda), como cualquier diálogo. Si está
  // abierto el de la contraseña (que va encima), cierra solo ese.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (isChangingPassword) setIsChangingPassword(false);
      else if (!isSaving) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, isChangingPassword, onClose]);

  // Recibe: el campo del form. Devuelve los props comunes de su input: id, valor, onChange
  // y los aria (que también le dan el borde rojo si tiene error).
  const getInputProps = (field, isRequired = false) => ({
    id: `${id}-${field}`,
    value: form[field],
    onChange: (event) => updateField(field, event.target.value),
    ...getFieldAriaProps(`${id}-${field}`, { error: fieldErrors[field], isRequired }),
  });

  return (
    <>
      <div className="EditProfileModal-overlay" {...overlayCloseProps}>
        <div
          className="EditProfileModal-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-title`}
          onClick={(event) => event.stopPropagation()}
        >
          <h2 className="EditProfileModal-title" id={`${id}-title`}>Editar perfil</h2>
          <button type="button" className="EditProfileModal-close" onClick={onClose} disabled={isSaving} aria-label="Cerrar">
            <span className="material-symbols-outlined">close</span>
          </button>

          <div className="EditProfileModal-scroll">
            <EditProfileImages cover={cover} avatar={avatar} initials={getUserInitials(form.name, form.lastName)} />

            <form id={`${id}-form`} className="EditProfileModal-form" onSubmit={handleSubmit} noValidate>
              <RequiredFieldsNote isVisible={hasFieldErrors(fieldErrors)} />

              <div className="EditProfileModal-row">
                <EditProfileField id={`${id}-name`} label="Nombre" isRequired error={fieldErrors.name}>
                  <input className="EditProfileModal-input" type="text" placeholder="Juan" maxLength={100} {...getInputProps('name', true)} />
                </EditProfileField>
                <EditProfileField id={`${id}-lastName`} label="Apellido" isRequired error={fieldErrors.lastName}>
                  <input className="EditProfileModal-input" type="text" placeholder="Pérez" maxLength={100} {...getInputProps('lastName', true)} />
                </EditProfileField>
              </div>

              {/* El nombre de usuario no se puede cambiar (el backend no lo permite): se
                  muestra solo como referencia, con un candado. */}
              {user.username && (
                <EditProfileField id={`${id}-username`} label="Nombre de usuario">
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
                </EditProfileField>
              )}

              {canChangePassword && (
                <button
                  type="button"
                  className="EditProfileModal-button EditProfileModal-button--outline EditProfileModal-passwordButton"
                  onClick={() => setIsChangingPassword(true)}
                  disabled={isSaving}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">lock</span>
                  Cambiar contraseña
                </button>
              )}

              <div className="EditProfileModal-row">
                <EditProfileField id={`${id}-specialty`} label="Especialidad" error={fieldErrors.specialty}>
                  <input className="EditProfileModal-input" type="text" placeholder="Ej: Pastas & Masas" maxLength={60} {...getInputProps('specialty')} />
                </EditProfileField>
                <EditProfileField id={`${id}-location`} label="Ubicación" error={fieldErrors.location}>
                  <input className="EditProfileModal-input" type="text" placeholder="Ej: Rosario, Santa Fe" maxLength={100} {...getInputProps('location')} />
                </EditProfileField>
              </div>

              <EditProfilePhoneField inputProps={getInputProps('phone')} error={fieldErrors.phone} />

              <EditProfileField id={`${id}-bio`} label="Biografía" error={fieldErrors.bio}>
                <textarea
                  className="EditProfileModal-input EditProfileModal-textarea"
                  placeholder="Contá en pocas palabras qué te gusta cocinar"
                  maxLength={BIO_MAX_LENGTH}
                  {...getInputProps('bio')}
                  // Con error, el lector de pantalla lee el error; si no, cuántos caracteres quedan.
                  aria-describedby={fieldErrors.bio ? `${id}-bio-error` : `${id}-bio-count`}
                />
                <p id={`${id}-bio-count`} className="EditProfileModal-charCount" role="status" aria-live="polite">
                  {BIO_MAX_LENGTH - form.bio.length} caracteres restantes
                </p>
              </EditProfileField>

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

      {/* Fuera del overlay: si estuvieran adentro, el clic en su fondo también llegaría
          al fondo de este modal. */}
      {isChangingPassword && (
        <ChangePasswordModal
          userId={user.id}
          onClose={() => setIsChangingPassword(false)}
          onChanged={() => {
            setIsChangingPassword(false);
            setIsPasswordChanged(true);
          }}
        />
      )}

      {isPasswordChanged && (
        <AlertModal
          title="Contraseña actualizada"
          message="La próxima vez que inicies sesión, usá la contraseña nueva."
          onClose={() => setIsPasswordChanged(false)}
        />
      )}
    </>
  );
}

export default EditProfileModal;
