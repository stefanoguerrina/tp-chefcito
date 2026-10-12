// Landing pública de Chefcito: se muestra cuando el usuario no inició sesión.
// Son 4 "pantallas" que ocupan el alto completo de la ventana (ver _landing-page.scss):
//   1. presentación (Hero);
//   2. las 5 recetas mejor valoradas del momento (del backend, ver useLandingTopRecipes);
//   3. "Buscá por": las tres formas de buscar en Chefcito;
//   4. la invitación a registrarse.
// Desde md se pasa de una a otra de a una por vez (scroll-snap del navegador, igual que en
// la home y el perfil), y cada una aparece con un fundido al entrar (ScrollReveal).
// Los CTA de login/registro los maneja AuthPage.
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import TopRecipesSection from '../components/TopRecipesSection.jsx';
import SearchBySection from '../components/SearchBySection.jsx';
import SignupCtaSection from '../components/SignupCtaSection.jsx';
import Footer from '../components/Footer.jsx';
import FloatingAssistantButton from '../components/FloatingAssistantButton.jsx';
import ScrollReveal from '../../../core/components/ScrollReveal.jsx';
import { useLandingTopRecipes } from '../hooks/useLandingTopRecipes.js';
import '../styles/_landing-page.scss';

// id de la 2ª pantalla: el CTA del hero baja hasta ella.
const TOP_RECIPES_SCREEN_ID = 'recetas-del-momento';

// Recibe: onLoginClick y onRegisterClick (accesos directos del Navbar) y onRequireAuth
// (de useAuth, vía AuthPage). Las recetas y el buscador todavía piden cuenta, así que sus
// CTA ("Ver receta", buscar, etc.) usan onRequireAuth: como el visitante no eligió login o
// registro explícitamente, primero se le pregunta cuál de los dos quiere.
function LandingPage({ onLoginClick, onRegisterClick, onRequireAuth }) {
  const topRecipes = useLandingTopRecipes();

  // Baja del hero a la pantalla siguiente. La animación del viaje la hace el navegador
  // (scroll-behavior: smooth en la landing, ver _landing-page.scss).
  const handleExploreClick = () => {
    document.getElementById(TOP_RECIPES_SCREEN_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="LandingPage">
      <Navbar onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} onRequireAuth={onRequireAuth} />

      <main>
        {/* Cada pantalla es un contenedor fijo (la parada del scroll) con la animación de
            entrada adentro, igual que en HomePage. */}
        <div className="LandingPage-screen LandingPage-screen--first" id="top">
          <ScrollReveal className="LandingPage-reveal">
            <Hero onExploreClick={handleExploreClick} />
          </ScrollReveal>
        </div>

        <div className="LandingPage-screen" id={TOP_RECIPES_SCREEN_ID}>
          <ScrollReveal className="LandingPage-reveal">
            <TopRecipesSection
              recipes={topRecipes.recipes}
              isLoading={topRecipes.isLoading}
              error={topRecipes.error}
              onRetry={topRecipes.handleRetry}
              onRecipeClick={onRequireAuth}
            />
          </ScrollReveal>
        </div>

        <div className="LandingPage-screen" id="buscar-por">
          <ScrollReveal className="LandingPage-reveal">
            <SearchBySection onItemClick={onRequireAuth} />
          </ScrollReveal>
        </div>

        <div className="LandingPage-screen" id="registrate">
          <ScrollReveal className="LandingPage-reveal">
            <SignupCtaSection onRegisterClick={onRegisterClick} />
          </ScrollReveal>
        </div>
      </main>

      <FloatingAssistantButton onClick={onRequireAuth} />

      <div className="LandingPage-footerScreen">
        <Footer onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />
      </div>
    </div>
  );
}

export default LandingPage;
