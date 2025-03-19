'use client';

import { Container, Title } from '@mantine/core';
import { CertificationForm } from '@/components/dashboard/CertificationForm';

export default function NewCertificationPage() {
  return (
    <Container fluid>
      <Title order={2} mb="xl">Add New Certification</Title>
      <CertificationForm />
    </Container>
  );
}