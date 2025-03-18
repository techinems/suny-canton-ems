'use client';

import { Title, Container, Stack, Paper, TextInput, NumberInput, Checkbox, Button, Group, Textarea, Alert, LoadingOverlay } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useRouter, useParams } from 'next/navigation';
import { getInventoryItem, updateInventoryItem, deleteInventoryItem, InventoryItem } from '@/lib/client/inventoryService';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconArrowLeft, IconDeviceFloppy, IconTrash, IconAlertCircle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export default function InventoryItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<InventoryItem | null>(null);

  const form = useForm({
    initialValues: {
      item_name: '',
      manufacturer: '',
      description: '',
      quantity: 0,
      size: '',
      manufacturing_date: null as Date | null,
      purchase_date: null as Date | null,
      price: null as number | null,
      paid_by: '',
      disposable: false,
      expiration_date: null as Date | null,
    },
    validate: {
      item_name: (value) => value.trim().length === 0 ? 'Item name is required' : null,
      quantity: (value) => value < 0 ? 'Quantity must be zero or positive' : null,
      price: (value) => value !== null && value < 0 ? 'Price cannot be negative' : null,
    }
  });

  useEffect(() => {
    async function loadItem() {
      try {
        setLoading(true);
        const loadedItem = await getInventoryItem(id);
        setItem(loadedItem);
        
        // Parse dates from strings to Date objects for form
        form.setValues({
          ...loadedItem,
          manufacturing_date: loadedItem.manufacturing_date ? new Date(loadedItem.manufacturing_date) : null,
          purchase_date: loadedItem.purchase_date ? new Date(loadedItem.purchase_date) : null,
          expiration_date: loadedItem.expiration_date ? new Date(loadedItem.expiration_date) : null,
        });
        
        setError(null);
      } catch (error) {
        console.error('Error loading inventory item:', error);
        setError('Failed to load inventory item. It might not exist or you may not have permission to view it.');
      } finally {
        setLoading(false);
      }
    }
    
    loadItem();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      // Convert dates to ISO strings for PocketBase if they exist
      const itemToUpdate: Partial<InventoryItem> = {
        ...values,
        manufacturing_date: values.manufacturing_date?.toISOString().split('T')[0] || undefined,
        purchase_date: values.purchase_date?.toISOString().split('T')[0] || undefined,
        expiration_date: values.expiration_date?.toISOString().split('T')[0] || undefined,
        price: values.price ?? undefined
      };

      await updateInventoryItem(id, itemToUpdate);
      notifications.show({
        title: 'Success',
        message: 'Inventory item updated successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Error updating inventory item:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update inventory item',
        color: 'red',
      });
    }
  };

  const openDeleteModal = () => {
    modals.openConfirmModal({
      title: 'Delete Inventory Item',
      children: `Are you sure you want to delete "${item?.item_name}"? This action cannot be undone.`,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteInventoryItem(id);
          notifications.show({
            title: 'Success',
            message: 'Inventory item deleted successfully',
            color: 'green',
          });
          router.push('/dashboard/inventory');
        } catch (error) {
          console.error('Error deleting inventory item:', error);
          notifications.show({
            title: 'Error',
            message: 'Failed to delete inventory item',
            color: 'red',
          });
        }
      },
    });
  };

  return (
    <Container fluid>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={2}>
            {loading ? 'Loading Inventory Item...' : item ? `Edit: ${item.item_name}` : 'Inventory Item'}
          </Title>
          <Button 
            leftSection={<IconArrowLeft size="1rem" />}
            variant="outline"
            onClick={() => router.push('/dashboard/inventory')}
          >
            Back to Inventory
          </Button>
        </Group>
        
        {error && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
            {error}
          </Alert>
        )}
        
        <Paper withBorder p="md" radius="md" shadow="xs" pos="relative">
          <LoadingOverlay visible={loading} />
          
          {!loading && !error && (
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Item Name"
                  placeholder="Enter item name"
                  required
                  {...form.getInputProps('item_name')}
                />
                
                <Group grow>
                  <TextInput
                    label="Manufacturer"
                    placeholder="Enter manufacturer"
                    {...form.getInputProps('manufacturer')}
                  />
                  
                  <TextInput
                    label="Size"
                    placeholder="Size or dimensions"
                    {...form.getInputProps('size')}
                  />
                </Group>
                
                <Textarea
                  label="Description"
                  placeholder="Enter item description"
                  {...form.getInputProps('description')}
                />
                
                <Group grow>
                  <NumberInput
                    label="Quantity"
                    placeholder="Enter quantity"
                    required
                    min={0}
                    {...form.getInputProps('quantity')}
                  />
                  
                  <NumberInput
                    label="Price"
                    placeholder="Enter price"
                    min={0}
                    prefix="$"
                    decimalScale={2}
                    fixedDecimalScale
                    {...form.getInputProps('price')}
                  />
                </Group>
                
                <Group grow>
                  <DateInput
                    label="Manufacturing Date"
                    placeholder="Select date"
                    clearable
                    {...form.getInputProps('manufacturing_date')}
                  />
                  
                  <DateInput
                    label="Purchase Date"
                    placeholder="Select date"
                    clearable
                    {...form.getInputProps('purchase_date')}
                  />
                </Group>
                
                <Group grow>
                  <DateInput
                    label="Expiration Date"
                    placeholder="Select date if applicable"
                    clearable
                    {...form.getInputProps('expiration_date')}
                  />
                  
                  <TextInput
                    label="Paid By"
                    placeholder="Department, grant name, etc."
                    {...form.getInputProps('paid_by')}
                  />
                </Group>
                
                <Checkbox
                  label="This is a disposable item"
                  {...form.getInputProps('disposable', { type: 'checkbox' })}
                />
                
                <Group justify="space-between" mt="xl">
                  <Button
                    color="red"
                    variant="outline"
                    leftSection={<IconTrash size="1rem" />}
                    onClick={openDeleteModal}
                  >
                    Delete Item
                  </Button>
                  
                  <Group>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/dashboard/inventory')}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      leftSection={<IconDeviceFloppy size="1rem" />}
                    >
                      Save Changes
                    </Button>
                  </Group>
                </Group>
              </Stack>
            </form>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}