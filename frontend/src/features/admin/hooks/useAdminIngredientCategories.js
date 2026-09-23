// Hook que carga los datos de la sección "Categorías de Ingredientes" del panel de
// administración (categorías y cuántos ingredientes tiene cada una) y expone las
// acciones de alta, edición y borrado. Reutiliza los servicios que ya existen en las
// features ingredientCategory/ingredient.
import { useState, useEffect, useMemo } from 'react';
import {
  getAllIngredientCategories,
  createIngredientCategory,
  updateIngredientCategory,
  deleteIngredientCategory,
} from '../../ingredientCategory/services/ingredientCategoryService.js';
import { getAllIngredients } from '../../ingredient/services/ingredientService.js';
import {
  countIngredientsByCategory,
  buildTopCategoriesByIngredientCount,
  buildCategoriesDistribution,
} from '../models/adminIngredientCategoriesModel.js';

// Los listados del backend responden 404 ("No se encontraron ...") cuando todavía no hay
// ningún registro cargado. Acá eso no es un error sino una lista vacía.
const fetchListOrEmpty = async (fetchList) => {
  try {
    return await fetchList();
  } catch (error) {
    if (error.message.includes('No se encontraron')) return [];
    throw error;
  }
};

export const useAdminIngredientCategories = () => {
  const [categories, setCategories] = useState([]);
  // Cantidad total de ingredientes (para el "hint" de la tarjeta de distribución), y el
  // Map de idCategory -> cantidad de ingredientes vinculados. Ambos se recalculan solo
  // cuando cambian los ingredientes, no al editar/borrar una categoría.
  const [ingredientsCount, setIngredientsCount] = useState(0);
  const [ingredientCountByCategory, setIngredientCountByCategory] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Pide en paralelo categorías e ingredientes (para calcular cuántos ingredientes tiene
  // cada categoría a partir del ingredientcategoryingredient[] ya embebido).
  const fetchCategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [categoriesData, ingredientsData] = await Promise.all([
        fetchListOrEmpty(() => getAllIngredientCategories()),
        fetchListOrEmpty(() => getAllIngredients()),
      ]);
      setCategories(categoriesData);
      setIngredientsCount(ingredientsData.length);
      setIngredientCountByCategory(countIngredientsByCategory(ingredientsData));
    } catch (err) {
      console.error('[useAdminIngredientCategories] Error al cargar categorías:', err);
      setError(err.message || 'No pudimos cargar las categorías de ingrediente.');
    } finally {
      setIsLoading(false);
    }
  };

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
    handleRefresh: fetchCategories,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  };
};
