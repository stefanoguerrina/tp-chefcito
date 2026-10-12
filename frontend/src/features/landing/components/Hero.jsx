// Primera pantalla de la landing: título, bajada, CTA y collage flotante de imágenes.
import dishPhoto1 from '../../../assets/hero-dish-1.jpg';
import dishPhoto2 from '../../../assets/hero-dish-2.jpg';
import dishPhoto3 from '../../../assets/hero-dish-3.jpg';
import '../styles/_hero.scss';

// Recibe: onExploreClick, que baja suavemente a la pantalla siguiente. Quién es "la
// siguiente" lo decide LandingPage, que es la que conoce el orden de las pantallas.
function Hero({ onExploreClick }) {
  return (
    <section className="Hero">
      <div className="Hero-text">
        <h1>
          Descubrí el <span className="Hero-highlight">placer</span> de cocinar algo rico y
          distinto todos los días
        </h1>
        <p>
          Descubre ideas para tus comidas diarias. Desde cenas rápidas hasta postres
          elaborados, encontrá tu próxima receta favorita y compartí las tuyas.
        </p>
        <button type="button" className="Hero-cta" onClick={onExploreClick}>
          Explorar recetas
        </button>
      </div>

      <div className="Hero-collage">
        <div className="Hero-image Hero-image--main">
          <img src={dishPhoto1} alt="Plato emplatado con palta, pescado curado y brotes" />
        </div>
        <div className="Hero-image Hero-image--secondary">
          <img src={dishPhoto2} alt="Pan casero recién horneado con queso y jamón crudo" />
        </div>
        <div className="Hero-image Hero-image--tertiary">
          <img src={dishPhoto3} alt="Canasta con verduras frescas y tomates" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
