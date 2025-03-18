'use client';
import { Title, Container, Stack, Grid, Box, Paper, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { CallStats } from '@/components/dashboard/CallStats';
import { useAuth } from '@/components/auth/AuthContext';
import { InventoryStats } from '@/components/dashboard/InventoryStats';
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
  // Sample certification data
  const certifications = [
    {
      id: '1',
      name: 'EMT-Basic',
      expiryDate: new Date(2024, 11, 15), // December 15, 2024
      issueDate: new Date(2022, 11, 15),  // December 15, 2022
      certificationNumber: 'EMT-123456',
      issuingAuthority: 'NY State Dept of Health'
    },
    {
      id: '2',
      name: 'CPR/AED for Healthcare Providers',
      expiryDate: new Date(2023, 10, 30), // November 30, 2023 (expired)
      issueDate: new Date(2021, 10, 30),  // November 30, 2021
      certificationNumber: 'CPR-789012',
      issuingAuthority: 'American Heart Association'
    },
    {
      id: '3',
      name: 'Advanced Cardiac Life Support',
      expiryDate: new Date(new Date().getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      issueDate: new Date(2022, 5, 15), // June 15, 2022
      certificationNumber: 'ACLS-345678',
      issuingAuthority: 'American Heart Association'
    }
  ];
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
                {certifications.some(cert => new Date(cert.expiryDate) < new Date() || 
                  (new Date(cert.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 90) ? (
                  <Box>
                    {certifications
                      .filter(cert => new Date(cert.expiryDate) < new Date() || 
                        (new Date(cert.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 90)
                      .map(cert => (
                        <Box key={cert.id} mb="sm">
                          <strong>{cert.name}</strong>: {new Date(cert.expiryDate) < new Date() ? 
                            'Expired' : 'Expiring soon'}
                        </Box>
                      ))}
                    <Group justify="center" mt="xl">
                      <Button 
                        variant="outline"
                        component={Link}
                        href="/dashboard/certifications"
                      >
                        View All Certifications
                      </Button>
                    </Group>
                  </Box>
                ) : (
                  <Box c="dimmed">All certifications are up to date</Box>
                )}
              </Paper>
            </Grid.Col>
          </Grid>
        </Stack>
      </Stack>
    </Container>
  );
}