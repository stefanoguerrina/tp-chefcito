// Hook que carga los datos de la sección "Ingredientes" del panel de administración
// (listado con su uso en recetas ya contado, y categorías: 2 pedidos) y expone las
// acciones de alta, edición y borrado.
// Reutiliza los servicios que ya existen en las features ingredient/ingredientCategory/recipe.
import { useState, useEffect, useMemo } from 'react';
import {
  getAllIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  uploadIngredientImage,
  deleteIngredientImage,
} from '../../ingredient/services/ingredientService.js';
import { compressImage } from '../../../shared/utils/compressImage.js';
import { getAllIngredientCategories } from '../../ingredientCategory/services/ingredientCategoryService.js';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Pide en paralelo ingredientes (cada uno trae en cuántas recetas se usa) y categorías
  // (para el selector del formulario) y guarda el resultado.
  // El estado se actualiza solo dentro de los callbacks de la promesa (nunca de forma
  // sincrónica), así se puede llamar desde el useEffect sin renders en cascada.
  const fetchIngredients = () =>
    Promise.all([
      fetchListOrEmpty(() => getAllIngredients()),
      fetchListOrEmpty(() => getAllIngredientCategories()),
    ])
      .then(([ingredientsData, categoriesData]) => {
        setIngredients(ingredientsData);
        setCategories(categoriesData);
        setError('');
      })
      .catch((err) => setError(err.message || 'No pudimos cargar los ingredientes.'))
      .finally(() => setIsLoading(false));

  // Reintento después de un error de carga (botón "Reintentar" de ErrorState): muestra
  // el loading y vuelve a pedir todo.
  const handleRetry = async () => {
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
  // Map de idIngredient -> cantidad de recetas donde aparece (sale del _count que manda el
  // backend en cada ingrediente, así se mantiene al día al crear o editar uno).
  const usageCountByIngredient = useMemo(() => countIngredientUsage(ingredients), [ingredients]);
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

  // Pone en la lista el ingrediente que devolvió el backend (reemplaza al que tenga el
  // mismo id, o lo suma si es nuevo), ordenado por nombre como lo devuelve GET /ingredients.
  // Así no hace falta volver a pedir ingredientes, categorías y recetas después de guardar.
  const upsertIngredient = (saved) =>
    setIngredients((prev) =>
      [...prev.filter((ingredient) => ingredient.id !== saved.id), saved].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );

  // Guarda lo que devolvió el formulario de ingrediente: primero los datos (con las
  // categorías y los valores nutricionales, en un solo pedido) y después la foto, que va
  // aparte porque se sube como archivo (necesita el id, que en un alta recién existe ahora).
  // Recibe: id (null para un alta) y { data, imageFile, isImageRemoved }.
  // Devuelve: { imageError } — si falló solo la foto, el ingrediente igual quedó guardado:
  // no se relanza (el formulario se cerraría con error y reintentar daría "nombre
  // repetido"), sino que se avisa aparte. Si fallan los datos, sí se relanza.
  const handleSaveIngredient = async (id, { data, imageFile, isImageRemoved }) => {
    let saved = id === null ? await createIngredient(data) : await updateIngredient(id, data);

    let imageError = null;
    try {
      if (imageFile) {
        // Se comprime antes de subir (WebP, máx. 1280px), igual que las fotos de recetas y perfil.
        saved = await uploadIngredientImage(saved.id, await compressImage(imageFile));
      } else if (isImageRemoved && saved.imagePath) {
        saved = await deleteIngredientImage(saved.id);
      }
    } catch (err) {
      imageError = err.message || 'No se pudo guardar la foto.';
    }

    upsertIngredient(saved);
    return { imageError };
  };

  // Guarda solo las categorías de un ingrediente (modal rápido de categorías de la tabla).
  const handleUpdateIngredientCategories = async (id, categoryIds) => {
    upsertIngredient(await updateIngredient(id, { categoryIds }));
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
    handleRetry,
    handleSaveIngredient,
    handleUpdateIngredientCategories,
    handleDeleteIngredient,
  };
};
