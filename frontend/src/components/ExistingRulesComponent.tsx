"use client"
import { useState, useEffect } from 'react';

type Rule = {
  id: number;
  type: string;
  mode: string;
  value: string | number;
  active: boolean;
};

function flattenRules(data: any): Rule[] {
  if (!data) return [];
  const rules: Rule[] = [];
  ['ips', 'ports', 'urls'].forEach(type => {
    ['blacklist', 'whitelist'].forEach(mode => {
      if (data[type] && data[type][mode]) {
        data[type][mode].forEach((r: any) => {
          rules.push({ ...r, type: type.slice(0, -1), mode, active: r.active });
        });
      }
    });
  });
  return rules;
}

export default function ExistingRulesComponent() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchRules() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/firewall/rules`);
      if (!res.ok) throw new Error('Failed to fetch rules');
      const data = await res.json();
      setRules(flattenRules(data));
    } catch (err: any) {
      setError(err.message || 'Error fetching rules');
      setRules([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRules();
  }, []);

  async function toggleActiveValue(id: number, value: boolean) {
  const rule = rules.find(r => r.id === id);
  if (!rule) return;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/firewall/rules`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [rule.type + 's']: { ids: [id], mode: rule.mode, active: value } }),
    });
    if (!res.ok) throw new Error('Failed to update rule');
    fetchRules();
  } catch (err) {
    setError('Error updating rule');
  }
}

  async function deleteRule(id: number) {
    const rule = rules.find(r => r.id === id);
    if (!rule) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/firewall/${rule.type}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [rule.value], mode: rule.mode }),
      });
      if (!res.ok) throw new Error('Failed to delete rule');
      fetchRules();
    } catch (err) {
      setError('Error deleting rule');
    }
  }

  return (
    <div className="rules-list-box" style={{ maxWidth: '900px', margin: '0 auto', marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Existing Firewall Rules</h3>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error-msg" style={{ color: 'red' }}>{error}</div>
      ) : rules.length === 0 ? (
        <div className="empty-msg">Database is empty</div>
      ) : (
        <ul className="rules-list" style={{ listStyle: 'none', padding: 0 }}>
          {rules.map(rule => (
            <li
              key={rule.id}
              className={rule.active ? 'active-rule' : 'inactive-rule'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                padding: '12px 0',
                borderBottom: '1px solid #eee',
                fontSize: '1.1rem',
              }}
            >
              <span style={{ minWidth: '180px', fontWeight: 500 }}>{rule.type.toUpperCase()}</span>
              <span style={{ minWidth: '120px' }}>{rule.mode}</span>
              <span style={{ minWidth: '220px' }}>{rule.value}</span>
              <button
                onClick={() => toggleActiveValue(rule.id, true)}
                style={{ border: '1px solid #007bff', borderRadius: '4px', padding: '8px 16px', background: '#007bff', color: '#fff', cursor: 'pointer', fontWeight: 'bold', marginRight: '1rem', transition: 'background 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.background = '#0056b3')}
                onMouseOut={e => (e.currentTarget.style.background = '#007bff')}
                >
                Activate
                </button>
                <button
                onClick={() => toggleActiveValue(rule.id, false)}
                style={{ border: '1px solid #6c757d', borderRadius: '4px', padding: '8px 16px', background: '#6c757d', color: '#fff', cursor: 'pointer', fontWeight: 'bold', marginRight: '1rem', transition: 'background 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.background = '#495057')}
                onMouseOut={e => (e.currentTarget.style.background = '#6c757d')}
                >
                Deactivate
                </button>
              <button
                onClick={() => deleteRule(rule.id)}
                style={{ border: '1px solid #dc3545', borderRadius: '4px', padding: '8px 16px', background: '#dc3545', color: '#fff', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.background = '#a71d2a')}
                onMouseOut={e => (e.currentTarget.style.background = '#dc3545')}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
