// Hook que carga los datos de la sección "Ingredientes" del panel de administración
// (listado, categorías y uso en recetas) y expone las acciones de alta, edición y borrado.
// Reutiliza los servicios que ya existen en las features ingredient/ingredientCategory/recipe.
import { useState, useEffect, useMemo } from 'react';
import {
  getAllIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from '../../ingredient/services/ingredientService.js';
import { getAllIngredientCategories } from '../../ingredientCategory/services/ingredientCategoryService.js';
import { getAllRecipes } from '../../recipe/services/recipeService.js';
import {
  countIngredientUsage,
  buildTopUsedIngredients,
  buildCategoryDistribution,
  buildCategoryColorMap,
} from '../models/adminIngredientsModel.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';

export const useAdminIngredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  // Map de idIngredient -> cantidad de recetas donde aparece (calculado una vez por
  // fetch a partir de las recetas; no cambia al editar/borrar un ingrediente).
  const [usageCountByIngredient, setUsageCountByIngredient] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Pide en paralelo ingredientes, categorías (para el selector del formulario) y recetas
  // (para calcular cuántas veces se usa cada ingrediente) y guarda el resultado.
  // El estado se actualiza solo dentro de los callbacks de la promesa (nunca de forma
  // sincrónica), así se puede llamar desde el useEffect sin renders en cascada.
  const fetchIngredients = () =>
    Promise.all([
      fetchListOrEmpty(() => getAllIngredients()),
      fetchListOrEmpty(() => getAllIngredientCategories()),
      fetchListOrEmpty(() => getAllRecipes()),
    ])
      .then(([ingredientsData, categoriesData, recipesData]) => {
        setIngredients(ingredientsData);
        setCategories(categoriesData);
        setUsageCountByIngredient(countIngredientUsage(recipesData));
        setError('');
      })
      .catch((err) => setError(err.message || 'No pudimos cargar los ingredientes.'))
      .finally(() => setIsLoading(false));

  // Recarga manual (botón "Actualizar"): muestra el loading y vuelve a pedir todo.
  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchIngredients();
  };

  // Carga inicial al montar (isLoading ya arranca en true).
  useEffect(() => {
    fetchIngredients();
  }, []);

  // Todo lo derivado se recalcula solo cuando cambia la lista de ingredientes o el uso
  // (por ejemplo, al eliminar un ingrediente localmente sin volver a pedirle todo al
  // backend) — mismo patrón que useAdminDashboard con userRows.
  const topUsedIngredients = useMemo(
    () => buildTopUsedIngredients(ingredients, usageCountByIngredient, 3),
    [ingredients, usageCountByIngredient]
  );
  // Cantidad de ingredientes distintos usados en al menos una receta (no confundir con
  // topUsedIngredients.length, que queda topeado a los primeros 3 del ranking).
  const usedIngredientsCount = useMemo(
    () => [...usageCountByIngredient.values()].filter((count) => count > 0).length,
    [usageCountByIngredient]
  );
  const categoryDistribution = useMemo(() => buildCategoryDistribution(ingredients), [ingredients]);
  const colorIndexByCategoryId = useMemo(
    () => buildCategoryColorMap(categoryDistribution),
    [categoryDistribution]
  );

  // Crea un ingrediente nuevo y recarga la lista (misma estrategia simple que ya usaban
  // RolePage/IngredientPage: recargar todo en vez de patchear el estado a mano).
  const handleCreateIngredient = async (data) => {
    await createIngredient(data);
    await fetchIngredients();
  };

  // Edita un ingrediente existente y recarga la lista.
  const handleUpdateIngredient = async (id, data) => {
    await updateIngredient(id, data);
    await fetchIngredients();
  };

  // Elimina un ingrediente. Falla (409) si está en uso en inventarios, recetas o tiene
  // valores nutricionales — el mensaje del backend ya lo explica. Se relanza para que la
  // tabla lo muestre en un modal de aviso (no hay estado de error acá: cada intento es
  // independiente).
  const handleDeleteIngredient = async (id) => {
    await deleteIngredient(id);
    setIngredients((prev) => prev.filter((ingredient) => ingredient.id !== id));
  };

  return {
    ingredients,
    categories,
    usageCountByIngredient,
    topUsedIngredients,
    usedIngredientsCount,
    categoryDistribution,
    colorIndexByCategoryId,
    isLoading,
    error,
    handleRefresh,
    handleCreateIngredient,
    handleUpdateIngredient,
    handleDeleteIngredient,
  };
};
