'use client';

import { useState, useEffect } from 'react';
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
import { createCertification, updateCertification, CertificationInput } from '@/lib/client/certificationService';

interface CertificationFormProps {
  initialValues?: {
    id?: string;
    certName?: string;
    certExpiration?: Date;
    certIssueDate?: Date;
    certNumber?: string;
    issuingAuthority?: string;
  };
}

export function CertificationForm({ initialValues }: CertificationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditing = !!initialValues?.id;

  const form = useForm({
    initialValues: {
      certName: initialValues?.certName || '',
      certExpiration: initialValues?.certExpiration || null,
      certIssueDate: initialValues?.certIssueDate || new Date(),
      certNumber: initialValues?.certNumber || '',
      issuingAuthority: initialValues?.issuingAuthority || '',
      certScan: null as File | null,
    },
    validate: {
      certName: (value) => (!value ? 'Certification name is required' : null),
      certExpiration: (value) => (!value ? 'Expiration date is required' : null),
      certScan: (value) => (!value && !isEditing ? 'Certificate scan is required' : null),
    },
  });

  // Update form values when initialValues change (for edit mode)
  useEffect(() => {
    if (initialValues) {
      form.setValues({
        certName: initialValues.certName || '',
        certExpiration: initialValues.certExpiration || null,
        certIssueDate: initialValues.certIssueDate || new Date(),
        certNumber: initialValues.certNumber || '',
        issuingAuthority: initialValues.issuingAuthority || '',
        certScan: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      setError(null);
      if (!values.certScan && !isEditing) {
        setError('Certificate scan is required');
        setLoading(false);
        return;
      }
      
      const certData: CertificationInput = {
        certName: values.certName,
        certExpiration: values.certExpiration,
        certIssueDate: values.certIssueDate,
        certNumber: values.certNumber || null,
        issuingAuthority: values.issuingAuthority || null,
      };

      if (values.certScan) {
        certData.certScan = values.certScan;
      }
      
      // For new certifications
      if (!isEditing) {
        if (!values.certScan) {
          setError('Certificate scan is required for new certifications');
          setLoading(false);
          return;
        }
        await createCertification(certData);
      } 
      // For updates
      else if (initialValues?.id) {
        await updateCertification(initialValues.id, certData);
      }

      notifications.show({
        title: isEditing ? 'Certification Updated' : 'Certification Added',
        message: `${values.certName} has been ${isEditing ? 'updated' : 'added'} successfully.`,
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
            {...form.getInputProps('certName')}
          />
          
          <Group grow>
            <DatePickerInput
              required
              label="Issue Date"
              placeholder="When was this certification issued?"
              valueFormat="YYYY-MM-DD"
              maxDate={new Date()}
              leftSection={<IconCalendar size="1rem" />}
              {...form.getInputProps('certIssueDate')}
            />
            
            <DatePickerInput
              required
              label="Expiration Date"
              placeholder="When does this certification expire?"
              valueFormat="YYYY-MM-DD"
              minDate={new Date()}
              leftSection={<IconCalendar size="1rem" />}
              {...form.getInputProps('certExpiration')}
            />
          </Group>
          
          <TextInput
            label="Certification Number"
            placeholder="Enter certification number if applicable"
            {...form.getInputProps('certNumber')}
          />
          
          <TextInput
            label="Issuing Authority"
            placeholder="e.g., American Heart Association, NREMT"
            {...form.getInputProps('issuingAuthority')}
          />
          
          <FileInput
            label="Upload Certificate Scan"
            placeholder="Click to upload certificate"
            accept="application/pdf,image/*"
            leftSection={<IconUpload size="1rem" />}
            clearable
            required={!isEditing}
            {...form.getInputProps('certScan')}
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