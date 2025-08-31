"use client"
import { useState } from 'react';

const ruleTypes = ['ip', 'port', 'url'];
const modes = ['blacklist', 'whitelist'];

export default function RulesAdditionComponent() {
  const [type, setType] = useState('ip');
  const [mode, setMode] = useState('blacklist');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

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


  function validateRule() {
    if (type === 'ip') {
        if (!isValidIP(value)) {
            return 'Invalid IP address';
        }
    }
    if (type === 'port') {
      const port = Number(value);
      if (!isValidPort(port)) {
        return 'Invalid port';
      }
    }
    if (type === 'url') {
      if (!isValidURL(value)) {
        return 'Invalid URL';
      }
    }
    return '';
  }

  async function handleAddRule() {
    const validationError = validateRule();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    try {
        
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/firewall/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [type === 'port' ? Number(value) : value], mode }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add rule');
      } else {
        setValue('');
        setError('');
      }
    } catch (err) {
      setError('Network error');
    }
  }

  return (
    <div className="add-rule-box" style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Add Firewall Rule</h3>
      <div className="add-rule-form" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '6px 12px', background: '#fff' }}
        >
          {ruleTypes.map(rt => <option key={rt} value={rt}>{rt.toUpperCase()}</option>)}
        </select>
        <select
          value={mode}
          onChange={e => setMode(e.target.value)}
          style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '6px 12px', background: '#fff' }}
        >
          {modes.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
        </select>
        <input
          type="text"
          placeholder={`Enter ${type}`}
          value={value}
          onChange={e => setValue(e.target.value)}
          style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '6px 12px', background: '#fff', minWidth: '120px' }}
        />
        <button
          onClick={handleAddRule}
          style={{ border: '1px solid #007bff', borderRadius: '4px', padding: '8px 16px', background: '#007bff', color: '#fff', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}
          onMouseOver={e => (e.currentTarget.style.background = '#0056b3')}
          onMouseOut={e => (e.currentTarget.style.background = '#007bff')}
        >
          Add Rule
        </button>
      </div>
      {error && <div className="error-msg" style={{ color: 'red', marginTop: '0.5rem' }}>{error}</div>}
    </div>
  );
}
