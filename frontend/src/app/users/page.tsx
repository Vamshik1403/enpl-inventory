import React from 'react';
import { AppSidebarLayout } from '../components/app-sidebar';
import UserTable from './userTable';

export default function Users() {
  return (
    <AppSidebarLayout>
      <UserTable />
    </AppSidebarLayout>
  );
}
