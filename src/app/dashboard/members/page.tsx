'use client';
import { 
  Title, 
  Container, 
  Stack, 
  Paper,
  Text,
  Button,
  Group
} from '@mantine/core';
import { IconUserPlus } from '@tabler/icons-react';
import { MemberList } from '@/components/dashboard/MemberList';
import Link from 'next/link';

export default function MembersPage() {
  return (
    <Container fluid>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Membership Roster</Title>
          <Button 
            component={Link} 
            href="/dashboard/members/new" 
            leftSection={<IconUserPlus size="1rem" />}
          >
            Add Member
          </Button>
        </Group>
        <Paper withBorder p="md" radius="md">
          <Text mb="md">
            View and manage all members of the SUNY Canton EMS team. You can add new members, edit existing member information, and manage membership status.
          </Text>
          <MemberList />
        </Paper>
      </Stack>
    </Container>
  );
}