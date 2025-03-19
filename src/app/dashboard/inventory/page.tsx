'use client';

import { Title, Container, Stack, Paper, Group, Button, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { InventoryList } from '@/components/dashboard/InventoryList';

export default function InventoryPage() {
  const router = useRouter();

  return (
    <Container fluid>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Equipment Inventory</Title>
          <Button 
            leftSection={<IconPlus size="1rem" />}
            onClick={() => router.push('/dashboard/inventory/new')}
          >
            Add Inventory Item
          </Button>
        </Group>
        
        <Paper withBorder p="md" radius="md" shadow="xs">
          <Text mb="md">
            View and manage all equipment and supplies in the SUNY Canton EMS inventory. 
            Keep track of quantities, expiration dates, and item status.
          </Text>
          <InventoryList />
        </Paper>
      </Stack>
    </Container>
  );
}