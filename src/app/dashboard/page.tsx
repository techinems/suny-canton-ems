'use client';
import { Title, Container, Stack, Grid, Paper, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { CallStats } from '@/components/dashboard/CallStats';
import { InventoryStats } from '@/components/dashboard/InventoryStats';
import { CertificationAlerts } from '@/components/dashboard/CertificationAlerts';
import { RecentCalls } from '@/components/dashboard/RecentCalls';
import Link from 'next/link';

export default function Dashboard() {

  return (
    <Container fluid>
      <Stack gap="md">
        <Grid>
          <Grid.Col span={12}>
            <Title order={3} mb="sm">Call Statistics</Title>
            <CallStats />
          </Grid.Col>

          <Grid.Col span={12}>
            <Title order={3} mb="sm">Inventory Overview</Title>
            <InventoryStats />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder p="md" radius="md" shadow="xs" h="100%">
              <Title order={3} mb="md">Recent Calls</Title>
              <RecentCalls limit={5} />
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
    </Container>
  );
}