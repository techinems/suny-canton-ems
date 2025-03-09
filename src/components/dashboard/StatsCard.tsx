'use client';

import { Paper, Text, Group, ThemeIcon } from '@mantine/core';
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.FC<{ size: string | number }>;
  color: string;
}

export function StatsCard({ title, value, description, icon: Icon, color }: StatsCardProps) {
  return (
    <Paper withBorder p="md" radius="md" shadow="xs">
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text fw={700} size="xl">
            {value}
          </Text>
          {description && (
            <Text size="xs" c="dimmed" mt={4}>
              {description}
            </Text>
          )}
        </div>

        <ThemeIcon color={color} variant="light" size="lg" radius="md">
          <Icon size="1.5rem" />
        </ThemeIcon>
      </Group>
    </Paper>
  );
}