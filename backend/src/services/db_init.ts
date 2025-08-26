import postgres from 'postgres';
import { config } from '../config/env';

const client = postgres(config.DATABASE_URI);

async function initDB() {
  try {
    await client`
      CREATE TABLE IF NOT EXISTS firewall_rules (
        id SERIAL PRIMARY KEY,
        value VARCHAR(255) NOT NULL,
        type VARCHAR(10) NOT NULL,
        mode VARCHAR(10) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Database initialized!');
  } catch (err) {
    console.error('Error initializing database:', (err as Error).message);
  } finally {
    await client.end();
  }
}

initDB();