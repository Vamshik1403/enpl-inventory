import React from 'react';
import { AppSidebarLayout } from '../components/app-sidebar';
import VendorPaymentTable from './vendorPaymentTable';

export default function VendorPayment() {
  return (
    <AppSidebarLayout>
      <VendorPaymentTable/>
    </AppSidebarLayout>
  );
}
