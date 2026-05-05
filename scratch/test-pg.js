const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL;

console.log("Testing connection to:", connectionString.split('@')[1]);

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("Connection error:", err);
  } else {
    console.log("Connection success:", res.rows[0]);
  }
  pool.end();
});
