'use client';

import { Title, Container } from '@mantine/core';
import { CallForm } from '@/components/dashboard/CallForm';

export default function NewCall() {
  return (
    <Container fluid>
      <Title order={2} mb="xl">Create New Call</Title>
      <CallForm />
    </Container>
  );
}