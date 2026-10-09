// Hook de la página "Donaciones": pide el historial del usuario logueado (recibidas,
// realizadas y totales) y expone los estados de carga y error para la UI.
import { useEffect, useState } from 'react';
import { getMyDonations } from '../services/donationService.js';

// Recibe: nada. Devuelve: { history (null mientras carga), isLoading, loadError, reload }.
export const useDonationHistory = () => {
  const [history, setHistory] = useState(null);
  const [loadError, setLoadError] = useState('');
  // Sube con cada "Reintentar" para volver a disparar el pedido.
  const [reloadCount, setReloadCount] = useState(0);

  // El estado se actualiza solo dentro de los callbacks de la promesa (regla del lint).
  useEffect(() => {
    let isStale = false;
    getMyDonations()
      .then((data) => {
        if (!isStale) setHistory(data);
      })
      .catch((err) => {
        if (!isStale) setLoadError(err.message);
      });
    return () => {
      isStale = true;
    };
  }, [reloadCount]);

  const reload = () => {
    setHistory(null);
    setLoadError('');
    setReloadCount((count) => count + 1);
  };

  return { history, isLoading: !history && !loadError, loadError, reload };
};
