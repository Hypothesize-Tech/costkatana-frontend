import React from 'react';
import { CacheDashboard } from '../components/cache';

const CachePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200">
      <CacheDashboard />
    </div>
  );
};

export default CachePage;
