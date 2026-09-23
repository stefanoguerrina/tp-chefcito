// Página de perfil: identidad real (avatar, nombre, bio, ubicación), estadísticas,
// las 3 recetas mejor valoradas y la galería completa de recetas (grilla masonry,
// con buscador y filtro por categorías). Reutiliza RecipeCard (la misma card del
// resto del sitio) para no duplicar layout.
// Sirve tanto para el perfil propio (editable) como para el de otro usuario, de
// solo lectura, al que se llega tocando su nombre desde el detalle de una receta
// (ver isOwnProfile más abajo): ahí no hay nada para editar, y "Editar perfil" se
// reemplaza por "Donar" (todavía sin CRUD propia, muestra el mismo aviso
// "Próximamente" que el botón de Donar del detalle de receta).
import { useState, useEffect } from 'react';
import { getUserByIdService } from '../services/getUserByIdService.js';
import { getAllRecipes } from '../../recipe/services/recipeService.js';
import { getReviewsByRecipe } from '../../review/services/reviewService.js';
import { recipeToCardProps } from '../../recipe/models/recipeModel.js';
import { getCurrentUserId } from '../../../shared/utils/decodeToken.js';
import RecipeCard from '../../../core/components/RecipeCard.jsx';
import MasonryGrid from '../../../core/components/MasonryGrid.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import EditProfileModal from '../components/EditProfileModal.jsx';
import CategoryFilterDropdown from '../components/CategoryFilterDropdown.jsx';
import RecipePodium from '../components/RecipePodium.jsx';
import '../styles/_profile-page.scss';

