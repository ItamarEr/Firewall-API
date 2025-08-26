

import express from 'express';
import firewallRouter from './routes/firewall';
import { config } from './config/env';
import logger from './config/Logger';

const app = express();
app.use(express.json());
app.use('/api/firewall', firewallRouter);

app.listen(config.PORT, () => {
	logger.info(`Server running on port ${config.PORT} [${config.ENV}]`);
});
