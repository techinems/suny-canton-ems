'use client';

import {
  Title,
  Container,
  Stack,
  Breadcrumbs,
  Anchor,
} from '@mantine/core';
import { BuildingForm } from '@/components/dashboard/BuildingForm';
import Link from 'next/link';

export default function NewBuildingPage() {
  const items = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Buildings', href: '/dashboard/buildings' },
    { title: 'New Building', href: '#' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container fluid>
      <Stack gap="md">
        <Breadcrumbs>{items}</Breadcrumbs>
        <Title order={2}>Add New Building</Title>
        <BuildingForm />
      </Stack>
    </Container>
  );
}
