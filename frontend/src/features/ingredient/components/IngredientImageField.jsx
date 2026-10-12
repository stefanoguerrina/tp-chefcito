// Foto del ingrediente dentro del formulario. Sin foto, todo el recuadro es el botón para
// subirla (ícono de subir en el centro y "Subir foto" debajo). Con foto, se ve la foto con
// un botón "Cambiar" abajo y, arriba a la derecha, el de quitarla. Solo la elige: se sube
// recién al guardar el ingrediente.
import { useRef } from 'react';

// Recibe: image (lo que devuelve useImagePicker) y name (nombre del ingrediente, para el alt).
function IngredientImageField({ image, name }) {
  // El <input type="file"> está oculto: los botones lo abren con .click().
  const inputRef = useRef(null);
  const handleOpenPicker = () => inputRef.current?.click();

  return (
    <div className="IngredientFormModal-image">
      {image.previewUrl ? (
        <>
          <img
            className="IngredientFormModal-imagePhoto"
            src={image.previewUrl}
            alt={name ? `Foto de ${name}` : 'Foto del ingrediente'}
          />
          <button type="button" className="IngredientFormModal-imageButton" onClick={handleOpenPicker}>
            <span className="material-symbols-outlined">upload</span>
            Cambiar
          </button>
          <button
            type="button"
            className="IngredientFormModal-imageRemove"
            onClick={image.handleRemove}
            aria-label="Quitar foto"
            title="Quitar foto"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </>
      ) : (
        <button type="button" className="IngredientFormModal-imageUpload" onClick={handleOpenPicker}>
          <span className="material-symbols-outlined" aria-hidden="true">upload</span>
          Subir foto
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={image.handleFileChange}
        aria-label="Subir foto del ingrediente"
      />
    </div>
  );
}

export default IngredientImageField;
