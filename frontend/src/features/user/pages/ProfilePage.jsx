// Página de perfil: identidad real (avatar, nombre, bio, ubicación), estadísticas,
// las 3 recetas mejor valoradas y la galería completa de recetas (grilla masonry,
// con buscador y filtro por categorías). Reutiliza RecipeCard (la misma card del
// resto del sitio) para no duplicar layout.
// Sirve tanto para el perfil propio (editable) como para el de otro usuario, de
// solo lectura, al que se llega tocando su nombre desde el detalle de una receta
// (ver isOwnProfile más abajo): ahí no hay nada para editar, y "Editar perfil" se
// reemplaza por "Donar" (todavía sin CRUD propia, muestra el mismo aviso
// "Próximamente" que el botón de Donar del detalle de receta).
import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProfileData } from '../hooks/useProfileData.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import EditProfileModal from '../components/EditProfileModal.jsx';
import ProfileHeader from '../components/ProfileHeader.jsx';
import ProfileMetrics from '../components/ProfileMetrics.jsx';
import ProfileRecipeGallery from '../components/ProfileRecipeGallery.jsx';
import RecipePodium from '../components/RecipePodium.jsx';
import '../styles/_profile-page.scss';

// Rutas: /perfil (perfil propio) y /usuarios/:userId (perfil de otro usuario).
function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId: currentUserId } = useAuthContext();
  const { userId: userIdParam } = useParams();
  const userId = userIdParam ? Number(userIdParam) : currentUserId;
  // Si no es el propio, es de solo lectura: sin edición de nada, "Donar" en vez de
  // "Editar perfil", y las recetas se ven (no se editan) al tocarlas.
  const isOwnProfile = userId === currentUserId;

  // En el perfil propio, tocar una receta abre el editor (y al terminar vuelve acá);
  // en uno ajeno, abre el detalle de solo lectura.
  const handleRecipeCardClick = (recipeId) =>
    isOwnProfile
      ? navigate(`/mis-recetas/${recipeId}/editar`, { state: { from: '/perfil' } })
      : navigate(`/recetas/${recipeId}`);

  // Vuelve a la pantalla anterior; si se entró directo por link (sin historial), a la home.
  const handleBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/'));

  const { user, setUser, recipes, recipeReviewStats, reviewStats, isLoading, fetchError, retry } =
    useProfileData(userId);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  // Muestra el aviso "Próximamente" al tocar "Donar" (la CRUD de donaciones todavía no existe).
  const [showDonationSoon, setShowDonationSoon] = useState(false);

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

  return (
    <div className="ProfilePage">
      {/* Solo el perfil ajeno tiene "Volver": el propio es una sección fija de la
          sidebar, no hay a dónde volver. */}
      {!isOwnProfile && (
        <button type="button" className="ProfilePage-backBtn" onClick={handleBack}>
          <span className="material-symbols-outlined">arrow_back</span>
          Volver
        </button>
      )}

      <ProfileHeader
        key={user.avatarUrl ?? 'sin-avatar'}
        user={user}
        recipesCount={recipes.length}
        isOwnProfile={isOwnProfile}
        onEditProfile={() => setIsEditingProfile(true)}
        onDonate={() => setShowDonationSoon(true)}
      />

      <ProfileMetrics recipes={recipes} reviewStats={reviewStats} isOwnProfile={isOwnProfile} />

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

      {/* Galería: se remonta al cambiar de perfil (key) para no arrastrar los filtros. */}
      {recipes.length > 0 && (
        <ProfileRecipeGallery
          key={userId}
          recipes={recipes}
          recipeReviewStats={recipeReviewStats}
          isOwnProfile={isOwnProfile}
          ownerName={user.name}
          onRecipeClick={handleRecipeCardClick}
        />
      )}

      {isOwnProfile && isEditingProfile && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditingProfile(false)}
          onSaved={(updatedUser) => {
            setUser(updatedUser);
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
