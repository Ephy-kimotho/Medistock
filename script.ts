import { prisma } from "./lib/prisma";

async function test() {
  await prisma.$connect();
  console.log("Connected successfully");
}

test();
