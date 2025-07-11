import React from 'react';
import { AppSidebarLayout } from '../components/app-sidebar';
import DepartmentTable from './departmentTable';

export default function Department() {
  return (
    <AppSidebarLayout>
      <DepartmentTable />
    </AppSidebarLayout>
  );
}
