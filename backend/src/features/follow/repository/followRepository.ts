// Acceso a datos de la feature follow: única capa que habla con Prisma para "Seguir".
// No contiene lógica de negocio — eso es responsabilidad de followService.
// La PK de follow es compuesta: (idFollower, idFollowed).
import prisma from '../../../core/prismaClient.js';

export const followRepository = {

  // Devuelve la fila "idFollower sigue a idFollowed", o null si no lo sigue.
  findOne: (idFollower: number, idFollowed: number) =>
    prisma.follow.findUnique({
      where: { idFollower_idFollowed: { idFollower, idFollowed } },
    }),

  create: (idFollower: number, idFollowed: number) =>
    prisma.follow.create({ data: { idFollower, idFollowed } }),

  delete: (idFollower: number, idFollowed: number) =>
    prisma.follow.delete({
      where: { idFollower_idFollowed: { idFollower, idFollowed } },
    }),

  // Cuántos usuarios activos siguen a idUser.
  countFollowers: (idUser: number) =>
    prisma.follow.count({ where: { idFollowed: idUser, follower: { deletedAt: null } } }),

  // A cuántos usuarios activos sigue idUser (sus "amigos" en la home).
  countFollowing: (idUser: number) =>
    prisma.follow.count({ where: { idFollower: idUser, followed: { deletedAt: null } } }),

};
