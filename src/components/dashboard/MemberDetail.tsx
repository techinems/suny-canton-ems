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
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Get position badge color
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

  // Format position display name
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
                {formatPosition(member.position)}
              </Badge>
              <Badge 
                color={member.membershipStanding === 'GOOD' ? 'green' : 'red'}
              >
                {member.membershipStanding === 'GOOD' ? 'Good' : 'Bad'} Standing
              </Badge>
              {member.medicalLevel && (
                <Badge color="blue">{member.medicalLevel}</Badge>
              )}
              {member.isAdmin && (
                <Badge color="red">Admin</Badge>
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
          {member.cantonEmail && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text fw={500}>Canton Email:</Text>
              <Text>{member.cantonEmail}</Text>
            </Grid.Col>
          )}
          {member.phoneNumber && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text fw={500}>Phone:</Text>
              <Text>{member.phoneNumber}</Text>
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
            <Text>{member.cantonCardId}</Text>
          </Grid.Col>
        </Grid>

        <Divider label="Housing Information" labelPosition="center" />

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Text fw={500}>Housing Type:</Text>
            <Text>{member.housingType === 'ON_CAMPUS' ? 'On Campus' : member.housingType === 'OFF_CAMPUS' ? 'Off Campus' : 'Commuter'}</Text>
          </Grid.Col>
          
          {member.housingType === 'ON_CAMPUS' && (
            <>
              {member.building && (
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Text fw={500}>Building:</Text>
                  <Text>{member.building.name}</Text>
                </Grid.Col>
              )}
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Text fw={500}>Room Number:</Text>
                <Text>{member.roomNumber}</Text>
              </Grid.Col>
            </>
          )}
          
          {member.localAddress && (
            <Grid.Col span={12}>
              <Text fw={500}>Local Address:</Text>
              <Text>{member.localAddress}</Text>
            </Grid.Col>
          )}
          
          {member.homeAddress && (
            <Grid.Col span={12}>
              <Text fw={500}>Home Address:</Text>
              <Text>{member.homeAddress}</Text>
            </Grid.Col>
          )}
        </Grid>

        {member.shirtSize && (
          <>
            <Divider label="Additional Information" labelPosition="center" />
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Text fw={500}>Shirt Size:</Text>
                <Text>{member.shirtSize}</Text>
              </Grid.Col>
            </Grid>
          </>
        )}
      </Stack>
    </Paper>
  );
}