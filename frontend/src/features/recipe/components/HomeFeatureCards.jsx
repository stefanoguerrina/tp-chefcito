// Tres accesos rápidos a las distintas formas de explorar recetas en Chefcito.
// Ninguna de las tres existe todavía como feature propia (inventario de ingredientes,
// búsqueda avanzada, asistente IA): por ahora son solo visuales.
import '../styles/_home-feature-cards.scss';

const FEATURE_CARDS = [
  { icon: 'kitchen', label: 'Cargá tus ingredientes', accent: 'secondary' },
  { icon: 'manage_search', label: 'Buscá por categoría, receta o usuario', accent: 'tertiary' },
  { icon: 'psychology', label: 'Consultá a la IA qué podés hacer', accent: 'primary' },
];

function HomeFeatureCards() {
  return (
    <section className="HomeFeatureCards">
      <div className="HomeFeatureCards-grid">
        {/* TODO: conectar cada card con su feature real (inventario, búsqueda, asistente IA). */}
        {FEATURE_CARDS.map((card) => (
          <button
            key={card.label}
            type="button"
            className={`HomeFeatureCards-card HomeFeatureCards-card--${card.accent}`}
          >
            <span className="material-symbols-outlined">{card.icon}</span>
            <span>{card.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default HomeFeatureCards;
