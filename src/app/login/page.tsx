'use client';

import { Title, Text, Paper, Container, Stack, Box, Divider } from '@mantine/core';
import { LoginForm } from '@/components/auth/LoginForm';
import { ThemeIcon } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';

export default function LoginPage() {
  return (
    <Container size="sm" py={50}>
      <Paper shadow="md" radius="lg" p="xl" withBorder>
        <Stack align="center" mb="md">
          <ThemeIcon size={60} radius={100} variant="light" color="blue">
            <IconLock size={30} />
          </ThemeIcon>
          <Title order={2} ta="center" mt="md">
            Welcome back!
          </Title>
          <Text size="sm" ta="center" c="dimmed" maw={420} mx="auto">
            Sign in to your account to access your dashboard and personal settings
          </Text>
        </Stack>
        
        <Divider my="md" labelPosition="center" label={
          <Box fz="sm" fw={500}>
            Secure Login
          </Box>
        } />
        
        <LoginForm />
        
        <Text size="xs" ta="center" mt="lg" c="dimmed">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </Paper>
    </Container>
  );
}