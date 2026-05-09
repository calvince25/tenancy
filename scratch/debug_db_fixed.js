const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const isSupabase = connectionString.includes("supabase.co") || connectionString.includes("supabase.com") || connectionString.includes("pooler.supabase.com");

const pool = new Pool({ 
  connectionString,
  ssl: isSupabase ? { rejectUnauthorized: false } : false
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const count = await prisma.repairReport.count();
    console.log("Count:", count);
  } catch (e) {
    console.error("DB ERROR:", e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
