import React from 'react';
import { AppSidebarLayout } from '../components/app-sidebar';
import PurchaseInvoiceTable from './purchaseInvoiceTable';

export default function PurchaseInvoices() {
  return (
    <AppSidebarLayout>
      <PurchaseInvoiceTable />
    </AppSidebarLayout>
  );
}
