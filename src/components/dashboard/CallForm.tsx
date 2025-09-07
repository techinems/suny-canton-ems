import { Paper, TextInput, Button, Group, Textarea, Alert, LoadingOverlay, Stack, Checkbox, Select, MultiSelect } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { getCallLog, updateCallLog, createCallLog } from '@/lib/client/callService';
import { getInventoryItems, getInventoryItem, InventoryItem } from '@/lib/client/inventoryService';
import { getAllMembers, Member } from '@/lib/client/memberService';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { InventoryItemsSelector, ItemWithQuantity } from './InventoryItemsSelector';

interface CallFormProps {
  callId?: string;
  isEditing?: boolean;
}

export function CallForm({ callId, isEditing = false }: CallFormProps) {
  const router = useRouter();
  
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [inventoryItems, setInventoryItems] = useState<{value: string, label: string}[]>([]);
  const [members, setMembers] = useState<{value: string, label: string}[]>([]);
  const [selectedItemsWithQuantities, setSelectedItemsWithQuantities] = useState<ItemWithQuantity[]>([]);
  const [inventoryItemsMap, setInventoryItemsMap] = useState<Record<string, InventoryItem>>({});
  // Track if we've already updated the form to prevent loops
  const hasUpdatedForm = useRef(false);
  // Current date to use as maxDate for DateTimePicker components
  const today = new Date();

  const form = useForm({
    initialValues: {
      callReceived: new Date(),
      callEnroute: new Date(),
      onScene: new Date(),
      backInService: new Date(),
      levelOfCare: 'EMT' as 'EMT' | 'None',
      dispatchInfo: '',
      location: '',
      jumpbagUsed: false,
      type: undefined as 'Standby' | undefined,
      itemsUsed: [] as string[],
      crew: [] as string[],
      comments: '',
      status: undefined as 'Cancelled enroute' | 'Complete' | undefined,
      // We'll keep the original itemsUsed for compatibility, but use our ItemWithQuantity UI
      itemsWithQuantities: [] as ItemWithQuantity[],
    },
    validate: {
      location: (value) => value.trim().length === 0 ? 'Location is required' : null,
      callReceived: (value) => {
        if (!value) return 'Call received time is required';
      },
      callEnroute: (value, values) => {
        if (!value) return 'Call enroute time is required';
        if (values.callReceived && value < values.callReceived) 
          return 'Call enroute time must be after call received time';
        return null;
      },
      onScene: (value, values) => {
        if (!value) return 'On scene time is required';
        if (values.callEnroute && value < values.callEnroute) 
          return 'On scene time must be after call enroute time';
        return null;
      },
      backInService: (value, values) => {
        if (!value) return 'Back in service time is required';
        if (values.onScene && value < values.onScene) 
          return 'Back in service time must be after on scene time';
        return null;
      },
    }
  });

  useEffect(() => {
    async function loadCall() {
      if (!isEditing || !callId) return;
      
      try {
        setLoading(true);
        const loadedCall = await getCallLog(callId);
        
        // Parse dates from strings to Date objects for form
        form.setValues({
          callReceived: new Date(loadedCall.callReceived),
          callEnroute: new Date(loadedCall.callEnroute),
          onScene: new Date(loadedCall.onScene),
          backInService: new Date(loadedCall.backInService),
          levelOfCare: loadedCall.levelOfCare,
          dispatchInfo: loadedCall.dispatchInfo || '',
          location: loadedCall.location,
          jumpbagUsed: loadedCall.jumpbagUsed || false,
          type: loadedCall.type || undefined,
          itemsUsed: loadedCall.itemsUsed || [],
          crew: loadedCall.crew || [],
          comments: loadedCall.comments || '',
          status: loadedCall.status || undefined,
          itemsWithQuantities: [],
        });
        
        // If there are items used, load their details for the quantity interface
        if (loadedCall.itemsUsed && loadedCall.itemsUsed.length > 0) {
          const itemsWithQuantities: ItemWithQuantity[] = [];
          const itemCounts: Record<string, number> = {};
          
          // Count occurrences of each item ID to determine quantities
          for (const itemId of loadedCall.itemsUsed) {
            if (itemId) {
              itemCounts[itemId] = (itemCounts[itemId] || 0) + 1;
            }
          }
          
          // For each unique item ID, fetch the item details and create an entry with the counted quantity
          for (const itemId of Object.keys(itemCounts)) {
            try {
              const item = await getInventoryItem(itemId);
              itemsWithQuantities.push({
                itemId,
                quantity: itemCounts[itemId], // Use the counted quantity
                itemName: item.itemName || 'Unknown Item',
                maxQuantity: item.quantity + itemCounts[itemId] // Add the used quantity back to max
              });
            } catch (error) {
              console.error(`Error loading item details for ${itemId}:`, error);
            }
          }
          
          setSelectedItemsWithQuantities(itemsWithQuantities);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error loading call log:', error);
        setError('Failed to load call log. It might not exist or you may not have permission to view it.');
      } finally {
        setLoading(false);
      }
    }

    async function loadInventoryItems() {
      try {
        const items = await getInventoryItems();
        setInventoryItems(items.map((item: InventoryItem) => ({
          value: item.id,
          label: item.itemName || 'Unknown Item'
        })));
        const itemsMap = items.reduce((acc: Record<string, InventoryItem>, item: InventoryItem) => {
          acc[item.id] = item;
          return acc;
        }, {} as Record<string, InventoryItem>);
        setInventoryItemsMap(itemsMap);
      } catch (error) {
        console.error('Error loading inventory items:', error);
      }
    }

    async function loadMembers() {
      try {
        const membersList = await getAllMembers();
        setMembers(membersList.map((member: Member) => ({
          value: member.id,
          label: `${member.first_name} ${member.last_name}`
        })));
      } catch (error) {
        console.error('Error loading members:', error);
      }
    }
    
    loadCall();
    loadInventoryItems();
    loadMembers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId, isEditing]);

  // Update the form data with the items with quantities information only when needed
  useEffect(() => {
    // Skip updates if there's no change or we're in initial loading
    if (loading || hasUpdatedForm.current) return;
    
    // Set flag to prevent multiple updates in the same cycle
    hasUpdatedForm.current = true;
    
    // Schedule the form update in the next tick to avoid update loops
    const timeoutId = setTimeout(() => {
      form.setFieldValue('itemsWithQuantities', selectedItemsWithQuantities);
      hasUpdatedForm.current = false;
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [selectedItemsWithQuantities, form, loading]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      // Get our item quantities data
      const itemsWithQuantities = values.itemsWithQuantities || [];
      
      // For each item with quantity, we need to create multiple entries in the items_used array
      // This allows us to store quantity information using the existing schema
      // For example, if we used 3 of item "123", we'll have ["123", "123", "123"] in the items_used array
      const expandedItemsUsed: string[] = [];
      itemsWithQuantities.forEach(item => {
        // Add the item ID to the array as many times as the quantity indicates
        for (let i = 0; i < item.quantity; i++) {
          expandedItemsUsed.push(item.itemId);
        }
      });

      // Convert dates for API call
      const callData = {
        ...values,
        callReceived: values.callReceived,
        callEnroute: values.callEnroute,
        onScene: values.onScene,
        backInService: values.backInService,
        // Use the expanded array that contains item IDs repeated based on quantity
        itemsUsed: expandedItemsUsed,
      };

      if (isEditing && callId) {
        await updateCallLog(callId, callData);
        notifications.show({
          title: 'Success',
          message: 'Call log updated successfully',
          color: 'green',
        });
      } else {
        await createCallLog(callData);
        notifications.show({
          title: 'Success',
          message: 'Call log created successfully',
          color: 'green',
        });
        router.push('/dashboard/calls');
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} call log:`, error);
      notifications.show({
        title: 'Error',
        message: `Failed to ${isEditing ? 'update' : 'create'} call log`,
        color: 'red',
      });
    }
  };

  const handleItemsChange = useCallback((items: string[]) => {
    form.setFieldValue('itemsUsed', items);
  }, [form]);

  const handleItemsWithQuantitiesChange = useCallback((items: ItemWithQuantity[]) => {
    // Compare current items with new items to avoid unnecessary updates
    const currentIds = new Set(selectedItemsWithQuantities.map(item => `${item.itemId}-${item.quantity}`));
    const newIds = new Set(items.map(item => `${item.itemId}-${item.quantity}`));
    
    // Check if the sets are different
    let needsUpdate = currentIds.size !== newIds.size;
    if (!needsUpdate) {
      for (const id of currentIds) {
        if (!newIds.has(id)) {
          needsUpdate = true;
          break;
        }
      }
    }
    
    // Only update state if there's an actual change
    if (needsUpdate) {
      setSelectedItemsWithQuantities(items);
    }
  }, [selectedItemsWithQuantities]);

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
              label="Location"
              placeholder="Enter call location"
              required
              {...form.getInputProps('location')}
            />
            
            <Group grow>
              <DateTimePicker
                label="Call Received"
                placeholder="Select date and time"
                required
                clearable={false}
                maxDate={today}
                {...form.getInputProps('callReceived')}
              />
              
              <DateTimePicker
                label="Enroute"
                placeholder="Select date and time"
                required
                clearable={false}
                maxDate={today}
                {...form.getInputProps('callEnroute')}
              />
            </Group>
            
            <Group grow>
              <DateTimePicker
                label="On Scene"
                placeholder="Select date and time"
                required
                clearable={false}
                maxDate={today}
                {...form.getInputProps('onScene')}
              />
              
              <DateTimePicker
                label="Back in Service"
                placeholder="Select date and time"
                required
                clearable={false}
                maxDate={today}
                {...form.getInputProps('backInService')}
              />
            </Group>
            
            <Group grow>
              <Select
                label="Level of Care"
                placeholder="Select level of care"
                required
                data={[
                  { value: 'EMT', label: 'EMT' },
                  { value: 'None', label: 'None' }
                ]}
                {...form.getInputProps('levelOfCare')}
              />
              
              <Select
                label="Call Type"
                placeholder="Select call type"
                data={[
                  { value: 'Standby', label: 'Standby' }
                ]}
                clearable
                {...form.getInputProps('type')}
              />
            </Group>
            
            <Group grow>
              <Select
                label="Status"
                placeholder="Select call status"
                data={[
                  { value: 'Complete', label: 'Complete' },
                  { value: 'Cancelled enroute', label: 'Cancelled enroute' }
                ]}
                clearable
                {...form.getInputProps('status')}
              />
              
              <Checkbox
                label="Jump bag used"
                mt="md"
                {...form.getInputProps('jumpbagUsed', { type: 'checkbox' })}
              />
            </Group>
            
            <TextInput
              label="Dispatch Information"
              placeholder="Enter dispatch information"
              {...form.getInputProps('dispatchInfo')}
            />
            
            <InventoryItemsSelector
              inventoryItems={inventoryItems}
              inventoryItemsMap={inventoryItemsMap}
              selectedItemIds={form.values.itemsUsed}
              onItemsChange={handleItemsChange}
              onItemsWithQuantitiesChange={handleItemsWithQuantitiesChange}
            />
            
            <MultiSelect
              label="Crew Members"
              placeholder="Select crew members on the call"
              data={members}
              searchable
              clearable
              {...form.getInputProps('crew')}
            />
            
            <Textarea
              label="Comments"
              placeholder="Enter any additional comments"
              minRows={3}
              {...form.getInputProps('comments')}
            />
            
            <Group justify="flex-end" mt="xl">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/calls')}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                leftSection={<IconDeviceFloppy size="1rem" />}
              >
                {isEditing ? 'Save Changes' : 'Save Call'}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Paper>
  );
}