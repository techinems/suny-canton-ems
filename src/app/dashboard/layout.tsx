'use client';

import { AppShell, Burger, Group, NavLink, Title, Box, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  IconHome, 
  IconAmbulance, 
  IconUsers, 
  IconUser, 
  IconPackage, 
  IconCertificate 
} from '@tabler/icons-react';
import { ColorSchemeToggle } from '@/components/themeToggle/themeToggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: <IconHome style={{ width: rem(20) }} /> },
    { label: 'Calls', href: '/dashboard/calls', icon: <IconAmbulance style={{ width: rem(20) }} /> },
    { label: 'Members', href: '/dashboard/members', icon: <IconUsers style={{ width: rem(20) }} /> },
    { label: 'Certifications', href: '/dashboard/certifications', icon: <IconCertificate style={{ width: rem(20) }} /> },
    { label: 'Inventory', href: '/dashboard/inventory', icon: <IconPackage style={{ width: rem(20) }} /> },
    { label: 'Profile', href: '/dashboard/profile', icon: <IconUser style={{ width: rem(20) }} /> },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header p="md">
        <Group justify="space-between" h="100%">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3}>SUNY Canton EMS</Title>
          </Group>
          <ColorSchemeToggle />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Box mb="xl">
          <Group justify="center" mb="xl">
            {/* You could add a logo here */}
          </Group>
          
          <Box>
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                label={link.label}
                component={Link}
                href={link.href}
                active={pathname === link.href}
                leftSection={link.icon}
                mb={8}
              />
            ))}
          </Box>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}