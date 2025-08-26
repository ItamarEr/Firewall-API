import { pgTable, serial, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

export const firewall_rules = pgTable('firewall_rules', {
  id: serial('id').primaryKey(),
  value: varchar('value', { length: 255 }).notNull(),
  type: varchar('type', { length: 10 }).notNull(),
  mode: varchar('mode', { length: 10 }).notNull(),
  active: boolean('active').default(true),
  created_at: timestamp('created_at').defaultNow(),
});
