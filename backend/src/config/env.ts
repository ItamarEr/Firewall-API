
import 'dotenv/config';
import { z } from 'zod';

// Constants
export const ENV_DEV = 'dev';
export const ENV_PRODUCTION = 'production';
export const DEFAULT_PORT = 3001;
export const PORT_MIN = 1;
export const PORT_MAX = 65535;

// Zod schema for environment variables
const envSchema = z.object({
  ENV: z.enum([ENV_DEV, ENV_PRODUCTION]),
  PORT: z.string().transform(Number).refine(
    (port) => Number.isInteger(port) && port >= PORT_MIN && port <= PORT_MAX,
    { message: `PORT must be an integer between ${PORT_MIN} and ${PORT_MAX}` }
  ),
  DATABASE_URI_DEV: z.string().url(),
  DATABASE_URI_PRODUCTION: z.string().url(),
  DB_CONNECTION_INTERVAL: z.string().transform(Number).refine(
    (interval) => Number.isInteger(interval) && interval > 0,
    { message: 'DB_CONNECTION_INTERVAL must be a positive integer' }
  ),
  MAX_DB_RETRIES: z.string().transform(Number).refine(
    (retries) => Number.isInteger(retries) && retries > 0,
    { message: 'MAX_DB_RETRIES must be a positive integer' }
  ),
});

// Parse and validate environment variables
const parsed = envSchema.safeParse({
  ENV: process.env.ENV,
  PORT: process.env.PORT,
  DATABASE_URI_DEV: process.env.DATABASE_URI_DEV,
  DATABASE_URI_PRODUCTION: process.env.DATABASE_URI_PRODUCTION,
  DB_CONNECTION_INTERVAL: process.env.DB_CONNECTION_INTERVAL,
  MAX_DB_RETRIES: process.env.MAX_DB_RETRIES,
});


if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

const env = parsed.data;

// Select correct database URI based on ENV
const DATABASE_URI = env.ENV === ENV_DEV ? env.DATABASE_URI_DEV : env.DATABASE_URI_PRODUCTION;

// Config object to export
export const config = {
  ENV: env.ENV,
  PORT: env.PORT,
  DATABASE_URI,
  DATABASE_URI_DEV: env.DATABASE_URI_DEV,
  DATABASE_URI_PRODUCTION: env.DATABASE_URI_PRODUCTION,
  DB_CONNECTION_INTERVAL: env.DB_CONNECTION_INTERVAL,
  MAX_DB_RETRIES: env.MAX_DB_RETRIES,
};
