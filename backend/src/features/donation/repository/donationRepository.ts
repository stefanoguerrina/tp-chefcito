// Acceso a datos de la feature donation: única capa que habla con Prisma para donaciones.
// No contiene lógica de negocio — eso es responsabilidad de donationService.
// La PK de donation es compuesta: (idDonor, idGrantee, transactionRef).
import prisma from '../../../core/prismaClient.js';

// Datos del que recibe la donación que necesita la pantalla de resultado.
const granteeSelect = {
  user_donation_idGranteeTouser: { select: { id: true, username: true, name: true, lastName: true } },
};

// Datos de la otra persona que muestra el historial (con su foto).
const historyUserSelect = { select: { id: true, username: true, name: true, lastName: true, avatarUrl: true } };

export const donationRepository = {

  create: (data: {
    idDonor: number;
    idGrantee: number;
    transactionRef: string;
    amount: number;
    currency: string;
    status: string;
  }) => prisma.donation.create({ data }),

  // Busca la donación por su referencia (la misma que viaja a Mercado Pago como
  // external_reference). Es única porque se genera con randomUUID.
  findByRef: (transactionRef: string) =>
    prisma.donation.findFirst({ where: { transactionRef }, include: granteeSelect }),

  // Donaciones que hizo idDonor (en cualquier estado), de la más nueva a la más vieja, con
  // los datos de quien las recibió.
  findSentBy: (idDonor: number) =>
    prisma.donation.findMany({
      where: { idDonor },
      orderBy: { createdAt: 'desc' },
      include: { user_donation_idGranteeTouser: historyUserSelect },
    }),

  // Donaciones completadas que recibió idGrantee, de la más nueva a la más vieja, con los
  // datos de quien donó.
  findCompletedReceivedBy: (idGrantee: number) =>
    prisma.donation.findMany({
      where: { idGrantee, status: 'completed' },
      orderBy: { createdAt: 'desc' },
      include: { user_donation_idDonorTouser: historyUserSelect },
    }),

  // Donaciones que siguen pendientes y se crearon antes de createdBefore (candidatas a vencer).
  findPendingCreatedBefore: (createdBefore: Date) =>
    prisma.donation.findMany({ where: { status: 'pending', createdAt: { lt: createdBefore } } }),

  updateStatus: (idDonor: number, idGrantee: number, transactionRef: string, status: string) =>
    prisma.donation.update({
      where: { idDonor_idGrantee_transactionRef: { idDonor, idGrantee, transactionRef } },
      data: { status },
      include: granteeSelect,
    }),

};
