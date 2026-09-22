// Landing pública de Chefcito: se muestra cuando el usuario no inició sesión.
// Compone las secciones de marketing y delega los CTA de login/registro a AuthPage.
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import WeeklyRecipe from '../components/WeeklyRecipe.jsx';
import ExploreSection from '../components/ExploreSection.jsx';
import CommunitySection from '../components/CommunitySection.jsx';
import Footer from '../components/Footer.jsx';
import FloatingAssistantButton from '../components/FloatingAssistantButton.jsx';
import '../styles/_landing-page.scss';

// Recibe: onLoginClick y onRegisterClick (accesos directos del Navbar) y onRequireAuth
// (de useAuth, vía AuthPage). Las recetas/categorías todavía no tienen página propia,
// así que sus CTA ("Ver receta", "Ver más", etc.) usan onRequireAuth: como el visitante
// no eligió login o registro explícitamente, primero se le pregunta cuál de los dos quiere.
function LandingPage({ onLoginClick, onRegisterClick, onRequireAuth }) {
  return (
    <div className="LandingPage">
      <Navbar onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} onRequireAuth={onRequireAuth} />

      <main>
        <Hero />
        <WeeklyRecipe onViewRecipeClick={onRequireAuth} />
        <ExploreSection onRecipeClick={onRequireAuth} onSeeMoreClick={onRequireAuth} />
        <CommunitySection onSeeMoreClick={onRequireAuth} />
      </main>

      <FloatingAssistantButton onClick={onRequireAuth} />
      <Footer />
    </div>
  );
}

export default LandingPage;
