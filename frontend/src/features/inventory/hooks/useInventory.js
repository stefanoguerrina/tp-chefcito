// Hook useInventory: centraliza el estado y las operaciones del inventario del usuario.
// Maneja los estados de loading, error y el flujo del modal de edición al detectar duplicados.
import { useState, useEffect, useCallback } from 'react';
import { getCurrentUserId } from '../../../shared/utils/decodeToken.js';
import {
  getInventory,
  addToInventory,
  updateInventoryItem,
  removeFromInventory,
} from '../services/inventoryService.js';
import { getAllIngredients } from '../../ingredient/services/ingredientService.js';

function useInventory() {
  const userId = getCurrentUserId();

  // Estado del inventario
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Lista de ingredientes disponibles para el buscador
  const [allIngredients, setAllIngredients] = useState([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(true);

  // Modal de duplicado: se muestra cuando el POST responde 409
  const [duplicateModal, setDuplicateModal] = useState(null);
  // { ingredientName, idIngredient, current: { availableQuantity, unitOfMeasure } }

  // Carga el inventario del usuario autenticado
  const loadInventory = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await getInventory(userId);
      setItems(data);
    } catch (err) {
      // El backend devuelve 404 cuando el inventario está vacío, no es un error real
      if (err.message.includes('vacío') || err.message.includes('404')) {
        setItems([]);
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Carga todos los ingredientes disponibles para el selector de búsqueda
  const loadIngredients = useCallback(async () => {
    setIngredientsLoading(true);
    try {
      const data = await getAllIngredients();
      setAllIngredients(data);
    } catch {
      setAllIngredients([]);
    } finally {
      setIngredientsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
    loadIngredients();
  }, [loadInventory, loadIngredients]);

  // Muestra un mensaje de éxito temporal (3 segundos)
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Agrega un ingrediente al inventario.
  // Si ya existe, guarda los datos del conflicto para mostrar el modal.
  const handleAdd = async (ingredientId, availableQuantity, unitOfMeasure) => {
    setError('');
    try {
      const result = await addToInventory(userId, {
        idIngredient: ingredientId,
        availableQuantity: Number(availableQuantity),
        unitOfMeasure: unitOfMeasure || null,
      });

      if (!result.ok && result.reason === 'already_exists') {
        // Buscar el nombre del ingrediente para mostrarlo en el modal
        const ingredientName =
          allIngredients.find((i) => i.id === ingredientId)?.name ?? 'este ingrediente';
        setDuplicateModal({
          ingredientName,
          idIngredient: ingredientId,
          current: result.current,
        });
        return;
      }

      setItems((prev) => [...prev, result.item]);
      showSuccess('Ingrediente agregado al inventario.');
    } catch (err) {
      setError(err.message);
    }
  };

  // Actualiza la cantidad/unidad de un ítem (tanto desde edición directa como desde el modal).
  const handleUpdate = async (ingredientId, data) => {
    setError('');
    try {
      const updated = await updateInventoryItem(userId, ingredientId, data);
      setItems((prev) => prev.map((it) => (it.idIngredient === ingredientId ? updated : it)));
      showSuccess('Inventario actualizado.');
      setDuplicateModal(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Elimina un ítem del inventario.
  const handleRemove = async (ingredientId) => {
    setError('');
    try {
      await removeFromInventory(userId, ingredientId);
      setItems((prev) => prev.filter((it) => it.idIngredient !== ingredientId));
      showSuccess('Ingrediente eliminado del inventario.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseDuplicateModal = () => setDuplicateModal(null);

  return {
    items,
    isLoading,
    error,
    successMsg,
    allIngredients,
    ingredientsLoading,
    duplicateModal,
    handleAdd,
    handleUpdate,
    handleRemove,
    handleCloseDuplicateModal,
    reload: loadInventory,
  };
}

export default useInventory;
