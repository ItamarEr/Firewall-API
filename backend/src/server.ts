
import express from 'express';
import firewallRouter from './routes/firewall';
import { config } from './config/env';

const app = express();
app.use(express.json());
app.use('/api/firewall', firewallRouter);

app.listen(config.PORT, () => {
	console.log(`Server running on port ${config.PORT} [${config.ENV}]`);
});
