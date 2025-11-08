'use client';

import { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from '@/components/auth/AuthContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MantineProvider>
      <AuthProvider>
        <ModalsProvider>
          <Notifications />
          {children}
        </ModalsProvider>
      </AuthProvider>
    </MantineProvider>
  );
}
