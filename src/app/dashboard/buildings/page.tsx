'use client';

import { Title, Container, Stack, Paper, Text, Button, Group } from '@mantine/core';
import { IconBuildingCommunity } from '@tabler/icons-react';
import { BuildingList } from '@/components/dashboard/BuildingList';
import Link from 'next/link';

export default function BuildingsPage() {
  return (
    <Container fluid>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Campus Buildings</Title>
          <Button
            component={Link}
            href="/dashboard/buildings/new"
            leftSection={<IconBuildingCommunity size="1rem" />}
          >
            Add Building
          </Button>
        </Group>
        <Paper withBorder p="md" radius="md">
          <Text mb="md">
            Manage campus buildings and their addresses. Buildings can be selected when
            adding member housing information or logging call locations.
          </Text>
          <BuildingList />
        </Paper>
      </Stack>
    </Container>
  );
}
