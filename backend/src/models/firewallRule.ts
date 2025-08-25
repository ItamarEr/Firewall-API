export type FirewallRuleType = 'ip' | 'url' | 'port';
export type FirewallRuleMode = 'blacklist' | 'whitelist';

export interface FirewallRule {
  id: number;
  value: string | number;
  type: FirewallRuleType;
  mode: FirewallRuleMode;
  active: boolean;
  created_at?: Date;
}
