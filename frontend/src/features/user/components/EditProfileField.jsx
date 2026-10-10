// Un campo de los formularios del perfil (EditProfileModal y ChangePasswordModal): label
// arriba (con * si es obligatorio), el control y, si está vacío o el backend lo rechazó,
// su error debajo.
import RequiredMark from '../../../core/components/RequiredMark.jsx';
import FieldError from '../../../core/components/FieldError.jsx';
import { getFieldErrorId } from '../../../shared/utils/fieldAria.js';

// Recibe: id (el del control), label, isRequired, error (texto o undefined) y children
// (el input/textarea).
function EditProfileField({ id, label, isRequired = false, error, children }) {
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

export default EditProfileField;
