import { useState, useEffect } from 'react';
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Group, 
  Box, 
  Alert,
  Stack,
  Select,
  NumberInput,
  Textarea
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconMail, IconLock, IconUser, IconPhone, IconHome } from '@tabler/icons-react';
import { useAuth } from './AuthContext';

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  cantonEmail: string;
  position: string;
  major: string;
  cantonCardId: string;
  gpa: number;
  phoneNumber: string;
  medicalLevel: string;
  housingType: string;
  building: string;
  roomNumber: number;
  homeAddress: string;
  localAddress: string;
  shirtSize: string;
}

const positionOptions = [
  { value: 'MEMBER', label: 'Member' },
  { value: 'PROBATIONARY_MEMBER', label: 'Probationary Member' },
  { value: 'LIEUTENANT', label: 'Lieutenant' },
  { value: 'CAPTAIN', label: 'Captain' },
  { value: 'TREASURER', label: 'Treasurer' },
  { value: 'SECRETARY', label: 'Secretary' },
  { value: 'VICE_PRESIDENT', label: 'Vice President' },
  { value: 'PRESIDENT', label: 'President' },
  { value: 'ALUMNI', label: 'Alumni' },
];

const shirtSizeOptions = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
  { value: 'XXXL', label: 'XXXL' },
];

const medicalLevelOptions = [
  { value: 'EMR', label: 'Emergency Medical Responder' },
  { value: 'EMT', label: 'Emergency Medical Technician' },
  { value: 'AEMT', label: 'Advanced Emergency Medical Technician' },
];

const housingTypeOptions = [
  { value: 'ON_CAMPUS', label: 'On Campus' },
  { value: 'OFF_CAMPUS', label: 'Off Campus' },
  { value: 'COMMUTER', label: 'Commuter' },
];

