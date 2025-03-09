'use client';

import { Paper, Title, Stack, SimpleGrid } from '@mantine/core';
import { StatsCard } from './StatsCard';
import { IconPhone, IconClock, IconUsersGroup, IconCalendarStats } from '@tabler/icons-react';

interface CallStatsProps {
  totalCalls: number;
  callsThisMonth: number;
  avgResponseTime: string;
  activeMembers: number;
}

export function CallStats({
  totalCalls,
  callsThisMonth,
  avgResponseTime,
  activeMembers,
}: CallStatsProps) {
  return (
    <Paper withBorder p="md" radius="md" shadow="xs">
      <Stack gap="md">
        <Title order={3}>Call Statistics</Title>
        
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          <StatsCard
            title="Total Calls This Year"
            value={totalCalls}
            icon={IconCalendarStats}
            color="blue"
          />
          
          <StatsCard
            title="Calls This Month"
            value={callsThisMonth}
            icon={IconPhone}
            color="green"
          />
          
          <StatsCard
            title="Average Response Time"
            value={avgResponseTime}
            icon={IconClock}
            color="orange"
          />
          
          <StatsCard
            title="Active Members"
            value={activeMembers}
            icon={IconUsersGroup}
            color="violet"
          />
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}