// Sección "Dashboard" del panel: resumen de métricas y tabla de usuarios (con el alta,
// la edición, los roles y la baja de cada uno). El resumen llega ya contado del backend y lo
// pide AdminPage (lo comparte con otras secciones); la tabla pide solo la página de usuarios
// que se ve.
// Recibe: header ({ title, subtitle }), isActive (si se está viendo: al volver a ella se
// actualiza la tabla), summary (lo que devuelve useAdminSummary) y onSelectSection.
import AdminSectionLayout from './AdminSectionLayout.jsx';
import AdminDashboardSummary from './AdminDashboardSummary.jsx';
import AdminUsersTable from './AdminUsersTable.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import LoadingState from '../../../core/components/LoadingState.jsx';
import { useAdminUsers } from '../hooks/useAdminUsers.js';
import { useRefreshOnReturn } from '../../../core/hooks/useRefreshOnReturn.js';

function AdminDashboardSection({ header, isActive, summary, onSelectSection }) {
  // Dar de alta, de baja o reactivar a alguien cambia las cifras de arriba (usuarios
  // activos/inactivos y recetas visibles): se vuelven a pedir, sin mostrar "cargando".
  const users = useAdminUsers({ onUsersChanged: summary.refreshSummary });
  useRefreshOnReturn(isActive, users.refreshPage);

  return (
    <AdminSectionLayout header={header}>
      {summary.error && <ErrorState message={summary.error} onRetry={summary.handleRetry} />}
      {summary.isLoading && !summary.metrics && <LoadingState message="Cargando panel..." />}
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
