// Hook de las tarjetas del dashboard: pide el resumen (un solo pedido, con todo ya contado
// en el backend) al montar la sección y lo deja listo para mostrar.
import { useState, useEffect } from 'react';
import { getAdminSummary } from '../services/adminService.js';
import { toDashboardMetrics } from '../models/adminDashboardModel.js';

// Devuelve: { metrics (null hasta que llega), isLoading, error, handleRetry, refreshSummary }.
export const useAdminSummary = () => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // El estado se actualiza solo dentro de los callbacks de la promesa, así se puede
  // llamar desde el useEffect sin renders en cascada.
  const fetchSummary = () =>
    getAdminSummary()
      .then((summary) => {
        setMetrics(toDashboardMetrics(summary));
        setError('');
      })
      .catch((err) => setError(err.message || 'No pudimos cargar el resumen del panel.'))
      .finally(() => setIsLoading(false));

  // Carga inicial al montar (isLoading ya arranca en true). Solo una vez.
  useEffect(() => {
    fetchSummary();
  }, []);

  // Reintento después de un error de carga (botón "Reintentar" de ErrorState).
  const handleRetry = () => {
    setIsLoading(true);
    fetchSummary();
  };

  return {
    metrics,
    isLoading,
    error,
    handleRetry,
    // Vuelve a pedir las cifras sin mostrar "cargando" (ej. después de dar de alta o de
    // baja a un usuario, que cambia los contadores y las recetas visibles).
    refreshSummary: fetchSummary,
  };
};
