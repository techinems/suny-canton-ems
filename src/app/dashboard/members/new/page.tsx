'use client';
import { 
  Title, 
  Container, 
  Stack,
  Breadcrumbs,
  Anchor
} from '@mantine/core';
import { MemberForm } from '@/components/dashboard/MemberForm';
import Link from 'next/link';

export default function NewMemberPage() {
  const items = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Members', href: '/dashboard/members' },
    { title: 'Add New Member', href: '#' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container fluid>
      <Stack gap="md">
        <Breadcrumbs>{items}</Breadcrumbs>
        <Title order={2}>Add New Member</Title>
        <MemberForm />
      </Stack>
    </Container>
  );
}