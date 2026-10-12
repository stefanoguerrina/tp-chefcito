// Modal de alta de un usuario desde el panel admin. Reutiliza el mismo modal y los mismos
// campos que el registro (AuthModalLayout + RegisterFields + useRegisterForm), así pide
// exactamente los mismos datos con las mismas validaciones; solo suma la opción de darle
// rol de administrador y manda el formulario a POST /api/users en vez de al registro.
import { useState } from 'react';
import AuthModalLayout from '../../auth/components/AuthModalLayout.jsx';
import RegisterFields from '../../auth/components/RegisterFields.jsx';
import { useRegisterForm } from '../../auth/hooks/useRegisterForm.js';
import { createUserService } from '../../user/services/createUserService.js';
import RequiredFieldsNote from '../../../core/components/RequiredFieldsNote.jsx';
import { hasFieldErrors } from '../../../shared/utils/fieldAria.js';
import '../styles/_admin-create-user-modal.scss';

const TITLE_ID = 'admin-create-user-modal-title';

// Recibe: onClose y onUserCreated(usuario) (agrega el usuario nuevo a la tabla sin volver
// a pedir todo al backend).
function AdminCreateUserModal({ onClose, onUserCreated }) {
  const [makeAdmin, setMakeAdmin] = useState(false);

  const { form, isLoading, fieldErrors, generalError, registeredUsername, handleInputChange, handleDateChange, handleSubmit } =
    useRegisterForm({
      submitForm: (registerForm) => createUserService(registerForm, makeAdmin),
      onSuccess: onUserCreated,
    });

  if (registeredUsername) {
    return (
      <AuthModalLayout titleId={TITLE_ID} onClose={onClose}>
        {/* role="status": el lector de pantalla anuncia el mensaje apenas aparece. */}
        <div className="AuthModal-success" role="status">
          <div className="AuthModal-icon AuthModal-icon--success">
            <span className="material-symbols-outlined">check</span>
          </div>
          <h2 className="AuthModal-title" id={TITLE_ID}>Usuario creado</h2>
          <p className="AuthModal-subtitle">
            <strong>@{registeredUsername}</strong> ya puede iniciar sesión
            {makeAdmin ? ' y entrar al panel de administración.' : '.'}
          </p>
          <button type="button" className="AuthModal-submit" onClick={onClose} autoFocus>
            Listo
          </button>
        </div>
      </AuthModalLayout>
    );
  }

  return (
    <AuthModalLayout titleId={TITLE_ID} onClose={onClose} isWide>
      <div className="AuthModal-header">
        <div className="AuthModal-icon">
          <span className="material-symbols-outlined">person_add</span>
        </div>
        <h2 className="AuthModal-title" id={TITLE_ID}>Nuevo usuario</h2>
        <p className="AuthModal-subtitle">Creá una cuenta con los mismos datos que pide el registro.</p>
      </div>

      <form className="AuthModal-form" onSubmit={handleSubmit} noValidate>
        <RequiredFieldsNote isVisible={hasFieldErrors(fieldErrors)} />

        <RegisterFields
          idPrefix="admin-create"
          form={form}
          fieldErrors={fieldErrors}
          onInputChange={handleInputChange}
          onDateChange={handleDateChange}
        />

        <label className="AdminCreateUserModal-adminOption" htmlFor="admin-create-make-admin">
          <input
            id="admin-create-make-admin"
            type="checkbox"
            checked={makeAdmin}
            onChange={(event) => setMakeAdmin(event.target.checked)}
          />
          <span className="AdminCreateUserModal-adminText">
            <span className="AdminCreateUserModal-adminTitle">Darle rol de administrador</span>
            <span className="AdminCreateUserModal-adminHint">
              Además del rol Usuario, va a poder entrar a este panel.
            </span>
          </span>
        </label>

        {generalError && <p className="AuthModal-error" role="alert">{generalError}</p>}

        <button type="submit" className="AuthModal-submit" disabled={isLoading}>
          {isLoading ? 'Creando usuario...' : 'Crear usuario'}
        </button>
      </form>
    </AuthModalLayout>
  );
}

export default AdminCreateUserModal;
