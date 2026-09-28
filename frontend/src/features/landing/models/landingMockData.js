// Datos de ejemplo para la landing (features/auth). No vienen de la API todavía:
// se usan solo para mostrar el diseño hasta que exista la feature de recetas real.
// Cuando esa feature exista, esta landing debería pasar a consumir su servicio
// en vez de este archivo.

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

export const weeklyRecipe = createMockRecipe({
  id: 'tarta-frutos-rojos',
  title: 'Tarta de Frutos Rojos',
  author: '@dulce_pasion',
  image: 'https://picsum.photos/seed/chefcito-tarta/640/480',
  rating: 4.8,
  reviewsCount: 124,
  timeMinutes: 45,
  difficulty: 'Postres',
  servings: 8,
  ingredientsCount: 12,
});

export const moreFeaturedRecipes = [
  createMockRecipe({
    id: 'pasta-pesto',
    title: 'Pasta al Pesto',
    author: '@chef_mario',
    image: 'https://picsum.photos/seed/chefcito-pasta/120/120',
  }),
  createMockRecipe({
    id: 'bowl-vegano',
    title: 'Bowl Vegano',
    author: '@plant_based',
    image: 'https://picsum.photos/seed/chefcito-bowl/120/120',
  }),
  createMockRecipe({
    id: 'asado-criollo',
    title: 'Asado Criollo',
    author: '@parrillero_arg',
    image: 'https://picsum.photos/seed/chefcito-asado/120/120',
  }),
  createMockRecipe({
    id: 'salmon-asado',
    title: 'Salmón Asado',
    author: '@maria_s',
    image: 'https://picsum.photos/seed/chefcito-salmon/120/120',
  }),
];

export const exploreRecipes = [
  createMockRecipe({
    id: 'salmon-vegetales',
    title: 'Salmón con Vegetales Asados',
    description: 'Un plato liviano y colorido, listo en menos de una hora y pensado para toda la semana.',
    author: 'María S.',
    authorAvatar: 'https://picsum.photos/seed/chefcito-user-maria/64/64',
    image: 'https://picsum.photos/seed/chefcito-salmon-veg/480/360',
    rating: 4.6,
    reviewsCount: 89,
    timeMinutes: 35,
    difficulty: 'Medio',
    categories: ['Saludable'],
  }),
  createMockRecipe({
    id: 'tarta-rustica',
    title: 'Tarta Rústica de Frutas',
    description: 'Masa quebrada casera rellena de frutos rojos de estación, ideal para la merienda.',
    author: 'Carlos D.',
    authorAvatar: 'https://picsum.photos/seed/chefcito-user-carlos/64/64',
    image: 'https://picsum.photos/seed/chefcito-tarta-rustica/480/360',
    rating: 4.9,
    reviewsCount: 210,
    timeMinutes: 60,
    difficulty: 'Difícil',
    categories: ['Postres', 'Repostería'],
  }),
  createMockRecipe({
    id: 'wok-fideos',
    title: 'Wok de Fideos y Vegetales',
    description: 'Una receta rápida y bien condimentada, perfecta para esas noches sin tiempo.',
    author: 'Ana B.',
    authorAvatar: 'https://picsum.photos/seed/chefcito-user-ana/64/64',
    image: 'https://picsum.photos/seed/chefcito-wok/480/360',
    rating: 4.5,
    reviewsCount: 156,
    timeMinutes: 15,
    difficulty: 'Fácil',
    categories: ['Rápido', 'Asiática'],
  }),
];

export const categories = [
  { id: 'desayunos', label: 'Desayunos', image: 'https://picsum.photos/seed/chefcito-cat-desayuno/400/300' },
  { id: 'panaderia', label: 'Panadería', image: 'https://picsum.photos/seed/chefcito-cat-pan/400/300' },
  { id: 'asiatica', label: 'Asiática', image: 'https://picsum.photos/seed/chefcito-cat-asiatica/400/300' },
  { id: 'carnes', label: 'Carnes', image: 'https://picsum.photos/seed/chefcito-cat-carnes/400/300' },
  { id: 'vegano', label: 'Vegano', image: 'https://picsum.photos/seed/chefcito-cat-vegano/400/300' },
];

export const activeUsers = [
  { id: 1, username: 'sofia.cocina', avatar: 'https://picsum.photos/seed/chefcito-user-sofia/80/80' },
  { id: 2, username: 'juan_chef', avatar: null },
  { id: 3, username: 'marialaura99', avatar: null },
];

export const latestComments = [
  {
    id: 1,
    recipeTitle: 'Pollo al Coco Estilo Thai',
    recipeAuthor: '@cocinero_viajero',
    recipeImage: 'https://picsum.photos/seed/chefcito-pollo-coco/200/200',
    rating: 4.6,
    text: 'Hice esto recién, delicioso y además agregué el contenido completo de una lata de leche de coco... ¡Quedó increíble!',
    commenter: 'Marina Ruiz',
  },
  {
    id: 2,
    recipeTitle: 'Mermelada de Frutilla Fácil',
    recipeAuthor: '@dulces_recetas',
    recipeImage: 'https://picsum.photos/seed/chefcito-mermelada/200/200',
    rating: 5.0,
    text: '¡Excelente mermelada, la hice muchas veces! Gracias por compartir la receta.',
    commenter: 'Lorena Gomez',
  },
];
