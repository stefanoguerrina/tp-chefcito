// Hook que carga los datos de la sección "Categorías de Ingredientes" del panel de
// administración (categorías con cuántos ingredientes tiene cada una, ya contado en el backend) y
// expone las acciones de alta, edición y borrado. Después de cada acción actualiza la
// lista local con lo que respondió el backend, sin volver a pedir todo. El total de
// ingredientes lo trae el resumen que pide AdminPage.
import { useState, useEffect, useMemo } from 'react';
import {
  getAllIngredientCategories,
  createIngredientCategory,
  updateIngredientCategory,
  deleteIngredientCategory,
} from '../../ingredientCategory/services/ingredientCategoryService.js';
import { countIngredientsByCategory } from '../models/adminIngredientCategoriesModel.js';
import {
  buildTopCategoriesByCount,
  buildCategoriesDistribution,
  replaceCategory,
} from '../models/adminCategoriesModel.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';

export const useAdminIngredientCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Pide las categorías (cada una trae cuántos ingredientes tiene).
  // El estado se actualiza solo dentro de los callbacks de la promesa (nunca de forma
  // sincrónica), así se puede llamar desde el useEffect sin renders en cascada.
  const fetchCategories = () =>
    fetchListOrEmpty(() => getAllIngredientCategories())
      .then((categoriesData) => {
        setCategories(categoriesData);
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

  // Todo lo derivado se recalcula solo cuando cambian las categorías.
  const ingredientCountByCategory = useMemo(() => countIngredientsByCategory(categories), [categories]);
  const topCategories = useMemo(
    () => buildTopCategoriesByCount(categories, ingredientCountByCategory, 3),
    [categories, ingredientCountByCategory]
  );
  const categoriesDistribution = useMemo(
    () => buildCategoriesDistribution(categories, ingredientCountByCategory),
    [categories, ingredientCountByCategory]
  );

  // Crea una categoría nueva y la suma al final de la lista (todavía sin ingredientes).
  const handleCreateCategory = async (data) => {
    const created = await createIngredientCategory(data);
    setCategories((prev) => [...prev, created]);
  };

  // Edita una categoría existente y la reemplaza en la lista.
  const handleUpdateCategory = async (id, data) => {
    const updated = await updateIngredientCategory(id, data);
    setCategories((prev) => replaceCategory(prev, updated));
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
    ingredientCountByCategory,
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
