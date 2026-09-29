// Página "Recetas guardadas" (ruta /guardadas): las recetas que el usuario autenticado
// guardó (bookmark), con los mismos filtros que el listado de recetas del buscador
// (tiempo, valoración, categoría, ingredientes y "Con mi despensa"), buscador por nombre,
// orden y paginación. Reutiliza RecipeListing en modo savedOnly en vez de duplicarlo; el
// listón de cada card quita la receta de las guardadas.
// Los filtros viven en la URL (ej. /guardadas?despensa=1), igual que en /buscar/recetas.
import { useSearchParams } from 'react-router-dom';
import RecipeListing from '../../search/components/RecipeListing.jsx';
import { parseRecipeFilters, recipeFiltersToParams } from '../../search/models/searchListingModel.js';
import '../styles/_saved-recipes-page.scss';

function SavedRecipesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="SavedRecipesPage">
      <RecipeListing
        filters={parseRecipeFilters(searchParams, { savedOnly: true })}
        onFiltersChange={(filters) => setSearchParams(recipeFiltersToParams(filters))}
      />
    </div>
  );
}

export default SavedRecipesPage;
