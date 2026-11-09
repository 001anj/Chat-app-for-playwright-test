import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { faker } from "@faker-js/faker";
import { randomIntFromInterval, shuffleArray } from "./../src/api/utils/helpers";

const prisma = new PrismaClient();
const seedPassword = "!password123";

async function main() {
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: await hash(seedPassword, 12),
    },
  });

  await prisma.user.upsert({
    where: { username: "jane" },
    update: {},
    create: {
      username: "jane",
      password: await hash(seedPassword, 12),
    },
  });

  await prisma.user.upsert({
    where: { username: "john" },
    update: {},
    create: {
      username: "john",
      password: await hash(seedPassword, 12),
    },
  });

  await prisma.user.upsert({
    where: { username: "tim" },
    update: {},
    create: {
      username: "tim",
      password: await hash(seedPassword, 12),
    },
  });

  await prisma.user.upsert({
    where: { username: "lea" },
    update: {},
    create: {
      username: "lea",
      password: await hash(seedPassword, 12),
    },
  });

  // cleanup
  await prisma.feedback.deleteMany();

  const feedbackTargets = [
    { author: "admin", receiver: "jane" },
    { author: "tim", receiver: "admin" },
    { author: "jane", receiver: "john" },
    { author: "lea", receiver: "admin" },
    { author: "lea", receiver: "tim" },
    { author: "lea", receiver: "jane" },
    { author: "john", receiver: "admin" },
    { author: "admin", receiver: "jane" },
  ];

  for (const target of shuffleArray(feedbackTargets)) {
    await prisma.feedback.create({
      data: {
        title: faker.lorem.lines(randomIntFromInterval(1, 3)),
        body: faker.lorem.text(),
        author: { connect: { username: target.author } },
        receiver: { connect: { username: target.receiver } },
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
