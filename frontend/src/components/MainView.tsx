"use client"
import { useState } from 'react';
import Navbar from './Navbar';
import RulesAdditionComponent from './RulesAdditionComponent';
import ExistingRulesComponent from './ExistingRulesComponent';
import LogsTestingComponent from './LogsTestingComponent';

const tabs = [
  'Overview',
  'Kernel Modules',
  'Firewall Rules',
  'API Interface',
  'Logs & Testing',
  'Settings',
  'Profile',
];

export default function MainView() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <main>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="tab-content" style={{ color: '#000' }}>
        {activeTab === 'Overview' && <div>Overview content goes here.</div>}
        {activeTab === 'Kernel Modules' && <div>Kernel Modules content goes here.</div>}
        {activeTab === 'Firewall Rules' && (
          <>
            <RulesAdditionComponent />
            <ExistingRulesComponent />
          </>
        )}
        {activeTab === 'API Interface' && <div>API Interface content goes here.</div>}
        {activeTab === 'Logs & Testing' && <LogsTestingComponent />}
        {activeTab === 'Settings' && <div>Settings content goes here.</div>}
        {activeTab === 'Profile' && <div>Profile content goes here.</div>}
      </div>
    </main>
  );
}