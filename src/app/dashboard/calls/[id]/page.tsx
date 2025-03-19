'use client';
import { 
  Title, 
  Container, 
  Stack, 
  Breadcrumbs,
  Anchor,
  Text,
  Loader,
  Center
} from '@mantine/core';
import { CallForm } from '@/components/dashboard/CallForm';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCallLog } from '@/lib/client/callService';
import { useParams } from 'next/navigation';

export default function EditCallPage() {
  const params = useParams();
  const id = params.id as string;
  const [callDate, setCallDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCallDetails = async () => {
      const call = await getCallLog(id);
      if (call) {
        // Format the date for display
        const date = new Date(call.call_received);
        setCallDate(date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
      setLoading(false);
    };
    
    fetchCallDetails();
  }, [id]);

  const items = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Calls', href: '/dashboard/calls' },
    { title: loading ? 'Loading...' : `Edit Call: ${callDate}`, href: '#' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container fluid>
      <Stack gap="md">
        <Breadcrumbs>{items}</Breadcrumbs>
        
        {loading ? (
          <Center h={100}>
            <Loader />
          </Center>
        ) : (
          <>
            <Title order={2}>Edit Call: {callDate}</Title>
            <Text c="dimmed" mb="lg">
              Update call information and save changes
            </Text>
            <CallForm callId={id} isEditing={true} />
          </>
        )}
      </Stack>
    </Container>
  );
}