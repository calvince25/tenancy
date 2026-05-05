import prisma from "./src/lib/prisma.ts";

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
  } catch (error) {
    console.error("Prisma error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
