'use client';
import { useState, useEffect } from 'react';
import { 
  Text, 
  Group, 
  Stack, 
  Badge, 
  Skeleton, 
  Divider,
  UnstyledButton,
  Box,
} from '@mantine/core';
import { IconClock, IconMapPin, IconChevronRight } from '@tabler/icons-react';
import { CallLog, getCallLogs } from '@/lib/client/callService';
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

export function RecentCalls({ limit = 5 }: { limit?: number }) {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    async function loadRecentCalls() {
      setLoading(true);
      try {
        const callData = await getCallLogs();
        // Take only the most recent calls based on the limit
        setCalls(callData.slice(0, limit));
      } catch {
        notifications.show({
          title: 'Error',
          message: 'Failed to load recent calls',
          color: 'red',
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    }
    loadRecentCalls();
  }, [limit]);

  const handleCallClick = (callId: string) => {
    router.push(`/dashboard/calls/${callId}`);
  };

  if (loading) {
    return (
      <Stack>
        {Array(3).fill(0).map((_, index) => (
          <Skeleton key={index} height={80} radius="sm" />
        ))}
      </Stack>
    );
  }

  if (calls.length === 0) {
    return <Text c="dimmed">No recent calls found.</Text>;
  }

  return (
    <Stack gap="xs">
      {calls.map((call, index) => (
        <Box key={call.id}>
          <UnstyledButton 
            onClick={() => handleCallClick(call.id)}
            w="100%"
            px="xs"
            py="sm"
          >
            <Group justify="space-between" wrap="nowrap">
              <Stack gap={4} style={{ flexGrow: 1 }}>
                <Group gap="xs">
                  <IconClock size="1rem" />
                  <Text size="sm" fw={500}>{formatDateTime(call.callReceived)}</Text>
                  <Badge color={getStatusColor(call.status)} size="sm">
                    {formatStatus(call.status)}
                  </Badge>
                </Group>
                <Group gap="xs">
                  <IconMapPin size="1rem" style={{ minWidth: '1rem' }} />
                  <Text size="sm" truncate>
                    {call.building ? call.building.name : call.location || 'N/A'}
                  </Text>
                </Group>
              </Stack>
              <IconChevronRight size="1rem" opacity={0.5} />
            </Group>
          </UnstyledButton>
          {index < calls.length - 1 && <Divider my="xs" />}
        </Box>
      ))}
    </Stack>
  );
}