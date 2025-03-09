'use client';

import { Title, Container, Stack, Button, Paper, Table, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

export default function CallsPage() {
  // Sample call data - in a real app, this would come from your API
  const calls = [
    { id: '1', date: '2023-11-21', type: 'Medical Emergency', priority: '2', location: 'Residence Hall 3', status: 'Completed' },
    { id: '2', date: '2023-11-18', type: 'Trauma', priority: '1', location: 'Athletic Center', status: 'Completed' },
    { id: '3', date: '2023-11-15', type: 'Transport', priority: '3', location: 'Student Center', status: 'Completed' },
    { id: '4', date: '2023-11-12', type: 'Standby', priority: '4', location: 'Campus Event', status: 'Completed' },
  ];

  const rows = calls.map((call) => (
    <Table.Tr key={call.id}>
      <Table.Td>{call.date}</Table.Td>
      <Table.Td>{call.type}</Table.Td>
      <Table.Td>{call.priority}</Table.Td>
      <Table.Td>{call.location}</Table.Td>
      <Table.Td>{call.status}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Container fluid>
      <Stack gap="md">
        <Title order={2}>Call History</Title>
        
        <Group justify="flex-end">
          <Button 
            component={Link}
            href="/dashboard/calls/new"
            leftSection={<IconPlus size="1rem" />}
          >
            Create New Call
          </Button>
        </Group>
        
        <Paper withBorder p="md" radius="md" shadow="xs">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Priority</Table.Th>
                <Table.Th>Location</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Paper>
      </Stack>
    </Container>
  );
}