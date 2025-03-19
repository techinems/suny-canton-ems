'use client';

import { Paper, Text, Group, Badge, Progress, ThemeIcon, Button, Anchor } from '@mantine/core';
import { IconCertificate, IconDownload } from '@tabler/icons-react';
import { Certification, getFileUrl, formatCertificationDates } from '@/lib/client/certificationService';

export function CertificationCard({ cert }: {cert: Certification}) {
  // Get formatted dates from the certification object
  const { expiryDate, issueDate } = formatCertificationDates(cert);
  
  // Calculate days remaining and progress percentage
  const today = new Date();
  const totalDuration = expiryDate && issueDate ? 
    expiryDate.getTime() - issueDate.getTime() : 0;
  const remainingTime = expiryDate ? 
    expiryDate.getTime() - today.getTime() : 0;
  const daysRemaining = expiryDate ? 
    Math.ceil(remainingTime / (1000 * 60 * 60 * 24)) : 0;
  
  // Calculate progress percentage - representing the time remaining (not elapsed)
  const progressValue = totalDuration > 0 ? 
    parseFloat(Math.min(100, Math.max(0, (remainingTime / totalDuration) * 100)).toFixed(1)) : 0;
  
  // Determine status and color
  let status = 'Valid';
  let color = 'green';
  
  if (!expiryDate || daysRemaining <= 0) {
    status = 'Expired';
    color = 'red';
  } else if (daysRemaining <= 30) {
    status = 'Expiring Soon';
    color = 'orange';
  } else if (daysRemaining <= 90) {
    status = 'Renewal Needed';
    color = 'yellow';
  }

  return (
    <Paper withBorder p="md" radius="md" shadow="xs">
      <Group justify="space-between" mb="xs">
        <Group>
          <ThemeIcon color="blue" variant="light" size="md" radius="md">
            <IconCertificate size="1.2rem" />
          </ThemeIcon>
          <Text fw={700}>{cert.cert_name}</Text>
        </Group>
      </Group>
      
      {cert.issuing_authority && (
        <Text size="sm" c="dimmed" mb={5}>
          Issued by: {cert.issuing_authority}
        </Text>
      )}
      
      {cert.cert_number && (
        <Text size="sm" c="dimmed" mb="xs">
          Certificate #: {cert.cert_number}
        </Text>
      )}

      <Text size="sm" mb={5}>
        Issued: {issueDate ? issueDate.toLocaleDateString() : 'Not specified'}
      </Text>
      
      <Text size="sm" mb="xs">
        Expires: {expiryDate ? expiryDate.toLocaleDateString() : 'Not specified'} 
        {expiryDate && daysRemaining > 0 ? ` (${daysRemaining} days remaining)` : expiryDate ? ' (EXPIRED)' : ''}
      </Text>
      
      <Progress 
        value={progressValue} 
        color={color}
        size="sm"
        striped={daysRemaining <= 30}
        animated={daysRemaining <= 30}
        mb={cert.cert_scan ? "xs" : undefined}
      />

      <Group justify="space-between" mt="xs">
        <Badge color={color}>{status}</Badge>
        
        {cert.cert_scan && cert.id && (
          <Anchor href={getFileUrl(cert)} target="_blank" download>
            <Button 
              variant="light" 
              size="xs" 
              leftSection={<IconDownload size="1rem" />}
            >
              Download Certificate
            </Button>
          </Anchor>
        )}
      </Group>
    </Paper>
  );
}