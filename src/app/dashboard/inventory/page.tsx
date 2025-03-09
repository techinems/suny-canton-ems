'use client';

import { Title, Container, Stack, Paper, Table, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export default function InventoryPage() {
  // Sample inventory data - in a real app, this would come from your API
  const inventoryItems = [
    { id: '1', name: 'Pocket Mask', category: 'Airway', quantity: 15, status: 'In Stock' },
    { id: '2', name: 'Automated External Defibrillator', category: 'Cardiac', quantity: 3, status: 'In Stock' },
    { id: '3', name: 'Bag Valve Mask', category: 'Airway', quantity: 8, status: 'In Stock' },
    { id: '4', name: 'Oxygen Tank', category: 'Airway', quantity: 5, status: 'In Stock' },
    { id: '5', name: 'Emergency Blanket', category: 'General', quantity: 20, status: 'Low Stock' },
    { id: '6', name: 'Splint', category: 'Trauma', quantity: 12, status: 'In Stock' },
  ];

  const rows = inventoryItems.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>{item.name}</Table.Td>
      <Table.Td>{item.category}</Table.Td>
      <Table.Td>{item.quantity}</Table.Td>
      <Table.Td>{item.status}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Container fluid>
      <Stack gap="md">
        <Title order={2}>Equipment Inventory</Title>
        
        <Group justify="flex-end">
          <Button 
            leftSection={<IconPlus size="1rem" />}
          >
            Add Inventory Item
          </Button>
        </Group>
        
        <Paper withBorder p="md" radius="md" shadow="xs">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Quantity</Table.Th>
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