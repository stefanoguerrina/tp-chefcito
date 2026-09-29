// Galería de fotos del detalle de receta: la foto grande arriba y, si la receta tiene más
// de una, las miniaturas abajo para cambiarla. Encima de la foto van la dificultad y el
// contador "1 / N".
import { useState } from 'react';
import { getMainImage, RECIPE_PLACEHOLDER_IMAGE, RECIPE_DIFFICULTY_ICON } from '../models/recipeModel.js';
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';
import '../styles/_recipe-gallery.scss';

// Recibe: una receta cruda. Devuelve: las URLs de sus fotos, con la principal primero
// (así es la que se ve al entrar).
const getOrderedImageUrls = (recipe) => {
  const mainImage = getMainImage(recipe);
  const others = (recipe.image ?? []).filter((image) => image !== mainImage);
  return [mainImage, ...others].filter(Boolean).map((image) => resolveImageUrl(image.imageUrl));
};

// Recibe: recipe (cruda del backend, con image[], name y difficulty).
function RecipeGallery({ recipe }) {
  const images = getOrderedImageUrls(recipe);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasSeveralImages = images.length > 1;

  return (
    <section className="RecipeDetailCard RecipeGallery">
      <div className="RecipeGallery-main">
        <img
          className="RecipeGallery-mainImage"
          src={images[selectedIndex] ?? RECIPE_PLACEHOLDER_IMAGE}
          alt={recipe.name}
        />

        {recipe.difficulty && (
          <span className="RecipeGallery-badge">
            <span className="material-symbols-outlined">{RECIPE_DIFFICULTY_ICON}</span>
            {recipe.difficulty}
          </span>
        )}

        {hasSeveralImages && (
          <span className="RecipeGallery-counter">
            <span className="material-symbols-outlined">photo_camera</span>
            {selectedIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {hasSeveralImages && (
        <div className="RecipeGallery-thumbs">
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              className={`RecipeGallery-thumb${index === selectedIndex ? ' RecipeGallery-thumb--active' : ''}`}
              onClick={() => setSelectedIndex(index)}
              aria-label={`Ver foto ${index + 1} de ${images.length}`}
              aria-pressed={index === selectedIndex}
            >
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecipeGallery;
