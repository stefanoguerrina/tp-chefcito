// Página de perfil, en 3 "pantallas" que encajan al scrollear (scroll snap desde md) y
// aparecen con animación cada vez que entran en pantalla (ScrollReveal):
// 1. portada, avatar y datos, y debajo las métricas del usuario (recetas publicadas,
//    valoración promedio, seguidores, seguidos y categoría principal);
// 2. las 3 recetas mejor valoradas, en abanico;
// 3. la galería completa de recetas, con buscador, inventario, categoría y orden.
// Al pie de las dos primeras, un aviso con flecha (ProfileScrollHint) lleva a la siguiente.
// Reutiliza RecipeCard (la misma card del resto del sitio) para no duplicar layout.
// Sirve tanto para el perfil propio (editable) como para el de otro usuario, de
// solo lectura, al que se llega tocando su nombre desde el detalle de una receta
// (ver isOwnProfile más abajo): ahí no hay nada para editar, y "Editar perfil" se
// reemplaza por "Seguir" (useFollow: las personas que seguís son tus "amigos" en la
// home) y "Donar" (todavía sin funcionalidad: muestra un aviso "Próximamente").
import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProfileData } from '../hooks/useProfileData.js';
import { useFollow } from '../../follow/hooks/useFollow.js';
import { useHasBeenVisible } from '../../../core/hooks/useHasBeenVisible.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import ScrollReveal from '../../../core/components/ScrollReveal.jsx';
import EditProfileModal from '../components/EditProfileModal.jsx';
import ProfileCard from '../components/ProfileCard.jsx';
import ProfileRecipeGallery from '../components/ProfileRecipeGallery.jsx';
import FeaturedRecipes from '../components/FeaturedRecipes.jsx';
import ProfileMetrics from '../components/ProfileMetrics.jsx';
import ProfileScrollHint from '../components/ProfileScrollHint.jsx';
import { buildProfileMetrics } from '../models/profileMetricsModel.js';
import '../styles/_profile-page.scss';

// ids de las secciones 2 y 3, para bajar hasta ellas con los avisos con flecha.
const FEATURED_SECTION_ID = 'perfil-destacadas';
const RECIPES_SECTION_ID = 'perfil-recetas';

// Recibe: una lista de recetas crudas. Devuelve sus categorías sin repetir ([{ id, name }]),
// ordenadas por nombre: son las opciones del filtro de la galería (solo las que usa el autor).
const getRecipeCategories = (recipes) =>
  Array.from(
    new Map(
      recipes
        .flatMap((recipe) => recipe.recipecategory ?? [])
        .map(({ category }) => category)
        .filter(Boolean)
        .map((category) => [category.id, { id: category.id, name: category.name }])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name, 'es'));

