'use client';

import { Box, Button, Group, Paper, Text, Title } from '@mantine/core';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

export function UserProfile() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Title order={4} mb="md">User Profile</Title>
      
      <Box>
        <Text fw={500}>Email:</Text>
        <Text>{user.email}</Text>
      </Box>

      {user.first_name && (
        <Box mt="sm">
          <Text fw={500}>Name:</Text>
          <Text>{user.first_name} {user.last_name || ''}</Text>
        </Box>
      )}

      {user.role && (
        <Box mt="sm">
          <Text fw={500}>Role:</Text>
          <Text>{user.role}</Text>
        </Box>
      )}

      <Group justify="flex-end" mt="xl">
        <Button onClick={handleLogout} loading={isLoading} color="red">
          Logout
        </Button>
      </Group>
    </Paper>
  );
}