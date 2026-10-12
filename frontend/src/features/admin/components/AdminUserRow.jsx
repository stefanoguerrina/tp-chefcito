// Fila de la tabla de usuarios del dashboard (AdminUsersTable): foto, nombre, rol, recetas
// con sus valoraciones, fecha de registro y los botones de acción.
import UserAvatar from '../../../core/components/UserAvatar.jsx';
import { formatRecipesCount, formatReviewsCount } from '../models/adminDashboardModel.js';

// Formatea una fecha ISO (YYYY-MM-DD o DateTime) a formato legible DD/MM/AAAA.
const formatDate = (dateValue) => {
  if (!dateValue) return '—';
  const datePart = String(dateValue).slice(0, 10);
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
};

// Recibe: row (ver buildUserRows), isCurrentAdmin (la fila es del admin logueado: no puede
// darse de baja ni cambiarse los roles), isBusy (hay una acción en curso sobre esta fila),
// y los callbacks onEdit, onManageRoles, onDelete y onRestore (reciben la fila).
function AdminUserRow({ row, isCurrentAdmin, isBusy, onEdit, onManageRoles, onDelete, onRestore }) {
  return (
    <tr className={row.isActive ? '' : 'AdminUsersTable-row--inactive'}>
      <td>
        <div className="AdminUsersTable-user">
          <UserAvatar user={row.avatarUser} size={36} />
          <span className="AdminUsersTable-userText">
            <span className="AdminUsersTable-userName">{row.fullName}</span>
            <span className="AdminUsersTable-userMeta">
              @{row.username} · ID {row.id}
              {!row.isActive && ' · Dado de baja'}
            </span>
          </span>
        </div>
      </td>
      <td className="AdminUsersTable-role">{row.roleLabel}</td>
      <td>
        <div className="AdminUsersTable-recipes">{formatRecipesCount(row.recipesCount)}</div>
        <div className="AdminUsersTable-reviews">
          {/* Las recetas de un usuario dado de baja no se ven en la app (tampoco sus
              valoraciones) hasta que se lo reactive: se aclara para que no parezcan perdidas. */}
          {!row.isActive && row.recipesCount > 0 ? (
            'Ocultas hasta reactivarlo'
          ) : row.reviewStats.count > 0 ? (
            <>
              <span
                className="material-symbols-outlined AdminUsersTable-starIcon"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              {row.reviewStats.average}
              <span className="AdminUsersTable-reviewsCount">({formatReviewsCount(row.reviewStats.count)})</span>
            </>
          ) : (
            'Sin valoraciones aún'
          )}
        </div>
      </td>
      <td className="AdminUsersTable-date AdminUsersTable-cell--center">{formatDate(row.createdAt)}</td>
      <td className="AdminUsersTable-cell--center">
        <div className="AdminUsersTable-rowActions">
          <button type="button" className="AdminUsersTable-iconButton" onClick={() => onEdit(row)} title="Editar usuario">
            <span className="material-symbols-outlined">edit</span>
          </button>

          <button
            type="button"
            className="AdminUsersTable-iconButton"
            onClick={() => onManageRoles(row)}
            disabled={isCurrentAdmin}
            title={isCurrentAdmin ? 'No podés modificar tus propios roles' : 'Roles'}
          >
            <span className="material-symbols-outlined">shield_person</span>
          </button>

          {row.isActive ? (
            <button
              type="button"
              className="AdminUsersTable-iconButton AdminUsersTable-iconButton--danger"
              onClick={() => onDelete(row)}
              disabled={isBusy || isCurrentAdmin}
              title={isCurrentAdmin ? 'No podés dar de baja tu propia cuenta' : 'Dar de baja'}
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          ) : (
            <button
              type="button"
              className="AdminUsersTable-iconButton AdminUsersTable-iconButton--restore"
              onClick={() => onRestore(row)}
              disabled={isBusy}
              title="Reactivar"
            >
              <span className="material-symbols-outlined">restore_from_trash</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default AdminUserRow;
