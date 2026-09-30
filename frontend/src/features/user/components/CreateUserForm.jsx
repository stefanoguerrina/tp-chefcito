// Formulario de alta de usuario, visible solo para administradores en el panel de admin.
// Permite crear usuarios regulares o admins (con el checkbox makeAdmin). Los obligatorios
// llevan * en el label y cada campo muestra su propio error debajo.
import { useCreateUserForm } from '../hooks/useCreateUserForm.js';
import RequiredMark from '../../../core/components/RequiredMark.jsx';
import RequiredFieldsNote from '../../../core/components/RequiredFieldsNote.jsx';
import FieldError from '../../../core/components/FieldError.jsx';
import { getFieldAriaProps, getFieldErrorId } from '../../../shared/utils/fieldAria.js';

// Un campo de la grilla: label (con * si es obligatorio), el input y su error debajo.
// Recibe: id (el del input), label, isRequired, error y children (el input).
function FormGroup({ id, label, isRequired = false, error, children }) {
    return (
        <div className="admin-panel__form-group">
            <label htmlFor={id}>
                {label}
                {isRequired && <RequiredMark />}
            </label>
            {children}
            <FieldError id={getFieldErrorId(id)} message={error} />
        </div>
    );
}

// Campos de texto del alta, en el orden de la grilla. isRequired coincide con lo que
// exige el backend (teléfono y fecha son opcionales).
const TEXT_FIELDS = [
    { field: 'username', id: 'createUsername', label: 'Usuario', type: 'text', placeholder: 'nombre_usuario', isRequired: true },
    { field: 'password', id: 'createPassword', label: 'Contraseña', type: 'password', placeholder: 'Mínimo 6 caracteres', isRequired: true },
    { field: 'name', id: 'createName', label: 'Nombre', type: 'text', placeholder: 'Nombre', isRequired: true },
    { field: 'lastName', id: 'createLastName', label: 'Apellido', type: 'text', placeholder: 'Apellido', isRequired: true },
    { field: 'email', id: 'createEmail', label: 'Email', type: 'email', placeholder: 'usuario@ejemplo.com', isRequired: true },
    { field: 'phone', id: 'createPhone', label: 'Teléfono', type: 'text', placeholder: 'Ej: +54 9 11 1234-5678' },
    { field: 'birthDate', id: 'createBirthDate', label: 'Fecha de nacimiento', type: 'date' },
];

const CreateUserForm = ({ onUserCreated, onCancel }) => {
    const { form, isLoading, error, fieldErrors, success, handleInputChange, handleSubmit } =
        useCreateUserForm({ onUserCreated });

    return (
        <div className="admin-panel__create-form">
            <h3 className="admin-panel__create-form-title">Nuevo Usuario</h3>

            {/* noValidate: los errores los muestra la app debajo de cada campo. */}
            <form onSubmit={handleSubmit} noValidate>
                <RequiredFieldsNote className="admin-panel__required-note" />

                <div className="admin-panel__form-grid">
                    {TEXT_FIELDS.map(({ field, id, label, type, placeholder, isRequired }) => (
                        <FormGroup key={field} id={id} label={label} isRequired={isRequired} error={fieldErrors[field]}>
                            <input
                                id={id}
                                className="admin-panel__input"
                                type={type}
                                placeholder={placeholder}
                                value={form[field]}
                                onChange={(e) => handleInputChange(e, field)}
                                {...getFieldAriaProps(id, { error: fieldErrors[field], isRequired })}
                            />
                        </FormGroup>
                    ))}
                </div>

                {/* Checkbox de rol admin — debajo de la grilla para darle énfasis visual */}
                <div className="admin-panel__form-group admin-panel__form-group--checkbox">
                    <label className="admin-panel__checkbox-label" htmlFor="createMakeAdmin">
                        <input
                            id="createMakeAdmin"
                            type="checkbox"
                            checked={form.makeAdmin}
                            onChange={(e) => handleInputChange(e, 'makeAdmin')}
                        />
                        <span>Darle rol de administrador</span>
                    </label>
                </div>

                {error && (
                    <div className="admin-panel__alert admin-panel__alert--error">⚠ {error}</div>
                )}

                {success && (
                    <div className="admin-panel__alert admin-panel__alert--success">✓ {success}</div>
                )}

                <div className="admin-panel__form-actions">
                    <button
                        type="submit"
                        className="admin-panel__btn admin-panel__btn--create"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creando...' : 'Crear usuario'}
                    </button>
                    <button
                        type="button"
                        className="admin-panel__btn admin-panel__btn--cancel"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateUserForm;
