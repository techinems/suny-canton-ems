'use client';
import { useState, useEffect } from 'react';
import { 
  Avatar, 
  Group, 
  Text, 
  Badge,
} from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { DataTable, Column, Action } from '@/components/DataTable';
import { Member, getAllMembers, getMemberAvatarUrl, getFullName, deleteMember } from '@/lib/client/memberService';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';

// Helper function to get badge color based on member position
const getPositionColor = (position: string): string => {
  const colorMap: Record<string, string> = {
    'ADVISOR': 'blue',
    'PRESIDENT': 'violet',
    'VICE_PRESIDENT': 'indigo',
    'SECRETARY': 'teal',
    'TREASURER': 'cyan',
    'SENATOR': 'green',
    'MEMBER': 'gray',
    'PROBATIONARY_MEMBER': 'yellow',
    'LIEUTENANT': 'orange',
    'CAPTAIN': 'red',
    'ALUMNI': 'gray',
    'HONOR_ROLL': 'yellow',
    'AUXILIARY': 'orange'
  };
  
  return colorMap[position] || 'gray';
};

// Helper function to get badge color based on membership standing
const getStandingColor = (standing: string): string => {
  return standing === 'GOOD' ? 'green' : 'red';
};

// Helper function to format position display name
const formatPosition = (position: string): string => {
  const positionMap: Record<string, string> = {
    'MEMBER': 'Member',
    'PROBATIONARY_MEMBER': 'Probationary Member',
    'LIEUTENANT': 'Lieutenant',
    'CAPTAIN': 'Captain',
    'TREASURER': 'Treasurer',
    'SECRETARY': 'Secretary',
    'VICE_PRESIDENT': 'Vice President',
    'PRESIDENT': 'President',
    'ALUMNI': 'Alumni',
    'ADVISOR': 'Advisor',
    'SENATOR': 'Senator',
    'HONOR_ROLL': 'Honor Roll',
    'AUXILIARY': 'Auxiliary'
  };
  
  return positionMap[position] || position;
};

// Helper function to format standing display name
const formatStanding = (standing: string): string => {
  return standing === 'GOOD' ? 'Good' : 'Bad';
};

export function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const fetchedMembers = await getAllMembers();
        setMembers(fetchedMembers);
      } catch {
        notifications.show({
          title: 'Error',
          message: 'Failed to load members',
          color: 'red',
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleDeleteMember = async (member: Member) => {
    try {
      const success = await deleteMember(member.id);
      if (success) {
        notifications.show({
          title: 'Success',
          message: `${getFullName(member)} was deleted successfully`,
          color: 'green',
          autoClose: 5000,
        });
        setMembers(members.filter(m => m.id !== member.id));
      } else {
        throw new Error('Failed to delete member');
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: `Failed to delete ${getFullName(member)}`,
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  const columns: Column<Member>[] = [
    {
      key: 'member',
      title: 'Member',
      render: (member) => (
        <Group gap="sm">
          <Avatar
            src={getMemberAvatarUrl(member)}
            alt={getFullName(member)}
            radius="xl"
            size="md"
          />
          <div>
            <Text size="sm" fw={500}>
              {getFullName(member)}
            </Text>
            <Text size="xs" c="dimmed">
              {member.major || 'No major specified'}
            </Text>
            {member.isAdmin && (
              <Badge color="red" size="xs" mt={4}>
                Admin
              </Badge>
            )}
          </div>
        </Group>
      )
    },
    {
      key: 'position',
      title: 'Position',
      render: (member) => (
        <Badge color={getPositionColor(member.position)}>
          {formatPosition(member.position)}
        </Badge>
      )
    },
    {
      key: 'medicalLevel',
      title: 'Medical Level',
      render: (member) => (
        member.medicalLevel ? (
          <Text size="sm">{member.medicalLevel}</Text>
        ) : (
          <Text size="sm" c="dimmed">Not specified</Text>
        )
      )
    },
    {
      key: 'membershipStanding',
      title: 'Membership',
      render: (member) => (
        <Badge color={getStandingColor(member.membershipStanding)}>
          {formatStanding(member.membershipStanding)}
        </Badge>
      )
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (member) => (
        <>
          <Text size="sm">{member.email}</Text>
          <Text size="xs">{member.phoneNumber || 'No phone number'}</Text>
        </>
      )
    }
  ];

  const baseActions: Action<Member>[] = user?.isAdmin
    ? [
        {
          label: 'Edit Member',
          icon: <IconEdit size="1rem" />,
          href: (member) => `/dashboard/members/${member.id}`,
        },
      ]
    : [];

  const adminActions: Action<Member>[] = [
    {
      label: 'Delete Member',
      icon: <IconTrash size="1rem" />,
      color: 'red'
    }
  ];

  const actions: Action<Member>[] = user?.isAdmin ? [...baseActions, ...adminActions] : baseActions;

  return (
    <DataTable<Member>
      data={members}
      columns={columns}
      actions={actions}
      loading={loading}
      onRowClick={user?.isAdmin ? (member) => router.push(`/dashboard/members/${member.id}`) : undefined}
      emptyMessage="No members found"
      confirmDelete={user?.isAdmin ? {
        title: 'Confirm Deletion',
        message: (member) => `Are you sure you want to delete ${getFullName(member)}? This action cannot be undone.`,
        onConfirm: handleDeleteMember
      } : undefined}
    />
  );
}