// Datos de ejemplo para la landing. No vienen de la API todavía: se usan solo para mostrar
// el diseño hasta que la landing consuma recetas reales (ver GET /api/feed/top-recipes,
// que hoy pide token). Cuando eso pase, esta lista se reemplaza por un servicio.
import tartaFrutosRojosImg from '../../../assets/landing-recipe-tarta-frutos-rojos.webp';
import salmonVegetalesImg from '../../../assets/landing-recipe-salmon-vegetales.webp';
import pastaPestoImg from '../../../assets/landing-recipe-pasta-pesto.webp';
import wokFideosImg from '../../../assets/landing-recipe-wok-fideos.webp';
import asadoCriolloImg from '../../../assets/landing-recipe-asado-criollo.webp';

// Crea un objeto receta de muestra con valores por defecto sobreescribibles.
// Recibe: un objeto parcial con los campos a fijar. Devuelve: la receta completa.
const createMockRecipe = (overrides) => ({
  id: null,
  title: '',
  description: null,
  author: '',
  authorAvatar: null,
  image: '',
  rating: 0,
  reviewsCount: 0,
  timeMinutes: 0,
  difficulty: 'Fácil',
  categories: [],
  ...overrides,
});

// Las 5 recetas "del momento", ordenadas de mejor a peor valorada: la primera se muestra
// destacada y las otras cuatro como ranking (ver TopRecipesSection).
export const momentRecipes = [
  createMockRecipe({
    id: 'tarta-frutos-rojos',
    title: 'Tarta de Frutos Rojos',
    description: 'Masa quebrada casera, crema pastelera y frutos rojos de estación recién lavados.',
    author: '@dulce_pasion',
    authorAvatar: 'https://picsum.photos/seed/chefcito-user-dulce/64/64',
    image: tartaFrutosRojosImg,
    rating: 4.9,
    reviewsCount: 124,
    timeMinutes: 45,
    difficulty: 'Postres',
    categories: ['Postres', 'Repostería'],
  }),
  createMockRecipe({
    id: 'salmon-vegetales',
    title: 'Salmón con Vegetales Asados',
    description: 'Un plato liviano y colorido, listo en menos de una hora.',
    author: 'María S.',
    authorAvatar: 'https://picsum.photos/seed/chefcito-user-maria/64/64',
    image: salmonVegetalesImg,
    rating: 4.8,
    reviewsCount: 89,
    timeMinutes: 35,
    difficulty: 'Medio',
    categories: ['Saludable'],
  }),
  createMockRecipe({
    id: 'pasta-pesto',
    title: 'Pasta al Pesto',
    description: 'Albahaca fresca, nueces y queso rallado en un pesto que se hace en minutos.',
    author: '@chef_mario',
    authorAvatar: 'https://picsum.photos/seed/chefcito-user-mario/64/64',
    image: pastaPestoImg,
    rating: 4.7,
    reviewsCount: 203,
    timeMinutes: 25,
    difficulty: 'Fácil',
    categories: ['Rápido', 'Italiana'],
  }),
  createMockRecipe({
    id: 'wok-fideos',
    title: 'Wok de Fideos y Vegetales',
    description: 'Una receta rápida y bien condimentada para esas noches sin tiempo.',
    author: 'Ana B.',
    authorAvatar: 'https://picsum.photos/seed/chefcito-user-ana/64/64',
    image: wokFideosImg,
    rating: 4.6,
    reviewsCount: 156,
    timeMinutes: 15,
    difficulty: 'Fácil',
    categories: ['Rápido', 'Asiática'],
  }),
  createMockRecipe({
    id: 'asado-criollo',
    title: 'Asado Criollo',
    description: 'El clásico de los domingos, con los tiempos de cada corte bien explicados.',
    author: '@parrillero_arg',
    authorAvatar: 'https://picsum.photos/seed/chefcito-user-parrillero/64/64',
    image: asadoCriolloImg,
    rating: 4.5,
    reviewsCount: 312,
    timeMinutes: 180,
    difficulty: 'Medio',
    categories: ['Carnes', 'Argentina'],
  }),
];

