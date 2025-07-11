import React from 'react';
import { AppSidebarLayout } from '../components/app-sidebar';
import CategoryTable from './CategoryTable';

export default function Category() {
  return (
    <AppSidebarLayout>
      <CategoryTable />
    </AppSidebarLayout>
  );
}
