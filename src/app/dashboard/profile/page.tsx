'use client';

import { Title, Container } from '@mantine/core';
import { UserProfile } from '@/components/auth/UserProfile';

export default function ProfilePage() {
  return (
    <Container fluid>
      <Title order={2} mb="xl">Your Profile</Title>
      <UserProfile />
    </Container>
  );
}