import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export async function deleteFeedback(ids: number[]): Promise<void> {
  if (ids.length === 0) return;

  await prisma.feedback.deleteMany({ where: { id: { in: ids } } });
}
