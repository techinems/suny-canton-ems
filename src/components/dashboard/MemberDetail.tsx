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
  Box,
  Button,
  FileButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { useState } from 'react';
import { IconUpload, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { Member, getMemberAvatarUrl, getFullName, uploadAvatar, deleteAvatar } from '@/lib/client/memberService';
import { useAuth } from '@/components/auth/AuthContext';

interface MemberDetailProps {
  member: Member;
}

export function MemberDetail({ member }: MemberDetailProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(getMemberAvatarUrl(member));
  const isOwnProfile = user?.id === member.id;

  // Handle avatar upload
  const handleAvatarUpload = async (file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      notifications.show({
        title: 'Invalid file type',
        message: 'Please upload an image file',
        color: 'red',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      notifications.show({
        title: 'File too large',
        message: 'Avatar must be less than 5MB',
        color: 'red',
      });
      return;
    }

    try {
      setUploading(true);
      const result = await uploadAvatar(file);
      
      if (result) {
        setAvatarUrl(`/api/files/${result.file.id}`);
        notifications.show({
          title: 'Success',
          message: 'Avatar uploaded successfully',
          color: 'green',
        });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to upload avatar',
        color: 'red',
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle avatar deletion
  const handleAvatarDelete = async () => {
    try {
      setUploading(true);
      await deleteAvatar();
      setAvatarUrl('');
      notifications.show({
        title: 'Success',
        message: 'Avatar removed successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete avatar',
        color: 'red',
      });
    } finally {
      setUploading(false);
    }
  };

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
          <Box pos="relative">
            <Avatar
              src={avatarUrl}
              alt={getFullName(member)}
              size="xl"
              radius="xl"
            />
            {isOwnProfile && (
              <Group gap={4} mt="xs">
                <FileButton onChange={handleAvatarUpload} accept="image/*">
                  {(props) => (
                    <Tooltip label="Upload avatar">
                      <ActionIcon
                        {...props}
                        variant="filled"
                        color="blue"
                        size="sm"
                        loading={uploading}
                      >
                        <IconUpload size={14} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </FileButton>
                {avatarUrl && (
                  <Tooltip label="Remove avatar">
                    <ActionIcon
                      variant="filled"
                      color="red"
                      size="sm"
                      onClick={handleAvatarDelete}
                      loading={uploading}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            )}
          </Box>
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