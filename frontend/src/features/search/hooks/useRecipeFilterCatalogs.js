// Hook que trae los catálogos que usan los filtros del listado de recetas: las categorías
// de receta y los ingredientes, ordenados por nombre.
import { useEffect, useState } from 'react';
import { getAllCategories } from '../../category/services/categoryService.js';
import { getAllIngredients } from '../../ingredient/services/ingredientService.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';

// Recibe: una lista cruda del backend. Devuelve [{ id, name }] ordenada alfabéticamente.
const toSortedOptions = (items) =>
  items
    .map((item) => ({ id: item.id, name: item.name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));

// Devuelve: { categories, ingredients }. Si falla la carga de alguno, esa lista queda
// vacía y su filtro simplemente no se muestra: el listado sigue funcionando sin él.
export function useRecipeFilterCatalogs() {
  const [catalogs, setCatalogs] = useState({ categories: [], ingredients: [] });

  useEffect(() => {
    Promise.all([
      fetchListOrEmpty(() => getAllCategories()).catch(() => []),
      fetchListOrEmpty(() => getAllIngredients()).catch(() => []),
    ]).then(([categories, ingredients]) => {
      setCatalogs({ categories: toSortedOptions(categories), ingredients: toSortedOptions(ingredients) });
    });
  }, []);

  return catalogs;
}
