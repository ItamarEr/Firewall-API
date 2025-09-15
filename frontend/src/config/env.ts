import { z } from 'zod';

// Define allowed ENV values
export const ENV_DEV = 'dev';
export const ENV_PRODUCTION = 'production';
export const DEFAULT_PORT = 3000;
export const PORT_MIN = 1;
export const PORT_MAX = 65535;

// Zod schema for environment variables
const envSchema = z.object({
  ENV: z.enum([ENV_DEV, ENV_PRODUCTION]),
  PORT: z.string().transform(Number).refine(
    (port) => Number.isInteger(port) && port >= PORT_MIN && port <= PORT_MAX,
    { message: `PORT must be an integer between ${PORT_MIN} and ${PORT_MAX}` }
  ),
  SERVER_URL: z.string().url(),
});

// Parse and validate environment variables
const parsed = envSchema.safeParse({
  ENV: process.env.NEXT_PUBLIC_ENV,
  PORT: process.env.NEXT_PUBLIC_PORT,
  SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
});

if (!parsed.success) {
  // In Next.js, throw error to halt rendering
  throw new Error('Invalid environment variables: ' + JSON.stringify(parsed.error.format()));
}

const env = parsed.data;

export const config = {
  ENV: env.ENV,
  PORT: env.PORT,
  SERVER_URL: env.SERVER_URL,
};
