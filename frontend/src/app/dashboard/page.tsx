import React from 'react';
import { AppSidebarLayout } from '../components/app-sidebar';
import Dashboard from './dashboard';

export default function Dashboards() {
  return (
    <AppSidebarLayout>
      <Dashboard />
    </AppSidebarLayout>
  );
}
