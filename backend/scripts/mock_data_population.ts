// @ts-ignore
const { faker } = require('@faker-js/faker');

import { firewall_rules } from '../src/config/schema';
import { FirewallRuleType, FirewallRuleMode } from '../src/types/firewallRule';
import DatabaseSingleton from '../src/config/drizzle';

// Helper functions for valid data
function getRandomIP() {
  return `${faker.datatype.number({min:1,max:255})}.${faker.datatype.number({min:0,max:255})}.${faker.datatype.number({min:0,max:255})}.${faker.datatype.number({min:0,max:255})}`;
}
function getRandomPort() {
  return faker.datatype.number({ min: 1, max: 65535 });
}
function getRandomURL() {
  return faker.internet.domainName();
}
function getRandomMode(): FirewallRuleMode {
  return faker.helpers.arrayElement(['blacklist', 'whitelist']);
}


async function populateMockData() {
  await DatabaseSingleton.dbReady;
  const db = DatabaseSingleton.getInstance();

  const rules: Array<{ value: string; type: string; mode: string; active: boolean }> = [];

  for (let i = 0; i < 6; i++) {
    rules.push({
      value: getRandomIP(),
      type: 'ip',
      mode: getRandomMode(),
      active: faker.datatype.boolean(),
    });
  }
  // Edge case IPs
  rules.push({ value: '0.0.0.0', type: 'ip', mode: 'blacklist', active: true });
  rules.push({ value: '255.255.255.255', type: 'ip', mode: 'whitelist', active: false });
  rules.push({ value: '1.2.3.4', type: 'ip', mode: 'blacklist', active: true });
  rules.push({ value: '192.168.0.1', type: 'ip', mode: 'whitelist', active: true });

  for (let i = 0; i < 6; i++) {
    rules.push({
      value: String(getRandomPort()),
      type: 'port',
      mode: getRandomMode(),
      active: faker.datatype.boolean(),
    });
  }
  // Edge case ports
  rules.push({ value: '1', type: 'port', mode: 'blacklist', active: true });
  rules.push({ value: '65535', type: 'port', mode: 'whitelist', active: false });
  rules.push({ value: '80', type: 'port', mode: 'blacklist', active: true });
  rules.push({ value: '443', type: 'port', mode: 'whitelist', active: true });

  for (let i = 0; i < 6; i++) {
    rules.push({
      value: getRandomURL(),
      type: 'url',
      mode: getRandomMode(),
      active: faker.datatype.boolean(),
    });
  }
  // Edge case URLs
  rules.push({ value: 'localhost.abc', type: 'url', mode: 'blacklist', active: true });
  rules.push({ value: '127.0.0.1.abc', type: 'url', mode: 'whitelist', active: false });
  rules.push({ value: 'example.com', type: 'url', mode: 'blacklist', active: true });
  rules.push({ value: 'ftp.example.com', type: 'url', mode: 'whitelist', active: true });

  try {
  await db!.insert(firewall_rules).values(rules);
    console.log(`Inserted ${rules.length} mock firewall rules.`);
  } catch (err) {
    console.error('Error inserting mock firewall rules:', err);
    throw err;
  }
}

declare const require: any;
declare const module: any;

if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  populateMockData().then(() => {
    // @ts-ignore
    process.exit(0);
  });
}
