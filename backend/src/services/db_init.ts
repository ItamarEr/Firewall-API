import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT) || 5432,
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS firewall_rules (
        id SERIAL PRIMARY KEY,
        value VARCHAR(255) NOT NULL,
        type VARCHAR(10) NOT NULL,
        mode VARCHAR(10) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized!');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
    pool.end();
  }
}

initDB();