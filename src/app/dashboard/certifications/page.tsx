'use client';

import { useState, useEffect } from 'react';
import { Title, Container, Loader, Center, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { Certifications } from '@/components/dashboard/Certifications';
import { getUserCertifications, Certification } from '@/lib/client/certificationService';

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setLoading(true);    
        setCertifications(await getUserCertifications());
      } catch (err) {
        console.error('Error fetching certifications:', err);
        setError('Failed to load certifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  if (loading) {
    return (
      <Container fluid>
        <Center h={200}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid>
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error"
          color="red"
          variant="filled"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Title order={2} mb="xl">Your Certifications</Title>
      <Certifications certifications={certifications} />
    </Container>
  );
}