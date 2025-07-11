import React from 'react';
import { AppSidebarLayout } from '../components/app-sidebar';
import InventoryTable from './inventoryTable';

export default function Inventory() {
  return (
    <AppSidebarLayout>
      <InventoryTable />
    </AppSidebarLayout>
  );
};
