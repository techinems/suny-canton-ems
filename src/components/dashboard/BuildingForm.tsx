'use client';

import { useState, useEffect } from 'react';
import { TextInput, Button, Stack, Paper, LoadingOverlay } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy } from '@tabler/icons-react';
import {
  getBuilding,
  createBuilding,
  updateBuilding,
} from '@/lib/client/buildingService';

interface BuildingFormProps {
  buildingId?: string;
  isEditing?: boolean;
}

export function BuildingForm({ buildingId, isEditing = false }: BuildingFormProps) {
  const [loading, setLoading] = useState<boolean>(isEditing);
  const router = useRouter();

  const form = useForm({
    initialValues: {
      name: '',
      address: '',
    },
    validate: {
      name: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Building name is required';
        }
        return null;
      },
      address: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Address is required';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (isEditing && buildingId) {
      loadBuilding();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingId, isEditing]);

  const loadBuilding = async () => {
    if (!buildingId) return;

    try {
      setLoading(true);
      const building = await getBuilding(buildingId);

      if (building) {
        form.setValues({
          name: building.name,
          address: building.address,
        });
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to load building',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      if (isEditing && buildingId) {
        await updateBuilding(buildingId, values);
        notifications.show({
          title: 'Success',
          message: 'Building updated successfully',
          color: 'green',
        });
      } else {
        await createBuilding(values);
        notifications.show({
          title: 'Success',
          message: 'Building created successfully',
          color: 'green',
        });
      }

      router.push('/dashboard/buildings');
      router.refresh();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save building',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder p="md" radius="md" shadow="xs" pos="relative">
      <LoadingOverlay visible={loading} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Building Name"
            placeholder="e.g., Whitaker Hall"
            required
            {...form.getInputProps('name')}
          />

          <TextInput
            label="Physical Address"
            placeholder="e.g., 34 Cornell Drive, Canton, NY 13617"
            required
            {...form.getInputProps('address')}
          />

          <Button
            type="submit"
            leftSection={<IconDeviceFloppy size="1rem" />}
            loading={loading}
          >
            {isEditing ? 'Update Building' : 'Create Building'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
