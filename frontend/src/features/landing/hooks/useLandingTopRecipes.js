// Hook que carga "Las 5 recetas del momento" de la landing, con sus estados de carga y
// error (y el reintento del botón de ErrorState).
import { useState, useEffect } from 'react';
import { getLandingTopRecipes } from '../services/landingService.js';

// Devuelve: { recipes, isLoading, error, handleRetry }.
export const useLandingTopRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // El estado se actualiza solo dentro de los callbacks de la promesa, así se puede llamar
  // desde el useEffect sin renders en cascada.
  const loadRecipes = () =>
    getLandingTopRecipes()
      .then((data) => {
        setRecipes(data);
        setError('');
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    loadRecipes();
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    loadRecipes();
  };

  return { recipes, isLoading, error, handleRetry };
};
