import React from 'react';
import { AppSidebarLayout } from '../components/app-sidebar';
import TaskTable from './TasktTable';

export default function Tasks() {
  return (
    <AppSidebarLayout>
      <TaskTable />
    </AppSidebarLayout>
  );
}