export function RegisterForm() {
  const { register, isLoading: authLoading, error: authError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Update local error state if auth context has an error
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      preferredName: '',
      cantonEmail: '',
      position: 'MEMBER',
      major: '',
      cantonCardId: '',
      gpa: 0,
      phoneNumber: '',
      medicalLevel: '',
      housingType: 'ON_CAMPUS',
      building: '',
      roomNumber: 0,
      homeAddress: '',
      localAddress: '',
      shirtSize: 'M',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 8 ? null : 'Password must be at least 8 characters'),
      confirmPassword: (value, values) => 
        value !== values.password ? 'Passwords do not match' : null,
      firstName: (value) => (value.length > 0 ? null : 'First name is required'),
      lastName: (value) => (value.length > 0 ? null : 'Last name is required'),
      cantonCardId: (value) => (value.length > 0 ? null : 'Canton Card ID is required'),
      gpa: (value) => (value >= 0 && value <= 4.0 ? null : 'GPA must be between 0.0 and 4.0'),
    },
  });

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create the display name from first and last name
      const displayName = `${values.firstName} ${values.lastName}`;
      
      // First, register the user with Better Auth
      await register(values.email, values.password, displayName);
      
      // Then, update their profile with additional information
      try {
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: values.firstName,
            lastName: values.lastName,
            preferredName: values.preferredName || null,
            cantonEmail: values.cantonEmail || null,
            position: values.position,
            major: values.major || null,
            cantonCardId: values.cantonCardId,
            gpa: values.gpa || null,
            phoneNumber: values.phoneNumber || null,
            medicalLevel: values.medicalLevel || null,
            housingType: values.housingType,
            building: values.building || null,
            roomNumber: values.roomNumber || null,
            homeAddress: values.homeAddress || null,
            localAddress: values.localAddress || null,
            shirtSize: values.shirtSize,
          }),
        });

        if (!response.ok) {
          console.error('Failed to update profile information');
          // Don't throw error here as the user is already registered
        }
      } catch (profileError) {
        console.error('Error updating profile:', profileError);
        // Don't throw error here as the user is already registered
      }
      
    } catch (err: unknown) {
      let errorMessage: string;
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'An error occurred during registration. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mx="auto">
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Registration Error" color="red" mb="lg" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Basic Information */}
          <TextInput
            label="Email"
            placeholder="your@email.com"
            leftSection={<IconMail size={16} />}
            required
            size="md"
            radius="md"
            {...form.getInputProps('email')}
          />
          
          <Group grow>
            <PasswordInput
              label="Password"
              placeholder="Your password"
              leftSection={<IconLock size={16} />}
              required
              size="md"
              radius="md"
              {...form.getInputProps('password')}
            />
            
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              leftSection={<IconLock size={16} />}
              required
              size="md"
              radius="md"
              {...form.getInputProps('confirmPassword')}
            />
          </Group>

          {/* Personal Information */}
          <Group grow>
            <TextInput
              label="First Name"
              placeholder="John"
              leftSection={<IconUser size={16} />}
              required
              size="md"
              radius="md"
              {...form.getInputProps('firstName')}
            />
            
            <TextInput
              label="Last Name"
              placeholder="Doe"
              leftSection={<IconUser size={16} />}
              required
              size="md"
              radius="md"
              {...form.getInputProps('lastName')}
            />
          </Group>

          <TextInput
            label="Preferred Name (Optional)"
            placeholder="What you'd like to be called"
            leftSection={<IconUser size={16} />}
            size="md"
            radius="md"
            {...form.getInputProps('preferredName')}
          />

          <TextInput
            label="Canton Email (Optional)"
            placeholder="your@canton.edu"
            leftSection={<IconMail size={16} />}
            size="md"
            radius="md"
            {...form.getInputProps('cantonEmail')}
          />

          {/* EMS Information */}
          <Group grow>
            <Select
              label="Position"
              placeholder="Select your position"
              data={positionOptions}
              required
              size="md"
              radius="md"
              {...form.getInputProps('position')}
            />
            
            <Select
              label="Shirt Size"
              placeholder="Select shirt size"
              data={shirtSizeOptions}
              required
              size="md"
              radius="md"
              {...form.getInputProps('shirtSize')}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Major"
              placeholder="Your major"
              size="md"
              radius="md"
              {...form.getInputProps('major')}
            />
            
            <NumberInput
              label="GPA"
              placeholder="3.5"
              min={0}
              max={4.0}
              step={0.01}
              size="md"
              radius="md"
              {...form.getInputProps('gpa')}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Canton Card ID"
              placeholder="Your student ID"
              required
              size="md"
              radius="md"
              {...form.getInputProps('cantonCardId')}
            />
            
            <TextInput
              label="Phone Number"
              placeholder="(555) 123-4567"
              leftSection={<IconPhone size={16} />}
              size="md"
              radius="md"
              {...form.getInputProps('phoneNumber')}
            />
          </Group>

          <Select
            label="Medical Level (Optional)"
            placeholder="Select your medical certification"
            data={medicalLevelOptions}
            size="md"
            radius="md"
            {...form.getInputProps('medicalLevel')}
          />

          {/* Housing Information */}
          <Select
            label="Housing Type"
            placeholder="Select housing type"
            data={housingTypeOptions}
            required
            size="md"
            radius="md"
            {...form.getInputProps('housingType')}
          />

          <Group grow>
            <TextInput
              label="Building (if on campus)"
              placeholder="Building name"
              leftSection={<IconHome size={16} />}
              size="md"
              radius="md"
              {...form.getInputProps('building')}
            />
            
            <NumberInput
              label="Room Number (if on campus)"
              placeholder="Room number"
              min={0}
              size="md"
              radius="md"
              {...form.getInputProps('roomNumber')}
            />
          </Group>

          <Textarea
            label="Home Address"
            placeholder="Your home address"
            size="md"
            radius="md"
            {...form.getInputProps('homeAddress')}
          />

          <Textarea
            label="Local Address (if different)"
            placeholder="Your local address while at school"
            size="md"
            radius="md"
            {...form.getInputProps('localAddress')}
          />

          <Button fullWidth size="md" type="submit" loading={loading || authLoading} radius="md">
            Create Account
          </Button>
        </Stack>
      </form>
    </Box>
  );
}