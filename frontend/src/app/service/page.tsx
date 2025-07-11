import React from 'react';
import { AppSidebarLayout } from '../components/app-sidebar';
import ServiceTable from './ServiceTable';

export default function Services() {
  return (
    <AppSidebarLayout>
      <ServiceTable />
    </AppSidebarLayout>
  );
}
