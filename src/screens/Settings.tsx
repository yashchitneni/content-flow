import React from 'react';
import { SettingsPanel } from '../components/templates';

export const Settings: React.FC = () => {
  return (
    <div className="h-screen bg-theme-primary">
      <SettingsPanel />
    </div>
  );
};