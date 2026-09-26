// Hook que carga los datos de la sección "Categorías de Recetas" del panel de
// administración (categorías y cuántas recetas tiene cada una) y expone las acciones de
// alta, edición y borrado. Reutiliza los servicios que ya existen en las features
// category/recipe.
import { useState, useEffect, useMemo } from 'react';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../category/services/categoryService.js';
import { getAllRecipes } from '../../recipe/services/recipeService.js';
import {
  countRecipesByCategory,
  buildTopCategoriesByRecipeCount,
  buildCategoriesDistribution,
} from '../models/adminRecipeCategoriesModel.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';

export const useAdminRecipeCategories = () => {
  const [categories, setCategories] = useState([]);
  // Cantidad total de recetas (para el "hint" de la tarjeta de distribución), y el Map de
  // idCategory -> cantidad de recetas vinculadas. Ambos se recalculan solo cuando cambian
  // las recetas, no al editar/borrar una categoría.
  const [recipesCount, setRecipesCount] = useState(0);
  const [recipeCountByCategory, setRecipeCountByCategory] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Pide en paralelo categorías y recetas (para calcular cuántas recetas tiene cada
  // categoría a partir del recipecategory[] ya embebido).
  // El estado se actualiza solo dentro de los callbacks de la promesa (nunca de forma
  // sincrónica), así se puede llamar desde el useEffect sin renders en cascada.
  const fetchCategories = () =>
    Promise.all([
      fetchListOrEmpty(() => getAllCategories()),
      fetchListOrEmpty(() => getAllRecipes()),
    ])
      .then(([categoriesData, recipesData]) => {
        setCategories(categoriesData);
        setRecipesCount(recipesData.length);
        setRecipeCountByCategory(countRecipesByCategory(recipesData));
        setError('');
      })
      .catch((err) => setError(err.message || 'No pudimos cargar las categorías de receta.'))
      .finally(() => setIsLoading(false));

  // Recarga manual (botón "Actualizar"): muestra el loading y vuelve a pedir todo.
  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchCategories();
  };

  // Carga inicial al montar (isLoading ya arranca en true).
  useEffect(() => {
    fetchCategories();
  }, []);

  // Todo lo derivado se recalcula solo cuando cambian las categorías o el conteo por
  // categoría — mismo patrón que useAdminIngredientCategories.
  const topCategories = useMemo(
    () => buildTopCategoriesByRecipeCount(categories, recipeCountByCategory, 3),
    [categories, recipeCountByCategory]
  );
  const categoriesDistribution = useMemo(
    () => buildCategoriesDistribution(categories, recipeCountByCategory),
    [categories, recipeCountByCategory]
  );

  // Crea una categoría nueva y recarga la lista.
  const handleCreateCategory = async (data) => {
    await createCategory(data);
    await fetchCategories();
  };

  // Edita una categoría existente y recarga la lista.
  const handleUpdateCategory = async (id, data) => {
    await updateCategory(id, data);
    await fetchCategories();
  };

  // Elimina una categoría. A diferencia de las de ingrediente, esta no bloquea por uso:
  // si tenía recetas asignadas, esos vínculos se borran en cascada (las recetas quedan,
  // solo pierden la etiqueta). Se relanza igual para que la tabla muestre cualquier otro
  // error inesperado en un modal de aviso.
  const handleDeleteCategory = async (id) => {
    await deleteCategory(id);
    setCategories((prev) => prev.filter((category) => category.id !== id));
  };

  return {
    categories,
    recipesCount,
    recipeCountByCategory,
    topCategories,
    categoriesDistribution,
    isLoading,
    error,
    handleRefresh,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  };
};
