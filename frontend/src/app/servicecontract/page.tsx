import React from 'react';
import ServiceContractTable from './ServiceContractTable';
import { AppSidebarLayout } from '../components/app-sidebar';

export default function ServiceContracts() {
  return (
    <AppSidebarLayout>
      <ServiceContractTable />
    </AppSidebarLayout>
  );
}
