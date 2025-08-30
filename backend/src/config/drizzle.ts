import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { Sql } from 'postgres';
import { config } from './env';
import LoggerSingleton from './Logger';
const logger = LoggerSingleton.getInstance();

class DatabaseSingleton {
	private static client: Sql<{}>;
	private static db: PostgresJsDatabase<Record<string, unknown>> | undefined;
	private static ready = false;
	private static readyPromiseResolve: (() => void) | null = null;
	public static dbReady: Promise<void> = new Promise((resolve) => {
		DatabaseSingleton.readyPromiseResolve = resolve;
	});

	private constructor() {}

	public static async connectWithRetry(retryCount = 0) {
		const maxRetries = config.MAX_DB_RETRIES;
		try {
			DatabaseSingleton.client = postgres(config.DATABASE_URI);
			// Test connection
			await DatabaseSingleton.client`SELECT 1`;
			DatabaseSingleton.db = drizzle(DatabaseSingleton.client);
			DatabaseSingleton.ready = true;
			if (DatabaseSingleton.readyPromiseResolve) DatabaseSingleton.readyPromiseResolve();
			logger.info('Database connection established.');
		} catch (err) {
			if (retryCount < maxRetries) {
				logger.error(`Database connection failed, retrying (${retryCount + 1}/${maxRetries})...`, err);
				setTimeout(() => DatabaseSingleton.connectWithRetry(retryCount + 1), config.DB_CONNECTION_INTERVAL);
			} else {
				logger.error('Database connection failed. Retry limit reached.', err);
				process.exit(1);
			}
		}
	}

	public static getInstance(): PostgresJsDatabase<Record<string, unknown>> | undefined {
		return DatabaseSingleton.db;
	}
}

DatabaseSingleton.connectWithRetry();

export default DatabaseSingleton;