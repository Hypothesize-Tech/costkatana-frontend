import React from 'react';
import { KeyVaultDashboard } from '../components/keyVault/KeyVaultDashboard';

const KeyVault: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <KeyVaultDashboard />
      </div>
    </div>
  );
};

export default KeyVault;