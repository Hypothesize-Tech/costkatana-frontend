import React from 'react';
import { KeyVaultDashboard } from '../components/keyVault/KeyVaultDashboard';

const KeyVault: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="max-w-7xl mx-auto py-4 px-3 sm:py-6 sm:px-4 lg:px-8">
        <KeyVaultDashboard />
      </div>
    </div>
  );
};

export default KeyVault;