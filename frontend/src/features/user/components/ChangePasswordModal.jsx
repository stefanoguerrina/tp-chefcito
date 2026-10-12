// Modal para cambiar la contraseña propia: pide la actual (el backend la verifica), la nueva
// y su confirmación. Se abre desde "Editar perfil" y usa su mismo diseño.
import { useId, useState } from 'react';
import EditProfileField from './EditProfileField.jsx';
import RequiredFieldsNote from '../../../core/components/RequiredFieldsNote.jsx';
import { useOverlayClose } from '../../../core/hooks/useOverlayClose.js';
import { changePasswordService } from '../services/changePasswordService.js';
import { createPasswordForm, validatePasswordForm } from '../models/userModel.js';
import { PASSWORD_MIN_LENGTH } from '../../auth/models/registerModel.js';
import { getFieldAriaProps, hasFieldErrors, mapApiFieldErrors } from '../../../shared/utils/fieldAria.js';
import '../styles/_edit-profile-modal.scss';

// Campos del formulario: { name, label, autoComplete, placeholder }. El nombre coincide con
// el campo que valida el backend (salvo confirmPassword, que solo existe acá).
const PASSWORD_FIELDS = [
  { name: 'currentPassword', label: 'Contraseña actual', autoComplete: 'current-password' },
  {
    name: 'newPassword',
    label: 'Contraseña nueva',
    autoComplete: 'new-password',
    placeholder: `Al menos ${PASSWORD_MIN_LENGTH} caracteres`,
  },
  { name: 'confirmPassword', label: 'Repetí la contraseña nueva', autoComplete: 'new-password' },
];

// Recibe: userId, onClose y onChanged (se llama cuando el backend confirmó el cambio).
function ChangePasswordModal({ userId, onClose, onChanged }) {
  const id = useId();
  const [form, setForm] = useState(createPasswordForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const overlayCloseProps = useOverlayClose(isSaving ? undefined : onClose);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const errors = validatePasswordForm(form);
    if (hasFieldErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      await changePasswordService(userId, form.currentPassword, form.newPassword);
      onChanged();
    } catch (err) {
      // La contraseña actual incorrecta (o la nueva rechazada) va debajo de su campo.
      const apiErrors = mapApiFieldErrors(err.fieldErrors, {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
      });
      if (hasFieldErrors(apiErrors)) setFieldErrors(apiErrors);
      else setError(err.message);
      setIsSaving(false);
    }
  };

  return (
    <div className="EditProfileModal-overlay" {...overlayCloseProps}>
      <div
        className="EditProfileModal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="EditProfileModal-title" id={`${id}-title`}>Cambiar contraseña</h2>
        <button type="button" className="EditProfileModal-close" onClick={onClose} disabled={isSaving} aria-label="Cerrar">
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="EditProfileModal-scroll">
          <form id={`${id}-form`} className="EditProfileModal-form" onSubmit={handleSubmit} noValidate>
            <RequiredFieldsNote isVisible={hasFieldErrors(fieldErrors)} />

            {PASSWORD_FIELDS.map((field) => (
              <EditProfileField
                key={field.name}
                id={`${id}-${field.name}`}
                label={field.label}
                isRequired
                error={fieldErrors[field.name]}
              >
                <input
                  id={`${id}-${field.name}`}
                  className="EditProfileModal-input"
                  type="password"
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                  {...getFieldAriaProps(`${id}-${field.name}`, { error: fieldErrors[field.name], isRequired: true })}
                />
              </EditProfileField>
            ))}

            {error && <p className="EditProfileModal-error">{error}</p>}
          </form>
        </div>

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
            {isSaving ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
