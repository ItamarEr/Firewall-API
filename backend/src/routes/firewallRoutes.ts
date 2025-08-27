
import express from 'express';
import { addRules, removeRules, getAllRules, updateRuleStatus } from '../services/firewallService';
import LoggerSingleton from '../config/Logger';
const logger = LoggerSingleton.getInstance();

const router = express.Router();


router.post('/ip', async (req, res) => {
  logger.info('POST /ip');
  const { values, mode } = req.body;
  try {
    const rules = await addRules(values, 'ip', mode);
    logger.info('IP rules added');
    res.json({ type: 'ip', mode, values, status: 'success' });
  } catch (err) {
    logger.error('Failed to add IP rules');
    res.status(400).json({ error: 'Invalid IP rule(s)' });
  }
});


router.delete('/ip', async (req, res) => {
  logger.info('DELETE /ip');
  const { values, mode } = req.body;
  try {
    const removed = await removeRules(values, 'ip', mode);
    if (!removed || removed.length === 0) {
      logger.error('Failed to remove IP rules: no rules removed');
      return res.status(400).json({ error: 'Remove failed' });
    }
    logger.info('IP rules removed');
    res.json({ type: 'ip', mode, values, status: 'success' });
  } catch (err) {
    logger.error('Failed to remove IP rules');
    res.status(400).json({ error: 'Remove failed' });
  }
});


router.post('/url', async (req, res) => {
  logger.info('POST /url');
  const { values, mode } = req.body;
  try {
    const rules = await addRules(values, 'url', mode);
    logger.info('URL rules added');
    res.json({ type: 'url', mode, values, status: 'success' });
  } catch (err) {
    logger.error('Failed to add URL rules');
    res.status(400).json({ error: 'Invalid URL rule(s)' });
  }
});


router.delete('/url', async (req, res) => {
  logger.info('DELETE /url');
  const { values, mode } = req.body;
  try {
    const removed = await removeRules(values, 'url', mode);
    if (!removed || removed.length === 0) {
      logger.error('Failed to remove URL rules: no rules removed');
      return res.status(400).json({ error: 'Remove failed' });
    }
    logger.info('URL rules removed');
    res.json({ type: 'url', mode, values, status: 'success' });
  } catch (err) {
    logger.error('Failed to remove URL rules');
    res.status(400).json({ error: 'Remove failed' });
  }
});


router.post('/port', async (req, res) => {
  logger.info('POST /port');
  const { values, mode } = req.body;
  try {
    const rules = await addRules(values, 'port', mode);
    logger.info('Port rules added');
    res.json({ type: 'port', mode, values, status: 'success' });
  } catch (err) {
    logger.error('Failed to add port rules');
    res.status(400).json({ error: 'Invalid port rule(s)' });
  }
});


router.delete('/port', async (req, res) => {
  logger.info('DELETE /port');
  const { values, mode } = req.body;
  try {
    const removed = await removeRules(values, 'port', mode);
    if (!removed || removed.length === 0) {
      logger.error('Failed to remove port rules: no rules removed');
      return res.status(400).json({ error: 'Remove failed' });
    }
    logger.info('Port rules removed');
    res.json({ type: 'port', mode, values, status: 'success' });
  } catch (err) {
    logger.error('Failed to remove port rules');
    res.status(400).json({ error: 'Remove failed' });
  }
});


router.get('/rules', async (req, res) => {
  logger.info('GET /rules');
  try {
    const rules = await getAllRules();
    logger.info('Rules fetched');
    res.json(rules);
  } catch (err) {
    logger.error('Failed to fetch rules');
    res.status(500).json({ error: 'Fetch failed' });
  }
});


router.put('/rules', async (req, res) => {
  logger.info('PUT /rules');
  const {urls, ports, ips } = req.body;
  let updated: any[] = [];
  try {
    if (ips && ips.ids) {
      updated = updated.concat(await updateRuleStatus('ip', ips.mode, ips.ids, ips.active));
    }
    if (urls && urls.ids) {
      updated = updated.concat(await updateRuleStatus('url', urls.mode, urls.ids, urls.active));
    }
    if (ports && ports.ids) {
      updated = updated.concat(await updateRuleStatus('port', ports.mode, ports.ids, ports.active));
    }
    if (updated.length === 0) {
      logger.error('Failed to update rules: no rules updated');
      return res.status(400).json({ error: 'Update failed' });
    }
    logger.info('Rules updated');
    res.json({ updated });
  } catch (err) {
    logger.error('Failed to update rules');
    res.status(400).json({ error: 'Update failed' });
  }
});

export default router;
