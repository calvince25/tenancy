const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const property = await prisma.property.findFirst({
    select: { id: true, address: true }
  });
  console.log(JSON.stringify(property, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
