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
      itemName: '',
      manufacturer: '',
      description: '',
      quantity: isEditing ? 0 : 1,
      size: '',
      manufacturingDate: null as Date | null,
      purchaseDate: null as Date | null,
      price: null as number | null,
      paidBy: '',
      disposable: false,
      expirationDate: null as Date | null,
    },
    validate: {
      itemName: (value) => value.trim().length === 0 ? 'Item name is required' : null,
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
          itemName: loadedItem.itemName || '',
          manufacturer: loadedItem.manufacturer || '',
          description: loadedItem.description || '',
          quantity: loadedItem.quantity,
          size: loadedItem.size || '',
          manufacturingDate: loadedItem.manufacturingDate ? new Date(loadedItem.manufacturingDate) : null,
          purchaseDate: loadedItem.purchaseDate ? new Date(loadedItem.purchaseDate) : null,
          price: loadedItem.price,
          paidBy: loadedItem.paidBy || '',
          disposable: loadedItem.disposable || false,
          expirationDate: loadedItem.expirationDate ? new Date(loadedItem.expirationDate) : null,
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
      // Convert dates to Date objects for the API
      const itemData = {
        itemName: values.itemName,
        manufacturer: values.manufacturer || null,
        description: values.description || null,
        quantity: values.quantity,
        size: values.size || null,
        manufacturingDate: values.manufacturingDate,
        purchaseDate: values.purchaseDate,
        price: values.price,
        paidBy: values.paidBy || null,
        disposable: values.disposable,
        expirationDate: values.expirationDate,
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
              {...form.getInputProps('itemName')}
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
                {...form.getInputProps('manufacturingDate')}
              />
              
              <DateInput
                label="Purchase Date"
                placeholder="Select date"
                clearable
                {...form.getInputProps('purchaseDate')}
              />
            </Group>
            
            <Group grow>
              <DateInput
                label="Expiration Date"
                placeholder="Select date if applicable"
                clearable
                {...form.getInputProps('expirationDate')}
              />
              
              <TextInput
                label="Paid By"
                placeholder="Department, grant name, etc."
                {...form.getInputProps('paidBy')}
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