'use client';
import { Title, Container, Stack, Grid, Box, Paper, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { CallStats } from '@/components/dashboard/CallStats';
import { useAuth } from '@/components/auth/AuthContext';
import { InventoryStats } from '@/components/dashboard/InventoryStats';
import { CertificationAlerts } from '@/components/dashboard/CertificationAlerts';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  
  // Sample data for demo purposes
  const callStats = {
    totalCalls: 143,
    callsThisMonth: 12,
    avgResponseTime: '4m 37s',
    activeMembers: 15,
  };

  return (
    <Container fluid>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>EMS Dashboard</Title>
          {user && (
            <Box>Welcome, {user.first_name || user.email}</Box>
          )}
        </Group>
        <Stack gap="xl">
          <Grid>
            <Grid.Col span={12}>
              <CallStats 
                totalCalls={callStats.totalCalls}
                callsThisMonth={callStats.callsThisMonth}
                avgResponseTime={callStats.avgResponseTime}
                activeMembers={callStats.activeMembers}
              />
            </Grid.Col>
            
            <Grid.Col span={12}>
              <InventoryStats />
            </Grid.Col>
          </Grid>
          
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper withBorder p="md" radius="md" shadow="xs" h="100%">
                <Title order={3} mb="md">Recent Calls</Title>
                <Box c="dimmed">Recent calls will be displayed here</Box>
                <Group justify="center" mt="xl">
                  <Button 
                    leftSection={<IconPlus size="1rem" />} 
                    component={Link} 
                    href="/dashboard/calls/new"
                  >
                    Create New Call
                  </Button>
                </Group>
              </Paper>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper withBorder p="md" radius="md" shadow="xs" h="100%">
                <Title order={3} mb="md">Certification Alerts</Title>
                <CertificationAlerts />
              </Paper>
            </Grid.Col>
          </Grid>
        </Stack>
      </Stack>
    </Container>
  );
}