'use client';
import { Box, Group, Button, Alert, Stack, Text, Badge } from '@mantine/core';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getUserCertifications, Certification } from '@/lib/client/certificationService';

export function CertificationAlerts() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setLoading(true);
        const certs = await getUserCertifications();
        setCertifications(certs);
      } catch (err) {
        setError('Failed to load certification data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  // Calculate which certifications are expired or expiring soon (within 90 days)
  const alertCertifications = certifications.filter(cert => {
    if (!cert.cert_expiration) return false;
    
    const expiryDate = new Date(cert.cert_expiration);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= 90; // Expired or expiring within 90 days
  });

  if (loading) {
    return <Box>Loading certification data...</Box>;
  }

  if (error) {
    return (
      <Alert color="red" title="Error" icon={<IconAlertCircle />}>
        {error}
      </Alert>
    );
  }

  return (
    <Stack>
      {alertCertifications.length > 0 ? (
        <Stack>
          {alertCertifications.map(cert => {
            const expiryDate = cert.cert_expiration ? new Date(cert.cert_expiration) : null;
            const now = new Date();
            const isExpired = expiryDate && expiryDate < now;
            const daysUntilExpiry = expiryDate 
              ? Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) 
              : null;
            
            return (
              <Box key={cert.id} mb="sm">
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={500}>{cert.cert_name}</Text>
                  <Badge 
                    color={isExpired ? 'red' : 'yellow'}
                  >
                    {isExpired 
                      ? 'Expired' 
                      : `Expires in ${daysUntilExpiry} days`}
                  </Badge>
                </Group>
                {expiryDate && (
                  <Text size="sm" c="dimmed">
                    {isExpired 
                      ? `Expired on ${expiryDate.toLocaleDateString()}` 
                      : `Expires on ${expiryDate.toLocaleDateString()}`}
                  </Text>
                )}
              </Box>
            );
          })}
          <Group justify="center" mt="md">
            <Button 
              variant="outline"
              component={Link}
              href="/dashboard/certifications"
            >
              View All Certifications
            </Button>
          </Group>
        </Stack>
      ) : (
        <Alert color="green" title="All certifications are up to date" icon={<IconCircleCheck />}>
          You have no certifications that are expired or expiring soon.
        </Alert>
      )}
    </Stack>
  );
}