// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
'use client';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { AuthProvider } from '@/components/auth/AuthContext';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <AuthProvider>
            <ModalsProvider>
              <Notifications />
              {children}
            </ModalsProvider>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}