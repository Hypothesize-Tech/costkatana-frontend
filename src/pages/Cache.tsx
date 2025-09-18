import React from 'react';
import { CacheDashboard } from '../components/cache';

const CachePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <CacheDashboard />
    </div>
  );
};

export default CachePage;
