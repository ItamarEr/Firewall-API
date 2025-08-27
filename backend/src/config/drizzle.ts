import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from './env';

class DatabaseSingleton {
	private static client: any;
	private static db: any;
	private static ready = false;
	private static readyPromiseResolve: (() => void) | null = null;
	public static dbReady: Promise<void> = new Promise((resolve) => {
		DatabaseSingleton.readyPromiseResolve = resolve;
	});

	private constructor() {}

	public static async connectWithRetry() {
		try {
			DatabaseSingleton.client = postgres(config.DATABASE_URI);
			// Test connection
			await DatabaseSingleton.client`SELECT 1`;
			DatabaseSingleton.db = drizzle(DatabaseSingleton.client);
			DatabaseSingleton.ready = true;
			if (DatabaseSingleton.readyPromiseResolve) DatabaseSingleton.readyPromiseResolve();
			console.log('Database connection established.');
		} catch (err) {
			console.error('Database connection failed, retrying...', err);
			setTimeout(DatabaseSingleton.connectWithRetry, Number(process.env.DB_CONNECTION_INTERVAL) || 5000);
		}
	}

	public static getInstance() {
		return DatabaseSingleton.db;
	}
}

DatabaseSingleton.connectWithRetry();

export default DatabaseSingleton;