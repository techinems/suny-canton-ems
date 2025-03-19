'use client';

import { SimpleGrid, Alert, Stack, Group, Button, Modal, Text, Menu, ActionIcon } from '@mantine/core';
import { useState } from 'react';
import { IconAlertCircle, IconEdit, IconTrash, IconDotsVertical } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { CertificationCard } from './CertificationCard';
import { Certification, deleteCertification, formatCertificationDates } from '@/lib/client/certificationService';

interface CertificationsProps {
  certifications: Certification[];
}

export function Certifications({ certifications: initialCertifications }: CertificationsProps) {
  const router = useRouter();
  const [certifications, setCertifications] = useState<Certification[]>(initialCertifications);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const certToDelete = certifications.find(cert => cert.id === deleteId);

  // Find any expiring certifications (within 90 days)
  const today = new Date();
  const expiringCertifications = certifications.filter(cert => {
    const { expiryDate } = formatCertificationDates(cert);
    if (!expiryDate) return false;
    const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining > 0 && daysRemaining <= 90;
  });

  // Find any expired certifications
  const expiredCertifications = certifications.filter(cert => {
    const { expiryDate } = formatCertificationDates(cert);
    return expiryDate ? expiryDate < today : false;
  });

  const handleEditCertification = (id: string) => {
    router.push(`/dashboard/certifications/${id}`);
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    open();
  };

  const handleDeleteCertification = async () => {
    if (!deleteId) return;
    
    try {
      setDeleteLoading(true);
      await deleteCertification(deleteId);
      
      // Update local state to remove the deleted certification
      setCertifications(prevCertifications => 
        prevCertifications.filter(cert => cert.id !== deleteId)
      );
      
      notifications.show({
        title: 'Certification Deleted',
        message: 'The certification has been successfully deleted.',
        color: 'green',
      });
      
      close();
      router.refresh();
    } catch (error) {
      console.error('Error deleting certification:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete certification. Please try again.',
        color: 'red',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Stack gap="md">
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

      {certifications.length === 0 ? (
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="No Certifications"
          color="blue"
          mb="md"
        >
          You don&apos;t have any certifications yet. Click the &quot;Add Certification&quot; button to add your first certification.
        </Alert>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {certifications.map((cert) => (
            <div key={cert.id} style={{ position: 'relative' }}>
              <CertificationCard cert={cert}/>
              {/* Replace buttons with action menu */}
              <Menu position="bottom-end" withArrow withinPortal>
                <Menu.Target>
                  <ActionIcon 
                    style={{ position: 'absolute', top: '10px', right: '10px' }}
                    variant="subtle"
                    radius="xl"
                  >
                    <IconDotsVertical size="1rem" />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item 
                    leftSection={<IconEdit size="1rem" />}
                    onClick={() => handleEditCertification(cert.id)}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Item 
                    leftSection={<IconTrash size="1rem" />}
                    color="red"
                    onClick={() => confirmDelete(cert.id)}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          ))}
        </SimpleGrid>
      )}

      {/* Delete confirmation modal */}
      <Modal opened={opened} onClose={close} title="Confirm Deletion" centered>
        <Text mb="lg">
          Are you sure you want to delete the certification: <strong>{certToDelete?.cert_name}</strong>?
          This action cannot be undone.
        </Text>
        <Group justify="right">
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button 
            color="red" 
            onClick={handleDeleteCertification}
            loading={deleteLoading}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}