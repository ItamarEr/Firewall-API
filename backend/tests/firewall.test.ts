import type { Server } from 'http';
let server: Server;
import request from 'supertest';
import app from '../src/app';
import { firewall_rules } from '../src/config/schema';
import DatabaseSingleton from '../src/config/drizzle';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
let db: PostgresJsDatabase<Record<string, unknown>> | undefined;

beforeAll(async () => {
  // Clean and populate DB with mock data
  await DatabaseSingleton.dbReady;
  db = DatabaseSingleton.getInstance();
  await db!.delete(firewall_rules);
  const mockData = require('../scripts/mock_data_population');
  if (typeof mockData.populateMockData === 'function') {
    await mockData.populateMockData();
  }
  // Start server only after DB is ready and mock data is populated
  server = app.listen(3001);
});

describe('Firewall API Endpoints', () => {
  describe('POST /api/firewall/ip', () => {
    it('should add a valid IP rule', async () => {
      const res = await request(app)
        .post('/api/firewall/ip')
        .send({ values: ['8.8.8.8'], mode: 'blacklist' });
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
    });
    it('should reject invalid IP', async () => {
      const res = await request(app)
        .post('/api/firewall/ip')
        .send({ values: ['999.999.999.999'], mode: 'blacklist' });
      expect(res.statusCode).toBe(400);
      for (const ip of ['1.2.3', '01.2.3.4']) {
        const resEdge = await request(app)
          .post('/api/firewall/ip')
          .send({ values: [ip], mode: 'blacklist' });
        expect(resEdge.statusCode).toBe(400);
      }
    });
    it('should reject duplicate IP rule', async () => {
      await request(app)
        .post('/api/firewall/ip')
        .send({ values: ['8.8.8.8'], mode: 'blacklist' });
      const res = await request(app)
        .post('/api/firewall/ip')
        .send({ values: ['8.8.8.8'], mode: 'blacklist' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/firewall/port', () => {
    it('should add a valid port rule', async () => {
      const res = await request(app)
        .post('/api/firewall/port')
        .send({ values: [8080], mode: 'whitelist' });
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
    });
    it('should reject port below range', async () => {
      const res = await request(app)
        .post('/api/firewall/port')
        .send({ values: [0], mode: 'blacklist' });
      expect(res.statusCode).toBe(400);
    });
    it('should reject port above range', async () => {
      const res = await request(app)
        .post('/api/firewall/port')
        .send({ values: [70000], mode: 'blacklist' });
      expect(res.statusCode).toBe(400);
    });
    it('should reject duplicate port rule', async () => {
      await request(app)
        .post('/api/firewall/port')
        .send({ values: [8080], mode: 'whitelist' });
      const res = await request(app)
        .post('/api/firewall/port')
        .send({ values: [8080], mode: 'whitelist' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/firewall/url', () => {
    it('should add a valid URL rule', async () => {
      const res = await request(app)
        .post('/api/firewall/url')
        .send({ values: ['google.com'], mode: 'blacklist' });
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
    });
    it('should reject invalid URL', async () => {
      const res = await request(app)
        .post('/api/firewall/url')
        .send({ values: ['not_a_url'], mode: 'blacklist' });
      expect(res.statusCode).toBe(400);
    });
    it('should reject duplicate URL rule', async () => {
      await request(app)
        .post('/api/firewall/url')
        .send({ values: ['google.com'], mode: 'blacklist' });
      const res = await request(app)
        .post('/api/firewall/url')
        .send({ values: ['google.com'], mode: 'blacklist' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('System happy flow', () => {
    it('should add, fetch, update, and remove a rule', async () => {
      let res = await request(app)
        .post('/api/firewall/ip')
        .send({ values: ['10.10.10.10'], mode: 'whitelist' });
      expect(res.statusCode).toBe(200);
      res = await request(app)
        .get('/api/firewall/rules');
      expect(res.statusCode).toBe(200);
  const ruleId = res.body.ips.whitelist.find((r: { id: number, value: string | number }) => r.value === '10.10.10.10')?.id;
      expect(ruleId).toBeDefined();
      res = await request(app)
        .put('/api/firewall/rules')
        .send({ ips: { ids: [ruleId], mode: 'whitelist', active: false } });
      expect(res.statusCode).toBe(200);
      res = await request(app)
        .delete('/api/firewall/ip')
        .send({ values: ['10.10.10.10'], mode: 'whitelist' });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /api/firewall/port', () => {
    it('should remove a port rule', async () => {
      await request(app)
        .post('/api/firewall/port')
        .send({ values: [12345], mode: 'blacklist' });
      const res = await request(app)
        .delete('/api/firewall/port')
        .send({ values: [12345], mode: 'blacklist' });
      expect(res.statusCode).toBe(200);
    });
    it('should handle remove failure', async () => {
      const res = await request(app)
        .delete('/api/firewall/port')
        .send({ values: ['not_a_port'], mode: 'blacklist' });
      expect(res.statusCode).toBe(400);
    });
    it('should hit catch block (error branch)', async () => {
      const spy = jest.spyOn(require('../src/services/firewallService'), 'removeRules').mockImplementation(() => { throw new Error('Test error'); });
      const res = await request(app)
        .delete('/api/firewall/port')
        .send({ values: [12345], mode: 'blacklist' });
      expect(res.statusCode).toBe(400);
      spy.mockRestore();
    });
  });

  describe('DELETE /api/firewall/url', () => {
    it('should remove a url rule', async () => {
      await request(app)
        .post('/api/firewall/url')
        .send({ values: ['test.com'], mode: 'blacklist' });
      const res = await request(app)
        .delete('/api/firewall/url')
        .send({ values: ['test.com'], mode: 'blacklist' });
      expect(res.statusCode).toBe(200);
    });
    it('should handle remove failure', async () => {
      const res = await request(app)
        .delete('/api/firewall/url')
        .send({ values: ['not_a_url'], mode: 'blacklist' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/firewall/rules', () => {
    it('should update port rule status', async () => {
      await request(app)
        .post('/api/firewall/port')
        .send({ values: [5555], mode: 'whitelist' });
      const getRes = await request(app)
        .get('/api/firewall/rules');
  const ruleId = getRes.body.ports.whitelist.find((r: { id: number, value: string | number }) => r.value === '5555')?.id;
      expect(ruleId).toBeDefined();
      const res = await request(app)
        .put('/api/firewall/rules')
        .send({ ports: { ids: [ruleId], mode: 'whitelist', active: false } });
      expect(res.statusCode).toBe(200);
    });
    it('should update url rule status', async () => {
      await request(app)
        .post('/api/firewall/url')
        .send({ values: ['update.com'], mode: 'whitelist' });
      const getRes = await request(app)
        .get('/api/firewall/rules');
  const ruleId = getRes.body.urls.whitelist.find((r: { id: number, value: string | number }) => r.value === 'update.com')?.id;
      expect(ruleId).toBeDefined();
      const res = await request(app)
        .put('/api/firewall/rules')
        .send({ urls: { ids: [ruleId], mode: 'whitelist', active: false } });
      expect(res.statusCode).toBe(200);
    });
    it('should handle update failure', async () => {
      const res = await request(app)
        .put('/api/firewall/rules')
        .send({ ports: { ids: [999999], mode: 'whitelist', active: false } }); // non-existent id
      expect(res.statusCode).toBe(400);
    });
    it('should handle missing fields', async () => {
      const res = await request(app)
        .put('/api/firewall/rules')
        .send({});
      expect(res.statusCode).toBe(400);
    });
  });

  describe('Edge and error cases', () => {
    it('should return 400 for missing required fields in POST', async () => {
      const res = await request(app)
        .post('/api/firewall/ip')
        .send({});
      expect(res.statusCode).toBe(400);
    });
    it('should return 400 for missing required fields in DELETE', async () => {
      const res = await request(app)
        .delete('/api/firewall/ip')
        .send({});
      expect(res.statusCode).toBe(400);
    });
    it('should return 400 for invalid types in POST', async () => {
      const res = await request(app)
        .post('/api/firewall/port')
        .send({ values: ['not_a_number'], mode: 'blacklist' });
      expect(res.statusCode).toBe(400);
    });
    it('should return 400 for invalid types in DELETE', async () => {
      const res = await request(app)
        .delete('/api/firewall/port')
        .send({ values: ['not_a_number'], mode: 'blacklist' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/firewall/rules', () => {
    it('should hit catch block (error branch)', async () => {
      const spy = jest.spyOn(require('../src/services/firewallService'), 'getAllRules').mockImplementation(() => { throw new Error('Test error'); });
      const res = await request(app)
        .get('/api/firewall/rules');
      expect(res.statusCode).toBe(500);
      spy.mockRestore();
    });
  });
});

afterAll(async () => {
  // Close Express server
  if (server && typeof server.close === 'function') {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('All tests completed successfully!');
});
