import { Paper, TextInput, NumberInput, Checkbox, Button, Group, Textarea, Alert, LoadingOverlay, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { getInventoryItem, updateInventoryItem, createInventoryItem } from '@/lib/client/inventoryService';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface InventoryFormProps {
  inventoryId?: string;
  isEditing?: boolean;
}

export function InventoryForm({ inventoryId, isEditing = false }: InventoryFormProps) {
  const router = useRouter();
  
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      item_name: '',
      manufacturer: '',
      description: '',
      quantity: isEditing ? 0 : 1,
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
      if (!isEditing || !inventoryId) return;
      
      try {
        setLoading(true);
        const loadedItem = await getInventoryItem(inventoryId);
        
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
  }, [inventoryId, isEditing]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      // Convert dates to ISO strings for PocketBase if they exist
      const itemData = {
        ...values,
        manufacturing_date: values.manufacturing_date?.toISOString().split('T')[0] || undefined,
        purchase_date: values.purchase_date?.toISOString().split('T')[0] || undefined,
        expiration_date: values.expiration_date?.toISOString().split('T')[0] || undefined,
        price: values.price ?? undefined
      };

      if (isEditing && inventoryId) {
        await updateInventoryItem(inventoryId, itemData);
        notifications.show({
          title: 'Success',
          message: 'Inventory item updated successfully',
          color: 'green',
        });
      } else {
        await createInventoryItem(itemData);
        notifications.show({
          title: 'Success',
          message: 'Inventory item created successfully',
          color: 'green',
        });
        router.push('/dashboard/inventory');
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} inventory item:`, error);
      notifications.show({
        title: 'Error',
        message: `Failed to ${isEditing ? 'update' : 'create'} inventory item`,
        color: 'red',
      });
    }
  };

  return (
    <Paper withBorder p="md" radius="md" shadow="xs" pos="relative">
      <LoadingOverlay visible={loading} />
      
      {error && (
        <Alert title="Error" color="red" mb="md">
          {error}
        </Alert>
      )}
      
      {(!loading || !isEditing) && (
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
                {isEditing ? 'Save Changes' : 'Save Item'}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Paper>
  );
}