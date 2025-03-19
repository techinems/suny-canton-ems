'use client';
import { useState, useEffect } from 'react';
import { 
  Table, 
  Avatar, 
  Group, 
  Text, 
  Badge, 
  ActionIcon, 
  Menu, 
  Button,
  Loader,
  Center,
  Box,
  Modal,
  Flex
} from '@mantine/core';
import { IconDotsVertical, IconEdit, IconTrash, IconUserPlus } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { Member, getAllMembers, getMemberAvatarUrl, getFullName } from '@/lib/client/memberService';

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
  const [opened, { open, close }] = useDisclosure(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const fetchedMembers = await getAllMembers();
      setMembers(fetchedMembers);
      setLoading(false);
    };

    fetchMembers();
  }, []);

  const handleDeleteClick = (member: Member) => {
    setMemberToDelete(member);
    open();
  };

  const confirmDelete = async () => {
    // Would implement actual delete functionality here
    // For now, we'll just close the modal
    close();
    setMemberToDelete(null);
  };

  if (loading) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <Box mb="md">
        <Flex justify="flex-end">
          <Button 
            component={Link} 
            href="/dashboard/members/new" 
            leftSection={<IconUserPlus size="1rem" />}
          >
            Add Member
          </Button>
        </Flex>
      </Box>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Member</Table.Th>
            <Table.Th>Position</Table.Th>
            <Table.Th>Medical Level</Table.Th>
            <Table.Th>Membership</Table.Th>
            <Table.Th>Contact</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {members.map((member) => (
            <Table.Tr key={member.id}>
              <Table.Td>
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
              </Table.Td>
              <Table.Td>
                <Badge color={getPositionColor(member.position)}>
                  {member.position}
                </Badge>
              </Table.Td>
              <Table.Td>
                {member.medical_level ? (
                  <Text size="sm">{member.medical_level}</Text>
                ) : (
                  <Text size="sm" c="dimmed">Not specified</Text>
                )}
              </Table.Td>
              <Table.Td>
                <Badge color={getStandingColor(member.membership_standing)}>
                  {member.membership_standing}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{member.email}</Text>
                <Text size="xs">{member.phone_number || 'No phone number'}</Text>
              </Table.Td>
              <Table.Td>
                <Menu position="bottom-end" shadow="md">
                  <Menu.Target>
                    <ActionIcon variant="subtle">
                      <IconDotsVertical size="1rem" />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item 
                      leftSection={<IconEdit size="1rem" />}
                      component={Link}
                      href={`/dashboard/members/${member.id}`}
                    >
                      Edit Member
                    </Menu.Item>
                    <Menu.Item 
                      leftSection={<IconTrash size="1rem" />}
                      color="red"
                      onClick={() => handleDeleteClick(member)}
                    >
                      Delete Member
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={close} title="Confirm Deletion" centered>
        {memberToDelete && (
          <>
            <Text>
              Are you sure you want to delete {getFullName(memberToDelete)}? This action cannot be undone.
            </Text>
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={close}>Cancel</Button>
              <Button color="red" onClick={confirmDelete}>Delete</Button>
            </Group>
          </>
        )}
      </Modal>
    </>
  );
}