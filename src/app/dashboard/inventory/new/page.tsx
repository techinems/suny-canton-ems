'use client';

import { Title, Container, Stack, Paper, TextInput, NumberInput, Checkbox, Button, Group, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { createInventoryItem, InventoryItem } from '@/lib/client/inventoryService';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';

export default function NewInventoryItemPage() {
  const router = useRouter();

  const form = useForm({
    initialValues: {
      item_name: '',
      manufacturer: '',
      description: '',
      quantity: 1,
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

  const handleSubmit = async (values: typeof form.values) => {
    try {
      // Convert dates to ISO strings for PocketBase if they exist
      const itemToCreate: Omit<InventoryItem, 'id' | 'created' | 'updated'> = {
        ...values,
        manufacturing_date: values.manufacturing_date?.toISOString().split('T')[0] || undefined,
        purchase_date: values.purchase_date?.toISOString().split('T')[0] || undefined,
        expiration_date: values.expiration_date?.toISOString().split('T')[0] || undefined,
        price: values.price ?? undefined, // Convert null to undefined
      };

      await createInventoryItem(itemToCreate);
      
      notifications.show({
        title: 'Success',
        message: 'Inventory item created successfully',
        color: 'green',
      });
      
      // Redirect back to the inventory list
      router.push('/dashboard/inventory');
    } catch (error) {
      console.error('Error creating inventory item:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create inventory item',
        color: 'red',
      });
    }
  };

  return (
    <Container fluid>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={2}>Add New Inventory Item</Title>
          <Button 
            leftSection={<IconArrowLeft size="1rem" />}
            variant="outline"
            onClick={() => router.push('/dashboard/inventory')}
          >
            Back to Inventory
          </Button>
        </Group>
        
        <Paper withBorder p="md" radius="md" shadow="xs">
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
              
              <Group justify="flex-end" mt="xl">
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
                  Save Item
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
}