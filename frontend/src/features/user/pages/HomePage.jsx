// Home page (ruta "/") — inicio de un usuario común: el buscador (SearchNavbar) y, debajo,
// 3 "pantallas" que encajan al scrollear (scroll snap desde md) y aparecen con animación
// al entrar en pantalla (ScrollReveal), igual que el perfil:
// 1. Recetas por amigos (lo último que publicaron las personas que sigue);
// 2. Top 10 de la semana (las mejor valoradas de los últimos 7 días, en carrusel);
// 3. Reseñas de amigos.
// Al pie de las dos primeras, un aviso con flecha (ProfileScrollHint) lleva a la siguiente.
// Cada sección carga sus datos por separado (features/feed): si una falla, las otras se
// ven igual. La 1ª carga al entrar; la 2ª y la 3ª, recién cuando el usuario llega a su
// pantalla (useHasBeenVisible), así al abrir la home no se piden las tres juntas.
// La sidebar la pone UserLayout. Un admin nunca llega acá: ProtectedRoute lo manda a /admin.
import SearchNavbar from '../../search/components/SearchNavbar.jsx';
import ScrollReveal from '../../../core/components/ScrollReveal.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import ProfileScrollHint from '../components/ProfileScrollHint.jsx';
import FriendsRecipesSection from '../../feed/components/FriendsRecipesSection.jsx';
import WeeklyTopSection from '../../feed/components/WeeklyTopSection.jsx';
import FriendsReviewsSection from '../../feed/components/FriendsReviewsSection.jsx';
import { useSavedRecipes } from '../../userRecipe/hooks/useSavedRecipes.js';
import { useHasBeenVisible } from '../../../core/hooks/useHasBeenVisible.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import '../styles/_home-feed.scss';

// ids de las pantallas 2 y 3, para bajar hasta ellas con los avisos con flecha.
const WEEKLY_TOP_SCREEN_ID = 'inicio-top-semana';
const FRIENDS_REVIEWS_SCREEN_ID = 'inicio-resenas';

function HomePage() {
  const { userId } = useAuthContext();
  // Uno solo para toda la home: si una receta aparece en dos secciones (ej. la publicó un
  // amigo y además está en el top), su listón se ve igual en las dos.
  const { savedRecipeIds, handleToggleSave, saveError, clearSaveError } = useSavedRecipes();
  // Si el usuario ya llegó a la pantalla 2 / 3 (se monta su sección y recién ahí pide datos).
  const { ref: weeklyTopScreenRef, hasBeenVisible: hasReachedWeeklyTop } = useHasBeenVisible();
  const { ref: friendsReviewsScreenRef, hasBeenVisible: hasReachedFriendsReviews } = useHasBeenVisible();

  return (
    <>
      <SearchNavbar />

      {/* Cada pantalla es un contenedor fijo (el que encaja al scrollear y al que bajan las
          flechas) con la animación adentro, como en ProfilePage. */}
      <div className="HomeFeed">
        <div className="HomeFeed-screen HomeFeed-screen--first">
          <ScrollReveal className="HomeFeed-section">
            <div className="HomeFeed-screenBody">
              <FriendsRecipesSection savedRecipeIds={savedRecipeIds} onToggleSave={handleToggleSave} />
            </div>
            <ProfileScrollHint label="Top 10 de la semana" targetId={WEEKLY_TOP_SCREEN_ID} />
          </ScrollReveal>
        </div>

        <div id={WEEKLY_TOP_SCREEN_ID} ref={weeklyTopScreenRef} className="HomeFeed-screen">
          <ScrollReveal className="HomeFeed-section">
            <div className="HomeFeed-screenBody">
              {hasReachedWeeklyTop && (
                <WeeklyTopSection
                  currentUserId={userId}
                  savedRecipeIds={savedRecipeIds}
                  onToggleSave={handleToggleSave}
                />
              )}
            </div>
            <ProfileScrollHint label="Reseñas de amigos" targetId={FRIENDS_REVIEWS_SCREEN_ID} />
          </ScrollReveal>
        </div>

        <div id={FRIENDS_REVIEWS_SCREEN_ID} ref={friendsReviewsScreenRef} className="HomeFeed-screen">
          <ScrollReveal className="HomeFeed-section">
            {/* Arriba de la pantalla (no centrada): título y reseñas quedan juntos. */}
            <div className="HomeFeed-screenBody HomeFeed-screenBody--top">
              {hasReachedFriendsReviews && <FriendsReviewsSection />}
            </div>
          </ScrollReveal>
        </div>
      </div>

      {saveError && (
        <AlertModal title="No se pudo guardar la receta" message={saveError} onClose={clearSaveError} />
      )}
    </>
  );
}

export default HomePage;
