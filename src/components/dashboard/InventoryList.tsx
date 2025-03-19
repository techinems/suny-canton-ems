'use client';

import { useState, useEffect } from 'react';
import { 
  Badge, 
  Text
} from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { DataTable, Column, Action } from '@/components/DataTable';
import { InventoryItem, getInventoryItems, deleteInventoryItem } from '@/lib/client/inventoryService';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

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

export function InventoryList() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    async function loadInventory() {
      setLoading(true);
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

  const handleDeleteItem = async (item: InventoryItem) => {
    try {
      await deleteInventoryItem(item.id);
      notifications.show({
        title: 'Success',
        message: `${item.item_name} was deleted successfully`,
        color: 'green',
        autoClose: 5000,
      });
      setInventoryItems(inventoryItems.filter(i => i.id !== item.id));
    } catch {
      notifications.show({
        title: 'Error',
        message: `Failed to delete ${item.item_name}`,
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  const columns: Column<InventoryItem>[] = [
    {
      key: 'item_name',
      title: 'Item',
      render: (item) => (
        <div>
          <Text size="sm" fw={500}>{item.item_name}</Text>
          {item.manufacturer && (
            <Text size="xs" c="dimmed">{item.manufacturer}</Text>
          )}
        </div>
      )
    },
    {
      key: 'quantity',
      title: 'Quantity',
      render: (item) => <Text>{item.quantity}</Text>
    },
    {
      key: 'status',
      title: 'Status',
      render: (item) => {
        const status = getItemStatus(item);
        return (
          <Badge color={status.color}>{status.label}</Badge>
        );
      }
    },
    {
      key: 'expiration_date',
      title: 'Expiration Date',
      render: (item) => (
        <Text>
          {item.expiration_date 
            ? new Date(item.expiration_date).toLocaleDateString() 
            : 'N/A'
          }
        </Text>
      )
    },
    {
      key: 'description',
      title: 'Description',
      render: (item) => (
        <Text size="sm" lineClamp={2}>
          {item.description || 'No description'}
        </Text>
      )
    }
  ];

  const actions: Action<InventoryItem>[] = [
    {
      label: 'Edit Item',
      icon: <IconEdit size="1rem" />,
      href: (item) => `/dashboard/inventory/${item.id}`
    },
    {
      label: 'Delete Item',
      icon: <IconTrash size="1rem" />,
      color: 'red'
    }
  ];

  return (
    <DataTable<InventoryItem>
      data={inventoryItems}
      columns={columns}
      actions={actions}
      loading={loading}
      onRowClick={(item) => router.push(`/dashboard/inventory/${item.id}`)}
      emptyMessage="No inventory items found"
      confirmDelete={{
        title: 'Confirm Deletion',
        message: (item) => `Are you sure you want to delete ${item.item_name}? This action cannot be undone.`,
        onConfirm: handleDeleteItem
      }}
    />
  );
}