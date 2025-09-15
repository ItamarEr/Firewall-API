"use client"
import React from 'react';

type NavbarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const tabs = [
  'Overview',
  'Kernel Modules',
  'Firewall Rules',
  'API Interface',
  'Logs & Testing',
  'Settings',
  'Profile',
];

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <nav className="navbar" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#181818', padding: '0.5rem 2rem' }}>
      <button
        onClick={() => setActiveTab('Overview')}
        style={{ background: 'none', border: 'none', padding: 0, marginRight: '1rem', cursor: 'pointer' }}
        aria-label="Go to Home"
      >
        <img src="/window.svg" alt="Logo" className="logo" style={{ height: '32px' }} />
      </button>
      {tabs.map(tab => (
        <button
          key={tab}
          className={activeTab === tab ? 'active' : ''}
          onClick={() => setActiveTab(tab)}
          style={{
            border: 'none',
            borderRadius: '4px',
            padding: '8px 18px',
            background: activeTab === tab ? '#333' : '#222',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background 0.2s',
            outline: activeTab === tab ? '2px solid #007bff' : 'none',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#444')}
          onMouseOut={e => (e.currentTarget.style.background = activeTab === tab ? '#333' : '#222')}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}
