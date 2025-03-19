'use client';
import { 
  Title, 
  Container, 
  Stack,
  Breadcrumbs,
  Anchor,
  Text
} from '@mantine/core';
import { InventoryForm } from '@/components/dashboard/InventoryForm';
import Link from 'next/link';

export default function NewInventoryItemPage() {
  const items = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventory', href: '/dashboard/inventory' },
    { title: 'Add New Item', href: '#' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container fluid>
      <Stack gap="md">
        <Breadcrumbs>{items}</Breadcrumbs>
        <Title order={2}>Add New Inventory Item</Title>
        <Text c="dimmed" mb="lg">
          Enter the details of the new inventory item
        </Text>
        <InventoryForm />
      </Stack>
    </Container>
  );
}