'use client';

import { useEffect, useState } from 'react';
import { Alert, Loader, Center } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from './AuthContext';
import { MemberDetail } from '../dashboard/MemberDetail';
import { Member, getMemberById } from '@/lib/client/memberService';

export function UserProfile() {
  const { user } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMemberData() {
      if (user?.id) {
        try {
          setLoading(true);
          const memberData = await getMemberById(user.id);
          setMember(memberData);
        } catch (err) {
          setError('Failed to load profile data');
          console.error('Error fetching member data:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    fetchMemberData();
  }, [user]);

  if (loading) {
    return (
      <Center h={200}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
        {error}
      </Alert>
    );
  }

  if (!member) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Not Found" color="yellow">
        Member profile not found. Please contact your administrator.
      </Alert>
    );
  }

  return <MemberDetail member={member} />;
}