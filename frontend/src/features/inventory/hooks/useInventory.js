// Hook useInventory: centraliza el estado y las operaciones del inventario del usuario.
// Maneja los estados de loading y error (de carga y de acciones) y el flujo del modal
// que aparece al intentar agregar un ingrediente que ya estaba en la despensa.
import { useState, useEffect } from 'react';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';
import {
  getInventory,
  addToInventory,
  updateInventoryItem,
  removeFromInventory,
} from '../services/inventoryService.js';
import { getAllIngredients } from '../../ingredient/services/ingredientService.js';

function useInventory() {
  const { userId } = useAuthContext();

  // Estado del inventario
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Error al cargar el inventario (se muestra en la página con "Reintentar").
  const [loadError, setLoadError] = useState('');
  // Error de la última acción (agregar, editar, quitar): se muestra en un modal.
  const [actionError, setActionError] = useState('');

  // Lista de ingredientes disponibles para el buscador
  const [allIngredients, setAllIngredients] = useState([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(true);

  // Modal de duplicado: se muestra cuando el POST responde 409
  // { ingredientName, idIngredient, current: { availableQuantity, unitOfMeasure } }
  const [duplicateModal, setDuplicateModal] = useState(null);

  // Carga el inventario del usuario autenticado (un 404 = despensa vacía).
  // El estado se actualiza solo dentro de los callbacks de la promesa, así se puede
  // llamar desde el useEffect sin renders en cascada.
  const loadInventory = () =>
    fetchListOrEmpty(() => getInventory(userId))
      .then((data) => {
        setItems(data);
        setLoadError('');
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setIsLoading(false));

  // Carga todos los ingredientes disponibles para el selector de búsqueda.
  // Si falla, el selector queda vacío (el form ya avisa que no hay ingredientes).
  const loadIngredients = () =>
    fetchListOrEmpty(() => getAllIngredients())
      .then(setAllIngredients)
      .catch(() => setAllIngredients([]))
      .finally(() => setIngredientsLoading(false));

  useEffect(() => {
    loadInventory();
    loadIngredients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Reintenta la carga del inventario después de un error.
  const reload = () => {
    setIsLoading(true);
    loadInventory();
  };

  // Agrega un ingrediente al inventario.
  // Devuelve true si se agregó; false si ya existía (abre el modal de duplicado) o si falló.
  const handleAdd = async (ingredientId, availableQuantity, unitOfMeasure) => {
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
        return false;
      }

      setItems((prev) => [...prev, result.item]);
      return true;
    } catch (err) {
      setActionError(err.message);
      return false;
    }
  };

  // Actualiza la cantidad/unidad de un ítem (tanto desde edición directa como desde el modal).
  // Devuelve true si se guardó, false si falló.
  const handleUpdate = async (ingredientId, data) => {
    try {
      const updated = await updateInventoryItem(userId, ingredientId, data);
      setItems((prev) => prev.map((it) => (it.idIngredient === ingredientId ? updated : it)));
      setDuplicateModal(null);
      return true;
    } catch (err) {
      setActionError(err.message);
      return false;
    }
  };

  // Elimina un ítem del inventario. Devuelve true si se eliminó, false si falló.
  const handleRemove = async (ingredientId) => {
    try {
      await removeFromInventory(userId, ingredientId);
      setItems((prev) => prev.filter((it) => it.idIngredient !== ingredientId));
      return true;
    } catch (err) {
      setActionError(err.message);
      return false;
    }
  };

  const handleCloseDuplicateModal = () => setDuplicateModal(null);
  const handleCloseActionError = () => setActionError('');

  return {
    items,
    isLoading,
    loadError,
    actionError,
    allIngredients,
    ingredientsLoading,
    duplicateModal,
    handleAdd,
    handleUpdate,
    handleRemove,
    handleCloseDuplicateModal,
    handleCloseActionError,
    reload,
  };
}

export default useInventory;
