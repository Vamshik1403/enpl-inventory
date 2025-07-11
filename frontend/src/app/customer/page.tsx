import React from 'react';
import { AppSidebarLayout } from '../components/app-sidebar';
import CustomerTable from './CustomerTable';

export default function Customers() {
  return (
    <AppSidebarLayout>
      <CustomerTable />
    </AppSidebarLayout>
  );
}
