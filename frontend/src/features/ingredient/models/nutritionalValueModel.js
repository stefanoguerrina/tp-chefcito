// Modelo de NutritionalValue (valores nutricionales de un ingrediente, entidad débil: no
// existe sin su ingrediente y se guarda junto con él en POST/PATCH /api/ingredients).
// Factory functions simples, como el resto del frontend.

// Convierte un valor nutricional crudo del backend al objeto que usa el frontend. Los
// Decimal llegan como texto: se pasan a número (o null si no están cargados).
// Recibe: { idIngredient, num, name, value, servingAmount, servingUnit }.
// Devuelve: { num, name, value, servingAmount, servingUnit }.
export const nutritionalValueFromApi = (item) => ({
  num: item.num,
  name: item.name,
  value: item.value != null ? Number(item.value) : null,
  servingAmount: item.servingAmount != null ? Number(item.servingAmount) : null,
  servingUnit: item.servingUnit ?? null,
});

// Arma un valor nutricional para el body de POST/PATCH /api/ingredients.
// Recibe: { name, value, servingAmount, servingUnit } (value y servingAmount como texto o
// número). Devuelve: el mismo objeto con los números convertidos.
export const nutritionalValueToPayload = ({ name, value, servingAmount, servingUnit }) => ({
  name,
  value: Number(value),
  servingAmount: Number(servingAmount),
  servingUnit,
});
