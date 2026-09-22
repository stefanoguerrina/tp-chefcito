// Instancia única (singleton) de PrismaClient para toda la aplicación.
// Se importa desde acá para evitar múltiples conexiones innecesarias a la BD.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;