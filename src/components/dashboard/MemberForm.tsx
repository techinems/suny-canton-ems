'use client';
import { useState, useEffect } from 'react';
import { 
  TextInput, 
  NumberInput, 
  Stack, 
  Group, 
  Select, 
  Button, 
  Title,
  FileInput,
  PasswordInput,
  Grid,
  Paper,
  Avatar,
  Accordion
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useRouter } from 'next/navigation';
import { Member, getMemberById, createMember, updateMember, getMemberAvatarUrl } from '@/lib/client/memberService';
import { isEmail } from '@/lib/utils';
import { pb } from '@/lib/client/pocketbase';

interface MemberFormProps {
  memberId?: string;
  isEditing?: boolean;
}

// Default values for a new member
const defaultMember: Partial<Member> = {
  position: 'Member',
  membership_standing: 'Good',
  housing_type: 'On Campus',
  room_number: 0,
  gpa: 2.0,
  canton_card_id: '',
  dob: new Date().toISOString().split('T')[0],
};

export function MemberForm({ memberId, isEditing = false }: MemberFormProps) {
  const [member, setMember] = useState<Partial<Member>>(defaultMember);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatar, setAvatar] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const router = useRouter();

  // Fetch existing member data if editing
  useEffect(() => {
    if (isEditing && memberId) {
      const fetchMember = async () => {
        setLoading(true);
        const fetchedMember = await getMemberById(memberId);
        if (fetchedMember) {
          setMember(fetchedMember);
        }
        setLoading(false);
      };
      fetchMember();
    }
  }, [memberId, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!member.email) newErrors.email = 'Email is required';
    if (!isEditing && !password) newErrors.password = 'Password is required';
    if (!member.first_name) newErrors.first_name = 'First name is required';
    if (!member.last_name) newErrors.last_name = 'Last name is required';
    if (!member.dob) newErrors.dob = 'Date of birth is required';
    if (!member.canton_card_id) newErrors.canton_card_id = 'Canton card ID is required';
    if (!member.gpa) newErrors.gpa = 'GPA is required';

    // Validate email format
    if (member.email && !isEmail(member.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Validate Canton email if provided
    if (member.canton_email && !isEmail(member.canton_email)) {
      newErrors.canton_email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let result;

      // Create or update based on isEditing flag
      if (isEditing && memberId) {
        // Handle file upload separately if needed
        if (avatar) {
          const formData = new FormData();
          formData.append('avatar', avatar);
          await pb.collection('users').update(memberId, formData);
        }
        result = await updateMember(memberId, member);
      } else {
        // Creating a new user requires a password
        const newMemberData = {
          ...member,
          password,
          passwordConfirm: password,
        };
        
        result = await createMember(newMemberData);
        
        // Handle avatar upload for new member
        if (result && avatar) {
          const formData = new FormData();
          formData.append('avatar', avatar);
          await pb.collection('users').update(result.id, formData);
        }
      }

      if (result) {
        // Redirect to members list on success
        router.push('/dashboard/members');
      }
    } catch (error) {
      console.error('Error saving member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string | number | null) => {
    setMember(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <Paper withBorder p="xl" radius="md">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Title order={3}>{isEditing ? 'Edit Member' : 'Add New Member'}</Title>
          
          {isEditing && member.avatar && (
            <Group justify="center" my="md">
              <Avatar 
                src={getMemberAvatarUrl(member as Member)} 
                size="xl" 
                radius="xl"
              />
            </Group>
          )}

          <Accordion defaultValue="basic" variant="separated">
            <Accordion.Item value="basic">
              <Accordion.Control>Basic Information</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Grid>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput
                        label="First Name"
                        placeholder="First Name"
                        value={member.first_name || ''}
                        onChange={(e) => handleChange('first_name', e.target.value)}
                        error={errors.first_name}
                        required
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput
                        label="Last Name"
                        placeholder="Last Name"
                        value={member.last_name || ''}
                        onChange={(e) => handleChange('last_name', e.target.value)}
                        error={errors.last_name}
                        required
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput
                        label="Preferred Name"
                        placeholder="Preferred Name (optional)"
                        value={member.preferred_name || ''}
                        onChange={(e) => handleChange('preferred_name', e.target.value)}
                      />
                    </Grid.Col>
                  </Grid>

                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Email"
                        placeholder="Email"
                        value={member.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        error={errors.email}
                        required
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Canton Email"
                        placeholder="Canton Email (optional)"
                        value={member.canton_email || ''}
                        onChange={(e) => handleChange('canton_email', e.target.value)}
                        error={errors.canton_email}
                      />
                    </Grid.Col>
                  </Grid>

                  {!isEditing && (
                    <PasswordInput
                      label="Password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={errors.password}
                      required
                    />
                  )}

                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <DateInput
                        label="Date of Birth"
                        placeholder="Date of Birth"
                        value={member.dob ? new Date(member.dob) : null}
                        onChange={(date) => handleChange('dob', date ? date.toISOString().split('T')[0] : null)}
                        error={errors.dob}
                        required
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Phone Number"
                        placeholder="Phone Number"
                        value={member.phone_number || ''}
                        onChange={(e) => handleChange('phone_number', e.target.value)}
                      />
                    </Grid.Col>
                  </Grid>

                  <FileInput
                    label="Profile Photo"
                    placeholder="Upload a profile photo"
                    accept="image/*"
                    onChange={setAvatar}
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="academic">
              <Accordion.Control>Academic Information</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Major"
                        placeholder="Major"
                        value={member.major || ''}
                        onChange={(e) => handleChange('major', e.target.value)}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <NumberInput
                        label="GPA"
                        placeholder="GPA"
                        min={0}
                        max={4.0}
                        step={0.1}
                        value={member.gpa || 0}
                        onChange={(value) => handleChange('gpa', value)}
                        error={errors.gpa}
                        required
                        decimalScale={1}
                      />
                    </Grid.Col>
                  </Grid>

                  <TextInput
                    label="Canton Card ID"
                    placeholder="Canton Card ID"
                    value={member.canton_card_id || ''}
                    onChange={(e) => handleChange('canton_card_id', e.target.value)}
                    error={errors.canton_card_id}
                    required
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="ems">
              <Accordion.Control>EMS Information</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Select
                        label="Position"
                        placeholder="Position"
                        data={[
                          { value: 'Advisor', label: 'Advisor' },
                          { value: 'President', label: 'President' },
                          { value: 'Vice President', label: 'Vice President' },
                          { value: 'Secretary', label: 'Secretary' },
                          { value: 'Treasurer', label: 'Treasurer' },
                          { value: 'Senator', label: 'Senator' },
                          { value: 'Member', label: 'Member' },
                          { value: 'Honor Roll', label: 'Honor Roll' },
                          { value: 'Auxillary', label: 'Auxillary' }
                        ]}
                        value={member.position || 'Member'}
                        onChange={(value) => handleChange('position', value)}
                        required
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Select
                        label="Medical Level"
                        placeholder="Medical Level"
                        data={[
                          { value: 'EMT', label: 'EMT' },
                          { value: 'First Responder', label: 'First Responder' }
                        ]}
                        value={member.medical_level || ''}
                        onChange={(value) => handleChange('medical_level', value)}
                        clearable
                      />
                    </Grid.Col>
                  </Grid>

                  <Select
                    label="Membership Standing"
                    placeholder="Membership Standing"
                    data={[
                      { value: 'Good', label: 'Good Standing' },
                      { value: 'Bad', label: 'Bad Standing' }
                    ]}
                    value={member.membership_standing || 'Good'}
                    onChange={(value) => handleChange('membership_standing', value)}
                    required
                  />

                  <Select
                    label="Shirt Size"
                    placeholder="Shirt Size"
                    data={[
                      { value: 'xs', label: 'XS' },
                      { value: 's', label: 'S' },
                      { value: 'm', label: 'M' },
                      { value: 'l', label: 'L' },
                      { value: 'xl', label: 'XL' },
                      { value: 'xxl', label: '2XL' },
                      { value: 'xxxl', label: '3XL' }
                    ]}
                    value={member.shirt_size || ''}
                    onChange={(value) => handleChange('shirt_size', value)}
                    clearable
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="housing">
              <Accordion.Control>Housing Information</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Select
                    label="Housing Type"
                    placeholder="Housing Type"
                    data={[
                      { value: 'On Campus', label: 'On Campus' },
                      { value: 'Off Campus', label: 'Off Campus' }
                    ]}
                    value={member.housing_type || 'On Campus'}
                    onChange={(value) => handleChange('housing_type', value)}
                    required
                  />

                  {member.housing_type === 'On Campus' && (
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                          label="Building"
                          placeholder="Building"
                          value={member.building || ''}
                          onChange={(e) => handleChange('building', e.target.value)}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <NumberInput
                          label="Room Number"
                          placeholder="Room Number"
                          value={member.room_number || 0}
                          onChange={(value) => handleChange('room_number', value)}
                          required
                        />
                      </Grid.Col>
                    </Grid>
                  )}

                  {member.housing_type === 'Off Campus' && (
                    <TextInput
                      label="Local Address"
                      placeholder="Local Address"
                      value={member.local_address || ''}
                      onChange={(e) => handleChange('local_address', e.target.value)}
                    />
                  )}

                  <TextInput
                    label="Home Address"
                    placeholder="Home Address"
                    value={member.home_address || ''}
                    onChange={(e) => handleChange('home_address', e.target.value)}
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {isEditing ? 'Update Member' : 'Create Member'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}