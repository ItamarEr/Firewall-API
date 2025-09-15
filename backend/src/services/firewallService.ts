import { FirewallRule, FirewallRuleType, FirewallRuleMode } from '../types/firewallRule';
import { firewall_rules } from '../config/schema';
import { eq, and } from 'drizzle-orm';

import LoggerSingleton from '../config/Logger';
const logger = LoggerSingleton.getInstance();

import DatabaseSingleton from '../config/drizzle';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
let db: PostgresJsDatabase<Record<string, unknown>> | undefined;
async function initDatabase() {
  await DatabaseSingleton.dbReady;
  db = DatabaseSingleton.getInstance();
}

initDatabase();

function isValidIP(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  for (const part of parts) {
    const num = Number(part);
    if (isNaN(num) || num < 0 || num > 255) return false;
    if (part.length > 1 && part.startsWith('0')) return false;
  }
  return true;
}

function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

function isValidURL(url: string): boolean {
  if (url.startsWith('http://') || url.startsWith('https://') || url.includes('/')) {
    return false;
  }
  
  if (url.trim() === '' || url.startsWith('.') || url.endsWith('.') || !url.includes('.')) {
    return false;
  }
  
  // Check for invalid characters and patterns
  if (!/^[a-zA-Z0-9.-]+$/.test(url) || url.includes('..')) {
    return false;
  }
  
  // Ensure the end is at least 2 alphabetic characters
  const parts = url.split('.');
  const end = parts[parts.length - 1];
  if (end.length < 2 || !/^[a-zA-Z]+$/.test(end)) {
    return false;
  }
  return true;
}

export async function addRules(values: (string|number)[], type: FirewallRuleType, mode: FirewallRuleMode): Promise<FirewallRule[]> {
  try {
    await DatabaseSingleton.dbReady;
    for (const value of values) {
      if (type === 'ip' && (typeof value !== 'string' || !isValidIP(value))) {
        logger.warn(`Invalid IP: ${value}`);
        throw new Error(`Invalid IP address: ${value}`);
      }
      if (type === 'port' && (typeof value !== 'number' || !isValidPort(value))) {
        logger.warn(`Invalid port: ${value}`);
        throw new Error(`Invalid port: ${value}`);
      }
      if (type === 'url' && (typeof value !== 'string' || !isValidURL(value))) {
        logger.warn(`Invalid URL: ${value}`);
        throw new Error(`Invalid URL: ${value}`);
      }
      // Duplicate check
  const existing = await db!.select().from(firewall_rules)
        .where(and(
          eq(firewall_rules.value, String(value)),
          eq(firewall_rules.type, type),
          eq(firewall_rules.mode, mode)
        ));
      if (existing.length > 0) {
        logger.warn(`Duplicate rule: ${value} (${type}, ${mode})`);
        throw new Error(`Duplicate rule: ${value}`);
      }
    }
    const inserted: FirewallRule[] = [];
    for (const value of values) {
  const result = await db!.insert(firewall_rules).values({ value: String(value), type, mode, active: true }).returning();
      if (result.length > 0) inserted.push(result[0] as FirewallRule);
    }
    logger.debug(`Rules added: ${inserted.length}`);
    return inserted;
  } catch (err) {
    logger.error('Database connection error or operation failed:', err);
    throw new Error('Database connection error');
  }
}

export async function removeRules(values: (string|number)[], type: FirewallRuleType, mode: FirewallRuleMode): Promise<number[]> {
  try {
    const removedIds: number[] = [];
    for (const value of values) {
  const deleted = await db!.delete(firewall_rules)
        .where(and(
          eq(firewall_rules.value, String(value)),
          eq(firewall_rules.type, type),
          eq(firewall_rules.mode, mode)
        ))
        .returning({ id: firewall_rules.id });
      if (deleted.length > 0) removedIds.push(deleted[0].id);
    }
    logger.debug(`Rules removed: ${removedIds.length}`);
    return removedIds;
  } catch (err) {
    logger.error('Database connection error or operation failed:', err);
    throw new Error('Database connection error');
  }
}

export type FirewallRulesGrouped = {
  ips: { blacklist: {id: number, value: string | number}[], whitelist: {id: number, value: string | number}[] },
  urls: { blacklist: {id: number, value: string | number}[], whitelist: {id: number, value: string | number}[] },
  ports: { blacklist: {id: number, value: string | number}[], whitelist: {id: number, value: string | number}[] }
};

export async function getAllRules(): Promise<FirewallRulesGrouped> {
  try {
  const rules = await db!.select().from(firewall_rules);
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
  } catch (err) {
    logger.error('Database connection error or operation failed:', err);
    throw new Error('Database connection error');
  }
}

export async function updateRuleStatus(type: FirewallRuleType, mode: FirewallRuleMode, ids: number[], active: boolean): Promise<FirewallRule[]> {
  try {
    const updated: FirewallRule[] = [];
    for (const id of ids) {
  const result = await db!.update(firewall_rules)
        .set({ active })
        .where(and(
          eq(firewall_rules.id, id),
          eq(firewall_rules.type, type),
          eq(firewall_rules.mode, mode)
        ))
        .returning();
      if (result.length > 0) updated.push(result[0] as FirewallRule);
      else {
        logger.warn(`Failed to update rule: ${id} (${type}, ${mode})`);
        throw new Error(`Failed to update rule: ${id} (${type}, ${mode})`);
      }
    }
    return updated;
  } catch (err) {
    logger.error('Database connection error or operation failed:', err);
    throw new Error('Database connection error');
  }
}
