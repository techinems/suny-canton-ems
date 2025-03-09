'use client';

import { Title, SimpleGrid, Alert, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { CertificationCard } from './CertificationCard';

interface Certification {
  id: string;
  name: string;
  expiryDate: Date;
  issueDate: Date;
  certificationNumber?: string;
  issuingAuthority?: string;
}

interface CertificationsProps {
  certifications: Certification[];
}

export function Certifications({ certifications }: CertificationsProps) {
  // Find any expiring certifications (within 90 days)
  const today = new Date();
  const expiringCertifications = certifications.filter(cert => {
    const daysRemaining = Math.ceil((cert.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining > 0 && daysRemaining <= 90;
  });

  // Find any expired certifications
  const expiredCertifications = certifications.filter(cert => {
    return cert.expiryDate < today;
  });

  return (
    <Stack gap="md">
      <Title order={3}>Your Certifications</Title>

      {expiredCertifications.length > 0 && (
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Expired Certifications"
          color="red"
          variant="filled"
          mb="md"
        >
          You have {expiredCertifications.length} expired certification{expiredCertifications.length !== 1 ? 's' : ''}. 
          Please renew them as soon as possible to maintain your qualifications.
        </Alert>
      )}

      {expiringCertifications.length > 0 && expiredCertifications.length === 0 && (
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Certifications Expiring Soon"
          color="yellow"
          mb="md"
        >
          You have {expiringCertifications.length} certification{expiringCertifications.length !== 1 ? 's' : ''} expiring soon. 
          Please plan to renew before they expire.
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {certifications.map((cert) => (
          <CertificationCard
            key={cert.id}
            name={cert.name}
            expiryDate={cert.expiryDate}
            issueDate={cert.issueDate}
            certificationNumber={cert.certificationNumber}
            issuingAuthority={cert.issuingAuthority}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}