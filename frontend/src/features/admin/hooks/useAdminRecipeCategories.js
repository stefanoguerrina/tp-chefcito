// Hook que carga los datos de la sección "Categorías de Recetas" del panel de
// administración (categorías con cuántas recetas tiene cada una, ya contado en el backend) y
// expone las acciones de alta, edición y borrado. Después de cada acción actualiza la
// lista local con lo que respondió el backend, sin volver a pedir todo. El total de
// recetas lo trae el resumen que pide AdminPage.
import { useState, useEffect, useMemo } from 'react';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../category/services/categoryService.js';
import { countRecipesByCategory } from '../models/adminRecipeCategoriesModel.js';
import {
  buildTopCategoriesByCount,
  buildCategoriesDistribution,
  replaceCategory,
} from '../models/adminCategoriesModel.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';

export const useAdminRecipeCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Pide las categorías (cada una trae cuántas recetas tiene).
  // El estado se actualiza solo dentro de los callbacks de la promesa (nunca de forma
  // sincrónica), así se puede llamar desde el useEffect sin renders en cascada.
  const fetchCategories = () =>
    fetchListOrEmpty(() => getAllCategories())
      .then((categoriesData) => {
        setCategories(categoriesData);
        setError('');
      })
      .catch((err) => setError(err.message || 'No pudimos cargar las categorías de receta.'))
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

  // Todo lo derivado se recalcula solo cuando cambian las categorías.
  const recipeCountByCategory = useMemo(() => countRecipesByCategory(categories), [categories]);
  const topCategories = useMemo(
    () => buildTopCategoriesByCount(categories, recipeCountByCategory, 3),
    [categories, recipeCountByCategory]
  );
  const categoriesDistribution = useMemo(
    () => buildCategoriesDistribution(categories, recipeCountByCategory),
    [categories, recipeCountByCategory]
  );

  // Crea una categoría nueva y la suma al final de la lista (todavía sin recetas).
  const handleCreateCategory = async (data) => {
    const created = await createCategory(data);
    setCategories((prev) => [...prev, created]);
  };

  // Edita una categoría existente y la reemplaza en la lista.
  const handleUpdateCategory = async (id, data) => {
    const updated = await updateCategory(id, data);
    setCategories((prev) => replaceCategory(prev, updated));
  };

  // Elimina una categoría. A diferencia de las de ingrediente, esta no bloquea por uso:
  // si tenía recetas asignadas, esos vínculos se borran en cascada (las recetas quedan,
  // solo pierden la etiqueta). Si falla, el error sigue de largo para que la tabla lo
  // muestre en un modal de aviso.
  const handleDeleteCategory = async (id) => {
    await deleteCategory(id);
    setCategories((prev) => prev.filter((category) => category.id !== id));
  };

  return {
    categories,
    recipeCountByCategory,
    topCategories,
    categoriesDistribution,
    isLoading,
    error,
    handleRetry,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    // Vuelve a pedir las categorías sin mostrar "cargando" (al volver a la sección).
    refresh: fetchCategories,
  };
};
