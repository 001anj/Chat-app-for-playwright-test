import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { faker } from "@faker-js/faker";
import { randomIntFromInterval, shuffleArray } from "./../src/api/utils/helpers";

const prisma = new PrismaClient();
const seedPassword = "!password123";

async function main() {
  // cleanup
  await prisma.feedback.deleteMany();
  await prisma.user.deleteMany({
    where: { username: { notIn: ["admin", "jane"] } },
  });

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

  const feedbackTargets = [
    { author: "admin", receiver: "jane" },
    { author: "jane", receiver: "admin" },
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
