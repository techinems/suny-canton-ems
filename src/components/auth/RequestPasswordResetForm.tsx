'use client';

import { useState } from 'react';
import { Stack, TextInput, Button, Alert, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck, IconMail } from '@tabler/icons-react';
import { authClient } from '@/lib/auth-client';

interface RequestPasswordResetFormProps {
  onRequestComplete?: (email: string) => void;
}

export function RequestPasswordResetForm({ onRequestComplete }: RequestPasswordResetFormProps) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Enter a valid email address'),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setLoading(true);
    setStatus('idle');
    setMessage(null);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL;
      const redirectTo = origin ? `${origin.replace(/\/$/, '')}/reset-password` : undefined;

      const { error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo,
      });

      if (error) {
        throw new Error(error.message);
      }

      setStatus('success');
      setMessage('If an account exists for that email we sent a reset code.');
      onRequestComplete?.(values.email);
    } catch (err) {
      const fallback = err instanceof Error ? err.message : 'We could not start the password reset. Try again in a moment.';
      setStatus('error');
      setMessage(fallback);
    } finally {
      setLoading(false);
    }
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="sm">
        {status === 'success' && message && (
          <Alert icon={<IconCheck size={16} />} color="green" title="Check your email" radius="md">
            {message}
          </Alert>
        )}
        {status === 'error' && message && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Unable to send reset" radius="md">
            {message}
          </Alert>
        )}

        <TextInput
          id="reset-email"
          label="Email"
          placeholder="you@example.com"
          leftSection={<IconMail size={16} />}
          required
          size="md"
          radius="md"
          {...form.getInputProps('email')}
        />

        <Button type="submit" loading={loading} radius="md" size="md">
          Send reset code
        </Button>

        <Text size="xs" c="dimmed">
          We will email you a reset code along with a link you can use to finish resetting your password.
        </Text>
      </Stack>
    </form>
  );
}
