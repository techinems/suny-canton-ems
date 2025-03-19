'use client';
import { 
  Paper, 
  Avatar, 
  Text, 
  Group, 
  Stack, 
  Grid, 
  Badge,
  Divider,
  Box
} from '@mantine/core';
import { Member, getMemberAvatarUrl, getFullName } from '@/lib/client/memberService';

interface MemberDetailProps {
  member: Member;
}

export function MemberDetail({ member }: MemberDetailProps) {
  // Helper function to format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Get position badge color
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

  return (
    <Paper withBorder p="lg" radius="md">
      <Stack>
        <Group>
          <Avatar
            src={getMemberAvatarUrl(member)}
            alt={getFullName(member)}
            size="xl"
            radius="xl"
          />
          <Box>
            <Text size="xl" fw={700}>
              {getFullName(member)}
            </Text>
            <Group gap="xs">
              <Badge color={getPositionColor(member.position)}>
                {member.position}
              </Badge>
              <Badge 
                color={member.membership_standing === 'Good' ? 'green' : 'red'}
              >
                {member.membership_standing} Standing
              </Badge>
              {member.medical_level && (
                <Badge color="blue">{member.medical_level}</Badge>
              )}
            </Group>
          </Box>
        </Group>

        <Divider label="Personal Information" labelPosition="center" />

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Text fw={500}>Email:</Text>
            <Text>{member.email}</Text>
          </Grid.Col>
          {member.canton_email && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text fw={500}>Canton Email:</Text>
              <Text>{member.canton_email}</Text>
            </Grid.Col>
          )}
          {member.phone_number && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text fw={500}>Phone:</Text>
              <Text>{member.phone_number}</Text>
            </Grid.Col>
          )}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Text fw={500}>Date of Birth:</Text>
            <Text>{formatDate(member.dob)}</Text>
          </Grid.Col>
        </Grid>

        <Divider label="Academic Information" labelPosition="center" />

        <Grid>
          {member.major && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text fw={500}>Major:</Text>
              <Text>{member.major}</Text>
            </Grid.Col>
          )}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Text fw={500}>GPA:</Text>
            <Text>{member.gpa}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Text fw={500}>Canton Card ID:</Text>
            <Text>{member.canton_card_id}</Text>
          </Grid.Col>
        </Grid>

        <Divider label="Housing Information" labelPosition="center" />

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Text fw={500}>Housing Type:</Text>
            <Text>{member.housing_type}</Text>
          </Grid.Col>
          
          {member.housing_type === 'On Campus' && (
            <>
              {member.building && (
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Text fw={500}>Building:</Text>
                  <Text>{member.building}</Text>
                </Grid.Col>
              )}
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Text fw={500}>Room Number:</Text>
                <Text>{member.room_number}</Text>
              </Grid.Col>
            </>
          )}
          
          {member.local_address && (
            <Grid.Col span={12}>
              <Text fw={500}>Local Address:</Text>
              <Text>{member.local_address}</Text>
            </Grid.Col>
          )}
          
          {member.home_address && (
            <Grid.Col span={12}>
              <Text fw={500}>Home Address:</Text>
              <Text>{member.home_address}</Text>
            </Grid.Col>
          )}
        </Grid>

        {member.shirt_size && (
          <>
            <Divider label="Additional Information" labelPosition="center" />
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Text fw={500}>Shirt Size:</Text>
                <Text>{member.shirt_size.toUpperCase()}</Text>
              </Grid.Col>
            </Grid>
          </>
        )}
      </Stack>
    </Paper>
  );
}