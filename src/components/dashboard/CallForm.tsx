'use client';

import { useState } from 'react';
import { 
  TextInput, 
  Textarea, 
  Button, 
  Group, 
  Select, 
  Paper, 
  Title, 
  Stack, 
  NumberInput,
  Notification
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconCalendar, IconClock } from '@tabler/icons-react';

// Note: To use DatePicker, you need to install @mantine/dates:
// npm install @mantine/dates dayjs

const CALL_TYPES = [
  { value: 'medical', label: 'Medical Emergency' },
  { value: 'trauma', label: 'Trauma' },
  { value: 'transport', label: 'Transport' },
  { value: 'standby', label: 'Standby' },
  { value: 'other', label: 'Other' }
];

const PRIORITY_LEVELS = [
  { value: '1', label: '1 - Critical' },
  { value: '2', label: '2 - Urgent' },
  { value: '3', label: '3 - Non-urgent' },
  { value: '4', label: '4 - Minor' }
];

export function CallForm() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    initialValues: {
      callType: '',
      priorityLevel: '',
      location: '',
      patientName: '',
      patientAge: null as number | null,
      chiefComplaint: '',
      description: '',
      callDateTime: new Date(),
    },
    validate: {
      callType: (value) => !value ? 'Call type is required' : null,
      priorityLevel: (value) => !value ? 'Priority level is required' : null,
      location: (value) => !value ? 'Location is required' : null,
      chiefComplaint: (value) => !value ? 'Chief complaint is required' : null,
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    // Here you would typically send this data to your API
    console.log('Form submitted with values:', values);
    
    // Show success notification
    setSubmitted(true);
    
    // Reset form after a short delay
    setTimeout(() => {
      form.reset();
      setSubmitted(false);
    }, 3000);
  };

  return (
    <Paper withBorder p="md" radius="md" shadow="xs">
      <Stack>
        <Title order={3}>Create New Call</Title>

        {submitted && (
          <Notification
            icon={<IconCheck size="1.2rem" />}
            color="green"
            title="Call Created"
            onClose={() => setSubmitted(false)}
          >
            The call has been successfully created
          </Notification>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {/* Temporarily using a simple input while @mantine/dates is not available */}
            <TextInput
              label="Call Date & Time"
              placeholder="Select date and time"
              leftSection={<IconCalendar size="1rem" />}
              rightSection={<IconClock size="1rem" />}
              {...form.getInputProps('callDateTime')}
              required
            />
            
            <Group grow>
              <Select
                label="Call Type"
                placeholder="Select call type"
                data={CALL_TYPES}
                {...form.getInputProps('callType')}
                required
              />
              
              <Select
                label="Priority Level"
                placeholder="Select priority"
                data={PRIORITY_LEVELS}
                {...form.getInputProps('priorityLevel')}
                required
              />
            </Group>
            
            <TextInput
              label="Location"
              placeholder="Enter call location"
              {...form.getInputProps('location')}
              required
            />
            
            <Group grow>
              <TextInput
                label="Patient Name"
                placeholder="Enter patient name (if known)"
                {...form.getInputProps('patientName')}
              />
              
              <NumberInput
                label="Patient Age"
                placeholder="Enter patient age"
                {...form.getInputProps('patientAge')}
                min={0}
                max={120}
              />
            </Group>
            
            <TextInput
              label="Chief Complaint"
              placeholder="Enter chief complaint"
              {...form.getInputProps('chiefComplaint')}
              required
            />
            
            <Textarea
              label="Description"
              placeholder="Enter detailed description of the call"
              rows={4}
              {...form.getInputProps('description')}
            />
            
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit">
                Create Call
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}