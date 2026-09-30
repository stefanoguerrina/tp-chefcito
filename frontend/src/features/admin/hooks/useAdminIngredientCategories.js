// Hook que carga los datos de la sección "Categorías de Ingredientes" del panel de
// administración (categorías con cuántos ingredientes tiene cada una, ya contado en el
// backend, y el total de ingredientes del resumen) y expone las acciones de alta, edición
// y borrado.
import { useState, useEffect, useMemo } from 'react';
import {
  getAllIngredientCategories,
  createIngredientCategory,
  updateIngredientCategory,
  deleteIngredientCategory,
} from '../../ingredientCategory/services/ingredientCategoryService.js';
import { getAdminSummary } from '../services/adminService.js';
import {
  countIngredientsByCategory,
  buildTopCategoriesByIngredientCount,
  buildCategoriesDistribution,
} from '../models/adminIngredientCategoriesModel.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';

export const useAdminIngredientCategories = () => {
  const [categories, setCategories] = useState([]);
  // Cantidad total de ingredientes (para el "hint" de la tarjeta de distribución), y el
  // Map de idCategory -> cantidad de ingredientes vinculados. Ambos se recalculan solo
  // cuando cambian los ingredientes, no al editar/borrar una categoría.
  const [ingredientsCount, setIngredientsCount] = useState(0);
  const [ingredientCountByCategory, setIngredientCountByCategory] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Pide en paralelo las categorías (cada una trae cuántos ingredientes tiene) y el
  // resumen del panel (solo para el total de ingredientes, ya contado en la base).
  // El estado se actualiza solo dentro de los callbacks de la promesa (nunca de forma
  // sincrónica), así se puede llamar desde el useEffect sin renders en cascada.
  const fetchCategories = () =>
    Promise.all([
      fetchListOrEmpty(() => getAllIngredientCategories()),
      getAdminSummary(),
    ])
      .then(([categoriesData, summary]) => {
        setCategories(categoriesData);
        setIngredientsCount(summary.ingredientsCount);
        setIngredientCountByCategory(countIngredientsByCategory(categoriesData));
        setError('');
      })
      .catch((err) => setError(err.message || 'No pudimos cargar las categorías de ingrediente.'))
      .finally(() => setIsLoading(false));

  // Reintento después de un error de carga (botón "Reintentar" de ErrorState): muestra
  // el loading y vuelve a pedir todo.
  const handleRetry = async () => {
    setIsLoading(true);
    await fetchCategories();
  };

  // Carga inicial al montar (isLoading ya arranca en true).
  useEffect(() => {
    fetchCategories();
  }, []);

  // Todo lo derivado se recalcula solo cuando cambian las categorías o el conteo por
  // categoría — mismo patrón que useAdminIngredients con categoryDistribution.
  const topCategories = useMemo(
    () => buildTopCategoriesByIngredientCount(categories, ingredientCountByCategory, 3),
    [categories, ingredientCountByCategory]
  );
  const categoriesDistribution = useMemo(
    () => buildCategoriesDistribution(categories, ingredientCountByCategory),
    [categories, ingredientCountByCategory]
  );

  // Crea una categoría nueva y recarga la lista.
  const handleCreateCategory = async (data) => {
    await createIngredientCategory(data);
    await fetchCategories();
  };

  // Edita una categoría existente y recarga la lista.
  const handleUpdateCategory = async (id, data) => {
    await updateIngredientCategory(id, data);
    await fetchCategories();
  };

  // Elimina una categoría. Falla (409) si todavía tiene ingredientes asociados — el
  // mensaje del backend ya lo explica. Se relanza para que la tabla lo muestre en un
  // modal de aviso (no hay estado de error acá: cada intento es independiente).
  const handleDeleteCategory = async (id) => {
    await deleteIngredientCategory(id);
    setCategories((prev) => prev.filter((category) => category.id !== id));
  };

  return {
    categories,
    ingredientsCount,
    ingredientCountByCategory,
    topCategories,
    categoriesDistribution,
    isLoading,
    error,
    handleRetry,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  };
};
