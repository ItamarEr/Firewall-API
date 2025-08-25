import express from 'express';
import { addRules, removeRules, getAllRules, updateRuleStatus } from '../services/firewallService';

const router = express.Router();

router.post('/ip', async (req, res) => {
  const { values, mode } = req.body;
  const rules = await addRules(values, 'ip', mode);
  res.json({ type: 'ip', mode, values, status: 'success' });
});

router.delete('/ip', async (req, res) => {
  const { values, mode } = req.body;
  await removeRules(values, 'ip', mode);
  res.json({ type: 'ip', mode, values, status: 'success' });
});

router.post('/url', async (req, res) => {
  const { values, mode } = req.body;
  const rules = await addRules(values, 'url', mode);
  res.json({ type: 'url', mode, values, status: 'success' });
});

router.delete('/url', async (req, res) => {
  const { values, mode } = req.body;
  await removeRules(values, 'url', mode);
  res.json({ type: 'url', mode, values, status: 'success' });
});

router.post('/port', async (req, res) => {
  const { values, mode } = req.body;
  const rules = await addRules(values, 'port', mode);
  res.json({ type: 'port', mode, values, status: 'success' });
});

router.delete('/port', async (req, res) => {
  const { values, mode } = req.body;
  await removeRules(values, 'port', mode);
  res.json({ type: 'port', mode, values, status: 'success' });
});

router.get('/rules', async (req, res) => {
  const rules = await getAllRules();
  res.json(rules);
});

router.put('/rules', async (req, res) => {
  const {urls, ports, ips } = req.body;
  let updated: any[] = [];
  if (ips && ips.ids) {
    updated = updated.concat(await updateRuleStatus('ip', ips.mode, ips.ids, ips.active));
  }
  if (urls && urls.ids) {
    updated = updated.concat(await updateRuleStatus('url', urls.mode, urls.ids, urls.active));
  }
  if (ports && ports.ids) {
    updated = updated.concat(await updateRuleStatus('port', ports.mode, ports.ids, ports.active));
  }
  res.json({ updated });
});

export default router;
