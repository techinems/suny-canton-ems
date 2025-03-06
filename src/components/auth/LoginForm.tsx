import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Center
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconMail, IconLock } from '@tabler/icons-react';
import { useAuth } from './AuthContext';

export function LoginForm() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

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
      
      // Success handling: If login succeeds, the effect will handle redirection
      console.log('Login successful, redirecting...');
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
            label="Email"
            placeholder="your@email.com"
            leftSection={<IconMail size={16} />}
            required
            size="md"
            radius="md"
            {...form.getInputProps('email')}
          />
          
          <PasswordInput
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
              label="Remember me"
              {...form.getInputProps('rememberMe', { type: 'checkbox' })}
            />
            <Anchor size="sm" href="#" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </Anchor>
          </Group>

          <Button fullWidth size="md" type="submit" loading={loading || authLoading} radius="md">
            Sign in
          </Button>
          <Center>
            <Anchor size="sm" href="/register" component="a">
              Don&apos;t have an account? Register
            </Anchor>
          </Center>
        </Stack>
      </form>
    </Box>
  );
}