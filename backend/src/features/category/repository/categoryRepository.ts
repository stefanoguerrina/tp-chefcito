// Acceso a datos de la feature category: única capa que habla con Prisma para el CRUD de categorías.
// No contiene lógica de negocio — eso es responsabilidad de categoryService.
import prisma from '../../../core/prismaClient.js';
import type { CreateCategoryData, UpdateCategoryData } from '../models/categoryModel.js';

export const categoryRepository = {

  // Devuelve todas las categorías. La tabla `category` no tiene baja lógica, así que no se filtra por deletedAt.
  // Cada una trae cuántas recetas visibles tiene (_count.recipecategory, sin contar las de
  // usuarios dados de baja): el panel admin lo muestra sin tener que pedir todas las recetas.
  findAll: () =>
    prisma.category.findMany({
      include: {
        _count: { select: { recipecategory: { where: { recipe: { user: { deletedAt: null } } } } } },
      },
    }),

  // Busca una categoría por su ID (clave primaria).
  findById: (id: number) =>
    prisma.category.findUnique({ where: { id } }),

  // Busca una categoría por su nombre exacto. `name` no es unique en el schema,
  // por eso usamos findFirst en lugar de findUnique.
  findByName: (name: string) =>
    prisma.category.findFirst({ where: { name } }),

  // Crea una nueva categoría con los datos ya validados.
  create: (data: CreateCategoryData) =>
    prisma.category.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    }),

  // Actualiza los campos editables (name, description) de una categoría existente.
  update: (id: number, data: UpdateCategoryData) =>
    prisma.category.update({ where: { id }, data }),

  // Elimina definitivamente una categoría (no hay baja lógica para category).
  // Las filas relacionadas en recipecategory se borran en cascada (onDelete: Cascade en el schema).
  delete: (id: number) =>
    prisma.category.delete({ where: { id } }),

};
