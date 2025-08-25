import { Pool } from 'pg';
import { FirewallRule, FirewallRuleType, FirewallRuleMode } from '../models/firewallRule';

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT) || 5432,
});

function isValidIP(ip: string): boolean {
  // IPv4 validation
  const parts = ip.split(".");
  if(parts.length !== 4) return false; // Must have 4 parts
  for (const part of parts){
    const num = Number(part);
    if (isNaN(num) || num < 0 || num > 255) return false; // All parts must be digits in 0-255
    if (part.length > 1 && part.startsWith('0')) return false; // No leading zeros
    }
  return true;
}

function isValidPort(port: number): boolean {
    // Port must be an integer between 0 and 65535
  return Number.isInteger(port) && port >= 0 && port <= 65535;
}

function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export async function addRules(values: (string|number)[], type: FirewallRuleType, mode: FirewallRuleMode): Promise<FirewallRule[]> {
  // Validate values
  for (const value of values) {
    if (type === 'ip' && (typeof value !== 'string' || !isValidIP(value))) {
      throw new Error(`Invalid IP address: ${value}`);
    }
    if (type === 'port' && (typeof value !== 'number' || !isValidPort(value))) {
      throw new Error(`Invalid port: ${value}`);
    }
    if (type === 'url' && (typeof value !== 'string' || !isValidURL(value))) {
      throw new Error(`Invalid URL: ${value}`);
    }
  }
  const client = await pool.connect();
  try {
    const inserted: FirewallRule[] = [];
    for (const value of values) {
      const res = await client.query(
        'INSERT INTO firewall_rules (value, type, mode, active) VALUES ($1, $2, $3, true) RETURNING *',
        [value, type, mode]
      );
      inserted.push(res.rows[0]);
    }
    return inserted;
  } finally {
    client.release();
  }
}

export async function removeRules(values: (string|number)[], type: FirewallRuleType, mode: FirewallRuleMode): Promise<number[]> {
  const client = await pool.connect();
  try {
    const removedIds: number[] = [];
    for (const value of values) {
      const res = await client.query(
        'DELETE FROM firewall_rules WHERE value = $1 AND type = $2 AND mode = $3 RETURNING id',
        [value, type, mode]
      );
      if (res.rows[0]) removedIds.push(res.rows[0].id);
    }
    return removedIds;
  } finally {
    client.release();
  }
}

export async function getAllRules(): Promise<any> {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM firewall_rules');
    const rules = res.rows;
    const result = {
      ips: { blacklist: [] as {id: number, value: string | number}[], whitelist: [] as {id: number, value: string | number}[] },
      urls: { blacklist: [] as {id: number, value: string | number}[], whitelist: [] as {id: number, value: string | number}[] },
      ports: { blacklist: [] as {id: number, value: string | number}[], whitelist: [] as {id: number, value: string | number}[] }
    };
    for (const rule of rules) {
      const entry = { id: rule.id, value: rule.value };
      if (rule.type === 'ip') result.ips[rule.mode as FirewallRuleMode].push(entry);
      if (rule.type === 'url') result.urls[rule.mode as FirewallRuleMode].push(entry);
      if (rule.type === 'port') result.ports[rule.mode as FirewallRuleMode].push(entry);
    }
    return result;
  } finally {
    client.release();
  }
}

export async function updateRuleStatus(type: FirewallRuleType, mode: FirewallRuleMode, ids: number[], active: boolean): Promise<FirewallRule[]> {
  const client = await pool.connect();
  try {
    const updated: FirewallRule[] = [];
    for (const id of ids) {
      const res = await client.query(
        'UPDATE firewall_rules SET active = $1 WHERE id = $2 AND type = $3 AND mode = $4 RETURNING *',
        [active, id, type, mode]
      );
      if (res.rows[0]) updated.push(res.rows[0]);
    }
    return updated;
  } finally {
    client.release();
  }
}
