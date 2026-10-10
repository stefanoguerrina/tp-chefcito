// Acceso a datos de la feature database: única capa que habla con Prisma.
import prisma from '../../../core/prismaClient.js';

export const databaseRepository = {

  // Consulta mínima para comprobar que la base responde. Lanza un error si no hay conexión.
  ping: () => prisma.$queryRaw`SELECT 1`,

};
