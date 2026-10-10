// Cabecera de la tabla de usuarios del dashboard (AdminUsersTable): título según el filtro,
// control segmentado Todos / Activos / Inactivos, buscador y botón de alta.
// Los estilos son los de la tabla (_admin-users-table.scss).

// Filtros del control segmentado (el id es el ?status= del backend) y el título que toma
// la tabla mientras ese filtro está activo (ej: "Usuarios Activos").
const FILTERS = [
  { id: 'all', label: 'Todos', title: 'Usuarios Registrados' },
  { id: 'active', label: 'Activos', title: 'Usuarios Activos' },
  { id: 'inactive', label: 'Inactivos', title: 'Usuarios Inactivos' },
];

// Recibe: status (filtro activo), searchInput (texto del buscador), onChangeStatus(id),
// onSearchChange(event) y onCreate (abre el modal de alta).
function AdminUsersTableHeader({ status, searchInput, onChangeStatus, onSearchChange, onCreate }) {
  const activeFilter = FILTERS.find((filter) => filter.id === status);

  return (
    <header className="AdminUsersTable-header">
      <h2 className="AdminUsersTable-title">{activeFilter.title}</h2>

      <div className="AdminUsersTable-actions">
        <div className="AdminUsersTable-tabs">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`AdminUsersTable-tab${status === filter.id ? ' AdminUsersTable-tab--active' : ''}`}
              onClick={() => onChangeStatus(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="AdminUsersTable-search">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            value={searchInput}
            onChange={onSearchChange}
            placeholder="Buscar usuario..."
            aria-label="Buscar usuario por nombre, usuario o email"
          />
        </div>

        <button
          type="button"
          className="AdminUsersTable-newButton"
          onClick={onCreate}
          title="Nuevo usuario"
          aria-label="Nuevo usuario"
        >
          <span className="material-symbols-outlined">person_add</span>
        </button>
      </div>
    </header>
  );
}

export default AdminUsersTableHeader;
