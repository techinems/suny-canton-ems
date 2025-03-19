'use client';

import { Title, Container, Stack, Paper, Group, Button, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { CallList } from '@/components/dashboard/CallList';

export default function CallsPage() {
  const router = useRouter();
  
  return (
    <Container fluid>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Call History</Title>
          <Button 
            leftSection={<IconPlus size="1rem" />}
            onClick={() => router.push('/dashboard/calls/new')}
          >
            Create New Call
          </Button>
        </Group>
        
        <Paper withBorder p="md" radius="md" shadow="xs">
          <Text mb="md">
            View and manage call logs for SUNY Canton EMS. Track emergency responses, 
            patient care details, and response times.
          </Text>
          <CallList />
        </Paper>
      </Stack>
    </Container>
  );
}