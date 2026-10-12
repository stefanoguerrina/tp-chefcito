// Campo "Teléfono" de EditProfileModal: la característica de Argentina va fija a la
// izquierda (no se edita) y solo se escribe el resto del número.
import EditProfileField from './EditProfileField.jsx';
import ArgentinaFlag from '../../../core/components/ArgentinaFlag.jsx';
import { PHONE_COUNTRY_PREFIX, PHONE_NUMBER_MAX_LENGTH } from '../../auth/models/registerModel.js';

// Recibe: inputProps (id, value, onChange y aria del input) y error (texto o undefined).
function EditProfilePhoneField({ inputProps, error }) {
  return (
    <EditProfileField id={inputProps.id} label="Teléfono" error={error}>
      <div className="EditProfileModal-addonGroup">
        <span className="EditProfileModal-addon" title="Argentina">
          <ArgentinaFlag className="EditProfileModal-flag" />
          {PHONE_COUNTRY_PREFIX}
        </span>
        <input
          className="EditProfileModal-input EditProfileModal-input--addon"
          type="tel"
          autoComplete="tel-national"
          placeholder="Ej: 341 555-0101"
          maxLength={PHONE_NUMBER_MAX_LENGTH}
          {...inputProps}
        />
      </div>
    </EditProfileField>
  );
}

export default EditProfilePhoneField;
