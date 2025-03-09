'use client';

import { Title, Container } from '@mantine/core';
import { Certifications } from '@/components/dashboard/Certifications';

export default function CertificationsPage() {
  // Sample certification data - in a real app, this would come from your API
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
    },
    {
      id: '4',
      name: 'Pediatric Advanced Life Support',
      expiryDate: new Date(2025, 2, 10), // March 10, 2025
      issueDate: new Date(2023, 2, 10), // March 10, 2023
      certificationNumber: 'PALS-567890',
      issuingAuthority: 'American Heart Association'
    },
  ];

  return (
    <Container fluid>
      <Title order={2} mb="xl">Your Certifications</Title>
      <Certifications certifications={certifications} />
    </Container>
  );
}