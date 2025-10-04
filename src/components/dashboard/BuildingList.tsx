'use client';

import { useState, useEffect } from 'react';
import { Text, Badge, Group } from '@mantine/core';
import { IconEdit, IconTrash, IconBuilding } from '@tabler/icons-react';
import { DataTable, Column, Action } from '@/components/DataTable';
import { Building, getBuildings, deleteBuilding } from '@/lib/client/buildingService';
import { notifications } from '@mantine/notifications';

export function BuildingList() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      setLoading(true);
      const data = await getBuildings();
      setBuildings(data);
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to load buildings',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBuilding = async (building: Building) => {
    try {
      await deleteBuilding(building.id);
      notifications.show({
        title: 'Success',
        message: `${building.name} was deleted successfully`,
        color: 'green',
      });
      setBuildings(buildings.filter((b) => b.id !== building.id));
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete building',
        color: 'red',
      });
    }
  };

  const columns: Column<Building>[] = [
    {
      key: 'name',
      title: 'Building Name',
      render: (building) => (
        <Group gap="xs">
          <IconBuilding size="1rem" />
          <Text size="sm" fw={500}>
            {building.name}
          </Text>
        </Group>
      ),
    },
    {
      key: 'address',
      title: 'Address',
      render: (building) => <Text size="sm">{building.address}</Text>,
    },
    {
      key: 'usage',
      title: 'Usage',
      render: (building) => (
        <Group gap="xs">
          {building._count && (
            <>
              <Badge color="blue" size="sm">
                {building._count.users} {building._count.users === 1 ? 'Member' : 'Members'}
              </Badge>
              <Badge color="green" size="sm">
                {building._count.callLogs} {building._count.callLogs === 1 ? 'Call' : 'Calls'}
              </Badge>
            </>
          )}
        </Group>
      ),
    },
  ];

  const actions: Action<Building>[] = [
    {
      icon: <IconEdit size="1rem" />,
      label: 'Edit',
      href: (building) => `/dashboard/buildings/${building.id}`,
    },
    {
      icon: <IconTrash size="1rem" />,
      label: 'Delete',
      color: 'red',
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={buildings}
      loading={loading}
      actions={actions}
      emptyMessage="No buildings found. Click 'Add Building' to create one."
      confirmDelete={{
        title: 'Confirm Deletion',
        message: (building) =>
          `Are you sure you want to delete ${building.name}? This action cannot be undone.`,
        onConfirm: handleDeleteBuilding,
      }}
    />
  );
}
