import React from 'react';
import { AppSidebarLayout } from '../components/app-sidebar';
import MaterialDeliveryTable from './materialTable';

export default function Material() {
  return (
    <AppSidebarLayout>
      <MaterialDeliveryTable />
    </AppSidebarLayout>
  );
}
