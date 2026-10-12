// Hook compartido para "eliminar con confirmación" en las tablas del panel admin: guarda
// qué elemento espera confirmación (ConfirmModal), cuál se está borrando (para deshabilitar
// su botón) y, si el borrado falla, el motivo para mostrarlo en un AlertModal aparte (en
// vez de un banner que queda pegado en la pantalla).
import { useState } from 'react';

// Recibe: onDelete (async, recibe el elemento a borrar; si falla, lanza el error con el
// mensaje para el usuario). Devuelve: el estado de los dos modales y sus acciones.
export const useDeleteConfirmation = (onDelete) => {
  // Elemento pendiente de confirmar ({ id, name, ... }), o null si el modal está cerrado.
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  // { name, message } del borrado que falló, o null si no hay aviso para mostrar.
  const [deleteFailure, setDeleteFailure] = useState(null);

  // Al confirmar: borra y cierra el modal de confirmación pase lo que pase; si falló,
  // deja el motivo para el modal de aviso.
  const handleConfirmDelete = async () => {
    const target = pendingDelete;
    setDeletingId(target.id);
    try {
      await onDelete(target);
    } catch (err) {
      setDeleteFailure({ name: target.name, message: err.message });
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  return {
    pendingDelete,
    deletingId,
    deleteFailure,
    requestDelete: setPendingDelete,
    cancelDelete: () => setPendingDelete(null),
    clearDeleteFailure: () => setDeleteFailure(null),
    handleConfirmDelete,
  };
};
