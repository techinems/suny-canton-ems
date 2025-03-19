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
import { MemberForm } from '@/components/dashboard/MemberForm';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getMemberById, getFullName } from '@/lib/client/memberService';
import { useParams } from 'next/navigation';


export default function EditMemberPage() {
  const params = useParams();
  const id = params.id as string;
  const [memberName, setMemberName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMemberName = async () => {
      const member = await getMemberById(id);
      if (member) {
        setMemberName(getFullName(member));
      }
      setLoading(false);
    };
    
    fetchMemberName();
  }, [id]);

  const items = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Members', href: '/dashboard/members' },
    { title: loading ? 'Loading...' : `Edit ${memberName}`, href: '#' },
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
            <Title order={2}>Edit Member: {memberName}</Title>
            <Text c="dimmed" mb="lg">
              Update member information and save changes
            </Text>
            <MemberForm memberId={id} isEditing={true} />
          </>
        )}
      </Stack>
    </Container>
  );
}