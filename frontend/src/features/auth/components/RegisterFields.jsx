// Campos del formulario de alta de una cuenta (nombre, apellido, usuario, email, teléfono,
// fecha de nacimiento y contraseña). Los comparten el registro (RegisterForm) y el alta de
// un usuario desde el panel admin (AdminCreateUserModal), así los dos piden lo mismo y con
// las mismas validaciones. Desde sm van de a dos por fila (AuthModal-row).
import { useState } from "react";
import { formatDateDisplay, PHONE_COUNTRY_PREFIX, PASSWORD_MIN_LENGTH } from "../models/registerModel";
import { getFieldAriaProps } from "../../../shared/utils/fieldAria.js";
import DatePickerModal from "../../../core/components/DatePickerModal.jsx";
import ArgentinaFlag from "../../../core/components/ArgentinaFlag.jsx";
import AuthField from "./AuthField.jsx";
import PasswordInput from "./PasswordInput.jsx";
import "../styles/_auth-modal.scss";

const PASSWORD_HINT = `Usá al menos ${PASSWORD_MIN_LENGTH} caracteres.`;

// Recibe: form y fieldErrors (los de useRegisterForm), onInputChange(event, campo),
// onDateChange(fechaIso) e idPrefix (prefijo de los ids de los inputs, para que no se
// repitan si hay dos formularios en la misma página).
function RegisterFields({ form, fieldErrors, onInputChange, onDateChange, idPrefix = "register" }) {
    // Estado puramente visual: si el modal de calendario está abierto.
    const [showDatePicker, setShowDatePicker] = useState(false);

    const ids = {
        name: `${idPrefix}-name`,
        lastName: `${idPrefix}-lastname`,
        username: `${idPrefix}-username`,
        email: `${idPrefix}-email`,
        phone: `${idPrefix}-phone`,
        birthDate: `${idPrefix}-birthdate`,
        password: `${idPrefix}-password`,
    };

    return (
        <>
            <div className="AuthModal-row">
                <AuthField id={ids.name} label="Nombre" isRequired error={fieldErrors.formalName}>
                    <input
                        className="AuthModal-input"
                        id={ids.name}
                        type="text"
                        autoComplete="given-name"
                        value={form.formalName}
                        onChange={(event) => onInputChange(event, "formalName")}
                        {...getFieldAriaProps(ids.name, { error: fieldErrors.formalName, isRequired: true })}
                    />
                </AuthField>
                <AuthField id={ids.lastName} label="Apellido" isRequired error={fieldErrors.surName}>
                    <input
                        className="AuthModal-input"
                        id={ids.lastName}
                        type="text"
                        autoComplete="family-name"
                        value={form.surName}
                        onChange={(event) => onInputChange(event, "surName")}
                        {...getFieldAriaProps(ids.lastName, { error: fieldErrors.surName, isRequired: true })}
                    />
                </AuthField>
            </div>

            <div className="AuthModal-row">
                <AuthField id={ids.username} label="Nombre de usuario" isRequired error={fieldErrors.userName}>
                    <input
                        className="AuthModal-input"
                        id={ids.username}
                        type="text"
                        autoComplete="username"
                        value={form.userName}
                        onChange={(event) => onInputChange(event, "userName")}
                        {...getFieldAriaProps(ids.username, { error: fieldErrors.userName, isRequired: true })}
                    />
                </AuthField>

                <AuthField id={ids.email} label="Email" isRequired error={fieldErrors.email}>
                    <input
                        className="AuthModal-input"
                        id={ids.email}
                        type="email"
                        placeholder="nombre@mail.com"
                        autoComplete="email"
                        value={form.email}
                        onChange={(event) => onInputChange(event, "email")}
                        {...getFieldAriaProps(ids.email, { error: fieldErrors.email, isRequired: true })}
                    />
                </AuthField>
            </div>

            <div className="AuthModal-row">
                <AuthField id={ids.phone} label="Teléfono" error={fieldErrors.telephone}>
                    <div className={`AuthModal-phoneWrapper${fieldErrors.telephone ? " AuthModal-phoneWrapper--invalid" : ""}`}>
                        <span className="AuthModal-phonePrefix">
                            <ArgentinaFlag className="AuthModal-phoneFlag" />
                            {PHONE_COUNTRY_PREFIX}
                        </span>
                        <input
                            className="AuthModal-input AuthModal-phoneInput"
                            id={ids.phone}
                            type="tel"
                            autoComplete="tel-national"
                            value={form.telephone}
                            onChange={(event) => onInputChange(event, "telephone")}
                            {...getFieldAriaProps(ids.phone, { error: fieldErrors.telephone })}
                        />
                    </div>
                </AuthField>

                <AuthField id={ids.birthDate} label="Fecha de nacimiento" error={fieldErrors.birthDate}>
                    <button
                        type="button"
                        className="AuthModal-dateButton"
                        id={ids.birthDate}
                        onClick={() => setShowDatePicker(true)}
                        {...getFieldAriaProps(ids.birthDate, { error: fieldErrors.birthDate })}
                    >
                        <span className={form.birthDate ? "" : "AuthModal-dateButton--placeholder"}>
                            {form.birthDate ? formatDateDisplay(form.birthDate) : "DD/MM/AAAA"}
                        </span>
                        <span className="material-symbols-outlined">calendar_month</span>
                    </button>
                </AuthField>
            </div>

            <AuthField id={ids.password} label="Contraseña" isRequired error={fieldErrors.password} hint={PASSWORD_HINT}>
                <PasswordInput
                    id={ids.password}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(event) => onInputChange(event, "password")}
                    {...getFieldAriaProps(ids.password, {
                        error: fieldErrors.password,
                        hint: PASSWORD_HINT,
                        isRequired: true
                    })}
                />
            </AuthField>

            {showDatePicker && (
                <DatePickerModal
                    value={form.birthDate}
                    onSelect={onDateChange}
                    onClose={() => setShowDatePicker(false)}
                />
            )}
        </>
    );
}

export default RegisterFields;
