const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function test() {
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const res = await pool.query('SELECT NOW()');
    console.log("Success:", res.rows[0]);
  } catch (err) {
    console.error("PG ERROR:", err);
  } finally {
    await pool.end();
  }
}

test();
