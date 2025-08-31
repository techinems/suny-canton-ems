'use client';
import { Container, Paper, Title, Text, Center, Anchor } from '@mantine/core';
import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <Container size={420} my={40}>
      <Title
        ta="center"
        fw={900}
        style={{
          fontSize: '2rem',
          background: 'linear-gradient(45deg, #228be6, #1971c2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}
      >
        Join SUNY Canton EMS
      </Title>
      
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Create your account to access the EMS management system
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <RegisterForm />
        
        <Center mt="md">
          <Text size="sm">
            Already have an account?{' '}
            <Anchor component={Link} href="/login" size="sm">
              Sign in here
            </Anchor>
          </Text>
        </Center>
      </Paper>
    </Container>
  );
}