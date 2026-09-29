// Una sección de la página de resultados (/buscar): título con la cantidad de
// coincidencias y una grilla con las cards de ese tipo de resultado.

// Recibe: title (ej. "Recetas sugeridas"), total (coincidencias reales, no solo las que se
// muestran), layout ('categories' | 'recipes' | 'users', define las columnas de la
// grilla) y children (las cards, incluida la de "+N más" si corresponde).
function SearchResultsSection({ title, total, layout, children }) {
  return (
    <section className="SearchResultsSection">
      <h2 className="SearchResultsSection-title">
        {title} ({total})
      </h2>
      <div className={`SearchResultsSection-grid SearchResultsSection-grid--${layout}`}>{children}</div>
    </section>
  );
}

export default SearchResultsSection;
