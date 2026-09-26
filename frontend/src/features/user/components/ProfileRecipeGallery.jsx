// Galería completa de recetas del perfil: buscador por nombre, filtro por categorías y
// paginación visual ("Ver más recetas"), en una grilla masonry con la RecipeCard de siempre.
// Los filtros se aplican en el navegador sobre las recetas ya cargadas, sin endpoints extra.
import { useState } from 'react';
import { recipeToCardProps } from '../../recipe/models/recipeModel.js';
import RecipeCard from '../../../core/components/RecipeCard.jsx';
import MasonryGrid from '../../../core/components/MasonryGrid.jsx';
import CategoryFilterDropdown from './CategoryFilterDropdown.jsx';

// Cuántas recetas muestra de entrada la galería, y cuántas suma cada vez que se
// toca "Ver más recetas". El backend ya devuelve todas las recetas del usuario
// en una sola llamada: el corte es solo visual, para no volcar 50 cards juntas.
const RECIPES_PER_PAGE = 12;

// Recibe: recipes (crudas del backend), recipeReviewStats (rating por id de receta),
// isOwnProfile, ownerName (nombre del dueño, para los textos del perfil ajeno) y
// onRecipeClick (recibe el id de la receta tocada).
function ProfileRecipeGallery({ recipes, recipeReviewStats, isOwnProfile, ownerName, onRecipeClick }) {
  // Cuántas recetas se están mostrando (ver RECIPES_PER_PAGE).
  const [visibleRecipeCount, setVisibleRecipeCount] = useState(RECIPES_PER_PAGE);
  const [searchQuery, setSearchQuery] = useState('');
  // Ids de las categorías elegidas en el menú de "Categorías". Vacío = todas.
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  // Cualquier cambio de filtro vuelve la galería a la primera tanda: si no,
  // después de achicar el resultado quedaba un "Mostrando 12 de 3" sin sentido.
  const resetPagination = () => setVisibleRecipeCount(RECIPES_PER_PAGE);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryIds([]);
    resetPagination();
  };

  // Categorías para el selector, sacadas de las propias recetas (sin pedirlas
  // aparte al backend).
  const categoryOptions = Array.from(
    new Map(
      recipes
        .map((recipe) => recipe.recipecategory?.[0]?.category)
        .filter(Boolean)
        .map((category) => [category.id, category])
    ).values()
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredRecipes = recipes
    .filter((recipe) => !normalizedQuery || recipe.name?.toLowerCase().includes(normalizedQuery))
    // Sin categorías elegidas se muestran todas; con varias, alcanza con que la
    // receta pertenezca a alguna de ellas.
    .filter((recipe) => selectedCategoryIds.length === 0 || selectedCategoryIds.includes(recipe.recipecategory?.[0]?.idCategory));

  const hasActiveFilters = Boolean(searchQuery || selectedCategoryIds.length > 0);

  // La paginación corre sobre el resultado filtrado, no sobre todas las recetas.
  const visibleRecipes = filteredRecipes.slice(0, visibleRecipeCount);
  const remainingRecipeCount = filteredRecipes.length - visibleRecipes.length;

  return (
    <section className="ProfilePage-allRecipes">
      <div className="ProfilePage-sectionHeader">
        <div>
          <span className="ProfilePage-eyebrow">Galería completa</span>
          <h3 className="ProfilePage-sectionTitle">
            {isOwnProfile ? 'Todas mis recetas' : `Todas las recetas de ${ownerName}`}
          </h3>
        </div>
        <span className="ProfilePage-galleryCount">
          Mostrando {visibleRecipes.length} de {filteredRecipes.length}
          {hasActiveFilters && ` (de ${recipes.length} en total)`}
        </span>
      </div>

      <div className="ProfilePage-galleryFilters">
        <div className="ProfilePage-searchBar">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              resetPagination();
            }}
            placeholder={isOwnProfile ? 'Buscar en mis recetas...' : `Buscar en las recetas de ${ownerName}...`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                resetPagination();
              }}
              aria-label="Limpiar búsqueda"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        <CategoryFilterDropdown
          categories={categoryOptions}
          selectedIds={selectedCategoryIds}
          onChange={(nextIds) => {
            setSelectedCategoryIds(nextIds);
            resetPagination();
          }}
        />

        {hasActiveFilters && (
          <button type="button" className="ProfilePage-clearFilters" onClick={handleClearFilters}>
            <span className="material-symbols-outlined">restart_alt</span>
            Limpiar filtros
          </button>
        )}
      </div>

      {filteredRecipes.length === 0 && (
        <p className="ProfilePage-empty">Ninguna receta coincide con estos filtros.</p>
      )}

      <MasonryGrid>
        {visibleRecipes.map((recipe) => {
          const stats = recipeReviewStats[recipe.id];
          return (
            <RecipeCard
              key={recipe.id}
              recipe={{
                ...recipeToCardProps(recipe),
                rating: stats?.averageRating ?? 0,
                reviewsCount: stats?.totalReviews ?? 0,
              }}
              onClick={() => onRecipeClick(recipe.id)}
              showSaveButton={false}
            />
          );
        })}
      </MasonryGrid>

      {remainingRecipeCount > 0 && (
        <div className="ProfilePage-loadMore">
          <button
            type="button"
            className="ProfilePage-button ProfilePage-button--outline"
            onClick={() => setVisibleRecipeCount((count) => count + RECIPES_PER_PAGE)}
          >
            <span className="material-symbols-outlined">expand_more</span>
            Ver más recetas ({remainingRecipeCount} restante{remainingRecipeCount !== 1 ? 's' : ''})
          </button>
        </div>
      )}
    </section>
  );
}

export default ProfileRecipeGallery;
