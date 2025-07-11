import React from 'react';
import { AppSidebarLayout } from '../components/app-sidebar';
import VendorTable from './VendorTable';

export default function Vendors() {
  return (
    <AppSidebarLayout>
      <VendorTable />
    </AppSidebarLayout>
  );
}
