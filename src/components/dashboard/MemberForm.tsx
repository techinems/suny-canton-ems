'use client';
import { useState, useEffect } from 'react';
import { 
  TextInput, 
  NumberInput, 
  Stack, 
  Group, 
  Select, 
  Button, 
  FileInput,
  PasswordInput,
  Grid,
  Paper,
  Avatar,
  Accordion,
  Switch
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useRouter } from 'next/navigation';
import { Member, getMemberById, createMember, updateMember, getMemberAvatarUrl } from '@/lib/client/memberService';
import { getBuildings } from '@/lib/client/buildingService';
import { isEmail } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthContext';

interface MemberFormProps {
  memberId?: string;
  isEditing?: boolean;
}

// Default values for a new member
const defaultMember: Partial<Member> = {
  position: 'MEMBER',
  membershipStanding: 'GOOD',
  housingType: 'ON_CAMPUS',
  roomNumber: undefined,
  gpa: 2.0,
  cantonCardId: '',
  dob: new Date(),
  isAdmin: false
};

export function MemberForm({ memberId, isEditing = false }: MemberFormProps) {
  const [member, setMember] = useState<Partial<Member>>(defaultMember);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatar, setAvatar] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [buildings, setBuildings] = useState<{ value: string; label: string }[]>([]);
  const router = useRouter();
  const { user } = useAuth();

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

  // Fetch buildings for dropdown
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const buildingsList = await getBuildings();
        setBuildings(
          buildingsList.map((building) => ({
            value: building.id,
            label: building.name,
          }))
        );
      } catch (error) {
        console.error('Error fetching buildings:', error);
      }
    };
    fetchBuildings();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!member.email) newErrors.email = 'Email is required';
    if (!isEditing && !password) newErrors.password = 'Password is required';
    if (!isEditing && password !== passwordConfirm) newErrors.passwordConfirm = 'Passwords do not match';
    if (!member.firstName) newErrors.firstName = 'First name is required';
    if (!member.lastName) newErrors.lastName = 'Last name is required';
    if (!member.dob) newErrors.dob = 'Date of birth is required';
    if (!member.cantonCardId) newErrors.cantonCardId = 'Canton card ID is required';
    if (!member.gpa) newErrors.gpa = 'GPA is required';

    // Validate email format
    if (member.email && !isEmail(member.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Validate Canton email if provided
    if (member.cantonEmail && !isEmail(member.cantonEmail)) {
      newErrors.cantonEmail = 'Invalid email format';
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

      // Create a clean data object without id, createdAt, or updatedAt fields
      const memberData: Partial<Member> = { 
        ...member,
        emailVerified: true, // Set email verification to true
        membershipStanding: member.membershipStanding || 'GOOD'
      };
      
      // Handle avatar file upload - in a real app, you'd upload to a file service
      // For now, we'll skip file handling since it needs to be a URL string
      if (avatar) {
        // TODO: Implement file upload to a service like AWS S3, Cloudinary, etc.
        // and set memberData.avatar to the returned URL
        console.warn('Avatar upload not yet implemented');
      }

      // Create or update based on isEditing flag
      if (isEditing && memberId) {
        result = await updateMember(memberId, memberData);
      } else {
        // Creating a new user requires a password
        const newMemberData = {
          ...memberData,
          password,
          passwordConfirm
        };
        
        result = await createMember(newMemberData);
      }

      if (result) {
        // Redirect to members list on success
        router.push('/dashboard/members');
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string | number | boolean | null) => {
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
                        value={member.firstName || ''}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        error={errors.firstName}
                        required
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput
                        label="Last Name"
                        placeholder="Last Name"
                        value={member.lastName || ''}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        error={errors.lastName}
                        required
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput
                        label="Preferred Name"
                        placeholder="Preferred Name (optional)"
                        value={member.preferredName || ''}
                        onChange={(e) => handleChange('preferredName', e.target.value)}
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
                        value={member.cantonEmail || ''}
                        onChange={(e) => handleChange('cantonEmail', e.target.value)}
                        error={errors.cantonEmail}
                      />
                    </Grid.Col>
                  </Grid>

                  {!isEditing && (
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <PasswordInput
                          label="Password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          error={errors.password}
                          required
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <PasswordInput
                          label="Confirm Password"
                          placeholder="Confirm Password"
                          value={passwordConfirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          error={errors.passwordConfirm}
                          required
                        />
                      </Grid.Col>
                    </Grid>
                  )}

                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <DateInput
                        label="Date of Birth"
                        placeholder="Date of Birth"
                        value={member.dob ? new Date(member.dob) : null}
                        onChange={(date) => handleChange('dob', date || null)}
                        error={errors.dob}
                        required
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Phone Number"
                        placeholder="Phone Number"
                        value={member.phoneNumber || ''}
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
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
                    value={member.cantonCardId || ''}
                    onChange={(e) => handleChange('cantonCardId', e.target.value)}
                    error={errors.cantonCardId}
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
                          { value: 'ADVISOR', label: 'Advisor' },
                          { value: 'PRESIDENT', label: 'President' },
                          { value: 'VICE_PRESIDENT', label: 'Vice President' },
                          { value: 'SECRETARY', label: 'Secretary' },
                          { value: 'TREASURER', label: 'Treasurer' },
                          { value: 'SENATOR', label: 'Senator' },
                          { value: 'MEMBER', label: 'Member' },
                          { value: 'PROBATIONARY_MEMBER', label: 'Probationary Member' },
                          { value: 'LIEUTENANT', label: 'Lieutenant' },
                          { value: 'CAPTAIN', label: 'Captain' },
                          { value: 'ALUMNI', label: 'Alumni' },
                          { value: 'HONOR_ROLL', label: 'Honor Roll' },
                          { value: 'AUXILIARY', label: 'Auxiliary' }
                        ]}
                        value={member.position || 'MEMBER'}
                        onChange={(value) => handleChange('position', value)}
                        required
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Select
                        label="Medical Level"
                        placeholder="Medical Level"
                        data={[
                          { value: 'EMR', label: 'EMR' },
                          { value: 'EMT', label: 'EMT' },
                          { value: 'AEMT', label: 'AEMT' }
                        ]}
                        value={member.medicalLevel || ''}
                        onChange={(value) => handleChange('medicalLevel', value)}
                        clearable
                      />
                    </Grid.Col>
                  </Grid>

                  <Select
                    label="Membership Standing"
                    placeholder="Membership Standing"
                    data={[
                      { value: 'GOOD', label: 'Good Standing' },
                      { value: 'BAD', label: 'Bad Standing' }
                    ]}
                    value={member.membershipStanding || 'GOOD'}
                    onChange={(value) => handleChange('membershipStanding', value)}
                    required
                  />

                  <Select
                    label="Shirt Size"
                    placeholder="Shirt Size"
                    data={[
                      { value: 'XS', label: 'XS' },
                      { value: 'S', label: 'S' },
                      { value: 'M', label: 'M' },
                      { value: 'L', label: 'L' },
                      { value: 'XL', label: 'XL' },
                      { value: 'XXL', label: '2XL' },
                      { value: 'XXXL', label: '3XL' }
                    ]}
                    value={member.shirtSize || ''}
                    onChange={(value) => handleChange('shirtSize', value)}
                    clearable
                  />

                  {user?.isAdmin && (
                    <Switch
                      label="Administrator access"
                      description="Admins can manage restricted areas like buildings."
                      checked={Boolean(member.isAdmin)}
                      onChange={(event) => handleChange('isAdmin', event.currentTarget.checked)}
                    />
                  )}
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
                      { value: 'ON_CAMPUS', label: 'On Campus' },
                      { value: 'OFF_CAMPUS', label: 'Off Campus' },
                      { value: 'COMMUTER', label: 'Commuter' }
                    ]}
                    value={member.housingType || 'ON_CAMPUS'}
                    onChange={(value) => handleChange('housingType', value)}
                    required
                  />

                  {member.housingType !== 'OFF_CAMPUS' && member.housingType !== 'COMMUTER' && (
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Select
                          label="Building"
                          placeholder="Select a building"
                          data={buildings}
                          value={member.buildingId || ''}
                          onChange={(value) => handleChange('buildingId', value)}
                          searchable
                          clearable
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <NumberInput
                          label="Room Number"
                          placeholder="Room Number"
                          value={member.roomNumber || undefined}
                          onChange={(value) => handleChange('roomNumber', value)}
                        />
                      </Grid.Col>
                    </Grid>
                  )}

                  {member.housingType === 'OFF_CAMPUS' && (
                    <TextInput
                      label="Local Address"
                      placeholder="Local Address"
                      value={member.localAddress || ''}
                      onChange={(e) => handleChange('localAddress', e.target.value)}
                    />
                  )}

                  <TextInput
                    label="Home Address"
                    placeholder="Home Address"
                    value={member.homeAddress || ''}
                    onChange={(e) => handleChange('homeAddress', e.target.value)}
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