// Servicio de la landing: las recetas mejor valoradas del momento. Es un pedido público
// (el visitante todavía no tiene sesión), así que no necesita token.
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { createLandingTopRecipes, LANDING_TOP_QUERY } from '../models/landingModel.js';

// Devuelve: las recetas del ranking, mapeadas con createLandingTopRecipes ([] si no hay).
export const getLandingTopRecipes = async () => {
  const raw = await apiFetch(`/feed/top-recipes?${LANDING_TOP_QUERY}`);
  return createLandingTopRecipes(raw);
};
