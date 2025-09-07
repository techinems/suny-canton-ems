'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Loader, Center, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { CertificationForm } from '@/components/dashboard/CertificationForm';
import { getCertification } from '@/lib/client/certificationService';
import { useParams } from 'next/navigation';

interface CertificationFormValues {
  id: string;
  certName: string;
  certExpiration?: Date;
  certIssueDate?: Date;
  certNumber?: string;
  issuingAuthority?: string;
}

export default function EditCertificationPage() {
  const params = useParams();
  const id = params.id as string;
  const [certification, setCertification] = useState<CertificationFormValues | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertification = async () => {
      try {
        setLoading(true);
        const data = await getCertification(id);

        // Format data to match form expectations (camelCase)
        const formattedCert: CertificationFormValues = {
          id: data.id,
          certName: data.certName,
          certExpiration: data.certExpiration || undefined,
          certIssueDate: data.certIssueDate || undefined,
          certNumber: data.certNumber || undefined,
          issuingAuthority: data.issuingAuthority || undefined,
        };

        setCertification(formattedCert);
      } catch (err) {
        console.error('Error fetching certification:', err);
        setError('Failed to load certification. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertification();
  }, [id]);

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
      <Title order={2} mb="xl">Edit Certification</Title>
      <CertificationForm initialValues={certification} />
    </Container>
  );
}