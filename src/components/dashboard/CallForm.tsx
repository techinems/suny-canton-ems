import { Paper, TextInput, Button, Group, Textarea, Alert, LoadingOverlay, Stack, Checkbox, Select, MultiSelect } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { getCallLog, updateCallLog, createCallLog } from '@/lib/client/callService';
import { getInventoryItems } from '@/lib/client/inventoryService';
import { getAllMembers, Member } from '@/lib/client/memberService';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

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

  const form = useForm({
    initialValues: {
      call_received: new Date(),
      call_enroute: new Date(),
      on_scene: new Date(),
      back_in_service: new Date(),
      level_of_care: 'EMT' as 'EMT' | 'None',
      dispatch_info: '',
      location: '',
      jumpbag_used: false,
      type: undefined as 'Standby' | undefined,
      items_used: [] as string[],
      crew: [] as string[],
      comments: '',
      status: undefined as 'Cancelled enroute' | 'Complete' | undefined,
    },
    validate: {
      location: (value) => value.trim().length === 0 ? 'Location is required' : null,
      call_received: (value) => value ? null : 'Call received time is required',
      call_enroute: (value) => value ? null : 'Call enroute time is required',
      on_scene: (value) => value ? null : 'On scene time is required',
      back_in_service: (value) => value ? null : 'Back in service time is required',
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
          ...loadedCall,
          call_received: new Date(loadedCall.call_received),
          call_enroute: new Date(loadedCall.call_enroute),
          on_scene: new Date(loadedCall.on_scene),
          back_in_service: new Date(loadedCall.back_in_service),
          items_used: loadedCall.items_used || [],
          crew: loadedCall.crew || [],
        });
        
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
        setInventoryItems(items.map(item => ({
          value: item.id,
          label: item.item_name
        })));
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

  const handleSubmit = async (values: typeof form.values) => {
    try {
      // Convert dates to ISO strings for PocketBase
      const callData = {
        ...values,
        call_received: values.call_received.toISOString(),
        call_enroute: values.call_enroute.toISOString(),
        on_scene: values.on_scene.toISOString(),
        back_in_service: values.back_in_service.toISOString(),
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
                {...form.getInputProps('call_received')}
              />
              
              <DateTimePicker
                label="Enroute"
                placeholder="Select date and time"
                required
                clearable={false}
                {...form.getInputProps('call_enroute')}
              />
            </Group>
            
            <Group grow>
              <DateTimePicker
                label="On Scene"
                placeholder="Select date and time"
                required
                clearable={false}
                {...form.getInputProps('on_scene')}
              />
              
              <DateTimePicker
                label="Back in Service"
                placeholder="Select date and time"
                required
                clearable={false}
                {...form.getInputProps('back_in_service')}
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
                {...form.getInputProps('level_of_care')}
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
                {...form.getInputProps('jumpbag_used', { type: 'checkbox' })}
              />
            </Group>
            
            <TextInput
              label="Dispatch Information"
              placeholder="Enter dispatch information"
              {...form.getInputProps('dispatch_info')}
            />
            
            <MultiSelect
              label="Items Used"
              placeholder="Select items used during the call"
              data={inventoryItems}
              searchable
              clearable
              {...form.getInputProps('items_used')}
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