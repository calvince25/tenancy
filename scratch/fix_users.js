const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");

const connectionString = "postgresql://postgres.ssvrfuqfvdvpfwiseguv:Calvince001ABC%2C%2E@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const deleted = await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
    console.log('Deleted test users:', deleted.count);
    
    const updated = await prisma.user.update({ 
      where: { email: 'omondicalvince4714@gmail.com' }, 
      data: { isApproved: true, isDefault: true } 
    });
    console.log('Updated user:', updated.email);
    console.log('User is now Approved and Default Admin.');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
