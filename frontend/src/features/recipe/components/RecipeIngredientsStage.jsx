// Ingredientes de la receta, a todo el ancho del editor: "Agregar" abre un modal con
// buscador sobre el catálogo (RecipeSearchModal, compartido con RecipeCategoryPicker);
// cada uno ya elegido se ve en una grilla de tarjetas compactas (1/2/3 columnas según el
// ancho de pantalla) donde solo se edita la cantidad.
import { useState } from 'react';
import RecipeIngredientCard from './RecipeIngredientCard.jsx';
import RecipeSearchModal from './RecipeSearchModal.jsx';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import RequiredMark from '../../../core/components/RequiredMark.jsx';
import FieldError from '../../../core/components/FieldError.jsx';
import '../styles/_recipe-ingredients-stage.scss';

// Recibe: ingredients (array de { idIngredient, quantity }), ingredientsCatalog
// (todos los ingredientes disponibles para elegir), onIngredientsChange (recibe el
// array completo ya modificado) y error (mensaje si se intentó publicar sin ingredientes).
function RecipeIngredientsStage({ ingredients, ingredientsCatalog, onIngredientsChange, error }) {
  const [showAddModal, setShowAddModal] = useState(false);
  // Índice del ingrediente que se está por borrar (null = no hay modal abierto).
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);

  const handleChangeIngredient = (index, patch) => {
    onIngredientsChange(ingredients.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const handleConfirmDelete = () => {
    onIngredientsChange(ingredients.filter((_, i) => i !== pendingDeleteIndex));
    setPendingDeleteIndex(null);
  };

  // Se agrega con la cantidad vacía: la card recién creada arranca directamente en modo
  // edición para completarla (ver RecipeIngredientCard).
  const handleSelectIngredient = (ingredient) => {
    onIngredientsChange([...ingredients, { idIngredient: String(ingredient.id), quantity: '' }]);
    setShowAddModal(false);
  };

  const excludedIngredientIds = new Set(ingredients.map((item) => Number(item.idIngredient)));
  const availableIngredients = ingredientsCatalog.filter((ing) => !excludedIngredientIds.has(ing.id));

  return (
    <section className="RecipeEditorCard RecipeIngredientsStage">
      <div className="RecipeEditorCard-header">
        <div className="RecipeIngredientsStage-titleGroup">
          <h2 className="RecipeEditorCard-title">
            Ingredientes
            {/* Solo es obligatorio si hay ingredientes para elegir (ver RecipeEditorPage). */}
            {ingredientsCatalog.length > 0 && <RequiredMark />}
          </h2>
          {ingredientsCatalog.length > 0 && (
            <span className="RecipeIngredientsStage-counter">
              {ingredients.length} {ingredients.length === 1 ? 'añadido' : 'añadidos'}
            </span>
          )}
        </div>
        {ingredientsCatalog.length > 0 && (
          <button type="button" className="RecipeIngredientsStage-addButton" onClick={() => setShowAddModal(true)}>
            <span className="material-symbols-outlined">add</span>
            Agregar
          </button>
        )}
      </div>

      <FieldError id="recipe-ingredients-error" message={error} />

      {ingredientsCatalog.length === 0 ? (
        <p className="RecipeEditorCard-empty">
          Todavía no hay ingredientes cargados en el catálogo. Pedile a un administrador que cargue algunos
          para poder agregarlos a tu receta.
        </p>
      ) : ingredients.length === 0 ? (
        <p className="RecipeEditorCard-empty">Todavía no agregaste ningún ingrediente.</p>
      ) : (
        <div className="RecipeIngredientsStage-grid">
          {ingredients.map((item, index) => (
            <RecipeIngredientCard
              key={`${item.idIngredient}-${index}`}
              item={item}
              ingredientsCatalog={ingredientsCatalog}
              canDelete={ingredients.length > 1}
              onChange={(patch) => handleChangeIngredient(index, patch)}
              onDelete={() => setPendingDeleteIndex(index)}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <RecipeSearchModal
          title="Agregar ingrediente"
          placeholder="Buscar ingrediente..."
          items={availableIngredients}
          emptyMessage="No se encontraron ingredientes con ese nombre."
          allPickedMessage="Ya agregaste todos los ingredientes del catálogo."
          renderMeta={(ingredient) =>
            ingredient.unitOfMeasure ? (
              <span className="RecipeSearchModal-meta">{ingredient.unitOfMeasure}</span>
            ) : null
          }
          onSelect={handleSelectIngredient}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {pendingDeleteIndex !== null && (
        <ConfirmModal
          title="Eliminar ingrediente"
          message={`¿Eliminar el ingrediente ${pendingDeleteIndex + 1}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDeleteIndex(null)}
        />
      )}
    </section>
  );
}

export default RecipeIngredientsStage;
