import React from 'react';
import { AppSidebarLayout } from '../components/app-sidebar';
import ProductTable from './ProductTable';

export default function Products() {
  return (
    <AppSidebarLayout>
      <ProductTable />
    </AppSidebarLayout>
  );
}
