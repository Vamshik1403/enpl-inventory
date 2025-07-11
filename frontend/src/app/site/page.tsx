import React from 'react';
import { AppSidebarLayout } from '../components/app-sidebar';
import SiteTable from './SiteTable';

export default function Sites() {
  return (
    <AppSidebarLayout>
      <SiteTable />
    </AppSidebarLayout>
  );
}
