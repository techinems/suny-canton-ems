'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TextInput, 
  Button, 
  Group, 
  Title, 
  Paper, 
  Stack, 
  FileInput, 
  Alert
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCalendar, IconUpload, IconAlertCircle } from '@tabler/icons-react';
import { createCertification, updateCertification, Certification } from '@/lib/client/certificationService';

interface CertificationFormProps {
  initialValues?: {
    id?: string;
    cert_name?: string;
    cert_expiration?: Date;
    cert_issue_date?: Date;
    cert_number?: string;
    issuing_authority?: string;
  };
}

export function CertificationForm({ initialValues }: CertificationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditing = !!initialValues?.id;

  const form = useForm({
    initialValues: {
      cert_name: initialValues?.cert_name || '',
      cert_expiration: initialValues?.cert_expiration || null,
      cert_issue_date: initialValues?.cert_issue_date || new Date(),
      cert_number: initialValues?.cert_number || '',
      issuing_authority: initialValues?.issuing_authority || '',
      cert_scan: null as File | null,
    },
    validate: {
      cert_name: (value) => (!value ? 'Certification name is required' : null),
      cert_expiration: (value) => (!value ? 'Expiration date is required' : null),
      cert_scan: (value) => (!value && !isEditing ? 'Certificate scan is required' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      setError(null);
      if (!values.cert_scan && !isEditing) {
        setError('Certificate scan is required');
        setLoading(false);
        return;
      }
      
      // Create a typesafe certification object
      const certData: Partial<Omit<Certification, 'id' | 'created' | 'updated'>> = {
        cert_name: values.cert_name,
        cert_expiration: values.cert_expiration ? values.cert_expiration.toISOString().split('T')[0] : undefined,
        cert_issue_date: values.cert_issue_date ? values.cert_issue_date.toISOString().split('T')[0] : undefined,
        cert_number: values.cert_number || undefined,
        issuing_authority: values.issuing_authority || undefined,
      };
      
      // Only add the cert_scan if there's a file
      if (values.cert_scan) {
        certData.cert_scan = values.cert_scan;
      }
      
      // For new certifications
      if (!isEditing) {
        await createCertification(certData as Omit<Certification, 'id' | 'created' | 'updated'>);
      } 
      // For updates
      else if (initialValues?.id) {
        await updateCertification(initialValues.id, certData);
      }

      notifications.show({
        title: isEditing ? 'Certification Updated' : 'Certification Added',
        message: `${values.cert_name} has been ${isEditing ? 'updated' : 'added'} successfully.`,
        color: 'green',
      });

      // Redirect to certifications page
      router.push('/dashboard/certifications');
      router.refresh();
    } catch (err) {
      console.error('Error saving certification:', err);
      setError('Failed to save certification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper p="md" shadow="sm" withBorder>
      <Title order={2} mb="lg">{isEditing ? 'Edit Certification' : 'Add New Certification'}</Title>
      
      {error && (
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error"
          color="red"
          mb="md"
        >
          {error}
        </Alert>
      )}
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            required
            label="Certification Name"
            placeholder="e.g., CPR, EMT-B, ACLS"
            {...form.getInputProps('cert_name')}
          />
          
          <Group grow>
            <DatePickerInput
              required
              label="Issue Date"
              placeholder="When was this certification issued?"
              valueFormat="YYYY-MM-DD"
              maxDate={new Date()}
              leftSection={<IconCalendar size="1rem" />}
              {...form.getInputProps('cert_issue_date')}
            />
            
            <DatePickerInput
              required
              label="Expiration Date"
              placeholder="When does this certification expire?"
              valueFormat="YYYY-MM-DD"
              minDate={new Date()}
              leftSection={<IconCalendar size="1rem" />}
              {...form.getInputProps('cert_expiration')}
            />
          </Group>
          
          <TextInput
            label="Certification Number"
            placeholder="Enter certification number if applicable"
            {...form.getInputProps('cert_number')}
          />
          
          <TextInput
            label="Issuing Authority"
            placeholder="e.g., American Heart Association, NREMT"
            {...form.getInputProps('issuing_authority')}
          />
          
          <FileInput
            label="Upload Certificate Scan"
            placeholder="Click to upload PDF"
            accept="application/pdf"
            leftSection={<IconUpload size="1rem" />}
            clearable
            required={!isEditing}
            {...form.getInputProps('cert_scan')}
          />
          
          <Group justify="flex-end" mt="md">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/certifications')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading}
            >
              {isEditing ? 'Update Certification' : 'Add Certification'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}