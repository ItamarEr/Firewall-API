import express from 'express';
import firewallRouter from './routes/firewall';

require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api/firewall', firewallRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
