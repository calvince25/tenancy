const { Pool } = require('pg');
require('dotenv').config();

let connectionString = process.env.DATABASE_URL;
// Remove sslmode from query string
connectionString = connectionString.split('?')[0];

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
