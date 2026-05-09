import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }
  
  const isSupabase = connectionString.includes("supabase.co") || connectionString.includes("supabase.com") || connectionString.includes("pooler.supabase.com");
  
  // Clean connection string for pg pool to prevent SSL conflicts
  const cleanedConnectionString = connectionString.split('?')[0];

  const pool = new Pool({ 
    connectionString: cleanedConnectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : false
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
