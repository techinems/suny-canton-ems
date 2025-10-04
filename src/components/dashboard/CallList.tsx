'use client';

import { useState, useEffect } from 'react';
import { 
  Badge, 
  Text,
  Group
} from '@mantine/core';
import { IconEdit, IconTrash, IconClock } from '@tabler/icons-react';
import { DataTable, Column, Action } from '@/components/DataTable';
import { CallLog, getCallLogs, deleteCallLog } from '@/lib/client/callService';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

// Helper function to format date and time
const formatDateTime = (date: Date) => {
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper function to determine call status badge color
const getStatusColor = (status: string | null | undefined) => {
  switch(status) {
    case 'COMPLETE':
      return 'green';
    case 'CANCELLED_ENROUTE':
      return 'orange';
    default:
      return 'blue';
  }
};

// Helper function to format status for display
const formatStatus = (status: string | null | undefined) => {
  switch(status) {
    case 'COMPLETE':
      return 'Complete';
    case 'CANCELLED_ENROUTE':
      return 'Cancelled enroute';
    default:
      return 'In Progress';
  }
};

export function CallList() {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    async function loadCalls() {
      setLoading(true);
      try {
        const callData = await getCallLogs();
        setCalls(callData);
      } catch {
        notifications.show({
          title: 'Error',
          message: 'Failed to load call logs',
          color: 'red',
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    }

    loadCalls();
  }, []);

  const handleDeleteCall = async (call: CallLog) => {
    try {
      await deleteCallLog(call.id);
      notifications.show({
        title: 'Success',
        message: `Call at ${formatDateTime(call.callReceived)} was deleted successfully`,
        color: 'green',
        autoClose: 5000,
      });
      setCalls(calls.filter(c => c.id !== call.id));
    } catch {
      notifications.show({
        title: 'Error',
        message: `Failed to delete call`,
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  const columns: Column<CallLog>[] = [
    {
      key: 'date_time',
      title: 'Date & Time',
      render: (call) => (
        <div>
          <Group gap="xs">
            <IconClock size="1rem" />
            <Text size="sm" fw={500}>{formatDateTime(call.callReceived)}</Text>
          </Group>
          <Text size="xs" c="dimmed">On scene: {call.onScene.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </div>
      )
    },
    {
      key: 'location',
      title: 'Location',
      render: (call) => (
        <Text size="sm">
          {call.building ? call.building.name : call.location || 'N/A'}
        </Text>
      )
    },
    {
      key: 'type',
      title: 'Type',
      render: (call) => <Text size="sm">{call.type || 'N/A'}</Text>
    },
    {
      key: 'levelOfCare',
      title: 'Level of Care',
      render: (call) => <Text size="sm">{call.levelOfCare}</Text>
    },
    {
      key: 'status',
      title: 'Status',
      render: (call) => (
        <Badge color={getStatusColor(call.status)}>
          {formatStatus(call.status)}
        </Badge>
      )
    },
    {
      key: 'duration',
      title: 'Duration',
      render: (call) => {
        const start = call.callReceived;
        const end = call.backInService;
        const durationMs = end.getTime() - start.getTime();
        const minutes = Math.floor(durationMs / 60000);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        return (
          <Text size="sm">
            {hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`}
          </Text>
        );
      }
    }
  ];

  const actions: Action<CallLog>[] = [
    {
      label: 'Edit Call',
      icon: <IconEdit size="1rem" />,
      href: (call) => `/dashboard/calls/${call.id}`
    },
    {
      label: 'Delete Call',
      icon: <IconTrash size="1rem" />,
      color: 'red'
    }
  ];

  return (
    <DataTable<CallLog>
      data={calls}
      columns={columns}
      actions={actions}
      loading={loading}
      onRowClick={(call) => router.push(`/dashboard/calls/${call.id}`)}
      emptyMessage="No call logs found"
      confirmDelete={{
        title: 'Confirm Deletion',
        message: (call) => `Are you sure you want to delete this call log from ${formatDateTime(call.callReceived)}? This action cannot be undone.`,
        onConfirm: handleDeleteCall
      }}
    />
  );
}