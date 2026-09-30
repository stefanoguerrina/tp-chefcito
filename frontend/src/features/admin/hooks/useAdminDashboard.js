// Hook que carga y arma todos los datos del dashboard de administración, y expone las
// acciones que puede disparar la tabla de usuarios (dar de baja, reactivar, editar).
// Reutiliza los servicios que ya existen en cada feature (no agrega endpoints nuevos) y
// deja el cálculo de cifras y series en adminDashboardModel.
import { useState, useEffect, useMemo } from 'react';
import { searchUsersService } from '../../user/services/searchUsersService.js';
import { deleteUserService } from '../../user/services/deleteUserService.js';
import { restoreUserService } from '../../user/services/restoreUserService.js';
import { getAllRecipes } from '../../recipe/services/recipeService.js';
import { getAllIngredients } from '../../ingredient/services/ingredientService.js';
import { getAllIngredientCategories } from '../../ingredientCategory/services/ingredientCategoryService.js';
import { getAllCategories } from '../../category/services/categoryService.js';
import { getAllRoles, getAllUserRoles, getRolesByUser } from '../../role/services/roleService.js';
import {
  countRecipesByUser,
  buildRecipesLastWeek,
  buildTopCreators,
  buildRoleLabel,
  buildRoleLabelsByUser,
  buildReviewStatsByUser,
  buildUserRows,
  sumSeries,
} from '../models/adminDashboardModel.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import { useCurrentUser } from '../../../app/CurrentUserContext.jsx';

