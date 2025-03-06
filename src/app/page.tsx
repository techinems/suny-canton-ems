'use client';

import { Container, Title, Grid, Stack } from '@mantine/core';
import { ColorSchemeToggle } from "@/components/themeToggle/themeToggle";
import { Welcome } from "@/components/welcome/welcome";
import { UserProfile } from "@/components/auth/UserProfile";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function HomePage() {
  return (
    <ProtectedRoute>
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <Title ta="center">Dashboard</Title>
          
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Welcome />
              <ColorSchemeToggle />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 4 }}>
              <UserProfile />
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </ProtectedRoute>
  );
}