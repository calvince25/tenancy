const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const landlords = await prisma.user.findMany({
    where: { role: 'LANDLORD' },
    select: { email: true, name: true }
  });
  console.log(JSON.stringify(landlords, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
