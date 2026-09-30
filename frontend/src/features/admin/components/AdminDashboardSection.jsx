// Sección "Dashboard" del panel: resumen de métricas y tabla de usuarios (con el alta,
// la edición, los roles y la baja de cada uno). Cada parte pide solo lo suyo, recién
// cuando se abre esta sección: el resumen llega ya contado del backend (1 pedido) y la
// tabla pide solo la página de usuarios que se ve.
// Recibe: header ({ title, subtitle }) y onSelectSection (abre otra sección del panel).
import AdminSectionLayout from './AdminSectionLayout.jsx';
import AdminDashboardSummary from './AdminDashboardSummary.jsx';
import AdminUsersTable from './AdminUsersTable.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import { useAdminSummary } from '../hooks/useAdminSummary.js';
import { useAdminUsers } from '../hooks/useAdminUsers.js';

function AdminDashboardSection({ header, onSelectSection }) {
  const summary = useAdminSummary();
  // Dar de alta, de baja o reactivar a alguien cambia las cifras de arriba (usuarios
  // activos/inactivos y recetas visibles): se vuelven a pedir, sin mostrar "cargando".
  const users = useAdminUsers({ onUsersChanged: summary.refreshSummary });

  return (
    <AdminSectionLayout header={header}>
      {summary.error && <ErrorState message={summary.error} onRetry={summary.handleRetry} />}
      {summary.isLoading && !summary.metrics && <p className="AdminPage-status">Cargando panel...</p>}
      {summary.metrics && <AdminDashboardSummary metrics={summary.metrics} onSelectSection={onSelectSection} />}

      {users.error ? (
        <ErrorState message={users.error} onRetry={users.handleRetry} />
      ) : (
        <AdminUsersTable users={users} />
      )}
    </AdminSectionLayout>
  );
}

export default AdminDashboardSection;
