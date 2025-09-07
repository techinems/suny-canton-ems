'use client';

import { useEffect, useState } from 'react';
import { SimpleGrid, Paper, Text, Group, Stack, Loader, Center } from '@mantine/core';
import { IconClock, IconCalendarStats, IconMapPin, IconRun } from '@tabler/icons-react';
import { getCallLogs } from '@/lib/client/callService';
import { pluralize } from '@/lib/utils';

export function CallStats() {
  const [stats, setStats] = useState({
    callsThisYear: 0,
    callsThisMonth: 0,
    averageResponseTime: 0,
    averageDuration: 0,
    locations: {} as Record<string, number>,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateStats = async () => {
      try {
        setIsLoading(true);
        const calls = await getCallLogs();
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        // Filter calls for current year and month
        const callsThisYear = calls.filter(call => {
          const callDate = call.callReceived;
          return callDate.getFullYear() === currentYear;
        });
        
        const callsThisMonth = callsThisYear.filter(call => {
          const callDate = call.callReceived;
          return callDate.getMonth() === currentMonth;
        });
        
        // Calculate total calls
        const totalCallsThisYear = callsThisYear.length;
        const totalCallsThisMonth = callsThisMonth.length;
        
        // Calculate average response time and duration
        let totalResponseTimeMinutes = 0;
        let totalDurationMinutes = 0;
        const locations: Record<string, number> = {};
        
        calls.forEach(call => {
          // Response time calculation (from call received to on scene)
          if (call.callReceived && call.onScene) {
            const receivedTime = call.callReceived;
            const onSceneTime = call.onScene;
            const responseTimeMinutes = (onSceneTime.getTime() - receivedTime.getTime()) / 60000;
            
            if (responseTimeMinutes > 0) {
              totalResponseTimeMinutes += responseTimeMinutes;
            }
          }
          
          // Duration calculation (from call received to back in service)
          if (call.callReceived && call.backInService) {
            const start = call.callReceived;
            const end = call.backInService;
            const durationMinutes = (end.getTime() - start.getTime()) / 60000;
            
            if (durationMinutes > 0) {
              totalDurationMinutes += durationMinutes;
            }
          }
          
          // Count locations
          if (call.location) {
            locations[call.location] = (locations[call.location] || 0) + 1;
          }
        });
        
        const validResponseTimes = calls.filter(call => call.callReceived && call.onScene).length;
        const validDurations = calls.filter(call => call.callReceived && call.backInService).length;
        
        const averageResponseTime = validResponseTimes > 0 ? Math.round(totalResponseTimeMinutes / validResponseTimes) : 0;
        const averageDuration = validDurations > 0 ? Math.round(totalDurationMinutes / validDurations) : 0;
        
        setStats({
          callsThisYear: totalCallsThisYear,
          callsThisMonth: totalCallsThisMonth,
          averageResponseTime,
          averageDuration,
          locations,
        });
      } catch (error) {
        console.error('Error calculating call stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    calculateStats();
  }, []);

  // Get the top 5 most common locations
  const topLocations = Object.entries(stats.locations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([location, count]) => ({ location, count }));

  if (isLoading) {
    return (
      <Center h={100}>
        <Loader />
      </Center>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
      <Paper withBorder radius="md" p="md">
        <Group>
          <IconCalendarStats size={30} stroke={1.5} />
          <div>
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">Calls This Year</Text>
            <Text fw={700} size="xl">{stats.callsThisYear}</Text>
          </div>
        </Group>
        <Text size="xs" mt="md" c="dimmed">
          <Text component="span" fw={700}>
            {stats.callsThisMonth} {pluralize(stats.callsThisMonth, 'call')}
          </Text>{" "}
          in the current month
        </Text>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <Group>
          <IconRun size={30} stroke={1.5} />
          <div>
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">Avg Response Time</Text>
            <Text fw={700} size="xl">
              {stats.averageResponseTime} min
            </Text>
          </div>
        </Group>
        <Text size="xs" mt="md" c="dimmed">
          Average time from call receipt to on scene
        </Text>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <Group>
          <IconClock size={30} stroke={1.5} />
          <div>
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">Avg Duration</Text>
            <Text fw={700} size="xl">
              {stats.averageDuration} min
            </Text>
          </div>
        </Group>
        <Text size="xs" mt="md" c="dimmed">
          Average time from call receipt to back in service
        </Text>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <Group>
          <IconMapPin size={30} stroke={1.5} />
          <div>
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">Top Locations</Text>
            <Stack gap={5} mt={5}>
              {topLocations.length > 0 ? (
                topLocations.map((loc, index) => (
                  <Group key={index} gap={3}>
                    <Text size="sm" truncate>
                      {loc.location}
                    </Text>
                    <Text size="xs" c="dimmed">
                      ({loc.count})
                    </Text>
                  </Group>
                ))
              ) : (
                <Text size="sm">No data</Text>
              )}
            </Stack>
          </div>
        </Group>
      </Paper>
    </SimpleGrid>
  );
}