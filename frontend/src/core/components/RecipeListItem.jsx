// Fila compacta de receta (número/ícono + miniatura + título + autor).
// Se usa en listas cortas, por ejemplo el ranking de "más recetas destacadas".
import './_recipe-list-item.scss';

// Recibe: recipe (title, author, image), position (número mostrado a la izquierda,
// opcional) y onClick. Devuelve la fila lista para insertarse en un <div> contenedor.
function RecipeListItem({ recipe, position, onClick }) {
  return (
    <div className="RecipeListItem" onClick={onClick}>
      {typeof position === 'number' && <span className="RecipeListItem-position">{position}</span>}
      <img className="RecipeListItem-image" src={recipe.image} alt={recipe.title} loading="lazy" />
      <div>
        <h4 className="RecipeListItem-title">{recipe.title}</h4>
        <p className="RecipeListItem-author">por {recipe.author}</p>
      </div>
    </div>
  );
}

export default RecipeListItem;
