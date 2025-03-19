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

// Helper function to get badge color based on member position
const getPositionColor = (position: string): string => {
  const colorMap: Record<string, string> = {
    'Advisor': 'blue',
    'President': 'violet',
    'Vice President': 'indigo',
    'Secretary': 'teal',
    'Treasurer': 'cyan',
    'Senator': 'green',
    'Member': 'gray',
    'Honor Roll': 'yellow',
    'Auxillary': 'orange'
  };
  
  return colorMap[position] || 'gray';
};

// Helper function to get badge color based on membership standing
const getStandingColor = (standing: string): string => {
  return standing === 'Good' ? 'green' : 'red';
};

export function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

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
          </div>
        </Group>
      )
    },
    {
      key: 'position',
      title: 'Position',
      render: (member) => (
        <Badge color={getPositionColor(member.position)}>
          {member.position}
        </Badge>
      )
    },
    {
      key: 'medical_level',
      title: 'Medical Level',
      render: (member) => (
        member.medical_level ? (
          <Text size="sm">{member.medical_level}</Text>
        ) : (
          <Text size="sm" c="dimmed">Not specified</Text>
        )
      )
    },
    {
      key: 'membership_standing',
      title: 'Membership',
      render: (member) => (
        <Badge color={getStandingColor(member.membership_standing)}>
          {member.membership_standing}
        </Badge>
      )
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (member) => (
        <>
          <Text size="sm">{member.email}</Text>
          <Text size="xs">{member.phone_number || 'No phone number'}</Text>
        </>
      )
    }
  ];

  const actions: Action<Member>[] = [
    {
      label: 'Edit Member',
      icon: <IconEdit size="1rem" />,
      href: (member) => `/dashboard/members/${member.id}`
    },
    {
      label: 'Delete Member',
      icon: <IconTrash size="1rem" />,
      color: 'red'
    }
  ];

  return (
    <DataTable<Member>
      data={members}
      columns={columns}
      actions={actions}
      loading={loading}
      onRowClick={(member) => router.push(`/dashboard/members/${member.id}`)}
      emptyMessage="No members found"
      confirmDelete={{
        title: 'Confirm Deletion',
        message: (member) => `Are you sure you want to delete ${getFullName(member)}? This action cannot be undone.`,
        onConfirm: handleDeleteMember
      }}
    />
  );
}