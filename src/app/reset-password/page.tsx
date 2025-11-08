'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Paper, Stack, Title, Text, Divider, ThemeIcon } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { RequestPasswordResetForm } from '@/components/auth/RequestPasswordResetForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');
  const [requestedEmail, setRequestedEmail] = useState<string | null>(null);

  return (
    <Container size="sm" py={50}>
      <Paper shadow="md" radius="lg" p="xl" withBorder>
        <Stack gap="sm" align="center" mb="md">
          <ThemeIcon size={60} radius={100} variant="light" color="blue">
            <IconLock size={30} />
          </ThemeIcon>
          <Title order={2} ta="center">
            Reset your password
          </Title>
          <Text size="sm" c="dimmed" ta="center" maw={420}>
            {tokenParam
              ? 'Enter the reset code you received and choose a new password.'
              : 'Enter the email you use for SUNY Canton EMS and we will send you a reset code.'}
          </Text>
          {requestedEmail && !tokenParam && (
            <Text size="xs" c="dimmed" ta="center">
              Request sent for <Text span fw={600}>{requestedEmail}</Text>. You can paste the code here once you receive it.
            </Text>
          )}
        </Stack>

        <Divider mb="lg" label={tokenParam ? 'Reset password' : 'Request reset code'} labelPosition="center" />

        {tokenParam ? (
          <ResetPasswordForm initialToken={tokenParam} />
        ) : (
          <RequestPasswordResetForm onRequestComplete={setRequestedEmail} />
        )}
      </Paper>
    </Container>
  );
}
