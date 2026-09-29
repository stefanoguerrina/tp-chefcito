// Fotos de la receta, dentro del editor: una foto grande (la principal) con su botón para
// subir/cambiarla, y abajo las miniaturas de las demás — tocar una miniatura la vuelve la
// principal, y cada una tiene su botón para quitarla. El estado (qué fotos hay, cuál es la
// principal) lo administra useRecipePhotos; este componente solo lo muestra y dispara sus
// acciones.
import { useRef } from 'react';
import '../styles/_recipe-media-stage.scss';

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp';

// Recibe: photos, mainPhoto, canAddMore, error, isProcessing (ver useRecipePhotos) y sus
// handlers onAddFiles(FileList), onReplaceMainFile(File), onSetMain(key), onRemove(key).
function RecipeMediaStage({ photos, mainPhoto, canAddMore, error, isProcessing, onAddFiles, onReplaceMainFile, onSetMain, onRemove }) {
  const addInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  const handleAddChange = (event) => {
    const files = event.target.files;
    event.target.value = '';
    if (files?.length) onAddFiles(files);
  };

  const handleReplaceChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onReplaceMainFile(file);
  };

  return (
    <section className="RecipeEditorCard RecipeMediaStage">
      <div className="RecipeMediaStage-main">
        {mainPhoto ? (
          <img className="RecipeMediaStage-mainImage" src={mainPhoto.previewUrl} alt="Foto principal de la receta" />
        ) : (
          <span className="RecipeMediaStage-mainPlaceholder material-symbols-outlined">restaurant</span>
        )}

        <div className="RecipeMediaStage-mainOverlay">
          <button
            type="button"
            className="RecipeMediaStage-mainButton"
            onClick={() => replaceInputRef.current?.click()}
            disabled={isProcessing}
          >
            <span className="material-symbols-outlined">upload</span>
            {isProcessing ? 'Procesando...' : mainPhoto ? 'Cambiar foto principal' : 'Subir foto principal'}
          </button>
          <p className="RecipeMediaStage-mainHint">Elegí una imagen desde tu dispositivo</p>
        </div>

        {photos.length > 0 && (
          <span className="RecipeMediaStage-counter">
            <span className="material-symbols-outlined">photo_camera</span>
            {photos.length} {photos.length === 1 ? 'foto cargada' : 'fotos cargadas'}
          </span>
        )}

        <input
          ref={replaceInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          className="RecipeMediaStage-fileInput"
          onChange={handleReplaceChange}
          aria-label="Subir o cambiar la foto principal"
        />
      </div>

      {error && <p className="RecipeMediaStage-error">{error}</p>}

      <div className="RecipeMediaStage-thumbs">
        {photos.map((photo) => (
          <div key={photo.key} className={`RecipeMediaStage-thumb${photo.isMain ? ' RecipeMediaStage-thumb--main' : ''}`}>
            <button
              type="button"
              className="RecipeMediaStage-thumbButton"
              onClick={() => onSetMain(photo.key)}
              aria-pressed={photo.isMain}
              aria-label={photo.isMain ? 'Foto principal' : 'Marcar como foto principal'}
              disabled={photo.isMain}
            >
              <img src={photo.previewUrl} alt="" />
              {photo.isMain && <span className="RecipeMediaStage-thumbBadge">Principal</span>}
            </button>
            <button
              type="button"
              className="RecipeMediaStage-thumbRemove"
              onClick={() => onRemove(photo.key)}
              aria-label="Quitar esta foto"
              title="Quitar esta foto"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            className="RecipeMediaStage-addThumb"
            onClick={() => addInputRef.current?.click()}
            disabled={isProcessing}
          >
            <span className="material-symbols-outlined">add</span>
            <span>Añadir foto</span>
          </button>
        )}
      </div>

      <input
        ref={addInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        multiple
        className="RecipeMediaStage-fileInput"
        onChange={handleAddChange}
        aria-label="Añadir fotos"
      />
    </section>
  );
}

export default RecipeMediaStage;
