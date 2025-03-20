'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Loader, Center, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { CertificationForm } from '@/components/dashboard/CertificationForm';
import { getCertification } from '@/lib/client/certificationService';
import { useParams } from 'next/navigation';

interface FormattedCertification {
  id: string;
  cert_name: string;
  cert_expiration?: Date;
  cert_issue_date?: Date;
  cert_number?: string;
  issuing_authority?: string;
}



export default function EditCertificationPage() {
  const params = useParams();
  const id = params.id as string;
  const [certification, setCertification] = useState<FormattedCertification | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertification = async () => {
      try {
        setLoading(true);
        const data = await getCertification(id);

        // Convert string dates to Date objects
        const formattedCert: FormattedCertification = {
          id: data.id,
          cert_name: data.cert_name,
          cert_expiration: data.cert_expiration ? new Date(data.cert_expiration) : undefined,
          cert_issue_date: data.cert_issue_date ? new Date(data.cert_issue_date) : undefined,
          cert_number: data.cert_number,
          issuing_authority: data.issuing_authority,
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