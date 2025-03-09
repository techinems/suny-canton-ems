'use client';

import { Paper, Text, Group, Badge, Progress, ThemeIcon } from '@mantine/core';
import { IconCertificate } from '@tabler/icons-react';

interface CertificationCardProps {
  name: string;
  expiryDate: Date;
  issueDate: Date;
  certificationNumber?: string;
  issuingAuthority?: string;
}

export function CertificationCard({
  name,
  expiryDate,
  issueDate,
  certificationNumber,
  issuingAuthority,
}: CertificationCardProps) {
  // Calculate days remaining and progress percentage
  const today = new Date();
  const totalDuration = expiryDate.getTime() - issueDate.getTime();
  const remainingTime = expiryDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
  const progressPercentage = 100 - Math.min(100, Math.max(0, (remainingTime / totalDuration) * 100));
  
  // Determine status and color
  let status = 'Valid';
  let color = 'green';
  
  if (daysRemaining <= 0) {
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
          <Text fw={700}>{name}</Text>
        </Group>
        <Badge color={color}>{status}</Badge>
      </Group>
      
      {issuingAuthority && (
        <Text size="sm" c="dimmed" mb={5}>
          Issued by: {issuingAuthority}
        </Text>
      )}
      
      {certificationNumber && (
        <Text size="sm" c="dimmed" mb="xs">
          Certificate #: {certificationNumber}
        </Text>
      )}

      <Text size="sm" mb={5}>
        Issued: {issueDate.toLocaleDateString()}
      </Text>
      
      <Text size="sm" mb="xs">
        Expires: {expiryDate.toLocaleDateString()} 
        {daysRemaining > 0 ? ` (${daysRemaining} days remaining)` : ' (EXPIRED)'}
      </Text>
      
      <Progress 
        value={progressPercentage} 
        color={color}
        size="sm"
        striped={daysRemaining <= 30}
        animated={daysRemaining <= 30}
      />
    </Paper>
  );
}