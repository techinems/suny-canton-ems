'use client';

import { Card, Group, Text, Stack, SimpleGrid, Badge, List, ThemeIcon, rem } from '@mantine/core';
import { IconPackages, IconAlertTriangle, IconClock, IconCalendarX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { getInventoryItems, InventoryItem } from '@/lib/client/inventoryService';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';

export function InventoryStats() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalQuantity: 0,
    lowStockItems: 0,
    expiringItems: 0,
    expiredItems: 0,
  });
  const router = useRouter();

  // Load inventory data
  useEffect(() => {
    async function loadInventoryData() {
      try {
        setLoading(true);
        const items = await getInventoryItems();
        setInventory(items);
        
        // Calculate stats
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        
        const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const lowStockItems = items.filter(item => item.quantity < 5 && item.quantity > 0).length;
        
        const expiringItems = items.filter(item => {
          if (!item.expiration_date) return false;
          const expDate = new Date(item.expiration_date);
          return expDate > today && expDate <= thirtyDaysFromNow;
        }).length;
        
        const expiredItems = items.filter(item => {
          if (!item.expiration_date) return false;
          return new Date(item.expiration_date) < today;
        }).length;
        
        setStats({
          totalItems: items.length,
          totalQuantity,
          lowStockItems,
          expiringItems,
          expiredItems,
        });
      } catch (error) {
        console.error('Failed to load inventory stats:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load inventory statistics',
          color: 'red',
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadInventoryData();
  }, []);
  
  // Get items that need attention (low stock, expiring soon, or expired)
  const getAttentionItems = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return inventory
      .filter(item => 
        (item.quantity < 5 && item.quantity > 0) || 
        (item.expiration_date && new Date(item.expiration_date) < thirtyDaysFromNow)
      )
      .slice(0, 5); // Limit to 5 items
  };
  
  const attentionItems = getAttentionItems();
  
  // Determine status and icon for an item
  const getItemStatus = (item: InventoryItem) => {
    const today = new Date();
    
    if (item.expiration_date && new Date(item.expiration_date) < today) {
      return { 
        label: 'Expired', 
        color: 'red',
        icon: <IconCalendarX style={{ width: rem(16), height: rem(16) }} />
      };
    }
    
    if (item.expiration_date) {
      const expDate = new Date(item.expiration_date);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      if (expDate <= thirtyDaysFromNow) {
        return { 
          label: 'Expiring Soon', 
          color: 'orange',
          icon: <IconClock style={{ width: rem(16), height: rem(16) }} />
        };
      }
    }
    
    if (item.quantity < 5 && item.quantity > 0) {
      return { 
        label: 'Low Stock', 
        color: 'yellow',
        icon: <IconAlertTriangle style={{ width: rem(16), height: rem(16) }} />
      };
    }
    
    return { 
      label: 'OK', 
      color: 'green',
      icon: <IconPackages style={{ width: rem(16), height: rem(16) }} />
    };
  };

  return (
    <Card withBorder p="md" radius="md" shadow="sm">
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Text fw={500}>Inventory Overview</Text>
          <Badge
            color={stats.lowStockItems > 0 || stats.expiringItems > 0 ? 'red' : 'green'}
            variant="light"
          >
            {stats.lowStockItems > 0 || stats.expiringItems > 0 
              ? `${stats.lowStockItems + stats.expiringItems} need attention`
              : 'All Good'}
          </Badge>
        </Group>
      </Card.Section>

      <SimpleGrid cols={{base: 2, sm: 4}} mt="md">
        <Stack gap="xs" align="center">
          <Text size="xs" c="dimmed">Total Items</Text>
          <Text fw={700} size="xl">{stats.totalItems}</Text>
        </Stack>
        
        <Stack gap="xs" align="center">
          <Text size="xs" c="dimmed">Total Quantity</Text>
          <Text fw={700} size="xl">{stats.totalQuantity}</Text>
        </Stack>
        
        <Stack gap="xs" align="center">
          <Text size="xs" c="dimmed">Low Stock</Text>
          <Text fw={700} size="xl" c={stats.lowStockItems > 0 ? 'red' : undefined}>{stats.lowStockItems}</Text>
        </Stack>
        
        <Stack gap="xs" align="center">
          <Text size="xs" c="dimmed">Expiring Soon</Text>
          <Text fw={700} size="xl" c={stats.expiringItems > 0 ? 'orange' : undefined}>{stats.expiringItems}</Text>
        </Stack>
      </SimpleGrid>
      
      {attentionItems.length > 0 && (
        <Stack mt="md">
          <Text size="sm" fw={500}>Items Needing Attention:</Text>
          <List spacing="xs" size="sm" center>
            {attentionItems.map((item) => {
              const status = getItemStatus(item);
              return (
                <List.Item 
                  key={item.id}
                  icon={
                    <ThemeIcon color={status.color} size={24} variant="light">
                      {status.icon}
                    </ThemeIcon>
                  }
                  onClick={() => router.push(`/dashboard/inventory/${item.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Text size="sm">{item.item_name}</Text>
                    <Badge color={status.color} variant="light" size="sm">
                      {status.label}
                    </Badge>
                  </Group>
                </List.Item>
              );
            })}
          </List>
          
          {inventory.length > 5 && (
            <Text 
              size="xs" 
              c="dimmed" 
              mt={5} 
              style={{ cursor: 'pointer' }}
              onClick={() => router.push('/dashboard/inventory')}
            >
              View all inventory items →
            </Text>
          )}
        </Stack>
      )}

      {loading && <Text size="sm" c="dimmed" ta="center" mt="md">Loading inventory data...</Text>}
    </Card>
  );
}