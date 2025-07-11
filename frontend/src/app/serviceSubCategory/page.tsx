import React from 'react';
import { AppSidebarLayout } from '../components/app-sidebar';
import ServiceSubCategoryTable from './serviceSubCategoryTable';

export default function ServiceSubCategory() {
  return (
    <AppSidebarLayout>
      <ServiceSubCategoryTable />
    </AppSidebarLayout>
  );
}
