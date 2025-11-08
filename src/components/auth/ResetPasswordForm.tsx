'use client';

import { useEffect, useState } from 'react';
import { Stack, PasswordInput, TextInput, Button, Alert, Group, Anchor } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck, IconKey, IconNumbers } from '@tabler/icons-react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

interface ResetPasswordFormProps {
  initialToken?: string | null;
  onResetComplete?: () => void;
}

export function ResetPasswordForm({ initialToken, onResetComplete }: ResetPasswordFormProps) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      token: initialToken ?? '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      token: (value) => (value.trim().length > 0 ? null : 'Enter the reset code that was sent to you'),
      newPassword: (value) => (value.length >= 8 ? null : 'Password must be at least 8 characters long'),
      confirmPassword: (value, values) => (value === values.newPassword ? null : 'Passwords do not match'),
    },
  });

  useEffect(() => {
    if (initialToken) {
      form.setFieldValue('token', initialToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  const handleSubmit = form.onSubmit(async (values) => {
    setLoading(true);
    setStatus('idle');
    setMessage(null);

    try {
      const { error } = await authClient.resetPassword({
        token: values.token.trim(),
        newPassword: values.newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      setStatus('success');
      setMessage('Your password has been updated. You can now sign in with your new password.');
      onResetComplete?.();
      form.reset();
    } catch (err) {
      const fallback = err instanceof Error ? err.message : 'We could not reset your password. Double-check the code and try again.';
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
          <Alert icon={<IconCheck size={16} />} color="green" title="Password reset" radius="md">
            {message}
          </Alert>
        )}
        {status === 'error' && message && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Unable to reset" radius="md">
            {message}
          </Alert>
        )}

        <TextInput
          id="reset-token"
          label="Reset code"
          placeholder="Paste the code from your email"
          leftSection={<IconNumbers size={16} />}
          radius="md"
          size="md"
          required
          {...form.getInputProps('token')}
        />

        <PasswordInput
          id="new-password"
          label="New password"
          placeholder="Enter a new password"
          leftSection={<IconKey size={16} />}
          radius="md"
          size="md"
          required
          {...form.getInputProps('newPassword')}
        />

        <PasswordInput
          id="confirm-password"
          label="Confirm password"
          placeholder="Re-enter your new password"
          leftSection={<IconKey size={16} />}
          radius="md"
          size="md"
          required
          {...form.getInputProps('confirmPassword')}
        />

        <Button type="submit" loading={loading} radius="md" size="md">
          Reset password
        </Button>

        <Group justify="space-between">
          <Anchor component={Link} href="/login" size="sm">
            Back to login
          </Anchor>
          <Anchor component={Link} href="/reset-password" size="sm">
            Request a new code
          </Anchor>
        </Group>
      </Stack>
    </form>
  );
}
