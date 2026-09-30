// Sección "Dashboard" del panel: resumen de métricas y tabla de usuarios. Sus datos se
// piden recién cuando se abre esta sección (useAdminDashboard vive acá, no en AdminPage).
// Recibe: header ({ title, subtitle }) y onSelectSection (abre otra sección del panel).
import AdminSectionLayout from './AdminSectionLayout.jsx';
import AdminDashboardSummary from './AdminDashboardSummary.jsx';
import AdminUsersTable from './AdminUsersTable.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import { useAdminDashboard } from '../hooks/useAdminDashboard.js';
import { ADMIN_SECTIONS } from '../models/adminSectionsModel.js';

function AdminDashboardSection({ header, onSelectSection }) {
  const {
    metrics,
    userRows,
    isLoading,
    error,
    busyUserId,
    handleRefresh,
    handleDeleteUser,
    handleRestoreUser,
    handleUserUpdated,
    handleUserRolesChanged,
  } = useAdminDashboard();

  return (
    <AdminSectionLayout header={header} onRefresh={handleRefresh} isRefreshing={isLoading}>
      {error && <ErrorState message={error} onRetry={handleRefresh} />}
      {isLoading && !metrics && <p className="AdminPage-status">Cargando panel...</p>}

      {metrics && (
        <>
          <AdminDashboardSummary metrics={metrics} onSelectSection={onSelectSection} />

          <AdminUsersTable
            rows={userRows}
            isLoading={isLoading}
            busyUserId={busyUserId}
            onManageUsers={() => onSelectSection(ADMIN_SECTIONS.users)}
            onDeleteUser={handleDeleteUser}
            onRestoreUser={handleRestoreUser}
            onUserUpdated={handleUserUpdated}
            onUserRolesChanged={handleUserRolesChanged}
          />
        </>
      )}
    </AdminSectionLayout>
  );
}

export default AdminDashboardSection;
