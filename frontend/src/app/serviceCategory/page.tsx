import React from 'react';
import { AppSidebarLayout } from '../components/app-sidebar';
import ServiceCategoryTable from './serviceCategoryTable';

export default function ServiceCategory() {
  return (
    <AppSidebarLayout>
      <ServiceCategoryTable />
    </AppSidebarLayout>
  );
}
