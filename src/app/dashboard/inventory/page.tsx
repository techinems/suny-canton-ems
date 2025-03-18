'use client';

import { Title, Container, Stack, Paper, Table, Group, Button, Badge } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { getInventoryItems, InventoryItem } from '@/lib/client/inventoryService';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadInventory() {
      try {
        const items = await getInventoryItems();
        setInventoryItems(items);
      } catch {
        notifications.show({
          title: 'Error',
          message: 'Failed to load inventory items',
          color: 'red',
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    }

    loadInventory();
  }, []);

  // Helper function to determine status based on quantity and expiration date
  const getItemStatus = (item: InventoryItem) => {
    if (item.quantity <= 0) {
      return { label: 'Out of Stock', color: 'red' };
    }
    
    if (item.expiration_date) {
      const expirationDate = new Date(item.expiration_date);
      const today = new Date();
      
      // Check if expired
      if (expirationDate < today) {
        return { label: 'Expired', color: 'red' };
      }
      
      // Check if expiring soon (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      if (expirationDate < thirtyDaysFromNow) {
        return { label: 'Expiring Soon', color: 'orange' };
      }
    }
    
    // Check if low stock (less than 5 items)
    if (item.quantity < 5) {
      return { label: 'Low Stock', color: 'yellow' };
    }
    
    return { label: 'In Stock', color: 'green' };
  };

  const rows = inventoryItems.map((item) => {
    const status = getItemStatus(item);
    
    return (
      <Table.Tr key={item.id} onClick={() => router.push(`/dashboard/inventory/${item.id}`)} style={{ cursor: 'pointer' }}>
        <Table.Td>{item.item_name}</Table.Td>
        <Table.Td>{item.manufacturer || 'N/A'}</Table.Td>
        <Table.Td>{item.quantity}</Table.Td>
        <Table.Td>
          <Badge color={status.color}>{status.label}</Badge>
        </Table.Td>
        <Table.Td>{item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : 'N/A'}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Container fluid>
      <Stack gap="md">
        <Title order={2}>Equipment Inventory</Title>
        
        <Group justify="flex-end">
          <Button 
            leftSection={<IconPlus size="1rem" />}
            onClick={() => router.push('/dashboard/inventory/new')}
          >
            Add Inventory Item
          </Button>
        </Group>
        
        <Paper withBorder p="md" radius="md" shadow="xs">
          {loading ? (
            <div>Loading inventory...</div>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Item</Table.Th>
                  <Table.Th>Manufacturer</Table.Th>
                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Expiration Date</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}