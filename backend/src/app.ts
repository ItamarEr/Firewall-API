import express from 'express';
import firewallRouter from './routes/firewallRoutes';
import { config } from './config/env';

import LoggerSingleton from './config/Logger';
const logger = LoggerSingleton.getInstance();

import DatabaseSingleton from './config/drizzle';
const db = DatabaseSingleton.getInstance();


const app = express();
app.use(express.json());
app.use('/api/firewall', firewallRouter);

// Only start the server after DB is ready
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
	DatabaseSingleton.dbReady.then(() => {
		app.listen(config.PORT, () => {
			logger.info(`Server running on port ${config.PORT} [${config.ENV}]`);
		});
	});
}

export default app;