const prisma = require('../src/lib/prisma').default;

async function test() {
  try {
    const reports = await prisma.repairReport.findMany({
      take: 1
    });
    console.log("Success:", reports.length);
  } catch (err) {
    console.error("CRITICAL ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
