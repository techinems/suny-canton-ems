import { useState, useEffect } from 'react';
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Group, 
  Box, 
  Alert,
  Stack,
  Checkbox,
  Anchor,
  Center,
  Text
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconMail, IconLock } from '@tabler/icons-react';
import Link from 'next/link';
import { useAuth } from './AuthContext';

export function LoginForm() {
  const { login, isLoading: authLoading, error: authError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Update local error state if auth context has an error
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
  });

  const handleSubmit = async (values: { email: string; password: string, rememberMe: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      
      await login(values.email, values.password);
    } catch (err: unknown) {
      // Display specific error message
      let errorMessage: string;
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'An error occurred during login. Please check your credentials and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mx="auto">
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Authentication Error" color="red" mb="lg" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            id="login-email"
            label="Email"
            placeholder="your@email.com"
            leftSection={<IconMail size={16} />}
            required
            size="md"
            radius="md"
            {...form.getInputProps('email')}
          />
          
          <PasswordInput
            id="login-password"
            label="Password"
            placeholder="Your password"
            leftSection={<IconLock size={16} />}
            required
            size="md"
            radius="md"
            {...form.getInputProps('password')}
          />
          <Group justify="space-between">
            <Checkbox
              id="login-remember-me"
              label="Remember me"
              {...form.getInputProps('rememberMe', { type: 'checkbox' })}
            />
            <Anchor size="sm" component={Link} href="/reset-password">
              Forgot password?
            </Anchor>
          </Group>
          <Button fullWidth size="md" type="submit" loading={loading || authLoading} radius="md">
            Sign in
          </Button>
          <Center>
            <Group gap="xs">
              <Text size="sm">Don&apos;t have an account?</Text>
              <Anchor size="sm" href="/register">
                Register here
              </Anchor>
            </Group>
          </Center>
        </Stack>
      </form>
    </Box>
  );
}