export const useAdminDashboard = () => {
  const { userId: currentUserId } = useAuthContext();
  const { updateCurrentUser } = useCurrentUser();
  const [metrics, setMetrics] = useState(null);
  // Usuarios crudos (no ya las filas armadas): se guardan así para poder moverlos entre
  // activos/inactivos y actualizarlos in-place cuando la tabla da de baja, reactiva o edita.
  const [activeUsers, setActiveUsers] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [recipeCountByUser, setRecipeCountByUser] = useState(new Map());
  const [roleLabelByUser, setRoleLabelByUser] = useState(new Map());
  const [reviewStatsByUser, setReviewStatsByUser] = useState(new Map());

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Estado de las acciones por fila de la tabla (dar de baja / reactivar).
  const [busyUserId, setBusyUserId] = useState(null);

  // Pide en paralelo todo lo que muestra el dashboard: un pedido por recurso (8 en
  // total, sin importar cuántos usuarios o recetas haya). Las recetas ya traen su
  // valoración y los roles de todos los usuarios llegan juntos, así que no hace falta
  // una segunda tanda de pedidos por usuario o por receta.
  // Si falla solo la carga de roles no se rompe todo el dashboard: la columna "Rol"
  // muestra "Sin rol asignado".
  // No toca el estado: devuelve los datos crudos para que fetchDashboard los guarde
  // dentro del callback de la promesa.
  const loadDashboardData = async () => {
    const [users, inactive, recipes, ingredients, ingredientCategories, recipeCategories, roles, userRoles] =
      await Promise.all([
        fetchListOrEmpty(() => searchUsersService({ inactive: false })),
        fetchListOrEmpty(() => searchUsersService({ inactive: true })),
        fetchListOrEmpty(() => getAllRecipes()),
        fetchListOrEmpty(() => getAllIngredients()),
        fetchListOrEmpty(() => getAllIngredientCategories()),
        fetchListOrEmpty(() => getAllCategories()),
        fetchListOrEmpty(() => getAllRoles()),
        getAllUserRoles().catch(() => []),
      ]);

    return { users, inactive, recipes, ingredients, ingredientCategories, recipeCategories, roles, userRoles };
  };

  // Guarda en el estado los datos ya cargados y arma el resumen de métricas.
  const applyDashboardData = ({ users, inactive, recipes, ingredients, ingredientCategories, recipeCategories, roles, userRoles }) => {
    const recipesLastWeek = buildRecipesLastWeek(recipes);

    setActiveUsers(users);
    setInactiveUsers(inactive);
    setRecipeCountByUser(countRecipesByUser(recipes));
    setRoleLabelByUser(buildRoleLabelsByUser(userRoles));
    setReviewStatsByUser(buildReviewStatsByUser(recipes));

    setMetrics({
      activeUsersCount: users.length,
      inactiveUsersCount: inactive.length,
      recipesCount: recipes.length,
      recipesThisWeekCount: sumSeries(recipesLastWeek),
      ingredientsCount: ingredients.length,
      ingredientCategoriesCount: ingredientCategories.length,
      recipeCategoriesCount: recipeCategories.length,
      rolesCount: roles.length,
      recipesLastWeek,
      topCreators: buildTopCreators(recipes),
    });
    setError('');
  };

  // El estado se actualiza solo dentro de los callbacks de la promesa (nunca de forma
  // sincrónica), así se puede llamar desde el useEffect sin renders en cascada.
  const fetchDashboard = () =>
    loadDashboardData()
      .then(applyDashboardData)
      .catch((err) => setError(err.message || 'No pudimos cargar los datos del panel.'))
      .finally(() => setIsLoading(false));

  // Recarga manual (botón "Actualizar"): muestra el loading y vuelve a pedir todo.
  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchDashboard();
  };

  // Carga inicial al montar el dashboard (isLoading ya arranca en true). Solo debe correr
  // una vez: fetchDashboard se recrea en cada render y re-ejecutaría la carga sin fin.
  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Las filas se recalculan solas cada vez que cambia alguna de sus fuentes (p. ej. al
  // dar de baja o reactivar un usuario, sin tener que volver a pedirle todo al backend).
  const userRows = useMemo(
    () => buildUserRows(activeUsers, inactiveUsers, recipeCountByUser, roleLabelByUser, reviewStatsByUser),
    [activeUsers, inactiveUsers, recipeCountByUser, roleLabelByUser, reviewStatsByUser]
  );

  // Da de baja a un usuario: lo mueve de activos a inactivos (baja lógica, reversible
  // desde "Reactivar") y ajusta el contador del resumen de arriba.
  // Nota: busca el usuario en el array (closure) en vez de dentro de un updater de
  // setState, para no disparar un setState distinto desde dentro de otro (con
  // StrictMode, React invoca los updaters dos veces en desarrollo y duplicaría la fila).
  const handleDeleteUser = async (userId) => {
    setBusyUserId(userId);
    try {
      await deleteUserService(userId);
      const user = activeUsers.find((u) => u.id === userId);
      setActiveUsers((prev) => prev.filter((u) => u.id !== userId));
      if (user) setInactiveUsers((prev) => [user, ...prev]);
      setMetrics((prev) =>
        prev && {
          ...prev,
          activeUsersCount: prev.activeUsersCount - 1,
          inactiveUsersCount: prev.inactiveUsersCount + 1,
        }
      );
    } finally {
      setBusyUserId(null);
    }
  };

  // Reactiva a un usuario dado de baja: lo mueve de inactivos a activos.
  const handleRestoreUser = async (userId) => {
    setBusyUserId(userId);
    try {
      await restoreUserService(userId);
      const user = inactiveUsers.find((u) => u.id === userId);
      setInactiveUsers((prev) => prev.filter((u) => u.id !== userId));
      if (user) setActiveUsers((prev) => [user, ...prev]);
      setMetrics((prev) =>
        prev && {
          ...prev,
          activeUsersCount: prev.activeUsersCount + 1,
          inactiveUsersCount: prev.inactiveUsersCount - 1,
        }
      );
    } finally {
      setBusyUserId(null);
    }
  };

  // El modal de edición ya hizo el PATCH al backend (EditProfileModal usa
  // updateUserService directamente); acá solo hay que reflejar los datos nuevos en el
  // array correspondiente para que la tabla se actualice sin pedir todo de nuevo.
  const handleUserUpdated = (updatedUser) => {
    const patchList = (list) =>
      list.map((user) => (user.id === updatedUser.id ? { ...user, ...updatedUser } : user));
    setActiveUsers(patchList);
    setInactiveUsers(patchList);
    // Si el admin se editó a sí mismo, el pie de su sidebar también muestra el cambio.
    if (updatedUser.id === currentUserId) updateCurrentUser(updatedUser);
  };

  // El modal de roles (AdminUserRolesModal / UserRolesPanel) ya hizo la asignación o
  // remoción real contra el backend; al cerrarse, se vuelve a pedir solo el rol de ESE
  // usuario (no hace falta recargar todo el dashboard) para que la columna "Rol" quede
  // al día. Si falla, la tabla se queda con la etiqueta anterior — no es crítico.
  const handleUserRolesChanged = async (userId) => {
    try {
      const roles = await getRolesByUser(userId);
      setRoleLabelByUser((prev) => {
        const next = new Map(prev);
        next.set(userId, buildRoleLabel(roles));
        return next;
      });
    } catch {
      // Sin aviso: la columna "Rol" queda con la etiqueta anterior hasta el próximo refresco.
    }
  };

  return {
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
  };
};