// Rutas: /perfil (perfil propio) y /usuarios/:userId (perfil de otro usuario).
function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId: currentUserId } = useAuthContext();
  const { userId: userIdParam } = useParams();
  const userId = userIdParam ? Number(userIdParam) : currentUserId;
  // Si no es el propio, es de solo lectura: sin edición de nada, "Seguir" y "Donar" en
  // vez de "Editar perfil", y las recetas solo se ven (sin el botón "Editar receta").
  const isOwnProfile = userId === currentUserId;

  // Tocar una receta abre su detalle (el mismo que ven los demás).
  const handleRecipeCardClick = (recipeId) => navigate(`/recetas/${recipeId}`);

  // En el perfil propio, al pasar el mouse por una receta aparecen dos botones: "Ver
  // receta" (el detalle) y "Editar receta" (el editor, que al terminar vuelve acá). En uno
  // ajeno queda el "Ver receta" de siempre (undefined = sin botones propios).
  // Recibe: el id de la receta. Devuelve: las acciones para RecipeCard (hoverActions).
  const getRecipeHoverActions = isOwnProfile
    ? (recipeId) => [
      { label: 'Ver receta', icon: 'visibility', onClick: () => handleRecipeCardClick(recipeId) },
      {
        label: 'Editar receta',
        icon: 'edit',
        variant: 'secondary',
        onClick: () => navigate(`/mis-recetas/${recipeId}/editar`, { state: { from: '/perfil' } }),
      },
    ]
    : undefined;

  // Vuelve a la pantalla anterior; si se entró directo por link (sin historial), a la home.
  const handleBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/'));

  const { user, setUser, recipes, recipeReviewStats, isLoading, fetchError, retry } =
    useProfileData(userId, isOwnProfile);

  const { followStatus, isFollowPending, handleToggleFollow, followError, clearFollowError } =
    useFollow(userId);

  // La galería (pantalla 3) pide su listado recién cuando el usuario llega hasta ella.
  const { ref: recipesScreenRef, hasBeenVisible: hasReachedRecipes } = useHasBeenVisible();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  // Mensaje del aviso "Próximamente" al tocar "Donar" (todavía no existe); vacío = sin aviso.
  const [comingSoonMessage, setComingSoonMessage] = useState('');

  // Recetas Destacadas: las 3 propias con mejor valoración promedio (0 si todavía
  // no tienen reseñas, así igual se completan los 3 huecos si hay pocas reseñas).
  const featuredRecipes = [...recipes]
    .sort((a, b) => (recipeReviewStats[b.id]?.averageRating ?? 0) - (recipeReviewStats[a.id]?.averageRating ?? 0))
    .slice(0, 3);

  if (isLoading) {
    return <p className="ProfilePage-status">Cargando perfil...</p>;
  }

  if (fetchError) {
    return <ErrorState title="No pudimos cargar el perfil" message={fetchError} onRetry={retry} />;
  }

  if (!user) {
    return <p className="ProfilePage-status">No pudimos encontrar este perfil.</p>;
  }

  // Sin recetas no hay destacadas: el perfil queda en una sola pantalla normal.
  const hasRecipes = recipes.length > 0;

  return (
    <div className={`ProfilePage${hasRecipes ? ' ProfilePage--screens' : ''}`}>
      {/* Cada pantalla es un <section> fijo (el que encaja al scrollear y al que bajan las
          flechas) con la animación adentro: si el que encajara fuera el mismo ScrollReveal,
          el encaje tomaría su posición corrida mientras está oculto y quedaría desfasado. */}

      {/* 1. Identidad y métricas */}
      <section className="ProfilePage-screen ProfilePage-screen--intro">
        <ScrollReveal className="ProfilePage-section">
          {/* Solo el perfil ajeno tiene "Volver": al propio se entra desde la cuenta del
              pie de la sidebar, no hay a dónde volver. */}
          {!isOwnProfile && (
            <button type="button" className="ProfilePage-backBtn" onClick={handleBack}>
              <span className="material-symbols-outlined">arrow_back</span>
              Volver
            </button>
          )}

          <ProfileCard
            key={user.avatarUrl ?? 'sin-avatar'}
            user={user}
            recipesCount={recipes.length}
            isOwnProfile={isOwnProfile}
            onEditProfile={() => setIsEditingProfile(true)}
            followStatus={followStatus}
            isFollowPending={isFollowPending}
            onFollow={handleToggleFollow}
            onDonate={() => setComingSoonMessage('Las donaciones a creadores todavía no están disponibles en Chefcito. ¡Estamos trabajando en eso!')}
          />

          {/* Las métricas se ven siempre (también sin recetas): ahí están los seguidores. */}
          <ProfileMetrics
            metrics={buildProfileMetrics(recipes, recipeReviewStats)}
            followStatus={followStatus}
          />
          {hasRecipes && <ProfileScrollHint label="Recetas destacadas" targetId={FEATURED_SECTION_ID} />}
        </ScrollReveal>
      </section>

      {/* 2. Destacadas: siempre las 3 de mejor valoración (o menos, si no hay tantas);
          los filtros de la galería no las afectan. */}
      {hasRecipes && (
        <section id={FEATURED_SECTION_ID} className="ProfilePage-screen ProfilePage-screen--featured">
          <ScrollReveal className="ProfilePage-section">
            <div className="ProfilePage-screenBody">
              <FeaturedRecipes
                recipes={featuredRecipes}
                reviewStatsByRecipe={recipeReviewStats}
                onRecipeClick={handleRecipeCardClick}
                getRecipeHoverActions={getRecipeHoverActions}
              />
            </div>
            <ProfileScrollHint label="Todas las recetas" targetId={RECIPES_SECTION_ID} />
          </ScrollReveal>
        </section>
      )}

      {/* 3. Todas las recetas. La galería se remonta al cambiar de perfil (key) para no
          arrastrar el texto del buscador, y se monta (y pide sus datos) recién cuando el
          usuario llega a esta pantalla. */}
      <section
        id={RECIPES_SECTION_ID}
        ref={recipesScreenRef}
        className="ProfilePage-screen ProfilePage-screen--recipes"
      >
        <ScrollReveal className="ProfilePage-section">
          {recipes.length === 0 ? (
            <p className="ProfilePage-empty">
              {isOwnProfile ? 'Todavía no publicaste recetas.' : `${user.name} todavía no publicó recetas.`}
            </p>
          ) : (
            hasReachedRecipes && (
              <ProfileRecipeGallery
                key={userId}
                authorId={userId}
                totalRecipes={recipes.length}
                categories={getRecipeCategories(recipes)}
                isOwnProfile={isOwnProfile}
                ownerName={user.name}
                onRecipeClick={handleRecipeCardClick}
                getRecipeHoverActions={getRecipeHoverActions}
              />
            )
          )}
        </ScrollReveal>
      </section>

      {isOwnProfile && isEditingProfile && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditingProfile(false)}
          onSaved={(updatedUser) => {
            // En el perfil propio, setUser actualiza el usuario compartido
            // (CurrentUserContext): la sidebar muestra el nombre y la foto nuevos sola.
            setUser(updatedUser);
            setIsEditingProfile(false);
          }}
        />
      )}

      {comingSoonMessage && (
        <AlertModal title="Próximamente" message={comingSoonMessage} onClose={() => setComingSoonMessage('')} />
      )}

      {followError && (
        <AlertModal title="No se pudo actualizar el seguimiento" message={followError} onClose={clearFollowError} />
      )}
    </div>
  );
}

export default ProfilePage;