// Iniciales para el avatar de respaldo (nombre + apellido). No depende de ningún
// servicio externo de imágenes, así que siempre se ve algo aunque no haya foto
// o la URL cargada por el usuario esté rota.
const getInitials = (name, lastName) =>
  `${name?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';

// Cuántas recetas muestra de entrada la galería, y cuántas suma cada vez que se
// toca "Ver más recetas". El backend ya devuelve todas las recetas del usuario
// en una sola llamada: el corte es solo visual, para no volcar 50 cards juntas.
const RECIPES_PER_PAGE = 12;

// Recibe:
//   userId        — id del usuario cuyo perfil se muestra.
//   onEditRecipe   — (perfil propio) abre el wizard de "Mis recetas" en modo edición.
//   onRecipeClick  — (perfil ajeno) abre el detalle de la receta, de solo lectura.
//   onBack         — (perfil ajeno) vuelve a la vista anterior. En el perfil propio
//                    no hay botón de volver: es un panel fijo de la sidebar.
function ProfilePage({ userId, onEditRecipe, onRecipeClick, onBack }) {
  const currentUserId = getCurrentUserId();
  // Si no es el propio, es de solo lectura: sin edición de nada, "Donar" en vez de
  // "Editar perfil", y las recetas se ven (no se editan) al tocarlas.
  const isOwnProfile = userId === currentUserId;
  const handleRecipeCardClick = isOwnProfile ? onEditRecipe : onRecipeClick;

  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  // Se activa si la URL de avatar cargada por el usuario no llega a cargar (rota,
  // sin conexión, etc.); en ese caso se cae al círculo con iniciales.
  const [avatarBroken, setAvatarBroken] = useState(false);
  // Muestra el aviso "Próximamente" al tocar "Donar" (la CRUD de donaciones todavía no existe).
  const [showDonationSoon, setShowDonationSoon] = useState(false);

  // Reseñas recibidas en todas las recetas propias: { totalReviews, averageRating
  // (null si todavía no hay ninguna) }. Se agrega en el frontend porque el backend
  // solo expone reviews por receta, no un agregado por usuario.
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: null });
  // Rating/cantidad de reseñas de cada receta individual, para mostrarlo en su card
  // y para poder ordenar "mejor valoradas primero". Clave: id de receta.
  const [recipeReviewStats, setRecipeReviewStats] = useState({});

  // Cuántas recetas se están mostrando en la galería (ver RECIPES_PER_PAGE).
  const [visibleRecipeCount, setVisibleRecipeCount] = useState(RECIPES_PER_PAGE);

  // Filtros de la galería. Se aplican en el navegador sobre las recetas que ya
  // trajo el backend, así que no hacen falta endpoints de búsqueda nuevos.
  const [searchQuery, setSearchQuery] = useState('');
  // Ids de las categorías elegidas en el menú de "Categorías". Vacío = todas.
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setFetchError('');
      try {
        const [userData, recipesData] = await Promise.all([
          getUserByIdService(userId),
          getAllRecipes(userId).catch((err) => {
            // El backend devuelve 404 cuando el usuario todavía no tiene recetas.
            if (err.message.includes('No se encontraron')) return [];
            throw err;
          }),
        ]);
        setUser(userData);
        setRecipes(recipesData);

        // Trae las reviews de cada receta propia en paralelo: se usan tanto para
        // el promedio ponderado general (panel de métricas) como para el rating
        // individual de cada card y el orden "mejor valoradas primero".
        const reviewsPerRecipe = await Promise.all(
          recipesData.map((recipe) => getReviewsByRecipe(recipe.id).catch(() => ({ reviews: [] })))
        );

        const perRecipe = {};
        recipesData.forEach((recipe, index) => {
          const ratings = reviewsPerRecipe[index].reviews.map((review) => review.rating);
          perRecipe[recipe.id] = {
            averageRating: ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0,
            totalReviews: ratings.length,
          };
        });
        setRecipeReviewStats(perRecipe);

        const allRatings = reviewsPerRecipe.flatMap((data) => data.reviews.map((review) => review.rating));
        setReviewStats({
          totalReviews: allRatings.length,
          averageRating: allRatings.length > 0
            ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
            : null,
        });
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId]);

  // Copia un resumen del perfil al portapapeles. No hay una página pública de
  // perfil todavía, así que "compartir" comparte el dato real (no un link falso).
  const handleShare = async () => {
    const summary = `${user.name} ${user.lastName} (@${user.username}) en Chefcito — ` +
      `${recipes.length} receta${recipes.length !== 1 ? 's' : ''} publicada${recipes.length !== 1 ? 's' : ''}.`;
    try {
      await navigator.clipboard.writeText(summary);
      setShareFeedback('¡Copiado al portapapeles!');
    } catch {
      setShareFeedback('No se pudo copiar. Copialo manualmente: ' + summary);
    }
    setTimeout(() => setShareFeedback(''), 3000);
  };

  // Cualquier cambio de filtro vuelve la galería a la primera tanda: si no,
  // después de achicar el resultado quedaba un "Mostrando 12 de 3" sin sentido.
  const resetPagination = () => setVisibleRecipeCount(RECIPES_PER_PAGE);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryIds([]);
    resetPagination();
  };

  const distinctCategoryCount = new Set(
    recipes
      .map((recipe) => recipe.recipecategory?.[0]?.category?.name)
      .filter(Boolean)
  ).size;

  // Recetas creadas en el mes en curso (para el badge "+N este mes").
  const now = new Date();
  const recipesThisMonth = recipes.filter((recipe) => {
    if (!recipe.createdAt) return false;
    const createdAt = new Date(recipe.createdAt);
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
  }).length;

  // Cuántas veces, en total, la comunidad guardó alguna receta propia (saveCount
  // es un contador real que ya lleva el backend por receta).
  const totalSaves = recipes.reduce((sum, recipe) => sum + (recipe.saveCount ?? 0), 0);

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

  // La paginación de la galería corre sobre el resultado filtrado, no sobre
  // todas las recetas.
  const visibleRecipes = filteredRecipes.slice(0, visibleRecipeCount);
  const remainingRecipeCount = filteredRecipes.length - visibleRecipes.length;

  // Recetas Destacadas: las 3 propias con mejor valoración promedio (0 si todavía
  // no tienen reseñas, así igual se completan los 3 huecos si hay pocas reseñas).
  const featuredRecipes = [...recipes]
    .sort((a, b) => (recipeReviewStats[b.id]?.averageRating ?? 0) - (recipeReviewStats[a.id]?.averageRating ?? 0))
    .slice(0, 3);

  if (isLoading) {
    return <p className="ProfilePage-status">Cargando perfil...</p>;
  }

  if (fetchError) {
    return <p className="ProfilePage-status ProfilePage-status--error">⚠ {fetchError}</p>;
  }

  if (!user) {
    return <p className="ProfilePage-status">No pudimos encontrar este perfil.</p>;
  }

  return (
    <div className="ProfilePage">
      {/* Solo el perfil ajeno tiene onBack: el propio es un panel fijo de la sidebar,
          no hay a dónde "volver". */}
      {onBack && (
        <button type="button" className="ProfilePage-backBtn" onClick={onBack}>
          <span className="material-symbols-outlined">arrow_back</span>
          Volver
        </button>
      )}

      <section className="ProfilePage-header">
        <div className="ProfilePage-banner">
          {/* Todavía no existe un campo de imagen de portada en el usuario: el botón
              queda visible para respetar el diseño, pero deshabilitado (mismo criterio
              que las tabs de abajo) en vez de prometer una acción que no pasa nada.
              En un perfil ajeno directamente no se muestra: no hay nada para editar. */}
          {isOwnProfile && (
            <button
              type="button"
              className="ProfilePage-coverButton"
              disabled
              title="Todavía no disponible"
            >
              <span className="material-symbols-outlined">photo_camera</span>
              Editar portada
            </button>
          )}

          <div className="ProfilePage-bannerRow">
            <div className="ProfilePage-bannerIdentity">
              {/* Las etiquetas van en la misma fila que el nombre, no sueltas al
                  costado del bloque, para que queden a su misma altura. */}
              <div className="ProfilePage-bannerNameRow">
                <h2 className="ProfilePage-bannerName">{user.name} {user.lastName}</h2>

                <div className="ProfilePage-bannerBadges">
                  {/* "Chef creador" no es un rol del backend: se muestra cuando el usuario
                      ya publicó al menos una receta, así el badge refleja un dato real. */}
                  {recipes.length > 0 && (
                    <span className="ProfilePage-creatorBadge">
                      <span className="material-symbols-outlined">verified</span>
                      Chef Creador
                    </span>
                  )}
                  {user.specialty && (
                    <span className="ProfilePage-specialtyBadge">
                      <span className="material-symbols-outlined">restaurant_menu</span>
                      {user.specialty}
                    </span>
                  )}
                </div>
              </div>

              <span className="ProfilePage-bannerUsername">@{user.username}</span>
            </div>
          </div>
        </div>

        {/* En el perfil propio, el avatar entero es el disparador de "cambiar foto"
            (abre el mismo modal de edición, donde está el campo de URL de la
            imagen). En uno ajeno es solo una imagen, sin overlay ni acción. */}
        {isOwnProfile ? (
          <button
            type="button"
            className="ProfilePage-avatarWrapper"
            onClick={() => setIsEditingProfile(true)}
            aria-label="Cambiar foto de perfil"
            title="Cambiar foto de perfil"
          >
            {user.avatarUrl && !avatarBroken ? (
              <img
                className="ProfilePage-avatar"
                src={user.avatarUrl}
                alt={user.username}
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              <div className="ProfilePage-avatar ProfilePage-avatar--initials">
                {getInitials(user.name, user.lastName)}
              </div>
            )}

            <span className="ProfilePage-avatarOverlay">
              <span className="material-symbols-outlined">photo_camera</span>
              <span className="ProfilePage-avatarOverlayLabel">Cambiar</span>
            </span>
          </button>
        ) : (
          <div className="ProfilePage-avatarWrapper">
            {user.avatarUrl && !avatarBroken ? (
              <img
                className="ProfilePage-avatar"
                src={user.avatarUrl}
                alt={user.username}
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              <div className="ProfilePage-avatar ProfilePage-avatar--initials">
                {getInitials(user.name, user.lastName)}
              </div>
            )}
          </div>
        )}

        <div className="ProfilePage-identityCard">
          <div className="ProfilePage-identityRow">
            <div className="ProfilePage-identityText">
              <div className="ProfilePage-bioRow">
                <p className="ProfilePage-bio">
                  {user.bio || (isOwnProfile ? 'Todavía no agregaste una biografía.' : 'Todavía no agregó una biografía.')}
                </p>
                {isOwnProfile && (
                  <button
                    type="button"
                    className="ProfilePage-bioEditButton"
                    onClick={() => setIsEditingProfile(true)}
                    aria-label="Editar biografía"
                    title="Editar biografía"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                )}
              </div>

              {user.location && (
                <p className="ProfilePage-location">
                  <span className="material-symbols-outlined">location_on</span>
                  {user.location}
                </p>
              )}
            </div>

            <div className="ProfilePage-actions">
              {isOwnProfile ? (
                <button
                  type="button"
                  className="ProfilePage-button ProfilePage-button--primary"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <span className="material-symbols-outlined">edit</span>
                  Editar perfil
                </button>
              ) : (
                <button
                  type="button"
                  className="ProfilePage-button ProfilePage-button--primary"
                  onClick={() => setShowDonationSoon(true)}
                >
                  <span className="material-symbols-outlined">volunteer_activism</span>
                  Donar
                </button>
              )}
              <button
                type="button"
                className="ProfilePage-button ProfilePage-button--outline"
                onClick={handleShare}
              >
                <span className="material-symbols-outlined">share</span>
                Compartir
              </button>
            </div>
          </div>

          {shareFeedback && <p className="ProfilePage-shareFeedback">{shareFeedback}</p>}
        </div>
      </section>

      <section className="ProfilePage-metrics">
        <div className="ProfilePage-metricsHeader">
          <div className="ProfilePage-metricsTitle">
            <span className="ProfilePage-metricsDot" />
            <span className="ProfilePage-metricsEyebrow">
              Panel de creador • Estadísticas de {isOwnProfile ? 'mi' : 'su'} contenido
            </span>
          </div>
          <button
            type="button"
            className="ProfilePage-metricsLink"
            disabled
            title="Todavía no disponible"
          >
            <span className="material-symbols-outlined">analytics</span>
            Ver estadísticas detalladas
          </button>
        </div>

        <div className="ProfilePage-metricsGrid">
          <div className="ProfilePage-metric">
            <div className="ProfilePage-metricTop">
              <span className="ProfilePage-metricValue">{recipes.length}</span>
              {recipesThisMonth > 0 && (
                <span className="ProfilePage-metricBadge">+{recipesThisMonth} este mes</span>
              )}
            </div>
            <span className="ProfilePage-metricLabel">Recetas publicadas</span>
          </div>

          <div className="ProfilePage-metric">
            <div className="ProfilePage-metricTop">
              <span className="ProfilePage-metricValue">{distinctCategoryCount}</span>
            </div>
            <span className="ProfilePage-metricLabel">Categorías distintas</span>
          </div>

          <div className="ProfilePage-metric">
            <div className="ProfilePage-metricTop">
              <span className="ProfilePage-metricValue">
                {reviewStats.averageRating != null ? reviewStats.averageRating.toFixed(1) : '—'}
              </span>
              {reviewStats.averageRating != null && <span className="ProfilePage-metricStar">★</span>}
            </div>
            <span className="ProfilePage-metricLabel">
              {reviewStats.totalReviews} reseña{reviewStats.totalReviews !== 1 ? 's' : ''} de comensales
            </span>
          </div>

          <div className="ProfilePage-metric">
            <div className="ProfilePage-metricTop">
              <span className="ProfilePage-metricValue">{totalSaves}</span>
            </div>
            <span className="ProfilePage-metricLabel">Veces guardada por la comunidad</span>
          </div>
        </div>
      </section>

      {/* Solo "Recetas Publicadas" está implementado; borradores y preferencias quedan
          visibles pero inertes hasta que existan esas features (mismo criterio
          que "Explorar"/"Notificaciones" en la sidebar) — y solo tienen sentido en el
          perfil propio, ninguna receta guardada tampoco (esas ya se ven en "Recetas
          guardadas" de la sidebar). */}
      <div className="ProfilePage-tabs">
        <button type="button" className="ProfilePage-tab ProfilePage-tab--active">
          <span className="material-symbols-outlined">menu_book</span>
          {isOwnProfile ? 'Mis Recetas Publicadas' : 'Recetas Publicadas'} ({recipes.length})
        </button>
        {isOwnProfile && (
          <>
            <button type="button" className="ProfilePage-tab" disabled title="Todavía no disponible">
              <span className="material-symbols-outlined">edit_note</span>
              Borradores
            </button>
            <button type="button" className="ProfilePage-tab" disabled title="Todavía no disponible">
              <span className="material-symbols-outlined">tune</span>
              Preferencias y Dieta
            </button>
          </>
        )}
      </div>

      {/* Recetas Destacadas: siempre son 3 (o menos si todavía no hay tantas) y
          siempre las de mejor valoración — no se ven afectadas por los filtros
          del buscador de más abajo, que solo aplican a la grilla de gestión. */}
      {featuredRecipes.length > 0 && (
        <section className="ProfilePage-featured">
          <div className="ProfilePage-sectionHeader">
            <div>
              <span className="ProfilePage-eyebrow">Lo mejor valorado</span>
              <h3 className="ProfilePage-sectionTitle">Recetas Destacadas</h3>
            </div>
          </div>

          <RecipePodium
            recipes={featuredRecipes}
            reviewStatsByRecipe={recipeReviewStats}
            onEditRecipe={handleRecipeCardClick}
          />
        </section>
      )}

      {recipes.length === 0 && (
        <p className="ProfilePage-empty">
          {isOwnProfile
            ? 'Todavía no publicaste ninguna receta. ¡Creá la primera desde "Mis recetas"!'
            : `${user.name} todavía no publicó ninguna receta.`}
        </p>
      )}

      {/* Galería: acomodo masonry (columnas de alto dispar, ver MasonryGrid) pero
          con la misma card de receta de siempre adentro. */}
      {recipes.length > 0 && (
        <section className="ProfilePage-allRecipes">
          <div className="ProfilePage-sectionHeader">
            <div>
              <span className="ProfilePage-eyebrow">Galería completa</span>
              <h3 className="ProfilePage-sectionTitle">
                {isOwnProfile ? 'Todas mis recetas' : `Todas las recetas de ${user.name}`}
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
                placeholder={isOwnProfile ? 'Buscar en mis recetas...' : `Buscar en las recetas de ${user.name}...`}
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
                  onClick={() => handleRecipeCardClick(recipe.id)}
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
      )}

      {isOwnProfile && isEditingProfile && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditingProfile(false)}
          onSaved={(updatedUser) => {
            setUser(updatedUser);
            setAvatarBroken(false);
            setIsEditingProfile(false);
          }}
        />
      )}

      {showDonationSoon && (
        <AlertModal
          title="Próximamente"
          message="Las donaciones a creadores todavía no están disponibles en Chefcito. ¡Estamos trabajando en eso!"
          onClose={() => setShowDonationSoon(false)}
        />
      )}
    </div>
  );
}

export default ProfilePage;
